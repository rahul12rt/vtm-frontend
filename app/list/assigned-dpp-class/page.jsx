"use client";
import React, { useState } from "react";

// Dummy data
const data = [
  {
    id: 1,
    dppName: "Algebra Basics",
    className: "1 PUC",
    college: "College A",
  },
  {
    id: 2,
    dppName: "Physics Mechanics",
    className: "2 PUC",
    college: "College B",
  },
  {
    id: 3,
    dppName: "Organic Chemistry",
    className: "10th",
    college: "College C",
  },
  {
    id: 4,
    dppName: "Calculus Fundamentals",
    className: "11th",
    college: "College A",
  },
];

const AssignedDPPList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredData = data.filter((item) =>
    item.dppName.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="container">
      <div className="sectionHeader">Assigned DPPs</div>

      <div className="inputContainer">
        <input
          type="text"
          placeholder="Filter by DPP Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="input"
          style={{ marginBottom: 20 }}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th className="dppNameColumn">DPP Name</th>
            <th className="classColumn">Class</th>
            <th className="collegeColumn">College</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id}>
              <td>{item.dppName}</td>
              <td>{item.className}</td>
              <td>{item.college}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedDPPList;
