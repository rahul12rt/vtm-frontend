"use client";
import React, { useEffect, useState } from "react";
import CollegePortalExcelUpload from "../../_components/uploadFile";

function AssignTest() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(
          `${strapiApiUrl}/api/assign-tests?populate[create_test][populate]=class&populate=colleges`
        );
        const data = await response.json();
        setTests(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tests:", error);
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  console.log(tests);

  // Function to create table rows for each college
  const createTableRows = () => {
    const rows = [];

    tests.forEach((test) => {
      const testData = test.attributes;
      const createTest = testData.create_test.data.attributes;
      const className = createTest.class.data.attributes.name;
      const classId = createTest.class.data.id;

      // Create a row for each college
      testData.colleges.data.forEach((college) => {
        const collegeData = college.attributes;
        console.log("College ID:", college.id, "Class ID:", classId);

        rows.push(
          <tr key={`${test.id}-${college.id}`} className="hover:bg-gray-50">
            <td className="px-6 py-4">{createTest.name}</td>
            <td className="px-6 py-4">{className}</td>
            <td className="px-6 py-4">{collegeData.name}</td>
            <td className="px-6 py-4">
              <CollegePortalExcelUpload
                collegeId={college.id}
                classId={classId}
              />
            </td>
          </tr>
        );
      });
    });

    return rows;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {createTableRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignTest;
