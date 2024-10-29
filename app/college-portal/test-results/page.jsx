import React from "react";

function Results() {
  return (
    <div className="container">
      <div className="sectionHeader">Test Results</div>
      <div style={{ padding: "50px" }}>
        <h1>We'll be back soon!</h1>
        <p style={{ fontSize: "18px", maxWidth: "600px", margin: "auto" }}>
          Our team is currently working on updates to improve your experience.
          Thank you for your patience!
          <br />
          <br />
          Please check back with us shortly, and if you have any questions, feel
          free to reach out to our support team.
        </p>
        <p
          style={{
            fontSize: "16px",
            color: "gray",
            maxWidth: "600px",
            margin: "auto",
            paddingTop: 10,
          }}
        >
          – The Vidvat Team
        </p>
      </div>
    </div>
  );
}

export default Results;
