"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { decrypt } from "@/app/_utils/encryptionUtils";
import { useParams, useRouter } from "next/navigation";
import styles from "./pages.module.css";

const JeeResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { stream } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        const encryptedUser = Cookies.get("user");
        if (!encryptedUser) throw new Error("User is not authenticated");
        const collegeUsername = decrypt(encryptedUser);
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const response = await fetch(
          `${strapiApiUrl}/api/results?filters[create_test][exam_type][$eq]=2&filters[student][college][user_name][$eq]=${collegeUsername}&populate[create_test][populate][subject][populate]=class&filters[create_test][exam_name][$eq]=${stream.toUpperCase()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }

        const data = await response.json();
        setResults(data?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [stream]);

  if (loading) return <h1 className="container">Loading results...</h1>;
  if (error) return <h1 className="container">Error: {error}</h1>;
  // Extract unique subjects
  const subjects = results
    .map(
      (result) =>
        result.attributes.create_test?.data?.attributes.subject?.data
          ?.attributes.name
    )
    .filter((value, index, self) => value && self.indexOf(value) === index); // Filter out duplicates

  return (
    <div className="container">
      <div className="sectionHeader">VES – Knowledge Hub</div>
      <h1 style={{textAlign:"center"}}>{stream.toUpperCase()} Results</h1>
      <div className={styles.cardContainer}>
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <>
              <div
                key={index}
                className={styles.card}
                onClick={() =>
                  router.push(
                    `/college-portal/consolidated-test/${stream}/${subject.toLowerCase()}`
                  )
                }
              >
                <h3>{subject}</h3>
              </div>
            </>
          ))
        ) : (
          <p>No subjects available</p>
        )}
        <div
          className={styles.card}
          onClick={() =>
            router.push(`/college-portal/consolidated-test/${stream}/all`)
          }
        >
          <h3>All</h3>
        </div>
      </div>
    </div>
  );
};

export default JeeResults;
