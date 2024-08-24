"use client";
import { useState, useEffect } from "react";

const collegeData = [
  { number: 1, name: "Harvard University" },
  { number: 2, name: "Massachusetts Institute of Technology (MIT)" },
  { number: 3, name: "Stanford University" },
  { number: 4, name: "University of Oxford" },
  { number: 5, name: "University of Cambridge" },
  { number: 6, name: "California Institute of Technology (Caltech)" },
  { number: 7, name: "University of Chicago" },
  { number: 8, name: "Imperial College London" },
  { number: 9, name: "ETH Zurich" },
];

const CollegeList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredColleges = collegeData.filter((college) =>
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
    </div>
  );
};

export default CollegeList;
