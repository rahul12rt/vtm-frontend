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
  const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encryptedUser = Cookies.get("user");
        const username = decrypt(encryptedUser);

        // Set logo path based on username using imported values
        if (username === "scpuc123" || username === "college1") {
          setLogoPath("/images/logos/sadvidya-composite-puc.svg");
        } else if (username === "ssrpuc") {
          setLogoPath("/images/logos/sadvidya-semi-residential.jpg");
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
              setLogoPath("/images/logos/logo.jpg");
            } else if (role === "Student") {
              const studentResponse = await fetch(
                `${strapiApiUrl}/api/students?filters[user_name][$eq]=${username}&populate=*`
              );

              const studentData = await studentResponse.json();
              const collegeUserName =
                studentData.data[0].attributes.college.data.attributes
                  .user_name;

              if (
                collegeUserName === "scpuc123" ||
                collegeUserName === "college1"
              ) {
                setLogoPath("/images/logos/sadvidya-composite-puc.svg");
              } else if (collegeUserName === "ssrpuc") {
                setLogoPath("/images/logos/sadvidya-semi-residential.jpg");
              }
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
            <>
              <img src={logoPath} alt="Logo" className={styles.logo} />
            </>
          )}
        </div>

        {!loading && pathname !== "/test" && userData && (
          <button onClick={handleLogout} className="submitButton">
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
