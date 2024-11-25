"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { decrypt } from "@/app/_utils/encryptionUtils";

function ExamResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const encryptedUser = Cookies.get("user");
        const username = decrypt(encryptedUser);

        if (!username) {
          console.error("No username found in cookies");
          return;
        }
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const resultsEndpoint = `${strapiApiUrl}/api/results?filters[create_test][exam_type][$eq]=2&filters[student][user_name][$eq]=${username}&populate[create_test][populate]=class,academic_year,subject,topics,exam_name,exam_type,college&populate=student`;

        const response = await fetch(resultsEndpoint);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        setResults(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="container">
      <div className="sectionHeader">Test Results</div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {results.length > 0 ? (
        results.map((result) => {
          const testInfo = result.attributes;
          const createTest = result.attributes.create_test.data.attributes;
          return (
            <div key={result.id} className="examResult">
              {/* <h2>College: {createTest.class.data.attributes.name}</h2> */}
              {/* <h3>
                {createTest.exam_name} (
                {createTest.academic_year.data.attributes.year}) -{" "}
                {createTest.date}
              </h3> */}
              <h4>Test : {createTest.name}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Obtained Marks</th>
                    <th>Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  <td>{createTest.subject.data.attributes.name}</td>
                  <td>{testInfo.obtained}</td>
                  <td>{testInfo.total}</td>
                </tbody>
              </table>
            </div>
          );
        })
      ) : (
        <div>No results found.</div>
      )}
    </div>
  );
}

export default ExamResults;
