"use client";
import React, { useState } from "react";
import styles from "../../styles/register.module.css";

const initialFormState = {
  name: "",
  address: "",
  city: "",
  pincode: "",
  contactPerson: "",
  contactNumber1: "",
  contactNumber2: "",
  email: "",
  username: "",
  password: "",
};

const cities = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Kolkata"];

const College = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode" && !/^\d{0,6}$/.test(value)) return;
    if (
      (name === "contactNumber1" || name === "contactNumber2") &&
      !/^\d{0,10}$/.test(value)
    )
      return;
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
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";
    if (!formData.contactPerson)
      newErrors.contactPerson = "Contact Person is required";
    if (!formData.contactNumber1)
      newErrors.contactNumber1 = "Contact Number1 is required";
    if (formData.email && !validateEmail(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  };

  return (
    <div className="container">
      <div className="sectionHeader">College Registration</div>
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
            placeholder="Enter the college name"
            className={errors.name ? "errorInput" : ""}
          />
          {errors.name && <p className="errorText">{errors.name}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="address">
            Address<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter the college address"
            className={errors.address ? "errorInput" : ""}
          />
          {errors.address && <p className="errorText">{errors.address}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="city">
            City<span style={{ color: "#e25050" }}>*</span>
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onFocus={handleFocus}
            className={errors.city ? "errorInput" : ""}
          >
            <option value="">Select the city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && <p className="errorText">{errors.city}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="pincode">
            Pincode<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter the pincode"
            className={errors.pincode ? "errorInput" : ""}
          />
          {errors.pincode && <p className="errorText">{errors.pincode}</p>}
        </div>
        <div className="formGroup">
          <label htmlFor="contactPerson">
            Contact Person<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter the contact person's name"
            className={errors.contactPerson ? "errorInput" : ""}
          />
          {errors.contactPerson && (
            <p className="errorText">{errors.contactPerson}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="contactNumber1">
            Contact Number1<span style={{ color: "#e25050" }}>*</span>
          </label>
          <input
            type="text"
            id="contactNumber1"
            name="contactNumber1"
            value={formData.contactNumber1}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter the contact number"
            className={errors.contactNumber1 ? "errorInput" : ""}
          />
          {errors.contactNumber1 && (
            <p className="errorText">{errors.contactNumber1}</p>
          )}
        </div>
        <div className="formGroup">
          <label htmlFor="contactNumber2">Contact Number2:</label>
          <input
            type="text"
            id="contactNumber2"
            name="contactNumber2"
            value={formData.contactNumber2}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter an additional contact number (optional)"
            className={errors.contactNumber2 ? "errorInput" : ""}
          />
          {errors.contactNumber2 && (
            <p className="errorText">{errors.contactNumber2}</p>
          )}
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
            placeholder="Enter the college email"
            className={errors.email ? "errorInput" : ""}
          />
          {errors.email && <p className="errorText">{errors.email}</p>}
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
            placeholder="Enter the username"
            className={errors.username ? "errorInput" : ""}
          />
          {errors.username && <p className="errorText">{errors.username}</p>}
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
            placeholder="Enter the password"
            className={errors.password ? "errorInput" : ""}
          />
          {errors.password && <p className="errorText">{errors.password}</p>}
        </div>
      </form>
      <button
        type="button"
        onClick={handleSubmit}
        className="submitButton"
        style={{ marginTop: 20 }}
      >
        Submit
      </button>
    </div>
  );
};

export default College;
