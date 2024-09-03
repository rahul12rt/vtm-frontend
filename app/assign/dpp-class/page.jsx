"use client";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";
import SearchableSingleSelect from "../../_components/searchAbleDropDownv2";
import toast, { Toaster } from "react-hot-toast";

const AssignDPPToClass = () => {
  const [dpps, setDPPs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedDPPs, setSelectedDPPs] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [assignedDPPs, setAssignedDPPs] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDPPChange = (selectedOptions) => {
    setSelectedDPPs(selectedOptions);
  };

  const handleClassChange = (value) => {
    setSelectedClass(value);
  };

  const handleCollegeChange = (value) => {
    setSelectedCollege(value);
  };
  const handleSubmit = async () => {
    if (selectedDPPs.length > 0 && selectedCollege) {
      // Create payload for POST request
      const payload = {
        data: {
          creat_dpps: selectedDPPs.map((dpp) => dpp.id || dpp),
          college: selectedCollege.id || selectedCollege,
        },
      };

      console.log(payload);
      toast.promise(
        fetch(`/api/assign-dpp-college`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(
                  data.error || "An error occurred while assigning DPPs"
                );
              });
            }
            return response.json();
          })
          .then((responseData) => {
            const newAssignment = {
              id: responseData.data.id,
              dppNames: responseData.data.attributes.creat_dpps.data.map(
                (dpp) => dpp.attributes.name
              ),
              college:
                responseData.data.attributes.college.data.attributes.name,
            };

            setAssignedDPPs((prevAssignments) => [
              ...prevAssignments,
              newAssignment,
            ]);

            setSelectedDPPs([]);
            setSelectedClass(""); // If class is used, reset it as well
            setSelectedCollege("");
          }),
        {
          loading: "Assigning DPPs...",
          success: <b>DPPs assigned successfully!</b>,
          error: <b>Failed to assign DPPs. Please try again.</b>,
        },
        {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }
      );
    }
  };

  const handleEdit = (index) => {
    const assignment = assignedDPPs[index];
    setSelectedDPPs(assignment.dppNames);
    setSelectedClass(assignment.className);
    setSelectedCollege(assignment.college);
    setEditIndex(index);
  };

  const handleDelete = async (id) => {
    toast.promise(
      (async () => {
        const response = await fetch(`/api/assign-dpp-college`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ materialId: id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              "An error occurred while deleting the assignment."
          );
        }

        return response.json();
      })().then(() => {
        const updatedAssignments = assignedDPPs.filter(
          (material) => material.id !== id
        );
        setAssignedDPPs(updatedAssignments);
      }),
      {
        loading: "Deleting assignment...",
        success: <b>Assignment deleted successfully!</b>,
        error: <b>Failed to delete assignment. Please try again.</b>,
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      toast
        .promise(
          Promise.all([
            fetch("/api/create-dpp"),
            fetch("/api/colleges"),
            fetch("/api/assign-dpp-college"),
          ]).then(async ([dppResponse, collegeResponse, assignDppResponse]) => {
            if (
              !dppResponse.ok ||
              !collegeResponse.ok ||
              !assignDppResponse.ok
            ) {
              throw new Error("Failed to fetch data");
            }

            const dppResults = await dppResponse.json();
            const collegeResults = await collegeResponse.json();
            const assignDppResults = await assignDppResponse.json();

            // Map DPPs and Classes
            const dppOptions = dppResults.data.map((dpp) => ({
              id: dpp.id.toString(),
              name: dpp.attributes.name,
            }));
            const classOptions = dppResults.data.map((dpp) => ({
              id: dpp.attributes.class.data.id.toString(),
              name: dpp.attributes.class.data.attributes.name,
            }));

            // Map Colleges
            const collegeOptions = collegeResults.data.map((college) => ({
              id: college.id.toString(),
              name: college.attributes.name,
            }));

            // Remove duplicates from classOptions
            const uniqueClassOptions = Array.from(
              new Map(classOptions.map((item) => [item.id, item])).values()
            );

            const mappedAssignments = assignDppResults.data.map(
              (assignment) => ({
                id: assignment.id,
                dppNames: assignment.attributes.creat_dpps.data.map(
                  (dpp) => dpp.attributes.name
                ),
                college: assignment.attributes.college.data.attributes.name,
              })
            );

            // Update state
            setDPPs(dppOptions);
            setClasses(uniqueClassOptions);
            setColleges(collegeOptions);
            setAssignedDPPs(mappedAssignments);
            setLoading(false);

            return "Data fetched successfully!";
          }),
          {
            loading: "Fetching data...",
            success: <b>Data fetched successfully!</b>,
            error: <b>Failed to fetch data. Please try again.</b>,
          },
          {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }
        )
        .catch((error) => {
          console.error("Failed to fetch data", error);
          setLoading(false);
        });
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="sectionHeader">Assign DPPs to Class and College</div>

      {loading ? (
        <div className="loader">Loading...</div> // Loader component or message
      ) : (
        <>
          <div className="inputContainer">
            <MultiSelectDropDown
              options={dpps}
              selectedValues={selectedDPPs}
              onChange={handleDPPChange}
              placeholder="Select DPPs"
            />
            <SearchableSingleSelect
              options={colleges}
              selectedValue={selectedCollege}
              onChange={handleCollegeChange}
              placeholder="Select College"
            />

            <button onClick={handleSubmit} className="addButton">
              {editIndex !== null ? "Update" : "Assign"}
            </button>
          </div>

          <ul className="todoList">
            {assignedDPPs.map((assignment, index) => (
              <li key={assignment.id} className="todoItem">
                <span>
                  {index + 1}: <strong>College:</strong> {assignment.college} -{" "}
                  <strong>DPPs:</strong> {assignment.dppNames.join(", ")}
                </span>
                <div className="buttonContainer">
                  <button
                    onClick={() => handleEdit(index)}
                    className="editButton"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="deleteButton"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AssignDPPToClass;
