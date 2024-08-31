"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import SearchableDropdown from "../_components/searchAbleDropDown";
import Pagination from "../_components/pagination";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaExternalLinkAlt } from "react-icons/fa";
import styles from "./page.module.css";

const Results = () => {
  const [data, setData] = useState({
    response: [],
    filteredData: [],
    options: {
      colleges: [],
      classes: [],
      subjects: [],
      topics: [],
      dates: [],
    },
    selectedFilters: {
      college: "",
      class: "",
      subject: "",
      topic: "",
      date: "",
    },
    pagination: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await axios.get("/api/test-results", {
          cache: "no-store",
        });
        setData((prevState) => ({
          ...prevState,
          response: result.data.data || [],
          filteredData: result.data.data || [],
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

  useEffect(() => {
    async function fetchDropdownOptions() {
      try {
        const [collegesRes, classesRes, subjectsRes, topicsRes, datesRes] =
          await Promise.all([
            axios.get("/api/colleges"),
            axios.get("/api/class"),
            axios.get("/api/subjects"),
            axios.get("/api/topics"),
            axios.get("/api/dates"),
          ]);

        const formatOptions = (response, type) => {
          return response.data.data.map((item) => ({
            id: item.id,
            name:
              type === "dates" ? item.attributes.date : item.attributes.name,
          }));
        };

        const formattedOptions = {
          colleges: formatOptions(collegesRes, "default"),
          classes: formatOptions(classesRes, "default"),
          subjects: formatOptions(subjectsRes, "default"),
          topics: formatOptions(topicsRes, "default"),
          dates: formatOptions(datesRes, "dates"),
        };

        setData((prevState) => ({
          ...prevState,
          options: formattedOptions,
        }));
      } catch (error) {
        console.log("Error fetching dropdown options:", error.message);
        setError("Error fetching dropdown options. Please try again later.");
      }
    }

    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    if (error) return;

    const { response, selectedFilters } = data;

    const filtered = response.filter((item) => {
      const collegeName = item.attributes.college?.data?.attributes?.name || "";
      const className = item.attributes.class?.data?.attributes?.name || "";
      const subjectName = item.attributes.subject?.data?.attributes?.name || "";
      const topicName = item.attributes.topic?.data?.attributes?.name || "";
      const testDate = item.attributes.test?.data?.attributes?.date || "";

      return (
        (!selectedFilters.college || collegeName === selectedFilters.college) &&
        (!selectedFilters.class || className === selectedFilters.class) &&
        (!selectedFilters.subject || subjectName === selectedFilters.subject) &&
        (!selectedFilters.topic || topicName === selectedFilters.topic) &&
        (!selectedFilters.date || testDate === selectedFilters.date)
      );
    });

    setData((prevState) => ({
      ...prevState,
      filteredData: filtered,
    }));
  }, [data.selectedFilters, data.response, error]);

  const groupData = (data) => {
    const groups = data.reduce((acc, item) => {
      const collegeName = item.attributes.college?.data?.attributes?.name || "";
      const className = item.attributes.class?.data?.attributes?.name || "";
      const subjectName = item.attributes.subject?.data?.attributes?.name || "";
      const topicName = item.attributes.topic?.data?.attributes?.name || "";
      const testDate = item.attributes.test?.data?.attributes?.date || "";

      const key = `${collegeName}|${className}|${subjectName}|${topicName}|${testDate}`;

      if (!acc[key]) {
        acc[key] = {
          collegeName,
          className,
          subjectName,
          topicName,
          testDate,
          students: [],
        };
      }
      acc[key].students.push(item);
      return acc;
    }, {});

    // Sort the groups based on roll number
    Object.keys(groups).forEach((key) => {
      groups[key].students.sort((a, b) => {
        const rollA = a.attributes.student?.data?.attributes?.roll_number || "";
        const rollB = b.attributes.student?.data?.attributes?.roll_number || "";
        return rollA.localeCompare(rollB); // Change this to `rollB.localeCompare(rollA)` for descending order
      });
    });

    return Object.values(groups);
  };

  const handlePageChange = (groupIndex, page) => {
    setData((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        [groupIndex]: {
          ...prevState.pagination[groupIndex],
          currentPage: page,
        },
      },
    }));
  };

  const handleItemsPerPageChange = (groupIndex, itemsPerPage) => {
    setData((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        [groupIndex]: {
          ...prevState.pagination[groupIndex],
          itemsPerPage,
          currentPage: 1,
        },
      },
    }));
  };

  const exportToPDF = (groupIndex) => {
    const titleElement = document.getElementById(`title-${groupIndex}`);
    const tableElement = document.getElementById(`table-${groupIndex}`);

    Promise.all([html2canvas(titleElement), html2canvas(tableElement)]).then(
      ([titleCanvas, tableCanvas]) => {
        const titleImgData = titleCanvas.toDataURL("image/png");
        const tableImgData = tableCanvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const titleImgHeight =
          (titleCanvas.height * imgWidth) / titleCanvas.width;
        const tableImgHeight =
          (tableCanvas.height * imgWidth) / tableCanvas.width;
        let heightLeft = titleImgHeight + tableImgHeight;
        let position = 0;

        // Add title to PDF
        pdf.addImage(
          titleImgData,
          "PNG",
          0,
          position,
          imgWidth,
          titleImgHeight
        );
        position += titleImgHeight;

        // Add table to PDF
        pdf.addImage(
          tableImgData,
          "PNG",
          0,
          position,
          imgWidth,
          tableImgHeight
        );
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - tableImgHeight;
          pdf.addPage();
          pdf.addImage(titleImgData, "PNG", 0, 0, imgWidth, titleImgHeight);
          pdf.addImage(
            tableImgData,
            "PNG",
            0,
            titleImgHeight,
            imgWidth,
            tableImgHeight
          );
          heightLeft -= pageHeight;
        }

        pdf.save(`test-results-${groupIndex}.pdf`);
      }
    );
  };

  return (
    <div className="container">
      <h2 className="sectionHeader">Filter Test Results</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <div className="inputContainer">
            <SearchableDropdown
              options={data.options.colleges}
              selectedValue={data.selectedFilters.college}
              onChange={(value) =>
                setData((prevState) => ({
                  ...prevState,
                  selectedFilters: {
                    ...prevState.selectedFilters,
                    college: value,
                  },
                }))
              }
              placeholder="Select College"
            />
          </div>
          <div className="inputContainer">
            <SearchableDropdown
              options={data.options.classes}
              selectedValue={data.selectedFilters.class}
              onChange={(value) =>
                setData((prevState) => ({
                  ...prevState,
                  selectedFilters: {
                    ...prevState.selectedFilters,
                    class: value,
                  },
                }))
              }
              placeholder="Select Class"
            />
            <SearchableDropdown
              options={data.options.subjects}
              selectedValue={data.selectedFilters.subject}
              onChange={(value) =>
                setData((prevState) => ({
                  ...prevState,
                  selectedFilters: {
                    ...prevState.selectedFilters,
                    subject: value,
                  },
                }))
              }
              placeholder="Select Subject"
            />
            <SearchableDropdown
              options={data.options.topics}
              selectedValue={data.selectedFilters.topic}
              onChange={(value) =>
                setData((prevState) => ({
                  ...prevState,
                  selectedFilters: {
                    ...prevState.selectedFilters,
                    topic: value,
                  },
                }))
              }
              placeholder="Select Topic"
            />
            <SearchableDropdown
              options={data.options.dates}
              selectedValue={data.selectedFilters.date}
              onChange={(value) =>
                setData((prevState) => ({
                  ...prevState,
                  selectedFilters: {
                    ...prevState.selectedFilters,
                    date: value,
                  },
                }))
              }
              placeholder="Select Date"
            />
          </div>
          {groupData(data.filteredData).map((group, index) => (
            <div key={index}>
              <div id={`title-${index}`} className={styles.titleContainer}>
                <div className={styles.headerSection}>
                  <div className={styles.sectionHeader}>
                    College Name - {group.collegeName}
                  </div>
                </div>
                <div className={styles.tableContainer}>
                  <div className={styles.classDetails}>
                    {group.className} Section
                  </div>
                  <div
                    className={styles.testDetails}
                    style={{ marginBottom: 10 }}
                  >
                    <div className={styles.testTitle}>
                      Test Title - {group.subjectName}
                    </div>
                    <div className={styles.testTitle}>
                      Topic - {group.topicName}
                    </div>
                    <div className={styles.testDate}>
                      Test Date: {group.testDate}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => exportToPDF(index)}
                className="submitButton"
                style={{ float: "right", margin: "20px 0px" }}
              >
                Export to PDF <FaExternalLinkAlt />
              </button>
              <table id={`table-${index}`} className={styles.resultsTable}>
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
                  {group.students
                    .slice(
                      (data.pagination[index]?.currentPage - 1 || 0) *
                        (data.pagination[index]?.itemsPerPage || 10),
                      (data.pagination[index]?.currentPage || 1) *
                        (data.pagination[index]?.itemsPerPage || 10)
                    )
                    .map((student, studentIndex) => (
                      <tr key={studentIndex}>
                        <td>
                          {
                            student.attributes.student?.data?.attributes
                              ?.roll_number
                          }
                        </td>
                        <td>
                          {student.attributes.student?.data?.attributes?.name}
                        </td>
                        <td>{student.attributes?.obtained}</td>
                        <td>{student.attributes?.total_marks}</td>
                        <td>{student.attributes.rank}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Pagination
                totalItems={group.students.length}
                itemsPerPage={data.pagination[index]?.itemsPerPage || 10}
                currentPage={data.pagination[index]?.currentPage || 1}
                onPageChange={(page) => handlePageChange(index, page)}
                onItemsPerPageChange={(itemsPerPage) =>
                  handleItemsPerPageChange(index, itemsPerPage)
                }
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Results;
