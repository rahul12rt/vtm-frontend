"use client";
import { decrypt } from "@/app/_utils/encryptionUtils";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import styles from "../self-study/Study.module.css";

const DPP = () => {
  const [selfStudyMaterials, setSelfStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const encryptedUser = Cookies.get("user");
        const username = decrypt(encryptedUser);
        if (!username) throw new Error("No username found");

        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const userEndpoint = `${strapiApiUrl}/api/students?filters[user_name][$eq]=${username}&populate=*`;
        const bearerToken = Cookies.get("token");

        const studentResponse = await fetch(userEndpoint, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!studentResponse.ok)
          throw new Error("Failed to fetch student data");

        const studentData = await studentResponse.json();
        const student = studentData.data[0];
        if (!student) throw new Error("Student data not found");

        const collegeId = student.attributes.college.data.id;
        const classId = student.attributes.class.data.id;

        const selfStudyEndpoint = `${strapiApiUrl}/api/assign-dpp-to-colleges?populate[creat_dpps][populate][subject][populate][class]=*&populate[creat_dpps][populate][material]=*&populate[college]=*&filters[college][id][$eq]=${collegeId}&filters[creat_dpps][subject][class][id][$eq]=${classId}`;
        const selfStudyResponse = await fetch(selfStudyEndpoint);
        if (!selfStudyResponse.ok)
          throw new Error("Failed to fetch DPP materials");

        const selfStudyData = await selfStudyResponse.json();
        setSelfStudyMaterials(selfStudyData.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  const handleViewMaterial = (url) => {
    window.open(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${url}`, "_blank");
  };

  return (
    <div className="container">
      <div className="sectionHeader">Self Study Materials</div>
      {selfStudyMaterials.length === 0 ? (
        <div className={styles.noMaterials}>
          No DPP materials assigned. Please check back later or contact your
          administrator.
        </div>
      ) : (
        <div className={styles.grid}>
          {selfStudyMaterials.map((item) =>
            item.attributes.creat_dpps.data.map((study) => (
              <div className={styles.card} key={study.id}>
                <h3 className={styles.studyName}>{study.attributes.name}</h3>
                <div className={styles.details}>
                  <p className={styles.detail}>
                    <strong>Subject:</strong>{" "}
                    {study.attributes.subject.data.attributes.name}
                  </p>
                  <p className={styles.detail}>
                    <strong>Class:</strong>{" "}
                    {
                      study.attributes.subject.data.attributes.class.data
                        .attributes.name
                    }
                  </p>
                </div>
                <button
                  className="submitButton"
                  onClick={() =>
                    handleViewMaterial(
                      study.attributes.material.data.attributes.url
                    )
                  }
                >
                  View
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DPP;
