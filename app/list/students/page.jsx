"use client";
import { useState } from "react";

const studentData = [
  {
    number: 1,
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    college: "Harvard",
    class: "1 PUC",
    year: "2024-25",
  },
  {
    number: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    username: "janesmith",
    college: "MIT",
    class: "2 PUC",
    year: "2023-24",
  },
  {
    number: 3,
    name: "Alice Johnson",
    email: "alice@example.com",
    username: "alicejohnson",
    college: "Stanford",
    class: "10th",
    year: "2024-25",
  },
  {
    number: 4,
    name: "Bob Brown",
    email: "bob@example.com",
    username: "bobbrown",
    college: "Oxford",
    class: "9th",
    year: "2023-24",
  },
  {
    number: 5,
    name: "Charlie Davis",
    email: "charlie@example.com",
    username: "charliedavis",
    college: "Harvard",
    class: "1 PUC",
    year: "2024-25",
  },
  {
    number: 6,
    name: "Daisy Wilson",
    email: "daisy@example.com",
    username: "daisywilson",
    college: "MIT",
    class: "2 PUC",
    year: "2023-24",
  },
  {
    number: 7,
    name: "Edward Thomas",
    email: "edward@example.com",
    username: "edwardthomas",
    college: "Stanford",
    class: "10th",
    year: "2024-25",
  },
  {
    number: 8,
    name: "Fiona Lee",
    email: "fiona@example.com",
    username: "fionalee",
    college: "Oxford",
    class: "9th",
    year: "2023-24",
  },
  {
    number: 9,
    name: "George Harris",
    email: "george@example.com",
    username: "georgeharris",
    college: "Harvard",
    class: "1 PUC",
    year: "2024-25",
  },
];

const classes = ["1 PUC", "2 PUC", "10th", "9th"];
const years = ["2024-25", "2023-24"];

const ListOfStudent = () => {
  const [nameFilter, setNameFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") setNameFilter(value);
    if (name === "college") setCollegeFilter(value);
  };

  const handleClassChange = (e) => {
    setClassFilter(e.target.value);
  };

  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
  };

  const filteredData = studentData.filter(
    (student) =>
      student.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      student.college.toLowerCase().includes(collegeFilter.toLowerCase()) &&
      (classFilter ? student.class === classFilter : true) &&
      (yearFilter ? student.year === yearFilter : true)
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const displayedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container">
      <div className="sectionHeader">List of Students</div>
      <div className="inputContainer">
        <input
          type="text"
          name="name"
          value={nameFilter}
          onChange={handleFilterChange}
          placeholder="Search by name"
          className="formGroup"
        />
        <input
          type="text"
          name="college"
          value={collegeFilter}
          onChange={handleFilterChange}
          placeholder="Search by college"
          className="formGroup"
        />
        <select
          value={classFilter}
          onChange={handleClassChange}
          className="select"
        >
          <option value="">Select class</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={handleYearChange}
          className="select"
        >
          <option value="">Select year</option>
          {years.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>College</th>
            <th>Class</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.length === 0 ? (
            <tr>
              <td colSpan={7} className="noDataMessage">
                No data found
              </td>
            </tr>
          ) : (
            displayedData.map((student) => (
              <tr key={student.number}>
                <td>{student.number}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.username}</td>
                <td>{student.college}</td>
                <td>{student.class}</td>
                <td>{student.year}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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

export default ListOfStudent;
