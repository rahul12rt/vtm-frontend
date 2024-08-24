import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

const MultiSelectDropDown = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select...",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleOptionClick = (option) => {
    const newSelectedValues = selectedValues.includes(option.name)
      ? selectedValues.filter((value) => value !== option.name)
      : [...selectedValues, option.name];
    onChange(newSelectedValues);
  };

  const displaySelectedValues = selectedValues.length
    ? selectedValues.join(", ")
    : placeholder;

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <input
        type="text"
        value={displaySelectedValues}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        placeholder={placeholder}
        className={styles.searchInput}
        readOnly
      />
      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          {options.length === 0 ? (
            <div className={styles.noOptions}>No options available</div>
          ) : (
            options.map((option) => (
              <div
                key={option.id}
                className={`${styles.dropdownOption} ${
                  selectedValues.includes(option.name) ? styles.selected : ""
                }`}
                onClick={() => handleOptionClick(option)}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.name)}
                  readOnly
                  className={styles.checkbox}
                />
                {option.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropDown;
