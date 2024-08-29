// SearchableSingleSelect.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css"; // Adjust the path as needed

const SearchableSingleSelect = ({
  options,
  selectedValue,
  onChange,
  placeholder = "Select...",
}) => {
  const [searchTerm, setSearchTerm] = useState(selectedValue);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.name
          ? option.name.toLowerCase().includes(searchTerm.toLowerCase())
          : false
      )
    );
  }, [searchTerm, options]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true); // Open dropdown when typing
    setIsInitial(false); // Set initial to false when user types
  };

  const handleOptionClick = (option) => {
    onChange(option); // Pass the entire option object
    setSearchTerm(option.name); // Update input field with selected value
    setIsDropdownOpen(false); // Close dropdown after selection
    setIsInitial(false); // Set initial to false after selection
  };

  const handleInputClick = () => {
    if (isInitial) {
      setSearchTerm(""); // Clear input if it's the initial focus
    }
    setIsDropdownOpen(!isDropdownOpen);
    setIsInitial(false); // Set initial to false after first focus
  };

  useEffect(() => {
    setSearchTerm(selectedValue); // Ensure the search term matches the selected value
  }, [selectedValue]);

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        onClick={handleInputClick}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          {filteredOptions.length === 0 ? (
            <div className={styles.noOptions}>No options found</div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className={`${styles.dropdownOption} ${
                  searchTerm === option.name ? styles.selected : ""
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSingleSelect;
