"use client";
import { useState } from "react";

const dummyData = [
  {
    name: "Algebra Basics",
    subject: "Math",
    chapter: "Algebra",
    class: "1 PU",
  },
  {
    name: "Advanced Geometry",
    subject: "Math",
    chapter: "Geometry",
    class: "2 PU",
  },
  {
    name: "Intro to Calculus",
    subject: "Math",
    chapter: "Calculus",
    class: "2 PU",
  },
  {
    name: "History of Rome",
    subject: "History",
    chapter: "Ancient Rome",
    class: "1 PU",
  },
  {
    name: "Shakespeare's Plays",
    subject: "English",
    chapter: "Literature",
    class: "2 PU",
  },
];

const ListOfSelfStudies = () => {
  const [filter, setFilter] = useState("");

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredData = dummyData.filter((material) =>
    material.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container">
      <div className="sectionHeader">List of Self Study Materials</div>
      <div className="inputContainer">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter by self-study name"
          className="input"
          style={{ marginBottom: 20 }}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "70%" }}>Self Study Name</th>
            <th style={{ width: "10%" }}>Subject</th>
            <th style={{ width: "10%" }}>Chapter</th>
            <th style={{ width: "10%" }}>Class</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((material, index) => (
            <tr key={index}>
              <td>{material.name}</td>
              <td>{material.subject}</td>
              <td>{material.chapter}</td>
              <td>{material.class}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListOfSelfStudies;
