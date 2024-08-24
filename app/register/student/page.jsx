"use client";
import React, { useState } from "react";
import styles from "../../styles/register.module.css";

const ClassEnum = {
  "1 PU": "1 PU",
  "2 PU": "2 PU",
};

const CollegeEnum = {
  Harvard: "Harvard",
  MIT: "MIT",
  Stanford: "Stanford",
  Oxford: "Oxford",
};

const AcademicYearEnum = {
  "2024-25": "2024-25",
  "2025-26": "2025-26",
};

const initialFormState = {
  name: "",
  email: "",
  username: "",
  password: "",
  rollNo: "",
  college: CollegeEnum.Harvard,
  class: ClassEnum["1 PU"],
  academicYear: AcademicYearEnum["2024-25"],
  contactNumber1: "",
  contactNumber2: "",
};

const StudentRegister = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email ? regex.test(email) : false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.rollNo) newErrors.rollNo = "Roll No is required";
    if (!formData.college) newErrors.college = "College is required";
    if (!formData.class) newErrors.class = "Class is required";
    if (!formData.academicYear)
      newErrors.academicYear = "Academic Year is required";
    if (!formData.contactNumber1)
      newErrors.contactNumber1 = "Contact Number1 is required";
    else if (!/^\d{10}$/.test(formData.contactNumber1))
      newErrors.contactNumber1 = "Contact Number1 must be 10 digits";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      console.log(formData);
    }
  };

  return (
    <div className="container">
      <div className="sectionHeader">Student Registration</div>
      <form className="form">
        <div className="formGroup">
          <label htmlFor="name">
            Name<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your name"
            className={errors.name ? "errorInput" : ""}
          />
          {errors.name && <p className="errorText">{errors.name}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="email">
            Email<span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your email"
            className={errors.email ? "errorInput" : ""}
          />
          {errors.email && <p className="errorText">{errors.email}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="username">
            Username<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your username"
            className={errors.username ? "errorInput" : ""}
          />
          {errors.username && <p className="errorText">{errors.username}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="password">
            Password<span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your password"
            className={errors.password ? "errorInput" : ""}
          />
          {errors.password && <p className="errorText">{errors.password}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="rollNo">
            Roll No<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="rollNo"
            name="rollNo"
            value={formData.rollNo}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your roll number"
            className={errors.rollNo ? "errorInput" : ""}
          />
          {errors.rollNo && <p className="errorText">{errors.rollNo}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="college">
            College<span className={styles.required}>*</span>
          </label>
          <select
            id="college"
            name="college"
            value={formData.college}
            onChange={handleChange}
            onFocus={handleFocus}
            className={errors.college ? "errorInput" : ""}
          >
            <option value={CollegeEnum.Harvard}>Harvard</option>
            <option value={CollegeEnum.MIT}>MIT</option>
            <option value={CollegeEnum.Stanford}>Stanford</option>
            <option value={CollegeEnum.Oxford}>Oxford</option>
          </select>
          {errors.college && <p className="errorText">{errors.college}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="class">
            Class<span className={styles.required}>*</span>
          </label>
          <select
            id="class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            onFocus={handleFocus}
            className={errors.class ? "errorInput" : ""}
          >
            <option value={ClassEnum["1 PU"]}>1 PU</option>
            <option value={ClassEnum["2 PU"]}>2 PU</option>
          </select>
          {errors.class && <p className="errorText">{errors.class}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="academicYear">
            Academic Year<span className={styles.required}>*</span>
          </label>
          <select
            id="academicYear"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            onFocus={handleFocus}
            className={errors.academicYear ? "errorInput" : ""}
          >
            <option value={AcademicYearEnum["2024-25"]}>2024-25</option>
            <option value={AcademicYearEnum["2025-26"]}>2025-26</option>
          </select>
          {errors.academicYear && (
            <p className="errorText">{errors.academicYear}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="contactNumber1">
            Contact Number1<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="contactNumber1"
            name="contactNumber1"
            value={formData.contactNumber1}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter contact number"
            className={errors.contactNumber1 ? "errorInput" : ""}
          />
          {errors.contactNumber1 && (
            <p className="errorText">{errors.contactNumber1}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="contactNumber2">Contact Number2</label>
          <input
            type="text"
            id="contactNumber2"
            name="contactNumber2"
            value={formData.contactNumber2}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter secondary contact number"
          />
        </div>
      </form>
      <button
        className="submitButton"
        onClick={handleSubmit}
        style={{ marginTop: "20px" }}
      >
        Submit
      </button>
    </div>
  );
};

export default StudentRegister;
