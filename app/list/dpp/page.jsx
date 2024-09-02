"use client";
import { useState, useEffect } from "react";

const ListOfDPP = () => {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/create-dpp");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();

        // Extracting the data from the API response
        const extractedData = result.data.map((item) => ({
          name: item.attributes.name,
          subject: item.attributes.subject.data.attributes.name,
          chapter: item.attributes.chapters.data
            .map((ch) => ch.attributes.name)
            .join(", "),
          class: item.attributes.class.data.attributes.name,
        }));

        console.log("Fetched Data:", extractedData); // Log the fetched data
        setData(extractedData); // Set the data state with the transformed data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredData = data.filter((material) => {
    const name = material.name.toLowerCase();
    const filterValue = filter.toLowerCase();
    const isMatch = name.includes(filterValue);

    console.log(`Filtering: "${filterValue}" vs "${name}" - Match: ${isMatch}`);

    return isMatch;
  });

  return (
    <div className="container">
      <div className="sectionHeader">List of DPP Materials</div>
      <div className="inputContainer">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter by DPP material name"
          className="input"
          style={{ marginBottom: 20 }}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "70%" }}>DPP material Name</th>
            <th style={{ width: "10%" }}>Subject</th>
            <th style={{ width: "10%" }}>Chapter</th>
            <th style={{ width: "10%" }}>Class</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((material, index) => (
              <tr key={index}>
                <td>{material.name}</td>
                <td>{material.subject}</td>
                <td>{material.chapter}</td>
                <td>{material.class}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No results found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListOfDPP;
