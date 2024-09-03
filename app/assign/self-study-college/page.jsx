"use client";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import MultiSelectDropDown from "../../_components/multiSelectDropDown2";
import SearchableSingleSelect from "../../_components/searchAbleDropDownv2";
import toast, { Toaster } from "react-hot-toast";

const AssignSelfStudy = () => {
  const [selectedSelfStudies, setSelectedSelfStudies] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [assignedMaterials, setAssignedMaterials] = useState([]);
  const [selfStudiesOptions, setSelfStudiesOptions] = useState([]);
  const [collegesOptions, setCollegesOptions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setloading] = useState(true);

  const handleSelfStudyChange = (selectedOptions) => {
    setSelectedSelfStudies(selectedOptions);
  };

  const handleCollegeChange = (value) => {
    setSelectedCollege(value);
  };

  const handleSubmit = async () => {
    if (selectedSelfStudies.length > 0 && selectedCollege) {
      const newAssignment = {
        id: assignedMaterials.length + 1,
        college: selectedCollege,
        selfStudies: selectedSelfStudies,
      };

      // Update or add the assignment locally
      if (editIndex !== null) {
        const updatedMaterials = [...assignedMaterials];
        updatedMaterials[editIndex] = newAssignment;
        setAssignedMaterials(updatedMaterials);
        setEditIndex(null);
      } else {
        setAssignedMaterials([...assignedMaterials, newAssignment]);
      }

      // Create the payload
      const payload = {
        data: {
          self_studies: selectedSelfStudies, // Multiple select for self-study
          college: selectedCollege, // Single select for college
        },
      };

      try {
        // Use toast.promise for user feedback during the operation
        await toast.promise(
          (async () => {
            const response = await fetch("/api/assign-study-college", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              throw new Error("Failed to assign self-study materials.");
            }

            await response.json(); // Ensure to await the response to handle possible errors
          })(),
          {
            loading: "Assigning self-study materials...",
            success: "Successfully assigned self-study materials.",
            error: "Failed to assign self-study materials. Please try again.",
          },
          {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }
        );

        // Reset the form
        setSelectedSelfStudies([]);
        setSelectedCollege("");
      } catch (error) {
        console.error("Error submitting data:", error);
        toast.error("Error submitting data. Please try again.");
      }
    } else {
      toast.error(
        "Please select at least one self-study material and a college."
      );
    }
  };

  const handleEdit = (index) => {
    const material = assignedMaterials[index];
    setSelectedSelfStudies(material.selfStudies);
    setSelectedCollege(material.college);
    setEditIndex(index);
  };

  const handleDelete = async (id) => {
    const action = toast.promise(
      (async () => {
        const response = await fetch(`/api/assign-study-college`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ materialId: id }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete the assignment.");
        }

        const updatedMaterials = assignedMaterials.filter(
          (material) => material.id !== id
        );
        setAssignedMaterials(updatedMaterials);
      })(),
      {
        loading: "Deleting assignment...",
        success: "Successfully deleted assignment.",
        error: "Failed to delete assignment. Please try again.",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );

    await action;
  };

  useEffect(() => {
    setloading(true);
    const fetchData = async () => {
      try {
        const [selfStudiesResponse, collegesResponse, assignmentsResponse] =
          await Promise.all([
            fetch("/api/self-study"),
            fetch("/api/colleges"),
            fetch("/api/assign-study-college"),
          ]);

        if (
          !selfStudiesResponse.ok ||
          !collegesResponse.ok ||
          !assignmentsResponse.ok
        ) {
          throw new Error("Network response was not ok");
        }

        const [selfStudiesResult, collegesResult, assignmentsResult] =
          await Promise.all([
            selfStudiesResponse.json(),
            collegesResponse.json(),
            assignmentsResponse.json(),
          ]);

        const selfStudies = selfStudiesResult.data.map((item) => ({
          id: item.id,
          name: item.attributes.name,
        }));

        const colleges = collegesResult.data.map((item) => ({
          id: item.id,
          name: item.attributes.name,
        }));

        const assignments = assignmentsResult.data.map((item) => ({
          id: item.id,
          college: item.attributes.college.data.attributes.name,
          selfStudies: item.attributes.self_studies.data.map(
            (study) => study.attributes.name
          ),
        }));

        setSelfStudiesOptions(selfStudies);
        setCollegesOptions(colleges);
        setAssignedMaterials(assignments);
        setloading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="sectionHeader">
        Assign Self-Study Materials to College
      </div>
      <div className="inputContainer">
        <MultiSelectDropDown
          options={selfStudiesOptions}
          selectedValues={selectedSelfStudies}
          onChange={handleSelfStudyChange}
          placeholder="Select Self-Studies"
        />

        <SearchableSingleSelect
          options={collegesOptions}
          selectedValue={selectedCollege}
          onChange={handleCollegeChange}
          placeholder="Select College"
        />

        <button onClick={handleSubmit} className="addButton">
          {editIndex !== null ? "Update" : "Assign"}
        </button>
      </div>
      {loading ? (
        "loading..."
      ) : (
        <ul className="todoList">
          {assignedMaterials.map((material, index) => (
            <li key={material.id} className="todoItem">
              <span>
                {index + 1}: <strong> College:</strong> {material.college} -{" "}
                <strong>Self-Studies:</strong> {material.selfStudies.join(", ")}
              </span>
              <div className="buttonContainer">
                <button
                  onClick={() => handleEdit(index)}
                  className="editButton"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="deleteButton"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssignSelfStudy;
