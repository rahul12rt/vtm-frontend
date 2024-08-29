import React, { useState, useEffect } from "react";
import SearchableDropdown from "../searchAbleDropDown";
import axios from "axios";

const Results = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get("/api/colleges");
        setColleges(response.data.colleges);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  return (
    <div className="inputContainer">
      <SearchableDropdown
        options={colleges}
        selectedValue={selectedCollege}
        onChange={setSelectedCollege}
        placeholder="Select College"
      />
    </div>
  );
};

export default Results;
