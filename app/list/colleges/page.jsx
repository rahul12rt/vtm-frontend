"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const CollegeList = () => {
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get("/api/colleges");
        const data = response.data.data;

        // Map the API response to the structure needed for the component
        const mappedColleges = data.map((college, index) => ({
          number: index + 1,
          name: college.attributes.name,
        }));

        setColleges(mappedColleges);
      } catch (error) {
        console.error("Error fetching college data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredColleges.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const displayedColleges = filteredColleges.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="sectionHeader">List of Colleges</div>
      <div className="inputContainer">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by college name"
          className="searchInput"
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Number</th>
            <th>College Name</th>
          </tr>
        </thead>
        <tbody>
          {displayedColleges.length === 0 ? (
            <tr>
              <td colSpan={2}>No colleges found</td>
            </tr>
          ) : (
            displayedColleges.map((college) => (
              <tr key={college.number}>
                <td data-label="Number">{college.number}</td>
                <td data-label="College Name">{college.name}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="paginationContainer">
        {totalPages > 1 && (
          <>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="paginationButton"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={i + 1 === currentPage ? "activePage" : ""}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="paginationButton"
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CollegeList;
