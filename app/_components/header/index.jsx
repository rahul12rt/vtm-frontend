"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./index.module.css";
import Cookies from "js-cookie";
import { decrypt } from "@/app/_utils/encryptionUtils";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPage, setSelectedPage] = useState("/");
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoPath, setLogoPath] = useState(""); // Default logo
  const [collegeDetails, setCollegeDetails] = useState(null);
  const [url, setUrl] = useState("/admin-c")
  const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encryptedUser = Cookies.get("user");
        const username = decrypt(encryptedUser);

        // Set logo path and college details based on username
        if (username === "sadvidya") {
          setLogoPath(
            "https://vtm-db.s3.ap-south-1.amazonaws.com/Sadvidya+Composite+Logo-cropped.svg"
          );
          setCollegeDetails({
            name: "Sadvidya Composite PU College",
            address:
              "Sadvidya Educational Institutions - #7, Narayana Sastry Road, Subbarayanakere, Chamrajpura, Mysore - 570024",
          });
          setUrl("/college-portal")
        } else if (username === "sadvidyasr") {
          setLogoPath(
            "https://vtm-db.s3.ap-south-1.amazonaws.com/Sadvidya+Semi+Residential.jpg"
          );
          setCollegeDetails({
            name: "Sadvidya Semi Residential PU College",
            address:
              "Sadvidya Semi Residential PU College - CA19, Damodaram Sanjeeviah Road, 2nd Stage, Vijayanagar, Mysuru - 570017",
          });
          setUrl("/college-portal")
        }

        if (username) {
          const response = await fetch(
            `${strapiApiUrl}/api/users?filters[username]=${username}&populate=*`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          if (data.length > 0) {
            const user = data[0];
            setUserData(user);
            const role = user.role?.name;
            if (role === "Admin") {
              setIsAdmin(true);
              setLogoPath(
                "https://vtm-db.s3.ap-south-1.amazonaws.com/vidvat+logo.svg"
              );
              setCollegeDetails(null); // Clear college details for admin
              setUrl("/admin-c")
            } else if (role === "Student") {
              const studentResponse = await fetch(
                `${strapiApiUrl}/api/students?filters[user_name][$eq]=${username}&populate=*`
              );

              const studentData = await studentResponse.json();
              const collegeUserName =
                studentData.data[0].attributes.college.data.attributes
                  .user_name;

              if (collegeUserName === "sadvidya") {
                setLogoPath(
                  "https://vtm-db.s3.ap-south-1.amazonaws.com/Sadvidya+Composite+Logo-cropped.svg"
                );
                setCollegeDetails({
                  name: "Sadvidya Composite PU College",
                  address:
                    "Sadvidya Educational Institutions - #7, Narayana Sastry Road, Subbarayanakere, Chamrajpura, Mysore - 570024",
                });
                setUrl("/college-portal")
              } else if (collegeUserName === "sadvidyasr") {
                setLogoPath(
                  "https://vtm-db.s3.ap-south-1.amazonaws.com/Sadvidya+Semi+Residential.jpg"
                );
                setCollegeDetails({
                  name: "Sadvidya Semi Residential PU College",
                  address:
                    "Sadvidya Semi Residential PU College - CA19, Damodaram Sanjeeviah Road, 2nd Stage, Vijayanagar, Mysuru - 570017",
                });
                setUrl("/college-portal")
              }
              setUrl("/student-portal")
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("token");
    Cookies.remove("utms_id");
    window.location.href = "/login";
  };

  const handleChange = (e) => {
    const path = e.target.value;
    setSelectedPage(path);
    router.push(path);
  };

  return (
    <div className="container">
      <div className={styles.wrap}>
        <div className={styles.logoWrap}>
          {pathname !== "/login" && logoPath && (
            <div className={styles.left}>
              <div className={styles.logoCont}>
                <img src={logoPath} alt="Logo" className={styles.logo} />
              </div>
              {collegeDetails && (
                <div className={styles.collegeDetails}>
                  <h2>{collegeDetails.name}</h2>
                  <p>{collegeDetails.address}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {!loading && pathname !== "/test" && userData && (
          <button onClick={handleLogout} className="submitButton">
            Logout
          </button>
        )}
      </div>
      <a href={url} style={{paddingBottom:10}}>Home</a>
    </div>
  );
};

export default Header;
