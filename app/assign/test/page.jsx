"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";
import styles from './page.module.css'

const AssignTest = () => {
  const [filters, setFilters] = useState({
    subject: "",
    chapter: [],
    topic: [],
    class: "",
    academicYear: "",
    question: "",
  });

  const [data, setData] = useState({
    subjects: [],
    chapters: [],
    topics: [],
    classes: [],
    years: [],
    assessments: [],
    colleges: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState({
    classes: false,
    years: false,
  });

  const [assignedTests, setAssignedTests] = useState({});
  const [selectedColleges, setSelectedColleges] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDropdownLoading((prevState) => ({
        ...prevState,
        classes: true,
        years: true,
      }));

      try {
        const buildQueryString = () => {
          const filtersArray = [];

          if (filters.subject) {
            filtersArray.push(
              `filters[question_banks][subject][id][$eq]=${filters.subject}`
            );
          }
          if (filters.chapter.length) {
            filtersArray.push(
              ...filters.chapter.map(
                (ch) => `filters[question_banks][chapters][id][$eq]=${ch}`
              )
            );
          }
          if (filters.topic.length) {
            filtersArray.push(
              ...filters.topic.map(
                (tp) => `filters[question_banks][topics][id][$eq]=${tp}`
              )
            );
          }
          if (filters.class) {
            filtersArray.push(
              `filters[question_banks][class][id][$eq]=${filters.class}`
            );
          }
          if (filters.academicYear) {
            filtersArray.push(
              `filters[academic_year][id][$eq]=${filters.academicYear}`
            );
          }
          if (filters.question) {
            filtersArray.push(
              `filters[question][$containsi]=${filters.question}`
            );
          }

          return filtersArray.join("&");
        };

        const queryString = buildQueryString();

        const [
          classesResponse,
          chaptersResponse,
          yearsResponse,
          topicsResponse,
          assessmentsResponse,
          assignTestResponse,
          collegesResponse,
        ] = await Promise.all([
          fetch("/api/class"),
          fetch("/api/chapter"),
          fetch("/api/academic"),
          fetch("/api/topics"),
          fetch(`/api/create-test${queryString ? `?${queryString}` : ""}`),
          fetch("/api/assign-tests"),
          fetch("/api/colleges"),
        ]);

        const classesResult = await classesResponse.json();
        const chaptersResult = await chaptersResponse.json();
        const yearsResult = await yearsResponse.json();
        const topicsResult = await topicsResponse.json();
        const assessmentsResult = await assessmentsResponse.json();
        const assignTestResult = await assignTestResponse.json();
        const collegesResult = await collegesResponse.json();

        const mappedAssignedTests = {};
        assignTestResult.data.forEach((test) => {
          const testId = test.attributes.create_test.data.id;
          mappedAssignedTests[testId] = {
            assigned: test.attributes.Assign,
            colleges: test.attributes.colleges.data.map(
              (college) => college.id
            ),
            assignTestId: test.id,
          };
        });

        setAssignedTests(mappedAssignedTests);

        setData((prevState) => ({
          ...prevState,
          classes: classesResult.data.map((classItem) => ({
            id: classItem.id,
            name: classItem.attributes.name,
          })),
          years: yearsResult.data.map((year) => ({
            id: year.id,
            name: year.attributes.year,
          })),

          chapters: chaptersResult.data.map((chapter) => ({
            id: chapter.id,
            name: chapter.attributes.name,
            subjectId: chapter.attributes.subject.data.id,
            subjectName: chapter.attributes.subject.data.attributes.name,
            className:
              chapter.attributes.subject.data.attributes.class.data.attributes
                .name,
          })),
          topics: topicsResult.data.map((topic) => ({
            id: topic.id,
            name: topic.attributes.name,
            chapterId: topic.attributes.chapter.data.id,
          })),
          assessments: assessmentsResult.data.map((assessment) => {
            const chapterNames = assessment.attributes.chapters.data.map(
              (c) => c.attributes.name
            );
            const topicNames = assessment.attributes.topics.data.map(
              (c) => c.attributes.name
            );

            return {
              id: assessment.id,
              name: assessment.attributes.name,
              subject: assessment.attributes.subject.data.attributes.name,
              chapter: chapterNames.join(", "),
              topic: topicNames.join(", "),
              class: assessment.attributes.class.data.attributes.name,
              academicYear:
                assessment.attributes.academic_year.data.attributes.year,
              exam_name: assessment.attributes.exam_name,
            };
          }),
          colleges: collegesResult.data.map((college) => ({
            id: college.id,
            name: college.attributes.name,
          })),
        }));

        const initialSelectedColleges = {};
        Object.keys(mappedAssignedTests).forEach((testId) => {
          initialSelectedColleges[testId] =
            mappedAssignedTests[testId].colleges || [];
        });
        setSelectedColleges(initialSelectedColleges);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
        setDropdownLoading((prevState) => ({
          ...prevState,
          classes: false,
          years: false,
        }));
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const filteredChapters = data.chapters.filter(
    (chapter) => chapter.subjectId === Number(filters.subject)
  );

  const paginationOptions = [10, 20, 30, 40];

  // Filtered and Paginated Assessments
  const filteredAssessments = data.assessments
  .filter((assessment) =>
    assessment.name.toLowerCase().includes(filters.question.toLowerCase())
  )
  // Sort in descending order based on ID
  .sort((a, b) => b.id - a.id);

    // Pagination Calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAssessments = filteredAssessments.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
  
    // Total Pages Calculation
    const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
  
    const handleItemsPerPageChange = (value) => {
      setItemsPerPage(Number(value));
      setCurrentPage(1); // Reset to first page when changing items per page
    };

  const assignTest = async (
    assessmentId,
    selectedCollegeIds,
    isReassign = false
  ) => {
    try {
      const url = "/api/assign-tests";
      const method = isReassign ? "PUT" : "POST";

      let body;

      if (isReassign) {
        body = {
          materialId: assignedTests[assessmentId].assignTestId,
          payload: {
            data: {
              create_test: assessmentId,
              colleges: selectedCollegeIds,
              Assign: true,
            },
          },
        };
      } else {
        body = {
          data: {
            create_test: assessmentId,
            Assign: true,
            colleges: selectedCollegeIds,
          },
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to assign test");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error assigning test", error);
      throw error;
    }
  };

  const unassignTest = async (assignTestId, assessmentId) => {
    try {
      const payload = {
        materialId: assignTestId,
        payload: {
          data: {
            create_test: assessmentId,
            colleges: [],
            Assign: false,
          },
        },
      };

      const response = await fetch(`/api/assign-tests`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to unassign test");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error unassigning test", error);
      throw error;
    }
  };

  const handleAssignClick = async (assessmentId) => {
    const isCurrentlyAssigned = assignedTests[assessmentId]?.assigned;
    const selectedCollegeIds = selectedColleges[assessmentId] || [];

    if (!isCurrentlyAssigned && selectedCollegeIds.length === 0) {
      setErrorMessage("Please select at least one college before assigning.");
      return;
    } else {
      setErrorMessage("");
    }

    try {
      let result;
      if (isCurrentlyAssigned) {
        const assignTestId = assignedTests[assessmentId].assignTestId;
        result = await unassignTest(assignTestId, assessmentId);
      } else {
        if (selectedCollegeIds.length > 0) {
          const isReassign =
            assignedTests[assessmentId]?.assignTestId !== undefined;
          result = await assignTest(
            assessmentId,
            selectedCollegeIds,
            isReassign
          );
        } else {
          setErrorMessage(
            "Please select at least one college before assigning."
          );
          return;
        }
      }

      setAssignedTests((prevState) => ({
        ...prevState,
        [assessmentId]: {
          assigned: !isCurrentlyAssigned,
          colleges: !isCurrentlyAssigned ? selectedCollegeIds : [],
          assignTestId: result.data.id,
        },
      }));
      if (isCurrentlyAssigned) {
        setSelectedColleges((prevState) => ({
          ...prevState,
          [assessmentId]: [],
        }));
      }
    } catch (error) {
      setErrorMessage("Failed to assign/unassign test. Please try again.");
    }
  };

  const handleCollegeChange = (assessmentId, values) => {
    setSelectedColleges((prevState) => ({
      ...prevState,
      [assessmentId]: values,
    }));
  };

  useEffect(() => {
    const initialSelectedColleges = {};
    Object.keys(assignedTests).forEach((testId) => {
      initialSelectedColleges[testId] = assignedTests[testId].colleges || [];
    });
    setSelectedColleges(initialSelectedColleges);
  }, [assignedTests]);

    // Render Pagination Controls
    const renderPaginationControls = () => {
      return (
        <>
 
        <div className={styles.paginationContainer} style={{margin:"30px 0px 10px 0px"}}>
          

      
    
          <div className={styles.pageNavigation} >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
            >
              Previous
            </button>
    
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`${styles.pageButton} ${
                  currentPage === index + 1 ? styles.active : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
    
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            >
              Next
            </button>
          </div>
          <div className={styles.itemsPerPage}>
           
            <select 
              value={itemsPerPage} 
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
            >
              {paginationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
          </div>
       
        </div>
        <div className={styles.paginationInfo} style={{margin:"10px 0px 50px 0px"}}>
            Showing {indexOfFirstItem + 1} to{' '}
            {Math.min(indexOfLastItem, filteredAssessments.length)} of{' '}
            {filteredAssessments.length} entries
          </div>  
        </>
      );
    };

  return (
    <div className="container">
      <div className="sectionHeader">List of Tests</div>
      
      {errorMessage && <div className="errorText">{errorMessage}</div>}
      
      <div className="table">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Assessment</th>
                  <th style={{ width: "10%" }}>Subject</th>
                  <th style={{ width: "10%" }}>Name</th>
                  <th style={{ width: "10%" }}>Academic Year</th>
                  <th style={{ width: "30%" }}>College</th>
                  <th style={{ width: "10%" }}>Assign</th>
                </tr>
              </thead>

              <tbody>
                {currentAssessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td>{assessment.name}</td>
                    <td>{assessment.subject}</td>
                    <td>{assessment.exam_name}</td>
                    <td>{assessment.academicYear}</td>
                    <td>
                      <MultiSelectDropDown
                        options={data.colleges}
                        selectedValues={selectedColleges[assessment.id] || []}
                        onChange={(values) =>
                          handleCollegeChange(assessment.id, values)
                        }
                        placeholder="Select Colleges"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleAssignClick(assessment.id)}
                        className={
                          assignedTests[assessment.id]?.assigned
                            ? "editButton"
                            : "submitButton"
                        }
                      >
                        {assignedTests[assessment.id]?.assigned
                          ? "Unassign"
                          : "Assign"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {renderPaginationControls()}
          </>
        )}
      </div>
    </div>
  );
};

export default AssignTest;
