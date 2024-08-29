"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import SearchableDropdown from "../_components/searchAbleDropDown";
import Pagination from "../_components/pagination";
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
        const result = await axios.get("/api/get-test-results", {
          cache: "no-store",
        });
        console.log(result);
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
            axios.get("/api/get-colleges"),
            axios.get("/api/get-class"),
            axios.get("/api/get-subjects"),
            axios.get("/api/get-topics"),
            axios.get("/api/get-dates"),
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

        console.log("Formatted Options:", formattedOptions);

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

          {data.filteredData.length === 0 ? (
            <p>No results found for the selected filters.</p>
          ) : (
            groupData(data.filteredData).map((group, groupIndex) => {
              const totalItems = group.students.length;
              const itemsPerPage =
                data.pagination[groupIndex]?.itemsPerPage || 10;
              const currentPage = data.pagination[groupIndex]?.currentPage || 1;
              const paginatedStudents = group.students.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              );

              return (
                <div key={groupIndex} className={styles.testSection}>
                  <div className={styles.headerSection}>
                    <div className={styles.sectionHeader}>
                      College Name - {group.collegeName}
                    </div>
                  </div>
                  <div className={styles.tableContainer}>
                    <div className={styles.classDetails}>
                      {group.className} Section
                    </div>
                    <div className={styles.testDetails}>
                      <div className={styles.testTitle}>
                        Test Title - {group.subjectName}
                      </div>
                      <div className={styles.testTitle}>
                        Topic - {group.topicName}
                      </div>
                      <div className={styles.testDate}>
                        Conducted On - {group.testDate}
                      </div>
                    </div>

                    <table className={styles.resultsTable}>
                      <thead>
                        <tr>
                          <th>Roll Number</th>
                          <th>Name</th>
                          <th>Marks Obtained</th>
                          <th>Total Marks</th>
                          <th>Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents.map((student) => (
                          <tr key={student.id}>
                            <td>
                              {student.attributes.student?.data?.attributes
                                ?.roll_number || "N/A"}
                            </td>
                            <td>
                              {student.attributes.student?.data?.attributes
                                ?.name || "N/A"}
                            </td>
                            <td>{student.attributes?.obtained || "N/A"}</td>
                            <td>{student.attributes?.total_marks || "N/A"}</td>
                            <td>{student.attributes?.rank || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={(page) =>
                        handlePageChange(groupIndex, page)
                      }
                      onItemsPerPageChange={(items) =>
                        handleItemsPerPageChange(groupIndex, items)
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export default Results;
