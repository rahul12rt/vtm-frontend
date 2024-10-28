"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";
import SearchableSingleSelect from "../../_components/searchAbleDropDownv2";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Modal } from "antd";

const SelfStudy = () => {
  const [name, setName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [academicYears, setAcademicYears] = useState([]);
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [viewFileUrl, setViewFileUrl] = useState("");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");

  const [data, setData] = useState({
    subjects: [],
    chapters: [],
    topics: [],
    classes: [],
    academicYears: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          chaptersResponse,
          classesResponse,
          selfStudyResponse,
          academicResponse,
        ] = await Promise.all([
          fetch("/api/chapter"),
          fetch("/api/class"),
          fetch("/api/self-study"),
          fetch("/api/academic"),
        ]);

        const chaptersResult = await chaptersResponse.json();
        const classesResult = await classesResponse.json();
        const selfStudyResult = await selfStudyResponse.json();
        const academicResult = await academicResponse.json();

        const academicYearsData = academicResult.data.map((item) => ({
          id: item.id,
          name: item.attributes.year,
        }));
        setData((prevState) => ({
          ...prevState,
          academicYears: academicYearsData,
        }));

        const chaptersData = chaptersResult.data.map((chapter) => ({
          id: chapter.id,
          name: chapter.attributes.name,
          subjectId: chapter.attributes.subject.data.id,
          subjectName: chapter.attributes.subject.data.attributes.name,
        }));
        setData((prevState) => ({ ...prevState, chapters: chaptersData }));

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
          const academic_year =
            item.attributes.academic_year.data.attributes.year;
          const chapterNames = item.attributes.chapters.data.map(
            (chapter) => chapter.attributes.name
          );
          const topicNames = item.attributes.topics.data.map(
            (topic) => topic.attributes.name
          );
          const fileUrl = item.attributes.material.data.attributes.url;

          return {
            id: item.id,
            name: materialName,
            subjectName,
            className,
            chapterNames,
            topicNames,
            academic_year,
            fileUrl,
          };
        });

        setMaterials(mappedMaterials);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const createPayload = () => {
    const numericSubject = Number(selectedSubject);
    const numericClass = Number(selectedClass);
    const numericChapters = selectedChapters.map((chapter) => Number(chapter));
    const numericTopics = selectedTopics.map((topic) => Number(topic));
    const numericAcademicYear = Number(selectedAcademicYear);

    const payload = {
      data: {
        name: name,
        subject: numericSubject,
        class: numericClass,
        chapters: numericChapters,
        topics: numericTopics,
        academic_year: numericAcademicYear,
        material: Number(file),
      },
    };

    return payload;
  };

  const resetForm = () => {
    setName("");
    setSelectedSubject("");
    setSelectedClass("");
    setSelectedChapters([]);
    setSelectedTopics([]);
    setSelectedAcademicYear("");
    setFile(null);
    setIsFileUploaded(false);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      return;
    }

    let formData = new FormData();
    formData.append("files", selectedFile);
    const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

    const action = toast.promise(
      (async () => {
        try {
          const response = await axios.post(
            `${strapiApiUrl}/api/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (!response.status === 200) {
            throw new Error("Failed to upload file.");
          }

          const result = response.data;
          setFile(result[0].id);
          setIsFileUploaded(true);
          setViewFileUrl(result[0].url);
        } catch (error) {
          console.error("Upload error:", error);
          throw error;
        }
      })(),
      {
        loading: "Uploading file...",
        success: "File uploaded successfully.",
        error: "Failed to upload file.",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );

    try {
      await action;
    } catch (error) {
      event.target.value = "";
      setIsFileUploaded(false);
      setFile(null);
      setViewFileUrl("");
    }
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
          const response = await fetch("/api/self-study", {
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
            academic_year:
              materialData.attributes.academic_year.data.attributes.year,
            fileUrl: viewFileUrl,
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

          resetForm();
        })(),
        {
          loading: "Submitting study material...",
          success: "Study material added successfully.",
          error: "Failed to add study material. Please try again.",
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

  const handleViewFile = (url) => {
    const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const fullUrl = `${strapiApiUrl}${url}`;
    window.open(fullUrl, "_blank");
    setCurrentPdfUrl(fullUrl);
    setIsPdfModalOpen(true);
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
    const selectedAcademicYearOption = data.academicYears.find(
      (year) => year.name === material.academic_year
    );
    setSelectedAcademicYear(selectedAcademicYearOption.id);
    setSelectedTopics(selectedTopicsWithIds);
    setFile(material.fileUrl);
    setEditIndex(index);
  };

  const handleDelete = async (id) => {
    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/self-study", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studyId: id }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete study material.");
        }

        setMaterials((prevTopics) =>
          prevTopics.filter((topic) => topic.id !== id)
        );
      })(),
      {
        loading: "Deleting study material...",
        success: "Study material deleted successfully.",
        error: "Failed to delete study material.",
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
      const payload = {
        studyId: materials[editIndex].id,
        updatedData: createPayload(),
      };

      const action = toast.promise(
        (async () => {
          const response = await fetch(`/api/self-study`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.status === 200) {
            throw new Error("Failed to update study material.");
          }

          const result = await response.json();

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
            academic_year:
              result.data.attributes.academic_year.data.attributes.year,
            fileUrl: viewFileUrl,
          };

          setMaterials((prevMaterials) =>
            prevMaterials.map((material, index) =>
              index === editIndex ? updatedMaterial : material
            )
          );

          resetForm();
          setEditIndex(null);
        })(),
        {
          loading: "Updating study material...",
          success: "Study material updated successfully.",
          error: "Failed to update study material.",
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
      setIsFileUploaded(false);
    } else {
      toast.error("Please fill out all fields before updating.");
    }
  };

  const filteredChapters = data.chapters.filter(
    (chapter) => chapter.subjectId === Number(selectedSubject)
  );

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="sectionHeader">Create Study Material</div>
      <div className="inputContainer">
        <div className="formGroup">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter study material name"
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
          <SearchableSingleSelect
            options={data.academicYears}
            selectedValue={selectedAcademicYear}
            onChange={(value) => setSelectedAcademicYear(value)}
            placeholder="Select academic year"
          />
        </div>

        <div className="formGroup">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            accept=".pdf"
          />
        </div>
      </div>

      <button
        onClick={editIndex !== null ? handleUpdateChange : handleSubmit}
        className="submitButton"
      >
        {editIndex !== null ? "Update Study Material" : "Create Study Material"}
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
                {index + 1}. {material.name}
              </div>
              <div>
                <strong>Subject:</strong> {material.subjectName}
              </div>
              <div>
                <strong>Class:</strong> {material.className}
              </div>
              {/* <div>
                <strong>Chapters:</strong> {material.chapterNames.join(", ")}
              </div>
              <div>
                <strong>Topics:</strong> {material.topicNames.join(", ")}
              </div> */}
              <div>
                <strong>Academic Year:</strong> {material.academic_year}
              </div>

              <div className="buttonContainer">
                {material.fileUrl && (
                  <button
                    onClick={() => handleViewFile(material.fileUrl)}
                    className="viewButton"
                  >
                    <FaEye />
                  </button>
                )}
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
      {console.log(currentPdfUrl)}
      {/* <Modal
        title="PDF Viewer"
        open={isPdfModalOpen}
        onCancel={() => setIsPdfModalOpen(false)}
        footer={null}
        width="90%"
        bodyStyle={{ height: "80vh" }}
      >
        <object
          class="pdf"
          data={currentPdfUrl}
          width="100%"
          height="100%"
        ></object>
      </Modal> */}
    </div>
  );
};

export default SelfStudy;
