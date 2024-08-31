"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../styles/register.module.css";
import toast, { Toaster } from "react-hot-toast";

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
  college: "", // Store the id of the selected college
  collegeName: "", // Display name in the dropdown
  class: "", // This will store the id of the selected class
  className: "", // Display name in the dropdown
  academicYear: AcademicYearEnum["2024-25"],
  contactNumber1: "",
  contactNumber2: "",
};

const StudentRegister = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]); // State to store classes
  const [colleges, setColleges] = useState([]); // State to store colleges

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

  const handleClassChange = (e) => {
    const selectedClassId = e.target.value;
    const selectedClass = classes.find(
      (classItem) => classItem.id === selectedClassId
    );

    setFormData({
      ...formData,
      class: selectedClassId ? Number(selectedClassId) : "", // Convert to number
      className: selectedClass ? selectedClass.attributes.name : "", // Display the name in the dropdown
    });
  };

  const handleCollegeChange = (e) => {
    const selectedCollegeId = e.target.value;
    const selectedCollege = colleges.find(
      (college) => college.id === selectedCollegeId
    );

    setFormData({
      ...formData,
      college: selectedCollegeId ? Number(selectedCollegeId) : "", // Convert to number
      collegeName: selectedCollege ? selectedCollege.attributes.name : "", // Display the name in the dropdown
    });
  };

  const handleSubmit = async (e) => {
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

      // Prepare the payload
      const payload = {
        data: {
          name: formData.name,
          roll_number: formData.rollNo,
          email: formData.email,
          user_name: formData.username,
          password: formData.password,
          college: Number(formData.college), // Ensure college is a number
          class: Number(formData.class), // Ensure class is a number
          academic_year: formData.academicYear,
          contact_number: formData.contactNumber1,
          secoundary_number: formData.contactNumber2 || "", // Default to 0 if not provided
        },
      };

      // Use toast.promise to handle the API request and show different toast notifications
      toast.promise(
        fetch("/api/register/student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }).then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.error || "An error occurred");
            });
          }
          return response.json();
        }),
        {
          loading: "Saving...",
          success: async () => {
            setFormData(initialFormState);
            return <b>Student registered successfully!</b>;
          },
          error: <b>Could not save. Please try again.</b>,
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

  useEffect(() => {
    async function fetchData() {
      try {
        const [classResult, collegeResult] = await Promise.all([
          axios.get("/api/class", { cache: "no-store" }),
          axios.get("/api/colleges", { cache: "no-store" }),
        ]);

        // Remove duplicate colleges based on the name
        const uniqueColleges = Array.from(
          new Set(
            collegeResult.data.data.map((college) => college.attributes.name)
          )
        ).map((name) =>
          collegeResult.data.data.find(
            (college) => college.attributes.name === name
          )
        );

        setClasses(classResult.data.data); // Set the fetched classes
        setColleges(uniqueColleges); // Set the unique colleges
      } catch (error) {
        console.log("Error fetching data:", error.message);
      }
    }

    fetchData();
  }, []); // Fetch classes and colleges only on component mount

  return (
    <div className="container">
      <div className="sectionHeader">Student Registration</div>
      <form className="form">
        {/* Form Fields */}
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
            onChange={handleCollegeChange}
            onFocus={handleFocus}
            className={errors.college ? "errorInput" : ""}
          >
            <option value="">Select College</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.attributes.name}
              </option>
            ))}
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
            onChange={handleClassChange}
            onFocus={handleFocus}
            className={errors.class ? "errorInput" : ""}
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.attributes.name}
              </option>
            ))}
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
            {Object.entries(AcademicYearEnum).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          {errors.academicYear && (
            <p className="errorText">{errors.academicYear}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="contactNumber1">
            Contact Number 1<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="contactNumber1"
            name="contactNumber1"
            value={formData.contactNumber1}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your contact number 1"
            className={errors.contactNumber1 ? "errorInput" : ""}
          />
          {errors.contactNumber1 && (
            <p className="errorText">{errors.contactNumber1}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="contactNumber2">Contact Number 2</label>
          <input
            type="text"
            id="contactNumber2"
            name="contactNumber2"
            value={formData.contactNumber2}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter your contact number 2 (optional)"
          />
        </div>
      </form>
      <button
        type="submit"
        onClick={handleSubmit}
        className="submitButton"
        style={{ marginTop: 20 }}
      >
        Register
      </button>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default StudentRegister;
