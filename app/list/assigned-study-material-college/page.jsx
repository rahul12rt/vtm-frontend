"use client";
import { useEffect, useState } from "react";

const AssignedStudyMaterialList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]); // State to hold the transformed data
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true when fetching begins
      try {
        const response = await fetch("/api/assign-study-college");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();

        // Transform the API response to match the table data structure
        const extractedData = result.data.map((item) => {
          const collegeName = item.attributes.college.data.attributes.name;
          const selfStudies = item.attributes.self_studies.data.map(
            (study) => ({
              id: study.id,
              materialName: study.attributes.name,
              className:
                study.attributes.subject.data.attributes.class.data.attributes
                  .name, // Replace this with actual class data if available
              college: collegeName,
            })
          );
          return selfStudies;
        });

        // Flatten the array of arrays and set the data state
        setData(extractedData.flat());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false once fetching is complete
      }
    };

    fetchData();
  }, []);

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

      {loading ? (
        <div>Loading...</div> // Display a loading message or spinner while fetching
      ) : (
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
      )}
    </div>
  );
};

export default AssignedStudyMaterialList;
