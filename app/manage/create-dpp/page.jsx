"use client";
import { useState } from "react";
import MultiSelectDropDown from "../../_components/multiSelectDropDown";
import SearchableSingleSelect from "../../_components/searchAbleDropDown";
import { FaEdit, FaTrash } from "react-icons/fa";

// Dummy data
const data = {
  subjects: ["Mathematics", "Physics", "Chemistry"],
  chapters: [
    "Algebra",
    "Geometry",
    "Calculus",
    "Thermodynamics",
    "Optics",
    "Organic Chemistry",
  ],
  topics: [
    "Linear Equations",
    "Triangles",
    "Derivatives",
    "Heat Transfer",
    "Light Reflection",
    "Hydrocarbons",
  ],
  classes: ["1 PUC", "2 PUC", "10th", "9th"],
};

const DPP = () => {
  const [name, setName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleSubmit = () => {
    if (
      name &&
      selectedSubject &&
      selectedChapters.length &&
      selectedTopics.length &&
      selectedClass &&
      file
    ) {
      const newMaterial = {
        id: materials.length + 1,
        name,
        subject: selectedSubject,
        chapters: selectedChapters,
        topics: selectedTopics,
        class: selectedClass,
        file,
      };

      if (editIndex !== null) {
        const updatedMaterials = [...materials];
        updatedMaterials[editIndex] = newMaterial;
        setMaterials(updatedMaterials);
        setEditIndex(null);
      } else {
        setMaterials([...materials, newMaterial]);
      }

      // Reset the form
      setName("");
      setSelectedSubject("");
      setSelectedChapters([]);
      setSelectedTopics([]);
      setSelectedClass("");
      setFile(null);
    }
  };

  const handleEdit = (index) => {
    const material = materials[index];
    setName(material.name);
    setSelectedSubject(material.subject);
    setSelectedChapters(material.chapters);
    setSelectedTopics(material.topics);
    setSelectedClass(material.class);
    setFile(material.file);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedMaterials = materials.filter((_, i) => i !== index);
    setMaterials(updatedMaterials);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <div className="container">
      <div className="sectionHeader">Create DPP</div>
      <div className="inputContainer">
        <div className="formGroup">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter material name"
            className="textInput"
          />
        </div>

        <div className="formGroup">
          <SearchableSingleSelect
            options={data.subjects.map((subject, index) => ({
              id: index.toString(),
              name: subject,
            }))}
            selectedValue={selectedSubject}
            onChange={(value) => setSelectedSubject(value)}
            placeholder="Select subject"
          />
        </div>

        <div className="formGroup">
          <MultiSelectDropDown
            options={data.chapters.map((chapter, index) => ({
              id: index.toString(),
              name: chapter,
            }))}
            selectedValues={selectedChapters}
            onChange={(values) => setSelectedChapters(values)}
            placeholder="Select chapters"
          />
        </div>
      </div>
      <div className="inputContainer">
        <div className="formGroup">
          <MultiSelectDropDown
            options={data.topics.map((topic, index) => ({
              id: index.toString(),
              name: topic,
            }))}
            selectedValues={selectedTopics}
            onChange={(values) => setSelectedTopics(values)}
            placeholder="Select topics"
          />
        </div>

        <div className="formGroup">
          <SearchableSingleSelect
            options={data.classes.map((cls, index) => ({
              id: index.toString(),
              name: cls,
            }))}
            selectedValue={selectedClass}
            onChange={(value) => setSelectedClass(value)}
            placeholder="Select class"
          />
        </div>

        <div className="formGroup">
          <input
            type="file"
            onChange={handleFileChange}
            className="fileInput"
            accept=".pdf"
          />
        </div>
      </div>
      <button onClick={handleSubmit} className="submitButton">
        {editIndex !== null ? "Update Material" : "Create Material"}
      </button>

      <ul className="todoList">
        {materials.map((material, index) => (
          <li key={material.id} className="todoItem">
            <div>
              {index + 1}: <strong>Name:</strong> {material.name} -{" "}
              <strong>Subject:</strong> {material.subject} -{" "}
              <strong>Chapters:</strong> {material.chapters.join(", ")} -{" "}
              <strong>Topics:</strong> {material.topics.join(", ")} -{" "}
              <strong>Class:</strong> {material.class} - <strong>File:</strong>{" "}
              {material.file?.name}
            </div>
            <div className="buttonContainer">
              <button onClick={() => handleEdit(index)} className="editButton">
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="deleteButton"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DPP;
