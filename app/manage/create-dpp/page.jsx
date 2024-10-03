"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";
import SearchableSingleSelect from "../../_components/searchAbleDropDownv2";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const CreateDpp = () => {
  const [name, setName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state

  const [data, setData] = useState({
    subjects: [],
    chapters: [],
    topics: [],
    classes: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [chaptersResponse, classesResponse, selfStudyResponse] =
          await Promise.all([
            fetch("/api/chapter"),
            fetch("/api/class"),
            fetch("/api/create-dpp"),
          ]);

        const chaptersResult = await chaptersResponse.json();
        const classesResult = await classesResponse.json();
        const selfStudyResult = await selfStudyResponse.json();

        // Extract chapters and subjects from the chapters data
        const chaptersData = chaptersResult.data.map((chapter) => ({
          id: chapter.id,
          name: chapter.attributes.name,
          subjectId: chapter.attributes.subject.data.id,
          subjectName: chapter.attributes.subject.data.attributes.name,
        }));
        console.log(chaptersData);
        setData((prevState) => ({ ...prevState, chapters: chaptersData }));

        // Extract unique subjects from chapters
        const uniqueSubjects = chaptersData.reduce((acc, chapter) => {
          if (!acc.find((subject) => subject.id === chapter.subjectId)) {
            acc.push({
              id: chapter.subjectId,
              name: chapter.subjectName,
            });
          }
          return acc;
        }, []);
        setData((prevState) => ({ ...prevState, subjects: uniqueSubjects }));

        const classes = classesResult.data.map((item) => ({
          id: item.id,
          name: item.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, classes }));

        const chapterIds = chaptersData.map((chapter) => chapter.id);
        const queryString = chapterIds
          .map((id) => `filters[chapter][id][$eq]=${id}`)
          .join("&");
        const topicsResponse = await fetch(
          `/api/topics?populate[chapter]=*&${queryString}`
        );
        const topicsResult = await topicsResponse.json();
        const topicsData = topicsResult.data.map((topic) => ({
          id: topic.id,
          name: topic.attributes.name,
          chapterId: topic.attributes.chapter.data.id,
        }));
        setData((prevState) => ({ ...prevState, topics: topicsData }));
        const mappedMaterials = selfStudyResult.data.map((item) => {
          const materialName = item.attributes.name;
          const subjectName = item.attributes.subject.data.attributes.name;
          const className = item.attributes.class.data.attributes.name;
          const chapterNames = item.attributes.chapters.data.map(
            (chapter) => chapter.attributes.name
          );
          const topicNames = item.attributes.topics.data.map(
            (topic) => topic.attributes.name
          );

          return {
            id: item.id,
            name: materialName,
            subjectName,
            className,
            chapterNames,
            topicNames,
          };
        });
        console.log(data);
        setMaterials(mappedMaterials);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false); // Set loading to false when fetching is done
      }
    };

    fetchData();
  }, []);

  const createPayload = () => {
    const numericSubject = Number(selectedSubject);
    const numericClass = Number(selectedClass);
    const numericChapters = selectedChapters.map((chapter) => Number(chapter));
    const numericTopics = selectedTopics.map((topic) => Number(topic));

    const payload = {
      data: {
        name: name,
        subject: numericSubject,
        class: numericClass,
        chapters: numericChapters,
        topics: numericTopics,
      },
    };

    return payload;
  };

  const handleSubmit = async () => {
    if (
      name &&
      selectedSubject &&
      selectedClass &&
      selectedChapters.length &&
      selectedTopics.length
    ) {
      const payload = createPayload();

      const action = toast.promise(
        (async () => {
          const response = await fetch("/api/create-dpp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const result = await response.json();
          console.log("Server Response:", result);

          const materialData = result.data;
          const newMaterial = {
            id: materialData.id,
            name: materialData.attributes.name,
            subjectName: materialData.attributes.subject.data.attributes.name,
            className: materialData.attributes.class.data.attributes.name,
            chapterNames: materialData.attributes.chapters.data.map(
              (chapter) => chapter.attributes.name
            ),
            topicNames: materialData.attributes.topics.data.map(
              (topic) => topic.attributes.name
            ),
          };

          if (editIndex === null) {
            setMaterials((prevMaterials) => [...prevMaterials, newMaterial]);
          } else {
            setMaterials((prevMaterials) =>
              prevMaterials.map((material, index) =>
                index === editIndex ? newMaterial : material
              )
            );
          }

          // Reset the form
          setName("");
          setSelectedSubject("");
          setSelectedClass("");
          setSelectedChapters([]);
          setSelectedTopics([]);
          setFile(null);
        })(),
        {
          loading: "Submitting DPP...",
          success: "DPP added successfully.",
          error: "Failed to add DPP. Please try again.",
        },
        {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }
      );

      await action;
    } else {
      toast.error("Please fill out all fields before submitting.");
    }
  };

  const handleEdit = (index) => {
    const material = materials[index];
    setName(material.name);
    const selectedSubjectOption = data.subjects.find(
      (sub) => sub.name === material.subjectName
    );
    setSelectedSubject(selectedSubjectOption.id);
    const selectedClassOption = data.classes.find(
      (sub) => sub.name === material.className
    );
    setSelectedClass(selectedClassOption.id);
    const selectedChaptersWithIds = data.chapters
      .filter((chapter) => material.chapterNames.includes(chapter.name))
      .map((chapter) => chapter.id);
    setSelectedChapters(selectedChaptersWithIds);
    const selectedTopicsWithIds = data.topics
      .filter((topic) => material.topicNames.includes(topic.name))
      .map((topic) => topic.id);
    setSelectedTopics(selectedTopicsWithIds);
    setFile(material.file);
    setEditIndex(index);
  };

  const handleDelete = async (id) => {
    console.log(id);

    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/create-dpp", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studyId: id }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete DPP.");
        }

        setMaterials((prevTopics) =>
          prevTopics.filter((topic) => topic.id !== id)
        );
      })(),
      {
        loading: "Deleting DPP...",
        success: "DPP deleted successfully.",
        error: "Failed to delete DPP.",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );

    await action;
  };

  const handleUpdateChange = async () => {
    if (
      name &&
      selectedSubject &&
      selectedClass &&
      selectedChapters.length &&
      selectedTopics.length
    ) {
      // Define the request payload to include studyId and updatedData
      const payload = {
        studyId: materials[editIndex].id, // Pass the ID of the study material being edited
        updatedData: createPayload(),
      };

      const action = toast.promise(
        (async () => {
          const response = await fetch(`/api/create-dpp`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          console.log(response);

          if (!response.status === 200) {
            throw new Error("Failed to update DPP.");
          }

          const result = await response.json();
          console.log("Update Response:", result);

          const updatedMaterial = {
            id: payload.studyId,
            name: result.data.attributes.name,
            subjectName: result.data.attributes.subject.data.attributes.name,
            className: result.data.attributes.class.data.attributes.name,
            chapterNames: result.data.attributes.chapters.data.map(
              (chapter) => chapter.attributes.name
            ),
            topicNames: result.data.attributes.topics.data.map(
              (topic) => topic.attributes.name
            ),
          };

          // Update the materials list with the newly updated material
          setMaterials((prevMaterials) =>
            prevMaterials.map((material, index) =>
              index === editIndex ? updatedMaterial : material
            )
          );

          // Reset form and exit edit mode
          setName("");
          setSelectedSubject("");
          setSelectedClass("");
          setSelectedChapters([]);
          setSelectedTopics([]);
          setFile(null);
          setEditIndex(null);
        })(),
        {
          loading: "Updating DPP...",
          success: "DPP updated successfully.",
          error: "Failed to update DPP.",
        },
        {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }
      );

      await action;
    } else {
      toast.error("Please fill out all fields before updating.");
    }
  };

  // Filter chapters based on the selected subject
  const filteredChapters = data.chapters.filter(
    (chapter) => chapter.subjectId === Number(selectedSubject)
  );
  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="sectionHeader">Create DPP</div>
      <div className="inputContainer">
        <div className="formGroup">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter DPP name"
            className="text-input"
          />
        </div>

        <div className="formGroup">
          <SearchableSingleSelect
            options={data.subjects}
            selectedValue={selectedSubject}
            onChange={(value) => setSelectedSubject(value)}
            placeholder="Select subject"
          />
        </div>

        <div className="formGroup">
          <SearchableSingleSelect
            options={data.classes}
            selectedValue={selectedClass}
            onChange={(value) => setSelectedClass(value)}
            placeholder="Select class"
          />
        </div>
      </div>
      <div className="inputContainer">
        <div className="formGroup">
          <MultiSelectDropDown
            options={filteredChapters}
            selectedValues={selectedChapters}
            onChange={(values) => setSelectedChapters(values)}
            placeholder="Select chapters"
          />
        </div>

        <div className="formGroup">
          <MultiSelectDropDown
            options={data.topics.filter((topic) =>
              selectedChapters.includes(topic.chapterId)
            )}
            selectedValues={selectedTopics}
            onChange={(values) => setSelectedTopics(values)}
            placeholder="Select topics"
          />
        </div>

        <div className="formGroup">
          {/* <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            accept=".pdf"
          /> */}
        </div>
      </div>
      <button
        onClick={editIndex !== null ? handleUpdateChange : handleSubmit}
        className="submitButton"
      >
        {editIndex !== null ? "Update DPP" : "Create DPP"}
      </button>
      {loading ? (
        <div className="loader" style={{ marginTop: 30 }}>
          Loading...
        </div>
      ) : (
        <ul className="todoList">
          {materials.map((material, index) => (
            <li key={material.id} className="todoItem">
              <div>
                <strong>Name:</strong> {material.name}
              </div>
              <div>
                <strong>Subject:</strong> {material.subjectName}
              </div>
              <div>
                <strong>Class:</strong> {material.className}
              </div>
              <div>
                <strong>Chapters:</strong> {material.chapterNames.join(", ")}
              </div>
              <div>
                <strong>Topics:</strong> {material.topicNames.join(", ")}
              </div>
              <div className="buttonContainer">
                <button
                  onClick={() => handleEdit(index)}
                  className="editButton"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="deleteButton"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CreateDpp;
