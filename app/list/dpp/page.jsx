"use client";
import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Modal } from "antd";

const ListOfSelfStudies = () => {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/create-dpp");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();

      const extractedData = result.data.map((item) => ({
        id: item.id,
        name: item.attributes.name,
        subject: item.attributes.subject.data.attributes.name,
        chapter: item.attributes.chapters.data
          .map((ch) => ch.attributes.name)
          .join(", "),
        class:
          item.attributes.subject.data.attributes.class.data.attributes.name,
        academic_year: item.attributes.academic_year.data.attributes.year,
      }));

      setData(extractedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch DPPs.");
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredData = data.filter((material) => {
    return material.name.toLowerCase().includes(filter.toLowerCase());
  });

  const showDeleteConfirm = (material) => {
    setItemToDelete(material);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const action = toast.promise(
      (async () => {
        const response = await fetch("/api/create-dpp", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studyId: itemToDelete.id }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete DPP.");
        }

        setData((prevData) =>
          prevData.filter((item) => item.id !== itemToDelete.id)
        );
      })(),
      {
        loading: "Deleting DPP...",
        success: "DPP deleted successfully.",
        error: "Failed to delete DPP.",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }
    );

    try {
      await action;
      setIsDeleteModalVisible(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setItemToDelete(null);
  };

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="sectionHeader">List of Self DPPs</div>
      <div className="inputContainer">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter by self-study name"
          className="input"
          style={{ marginBottom: 20 }}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "50%" }}>Self Study Name</th>
            <th style={{ width: "10%" }}>Subject</th>
            <th style={{ width: "10%" }}>Chapter</th>
            <th style={{ width: "10%" }}>Class</th>
            <th style={{ width: "20%" }}>Academic Year</th>
            <th style={{ width: "10%" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((material) => (
              <tr key={material.id}>
                <td>{material.name}</td>
                <td>{material.subject}</td>
                <td>{material.chapter}</td>
                <td>{material.class}</td>
                <td>{material.academic_year}</td>
                <td>
                  <button
                    onClick={() => showDeleteConfirm(material)}
                    className="deleteButton"
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        okText="Yes"
        cancelText="No"
        okButtonProps={{
          style: {
            backgroundColor: "#ff4d4f",
            borderColor: "#ff4d4f",
          },
        }}
      >
        <p>Are you sure you want to delete &quot;{itemToDelete?.name}&quot;?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ListOfSelfStudies;
