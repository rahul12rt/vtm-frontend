"use client";
import React, { useEffect, useState } from "react";
import CollegePortalExcelUpload from "../../_components/uploadFile";

function AssignTest() {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Assign Tests
        const assignTestsResponse = await fetch(
          `${strapiApiUrl}/api/assign-tests?populate[create_test][populate]=class&populate=colleges`
        );
        const assignTestsData = await assignTestsResponse.json();

        // Fetch Results
        const resultsResponse = await fetch(
          `${strapiApiUrl}/api/results?populate=*`
        );
        const resultsData = await resultsResponse.json();

        // Sort tests in descending order based on ID
        const sortedTests = assignTestsData.data.sort((a, b) => b.id - a.id);

        setTests(sortedTests);
        setResults(resultsData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to check if upload should be disabled
  const shouldDisableUpload = (testId) => {
    return results.some(
      (result) => result.attributes.create_test.data.id == testId
    );
  };

  // Function to create table rows for each college
  const createTableRows = () => {
    const rows = [];

    tests.forEach((test) => {
      const testData = test.attributes;
      const createTest = testData.create_test.data.attributes;
      const className = createTest.class.data.attributes.name;
      const classId = createTest.class.data.id;
      const testId = testData.create_test.data.id;

      testData.colleges.data.forEach((college) => {
        const collegeData = college.attributes;

        rows.push(
          <tr key={`${test.id}-${college.id}`} className="hover:bg-gray-50">
            <td className="px-6 py-4">{createTest.name}</td>
            <td className="px-6 py-4">{className}</td>
            <td className="px-6 py-4">{collegeData.name}</td>
            <td className="px-6 py-4">
              <CollegePortalExcelUpload
                collegeId={college.id}
                classId={classId}
                disabled={shouldDisableUpload(testId)}
              />
            </td>
          </tr>
        );
      });
    });

    return rows;
  };

  // Pagination calculations
  const tableRows = createTableRows();
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableRows.slice(indexOfFirstRow, indexOfLastRow);

  // Calculate total pages
  const totalPages = Math.ceil(tableRows.length / rowsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Rows per page handler
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
            {currentRows}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{display:"flex", justifyContent:"space-between", margin:"30px 0px"}}>
          {/* Rows per page selector,  */}
     

          {/* Pagination Buttons */}
          <div >
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
           style={{marginRight:10}}
            >
              Previous
            </button>
            <span className="self-center text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{marginLeft:10}}
            >
              Next
            </button>
          </div>
          <div className="flex items-center space-x-2">
       
       <select 
         value={rowsPerPage} 
         onChange={handleRowsPerPageChange}
         className="border rounded px-2 py-1"
       >
         {[5, 10, 15, 20, 25].map((pageSize) => (
           <option key={pageSize} value={pageSize}>
             {pageSize}
           </option>
         ))}
       </select>
     </div>
        </div>
      </div>
    </div>
  );
}

export default AssignTest;