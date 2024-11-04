import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./index.module.css";

const TestResults = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No results available</div>;
  }

  const testInfo = data[0].attributes.create_test.data.attributes;
  const collegeInfo =
    data[0].attributes.student.data.attributes.college.data.attributes;
  const academicYear = data[0].attributes.student.data.attributes.academic_year; // Extract academic year

  // Sort the results based on obtained marks in descending order
  const results = data
    .map((item) => ({
      id: item.id,
      rollNo: item.attributes.student.data.attributes.roll_number,
      name: item.attributes.student.data.attributes.name,
      marksObtained: item.attributes.obtained,
      totalMarks: item.attributes.total,
    }))
    .sort((a, b) => b.marksObtained - a.marksObtained) // Sorting by obtained marks
    .map((result, index) => ({
      ...result,
      rank: index + 1, // Dynamic ranking based on sorted marks
    }));

  const exportPDF = () => {
    const input = document.getElementById("pdfContent");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("test_results.pdf");
    });
  };

  return (
    <div className="container">
      <div className={styles.exportButton}>
        <button className="submitButton" onClick={exportPDF}>
          Export to PDF <strong>↗</strong>
        </button>
      </div>
      <div id="pdfContent">
        <div className="sectionHeader">College Name - {collegeInfo.name}</div>
        <div className={styles.infoSection}>
          <h2 className={styles.infoTitle}>
            {testInfo.subject.data.attributes.class.data.attributes.name}{" "}
            {testInfo.exam_name} Section {academicYear}
          </h2>
          <p className={styles.infoDetails}>
            Test - {testInfo.subject.data.attributes.name}
            &nbsp;&nbsp;|&nbsp;&nbsp;Topic - {testInfo.name}
            &nbsp;&nbsp;|&nbsp;&nbsp;Date: {testInfo.date}
          </p>
        </div>

        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Marks Obtained</th>
              <th>Total Marks</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td>{result.rollNo}</td>
                <td>{result.name}</td>
                <td>{result.marksObtained}</td>
                <td>{result.totalMarks}</td>
                <td>{result.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestResults;
