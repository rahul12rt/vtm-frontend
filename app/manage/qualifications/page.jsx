"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import Pagination from "../../_components/pagination";

const Qualification = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const inputRef = useRef(null);

  useEffect(() => {
    // Reset currentPage when itemsPerPage changes
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleAddTodo = () => {
    if (inputValue.trim()) {
      if (editIndex !== null) {
        const updatedTodos = todos.map((todo, index) =>
          index === editIndex ? inputValue : todo
        );
        setTodos(updatedTodos);
        setEditIndex(null);
      } else {
        setTodos([...todos, inputValue]);
      }
      setInputValue("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleEditTodo = (index) => {
    setEditIndex(index);
    setInputValue(todos[index]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDeleteTodo = (index) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const totalItems = todos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const displayedTodos = todos.slice(startIndex, endIndex);

  // Handle the case where the last item on the last page is deleted
  useEffect(() => {
    if (todos.length > 0 && startIndex >= todos.length) {
      setCurrentPage(currentPage - 1);
    }
  }, [todos.length, startIndex, currentPage]);

  return (
    <div className="container">
      <div className="sectionHeader">Manage Qualification</div>
      <div className="inputContainer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a new qualification"
          ref={inputRef}
        />
        <button
          onClick={handleAddTodo}
          className={editIndex !== null ? "updateButton" : "addButton"}
        >
          {editIndex !== null ? <FaSyncAlt /> : <FaPlus />}
          {editIndex !== null ? "Update" : "Add"}
        </button>
      </div>
      <ul className="todoList">
        {displayedTodos.map((todo, index) => (
          <li key={index} className="todoItem">
            <span>
              {startIndex + index + 1}. {todo}
            </span>
            <div className="buttonContainer">
              <button
                onClick={() => handleEditTodo(startIndex + index)}
                className="editButton"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDeleteTodo(startIndex + index)}
                className="deleteButton"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {todos.length > itemsPerPage && (
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default Qualification;
