"use client";
import { useState } from "react";

// Dummy data
const data = [
  {
    id: 1,
    materialName: "Algebra Basics",
    className: "1 PUC",
    college: "College A",
  },
  {
    id: 2,
    materialName: "Advanced Geometry",
    className: "2 PUC",
    college: "College B",
  },
  {
    id: 3,
    materialName: "Intro to Calculus",
    className: "10th",
    college: "College C",
  },
  {
    id: 4,
    materialName: "History of Rome",
    className: "11th",
    college: "College A",
  },
];

const AssignedStudyMaterialList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredData = data.filter((item) =>
    item.materialName.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="container">
      <div className="sectionHeader">Assigned Study Material List</div>
      <div className="inputContainer">
        <input
          type="text"
          placeholder="Filter by Study Material Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="input"
          style={{ marginBottom: 20 }}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th className="materialNameColumn">Study Material Name</th>
            <th className="classColumn">Class</th>
            <th className="collegeColumn">College</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id}>
              <td>{item.materialName}</td>
              <td>{item.className}</td>
              <td>{item.college}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedStudyMaterialList;
