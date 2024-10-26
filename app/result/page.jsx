"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Result = () => {
  const [data, setData] = useState({ response: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await axios.get("/api/results", {
          cache: "no-store",
        });
        const fetchedData = result.data.data || [];

        // Remove duplicate tests based on name, exam_name, and date
        const uniqueTests = fetchedData.reduce((acc, current) => {
          const existingTest = acc.find(
            (item) =>
              item.attributes.create_test.data.attributes.name ===
                current.attributes.create_test.data.attributes.name &&
              item.attributes.create_test.data.attributes.exam_name ===
                current.attributes.create_test.data.attributes.exam_name &&
              item.attributes.create_test.data.attributes.date ===
                current.attributes.create_test.data.attributes.date
          );
          if (!existingTest) {
            acc.push(current);
          }
          return acc;
        }, []);

        setData((prevState) => ({
          ...prevState,
          response: uniqueTests,
        }));
      } catch (error) {
        console.log("Error fetching data:", error.message);
        setError(
          "This page is currently under maintenance. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  console.log(data);

  // Filter results based on search term
  const filteredResults = data.response.filter((item) =>
    item.attributes.create_test.data.attributes.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleViewResults = (id) => {
    router.push(`/result/${id}`); // Navigate to the specific result ID
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container"> {error}</div>;
  }

  return (
    <div className="container">
      <div className="sectionHeader">Results</div>
      <div className="inputContainer">
        <input
          type="text"
          placeholder="Search by Assessment Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
        />
      </div>
      <div className="cardContainer">
        {filteredResults.length === 0 ? (
          <p>No data available</p>
        ) : (
          filteredResults.map((item) => {
            const testAttributes = item.attributes.create_test.data.attributes;
            return (
              <div key={item.id} className="cardResults">
                <div>
                  <h2>{testAttributes.name}</h2>
                  <div style={{ display: "flex", gap: 20 }}>
                    <p>Type: {testAttributes.exam_name}</p>
                    <p>Date: {testAttributes.date}</p>
                  </div>
                </div>
                <button
                  className="submitButton"
                  onClick={() =>
                    handleViewResults(item.attributes.create_test.data.id)
                  } // Handle navigation
                >
                  View Results
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Result;
