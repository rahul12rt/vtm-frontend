"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const ListOfStudent = () => {
  const [students, setStudents] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("/api/register/student");
        const data = response.data.data;

        // Map the API response to the required format
        const mappedStudents = data.map((item, index) => ({
          roll_number: item.attributes.roll_number, // Updated to use roll_number
          name: item.attributes.name,
          email: item.attributes.email,
          username: item.attributes.user_name,
          college: item.attributes.college.data.attributes.name,
          class: item.attributes.class.data.attributes.name,
          year: item.attributes.academic_year,
        }));

        setStudents(mappedStudents);

        // Extract unique classes and years for dropdown filters
        const uniqueClasses = [
          ...new Set(mappedStudents.map((student) => student.class)),
        ];
        const uniqueYears = [
          ...new Set(mappedStudents.map((student) => student.year)),
        ];

        setClasses(uniqueClasses);
        setYears(uniqueYears);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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

  const filteredData = students.filter(
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

  if (loading) {
    return (
      <div className="container">
        <div className="loader">Loading...</div>
      </div>
    );
  }

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
            <th>Roll Number</th> {/* Updated header */}
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
              <tr key={student.roll_number}>
                <td>{student.roll_number}</td>{" "}
                {/* Updated to display roll_number */}
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
