"use client";
import React, { useState } from "react";
import styles from "../../styles/register.module.css";

const SubjectEnum = {
  Math: "Math",
  Science: "Science",
  History: "History",
};

const QualificationEnum = {
  Bachelors: 1,
  Masters: 2,
  PhD: 3,
};

const initialFormState = {
  name: "",
  username: "",
  email: "",
  password: "",
  contactNumber: "",
  subjects: SubjectEnum["Math"],
  cv: null,
  qualification: 1,
  aadhar: "",
  pan: "",
  bankAccount: "",
  ifsc: "",
};

const Faculty = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;

    if (type === "file") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files?.[0] || null,
      }));
    } else if (
      name === "contactNumber" ||
      name === "aadhar" ||
      name === "bankAccount"
    ) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value.replace(/[^0-9]/g, ""),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
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
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact Number is required";
    else if (formData.contactNumber.length !== 10)
      newErrors.contactNumber = "Contact Number must be 10 digits";
    if (!formData.subjects) newErrors.subjects = "Subject is required";
    if (!formData.cv) newErrors.cv = "CV is required";
    if (!formData.qualification)
      newErrors.qualification = "Qualification is required";
    if (!formData.aadhar) newErrors.aadhar = "Aadhar Number is required";
    else if (formData.aadhar.length !== 12)
      newErrors.aadhar = "Aadhar Number must be 12 digits";
    if (!formData.pan) newErrors.pan = "PAN Number is required";
    if (!formData.bankAccount)
      newErrors.bankAccount = "Bank Account Number is required";
    if (!formData.ifsc) newErrors.ifsc = "IFSC is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <div className="container">
      <div className="sectionHeader">Faculty Registration</div>
      <form className="form">
        <div className="formGroup">
          <label htmlFor="name">
            Name<span style={{ color: "#e25050" }}>*</span>
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
          <label htmlFor="username">
            Username<span style={{ color: "#e25050" }}>*</span>
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
          <label htmlFor="email">
            Email<span style={{ color: "#e25050" }}>*</span>
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
          <label htmlFor="password">
            Password<span style={{ color: "#e25050" }}>*</span>
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
          <label htmlFor="contactNumber">
            Contact Number<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your contact number"
            maxLength={10}
            pattern="\d*"
            className={errors.contactNumber ? "errorInput" : ""}
          />
          {errors.contactNumber && (
            <p className="errorText">{errors.contactNumber}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="subjects">
            Subjects<span style={{ color: "#e25050" }}>*</span>
          </label>
          <select
            id="subjects"
            name="subjects"
            value={formData.subjects}
            onChange={handleChange}
            onFocus={handleFocus}
            className={errors.subjects ? "errorInput" : ""}
          >
            {Object.values(SubjectEnum).map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          {errors.subjects && <p className="errorText">{errors.subjects}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="cv">
            CV<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="file"
            id="cv"
            name="cv"
            onChange={handleChange}
            onFocus={handleFocus}
            className={errors.cv ? "errorInput" : ""}
          />
          {errors.cv && <p className="errorText">{errors.cv}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="qualification">
            Qualification<span style={{ color: "#e25050" }}>*</span>
          </label>
          <select
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            onFocus={handleFocus}
            className={errors.qualification ? "errorInput" : ""}
          >
            {Object.entries(QualificationEnum).map(([qual, id]) => (
              <option key={id} value={id}>
                {qual}
              </option>
            ))}
          </select>
          {errors.qualification && (
            <p className="errorText">{errors.qualification}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="aadhar">
            Aadhar Number<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="aadhar"
            name="aadhar"
            value={formData.aadhar}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your Aadhar Number"
            maxLength={12}
            pattern="\d*"
            className={errors.aadhar ? styles.errorInput : ""}
          />
          {errors.aadhar && <p className="errorText">{errors.aadhar}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="pan">
            PAN Number<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="pan"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your PAN Number"
            className={errors.pan ? styles.errorInput : ""}
          />
          {errors.pan && <p className="errorText">{errors.pan}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="bankAccount">
            Bank Account Number<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="bankAccount"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your Bank Account Number"
            pattern="\d*"
            className={errors.bankAccount ? "errorInput" : ""}
          />
          {errors.bankAccount && (
            <p className="errorText">{errors.bankAccount}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="ifsc">
            IFSC Code<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="ifsc"
            name="ifsc"
            value={formData.ifsc}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your IFSC Code"
            className={errors.ifsc ? "errorInput" : ""}
          />
          {errors.ifsc && <p className="errorText">{errors.ifsc}</p>}
        </div>
        <button type="submit" onClick={handleSubmit} className="submitButton">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Faculty;
