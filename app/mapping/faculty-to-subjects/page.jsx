"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaSyncAlt, FaTrash } from "react-icons/fa";
import Pagination from "../../_components/pagination";
import SearchableSingleSelect from "../../_components/searchAbleDropDown";
import MultiSelectDropDown from "../../_components/multiSelectDropDown";

const subjects = [
  { id: "1", name: "Math" },
  { id: "2", name: "Science" },
  { id: "3", name: "English" },
  { id: "4", name: "History" },
]; // Example subjects

const facultyOptions = [
  { id: "1", name: "Dr. Smith" },
  { id: "2", name: "Prof. Johnson" },
  { id: "3", name: "Ms. Davis" },
  { id: "4", name: "Mr. Brown" },
]; // Example faculty

const FacultyToSubject = () => {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFacultyChange = (value) => {
    setSelectedFaculty(value);
  };

  const handleSubjectsChange = (values) => {
    setSelectedSubjects(values);
  };

  const handleSubmit = () => {
    if (selectedFaculty && selectedSubjects.length > 0) {
      if (editingIndex !== null) {
        const updatedMappings = [...mappings];
        updatedMappings[editingIndex] = {
          facultyName: selectedFaculty,
          subjects: selectedSubjects,
        };
        setMappings(updatedMappings);
        setEditingIndex(null);
      } else {
        setMappings((prevMappings) => [
          ...prevMappings,
          {
            facultyName: selectedFaculty,
            subjects: selectedSubjects,
          },
        ]);
      }
      setSelectedFaculty("");
      setSelectedSubjects([]);
    }
  };

  const handleEditMapping = (index) => {
    const mapping = mappings[index];
    setSelectedFaculty(mapping.facultyName);
    setSelectedSubjects(mapping.subjects);
    setEditingIndex(index);
  };

  const handleDeleteMapping = (index) => {
    const actualIndex = index;
    const updatedMappings = mappings.filter((_, i) => i !== actualIndex);
    setMappings(updatedMappings);

    // Pagination adjustment
    const maxPage = Math.ceil(updatedMappings.length / itemsPerPage);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsSearchPerformed(true); // Set search performed to true on input change
  };

  const filteredMappings = mappings.filter((mapping) =>
    mapping.facultyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredMappings.length);
  const displayedMappings = filteredMappings.slice(startIndex, endIndex);

  useEffect(() => {
    if (filteredMappings.length === 0 && isSearchPerformed) {
      setSearchTerm("");
    }
  }, [filteredMappings.length, isSearchPerformed]);

  return (
    <div className="container">
      <div className="sectionHeader">Faculty to Subject Mapping</div>
      <div className="inputContainer">
        <SearchableSingleSelect
          options={facultyOptions}
          selectedValue={selectedFaculty}
          onChange={handleFacultyChange}
          placeholder="Select faculty"
        />
        <MultiSelectDropDown
          options={subjects}
          selectedValues={selectedSubjects}
          onChange={handleSubjectsChange}
          placeholder="Select subjects"
        />
        <button onClick={handleSubmit} className="addButton">
          {editingIndex !== null ? <FaSyncAlt /> : <FaPlus />}
          {editingIndex !== null ? "Update" : "Add"}
        </button>
      </div>
      <div className="inputContainer">
        {mappings.length > 1 && (
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search faculty"
            className="search-bar"
          />
        )}
      </div>
      <ul className="todoList">
        {filteredMappings.length === 0 && isSearchPerformed ? (
          <div className="no-data-message">No data found</div>
        ) : (
          displayedMappings.map((mapping, index) => (
            <li key={startIndex + index} className="todoItem">
              <span>
                {startIndex + index + 1}. <span>{mapping.facultyName}</span> -{" "}
                <span className="highlight">{mapping.subjects.join(", ")}</span>
              </span>
              <div className="buttonContainer">
                <button
                  onClick={() => handleEditMapping(startIndex + index)}
                  className="editButton"
                >
                  <FaEdit /> {/* Edit icon */}
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMapping(startIndex + index)}
                  className="deleteButton"
                >
                  <FaTrash /> {/* Delete icon */}
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      {filteredMappings.length > itemsPerPage && (
        <Pagination
          totalItems={filteredMappings.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default FacultyToSubject;
