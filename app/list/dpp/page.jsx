"use client";
import React, { useState } from "react";

// Dummy data
const dppData = [
  {
    id: 1,
    name: "Algebra Basics",
    subject: "Mathematics",
    chapters: ["Algebra"],
    topics: ["Linear Equations", "Quadratic Equations"],
    class: "1 PUC",
  },
  {
    id: 2,
    name: "Physics Mechanics",
    subject: "Physics",
    chapters: ["Mechanics"],
    topics: ["Newton's Laws", "Friction"],
    class: "2 PUC",
  },
  {
    id: 3,
    name: "Organic Chemistry",
    subject: "Chemistry",
    chapters: ["Organic Chemistry"],
    topics: ["Hydrocarbons", "Functional Groups"],
    class: "10th",
  },
  {
    id: 4,
    name: "Calculus Fundamentals",
    subject: "Mathematics",
    chapters: ["Calculus"],
    topics: ["Derivatives", "Integrals"],
    class: "1 PUC",
  },
];

const ListOfDPP = () => {
  const [filter, setFilter] = useState("");

  const filteredDPPs = dppData.filter((dpp) =>
    dpp.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <div className="sectionHeader">List of DPP</div>
        <div className="formGroup">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Enter DPP name"
            className="filterInput"
            style={{ marginBottom: 20 }}
          />
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th className="dppName">DPP Name</th>
            <th>Subject</th>
            <th>Chapters</th>
            <th>Topics</th>
            <th>Class</th>
          </tr>
        </thead>
        <tbody>
          {filteredDPPs.map((dpp) => (
            <tr key={dpp.id}>
              <td className="dppName">{dpp.name}</td>
              <td>{dpp.subject}</td>
              <td>{dpp.chapters.join(", ")}</td>
              <td>{dpp.topics.join(", ")}</td>
              <td>{dpp.class}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListOfDPP;
