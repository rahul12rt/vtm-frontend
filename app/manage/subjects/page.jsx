"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import Pagination from "../../_components/pagination";
import styles from "../../styles/manage.module.css";

const Subject = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const inputRef = useRef(null);

  useEffect(() => {
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
    const totalItems = updatedTodos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, todos.length);
  const displayedTodos = todos.slice(startIndex, endIndex);

  return (
    <div className="container">
      <div className="sectionHeader">Manage Subjects</div>
      <div className="inputContainer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a new subject"
          ref={inputRef}
        />
        <button
          onClick={handleAddTodo}
          className={editIndex !== null ? "addButton" : "addButton"}
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
                <FaEdit />
                Edit
              </button>
              <button
                onClick={() => handleDeleteTodo(startIndex + index)}
                className="deleteButton"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Pagination
        totalItems={todos.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default Subject;
