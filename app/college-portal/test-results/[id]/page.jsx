"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import TestResults from "../../../_components/testResults";
import Cookies from "js-cookie";
import { decrypt } from "@/app/_utils/encryptionUtils";

const Results = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const id = params.id;
  const encryptedUser = Cookies.get("user");
  const username = decrypt(encryptedUser);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return; // Don't fetch if id is not available yet

      console.log(username);

      setIsLoading(true);
      try {
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const response = await fetch(
          `${strapiApiUrl}/api/results?populate[create_test][populate][subject][populate]=class&populate[student][populate]=college&populate[create_test][populate]=academic_year&filters[create_test][id][$eq]=${id}&filters[student][college][user_name][$eq]=${username}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;
  if (!data) return <div className="container">No data available</div>;

  return <TestResults data={data} />;
};

export default Results;
