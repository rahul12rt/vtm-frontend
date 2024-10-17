"use client";
import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const ListOfSelfStudies = () => {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/self-study");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();

      const extractedData = result.data.map((item) => ({
        id: item.id,
        name: item.attributes.name,
        subject: item.attributes.subject.data.attributes.name,
        chapter: item.attributes.chapters.data
          .map((ch) => ch.attributes.name)
          .join(", "),
        class: item.attributes.class.data.attributes.name,
        academic_year: item.attributes.academic_year.data.attributes.year,
      }));

      console.log("Fetched Data:", extractedData);
      setData(extractedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch study materials.");
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredData = data.filter((material) => {
    return material.name.toLowerCase().includes(filter.toLowerCase());
  });

  const handleDelete = async (id) => {
    console.log(id);
    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/self-study", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studyId: id }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete study material.");
        }

        setData((prevData) => prevData.filter((item) => item.id !== id));
      })(),
      {
        loading: "Deleting study material...",
        success: "Study material deleted successfully.",
        error: "Failed to delete study material.",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );

    await action;
  };

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
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
            <th style={{ width: "50%" }}>Self Study Name</th>
            <th style={{ width: "10%" }}>Subject</th>
            <th style={{ width: "10%" }}>Chapter</th>
            <th style={{ width: "10%" }}>Class</th>
            <th style={{ width: "20%" }}>Academic Year</th>
            <th style={{ width: "10%" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((material) => (
              <tr key={material.id}>
                <td>{material.name}</td>
                {console.log(material)}
                <td>{material.subject}</td>
                <td>{material.chapter}</td>
                <td>{material.class}</td>
                <td>{material.academic_year}</td>
                <td>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="deleteButton"
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No results found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListOfSelfStudies;
