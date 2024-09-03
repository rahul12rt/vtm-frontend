"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const ListOfFaculty = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/register/faculty");
        const fetchedData = response.data.data.map((faculty) => ({
          number: faculty.id,
          name: faculty.attributes.name,
          subjects: [faculty.attributes.subject.data.attributes.name],
        }));
        setFacultyData(fetchedData);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFacultySearchChange = (e) => {
    setFacultySearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const handleSubjectSearchChange = (e) => {
    setSubjectSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const filteredFaculty = facultyData.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(facultySearchTerm.toLowerCase()) &&
      faculty.subjects.some((subject) =>
        subject.toLowerCase().includes(subjectSearchTerm.toLowerCase())
      )
  );

  const totalItems = filteredFaculty.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const displayedFaculty = filteredFaculty.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container">
      <div className="sectionHeader">List of Faculty</div>
      <div className="inputContainer">
        <input
          type="text"
          value={facultySearchTerm}
          onChange={handleFacultySearchChange}
          placeholder="Search by faculty name"
          className="searchInput"
        />
        <input
          type="text"
          value={subjectSearchTerm}
          onChange={handleSubjectSearchChange}
          placeholder="Search by subject"
          className="searchInput"
        />
      </div>
      {loading ? (
        <div className="loadingMessage">Loading...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Faculty Name</th>
              <th>Subjects</th>
            </tr>
          </thead>
          <tbody>
            {displayedFaculty.length === 0 ? (
              <tr>
                <td colSpan={3} className="noDataMessage">
                  No data found
                </td>
              </tr>
            ) : (
              displayedFaculty.map((faculty, id) => (
                <tr key={id}>
                  <td>{id + 1}</td>
                  <td>{faculty.name}</td>
                  <td>{faculty.subjects.join(", ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {totalItems > itemsPerPage && (
        <div className="paginationContainer">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="paginationButton"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={i + 1 === currentPage ? "activePage" : ""}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="paginationButton"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ListOfFaculty;
