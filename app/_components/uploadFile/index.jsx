import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FaFileUpload } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import styles from "./UploadFile.module.css";

const CollegePortalExcelUpload = ({ collegeId, classId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [columnData, setColumnData] = useState([]);
  const [secondRowFirstColValue, setSecondRowFirstColValue] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [keyColumns, setKeyColumns] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);

  const handleFileUpload = async (event) => {
    setIsProcessing(true);

    const file = event.target.files[0];
    const workbook = await readExcelFile(file);
    const data = await extractDataFromWorksheet(workbook);

    setColumnData(data.columnData);
    setSecondRowFirstColValue(data.secondRowFirstColValue);
    setKeyColumns(data.keyColumns);

    // Calculate total marks based on number of key columns
    const calculatedTotal = data.keyColumns.length * 4;
    setTotalMarks(calculatedTotal);

    setIsProcessing(false);
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        resolve(workbook);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsBinaryString(file);
    });
  };

  const extractDataFromWorksheet = (workbook) => {
    return new Promise((resolve) => {
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Find cells containing "Key" in the first row
      const keyColumns = [];
      if (data.length > 0) {
        data[0].forEach((cell, index) => {
          if (
            cell &&
            typeof cell === "string" &&
            cell.toLowerCase().includes("key")
          ) {
            keyColumns.push({
              columnIndex: index,
              value: cell,
            });
          }
        });
      }

      // Extract the data from the third and fifth columns, excluding the first row and null/empty values
      const columnData = data
        .slice(1)
        .map((row) => [row[2], row[4]])
        .filter(
          ([c, e]) =>
            c !== null &&
            c !== "" &&
            c !== undefined &&
            e !== null &&
            e !== "" &&
            e !== undefined
        );

      resolve({
        columnData,
        secondRowFirstColValue: data[1][0],
        keyColumns,
      });
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!secondRowFirstColValue) return;
      try {
        const testId = await fetchTestId(secondRowFirstColValue);
        await fetchStudentData(testId);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [secondRowFirstColValue]);

  const fetchTestId = async (testName) => {
    const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const response = await fetch(
      `${strapiApiUrl}/api/assign-tests?populate[create_test]=*&filters[create_test][name][$eq]=${encodeURIComponent(
        testName
      )}`
    );

    if (!response.ok) {
      throw new Error("Test not found");
    }

    const data = await response.json();
    setApiData(data.data[0].attributes.create_test.data.id);
    return data.data[0].attributes.create_test.data.id;
  };

  const fetchStudentData = async (testId) => {
    const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

    for (const [rollNumber, testValue] of columnData.filter(
      ([c, e]) => c !== undefined && e !== undefined
    )) {
      const numericRollNumber = rollNumber;

      if (!isNaN(numericRollNumber)) {
        try {
          const studentResponse = await fetch(
            `${strapiApiUrl}/api/students?populate[college]=*&filters[college][id][$eq]=${collegeId}&populate[class]=*&filters[class][id][$eq]=${classId}&filters[roll_number][$eq]=${numericRollNumber}`
          );

          if (studentResponse.ok) {
            const studentDataResponse = await studentResponse.json();
            const studentId = studentDataResponse.data[0].id;
            await submitResults(studentId, testValue, testId);
          } else {
            console.error(
              "Failed to fetch data for roll number:",
              numericRollNumber
            );
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      }
    }
  };

  const submitResults = async (studentId, obtainedMarks, testId) => {
    const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const resultsEndpoint = `${strapiApiUrl}/api/results?populate=*`;
    try {
      await toast.promise(
        fetch(resultsEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              create_test: testId,
              student: studentId,
              total: totalMarks, // Using the calculated total based on key columns
              obtained: obtainedMarks,
              test_info: "",
            },
          }),
        }),
        {
          loading: "Submitting result...",
          success: "Result submitted successfully",
          error: "Failed to submit result",
        }
      );
    } catch (error) {
      console.error("Error submitting result:", error);
    }
  };

  return (
    <div
      className={`${styles.uploadCard} ${isProcessing ? styles.disabled : ""}`}
    >
      <Toaster position="top-right" reverseOrder={false} />
      <label className={styles.uploadLabel}>
        <FaFileUpload className={styles.uploadIcon} />
        {isProcessing ? "Processing..." : "Upload Excel File"}
        <input
          type="file"
          id="fileUpload"
          accept=".xlsx, .xls"
          className={styles.uploadInput}
          disabled={isProcessing}
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
};

export default CollegePortalExcelUpload;
