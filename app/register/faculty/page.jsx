"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const initialFormState = {
  name: "",
  username: "",
  email: "",
  password: "",
  contactNumber: "",
  subjects: "", // Initialize as an empty string
  cv: null,
  qualification: "", // Initialize as an empty string
  aadhar: "",
  pan: "",
  bankAccount: "",
  ifsc: "",
};

const Faculty = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [qualifications, setQualifications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingQualifications, setLoadingQualifications] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Handle input changes
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

  // Handle input focus
  const handleFocus = (e) => {
    const { name } = e.target;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  // Fetch qualifications and subjects
  useEffect(() => {
    async function fetchData() {
      try {
        const [qualificationsResponse, subjectsResponse] = await Promise.all([
          axios.get("/api/qualification", { cache: "no-store" }),
          axios.get("/api/subjects", { cache: "no-store" }),
        ]);

        setQualifications(qualificationsResponse.data.data);
        setSubjects(subjectsResponse.data.data);
      } catch (error) {
        console.log("Error fetching data:", error.message);
      } finally {
        setLoadingQualifications(false);
        setLoadingSubjects(false);
      }
    }

    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation logic for faculty registration
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
      return; // Exit if there are validation errors
    }

    setErrors({}); // Clear previous errors

    // Step 1: Prepare the payload for user registration
    const registerPayload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    // Use toast.promise to handle the API request for user registration
    toast.promise(
      fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerPayload),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(
                data.error || "An error occurred during user registration"
              );
            });
          }
          return response.json();
        })
        .then(async (data) => {
          // Step 2: If user registration is successful, proceed to register the faculty
          const facultyPayload = {
            data: {
              name: formData.name,
              user_name: formData.username,
              email: formData.email,
              password: formData.password, // If needed
              contact_number: formData.contactNumber,
              subject: parseInt(formData.subjects), // Ensure subject is a number
              qualification: parseInt(formData.qualification), // Ensure qualification is a number
              aadhar_number: formData.aadhar,
              pan_number: formData.pan,
              bank_account: formData.bankAccount,
              ifsc_code: formData.ifsc,
            },
          };

          // Call the faculty registration API
          const facultyResponse = await fetch("/api/register/faculty", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(facultyPayload),
          });

          if (!facultyResponse.ok) {
            const errorData = await facultyResponse.json();
            throw new Error(
              errorData.error || "An error occurred during faculty registration"
            );
          }

          // If faculty registration is successful
          // Step 3: Change the role of the user using the ChangeRole API
          const changeRoleResponse = await fetch("/api/change-role", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: data.user.id,
              roleId: 5, // Assuming 3 is the role ID for students
            }),
          });

          if (!changeRoleResponse.ok) {
            const roleErrorData = await changeRoleResponse.json();
            throw new Error(
              roleErrorData.error || "An error occurred while updating the role"
            );
          }
          setFormData(initialFormState); // Reset form data
          return <b>Faculty registered successfully!</b>;
        }),
      {
        loading: "Registering...",
        success: async () => {
          return <b>Faculty registered successfully!</b>;
        },
        error: <b>Registration failed. UserName or Email already taken</b>,
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

  // Validate email
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
            {loadingSubjects ? (
              <option>Loading...</option> // Show loading text inside the dropdown
            ) : (
              <>
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.attributes.name} (
                    {subject.attributes.class.data.attributes.name})
                  </option>
                ))}
              </>
            )}
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
            {loadingQualifications ? (
              <option>Loading...</option> // Show loading text inside the dropdown
            ) : (
              <>
                <option value="">Select qualification</option>
                {qualifications.map((qualification) => (
                  <option key={qualification.id} value={qualification.id}>
                    {qualification.attributes.name}
                  </option>
                ))}
              </>
            )}
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
            placeholder="Enter your Aadhar number"
            maxLength={12}
            pattern="\d*"
            className={errors.aadhar ? "errorInput" : ""}
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
            placeholder="Enter your PAN number"
            className={errors.pan ? "errorInput" : ""}
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
            placeholder="Enter your bank account number"
            maxLength={16}
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
            placeholder="Enter your IFSC code"
            className={errors.ifsc ? "errorInput" : ""}
          />
          {errors.ifsc && <p className="errorText">{errors.ifsc}</p>}
        </div>
      </form>
      <button
        type="submit"
        className="submitButton"
        style={{ marginTop: 20 }}
        onClick={handleSubmit}
      >
        Submit
      </button>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Faculty;
