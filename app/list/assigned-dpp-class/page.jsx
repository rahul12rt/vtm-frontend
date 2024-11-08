"use client";
import React, { useState, useEffect } from "react";

const AssignedDPPList = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch("/api/assign-dpp-college");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result.data); // Update the state with fetched data
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredData = data.filter((item) =>
    item.attributes.creat_dpps.data.some((dpp) =>
      dpp.attributes.name.toLowerCase().includes(searchTerm)
    )
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

      {loading ? (
        <div className="loading">Loading...</div> // Loading indicator
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="dppNameColumn">DPP Name</th>
              <th className="classColumn">Class</th>
              <th className="collegeColumn">College</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) =>
                item.attributes.creat_dpps.data.map((dpp) => (
                  <tr key={dpp.id}>
                    <td>{dpp.attributes.name}</td>
                    <td>
                      {
                        dpp.attributes.subject.data.attributes.class.data
                          .attributes.name
                      }
                    </td>
                    <td>{item.attributes.college.data.attributes.name}</td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan="3">No DPPs found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AssignedDPPList;
