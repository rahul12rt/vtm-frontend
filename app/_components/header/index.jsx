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
  const [loading, setLoading] = useState(true); // Add loading state
  const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encryptedUser = Cookies.get("user");
        const username = decrypt(encryptedUser);
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
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching is done
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
          <h5 style={{ fontSize: 32, margin: 0 }}>VidVat</h5>
        </div>
        {pathname !== "/login" && pathname !== "/test" && isAdmin && (
          <select
            value={selectedPage}
            onChange={handleChange}
            style={{ padding: "10px", fontSize: "16px", width: "60%" }}
          >
            <option value="/">Select a page</option>
            {/* <option value="/login">Login</option> */}
            <option value="/register/student">Student Register</option>
            <option value="/register/faculty">Faculty Register</option>
            <option value="/register/college">College Register</option>
            <option value="/manage/subjects">Manage Subjects</option>
            <option value="/manage/chapters">Manage Chapters</option>
            <option value="/manage/qualifications">
              Manage Qualifications
            </option>
            <option value="/manage/topics">Manage Topics</option>
            <option value="/mapping/faculty-to-subjects">
              Map faculty to subject
            </option>
            <option value="/mapping/faculty-to-colleges">
              Map faculty to college
            </option>
            <option value="/manage/self-study">Self study</option>
            <option value="/list/self-studies">List of Self Studies</option>
            <option value="/assign/self-study-college">
              Assign Self-Study to College
            </option>
            <option value="/list/assigned-study-material-college">
              Assigned Study Material List
            </option>
            <option value="/manage/create-dpp">Create DPP</option>
            <option value="/list/dpp">List of DPP</option>
            <option value="/assign/dpp-class">
              Assign Dpp to Class and College
            </option>
            <option value="/list/assigned-dpp-class">Assigned DPP List</option>
            <option value="/list/students">List of students</option>
            <option value="/list/colleges">List of colleges</option>
            <option value="/list/facultys">List of faculty</option>
            <option value="/question-bank-management">
              Question bank management
            </option>
            <option value="/question-bank-management/list">
              Questions List
            </option>
            <option value="/manage/create-test">Create Test</option>
            <option value="/list/test">Test List</option>
            <option value="/assign/test">Assign Test</option>
            <option value="/result">Test Results</option>
            <option value="/reports/Aprameya">
              Student wise reports for APRAMEYA AR
            </option>
          </select>
        )}
        {!loading &&
          pathname !== "/test" &&
          userData && ( // Show logout button after loading is complete
            <button onClick={handleLogout} className="submitButton">
              Logout
            </button>
          )}
      </div>
    </div>
  );
};

export default Header;
