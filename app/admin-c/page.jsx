import React from "react";
import styles from "./page.module.css";
import AdminCard from "../_components/adminCard";

// Import icons from react-icons
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaBook,
  FaTasks,
  FaClipboardList,
  FaMapMarkerAlt,
  FaListAlt,
  FaEdit,
  FaPlus,
  FaClipboardCheck,
  FaQuestionCircle,
} from "react-icons/fa";

function Admin() {
  // Mapping icons to route titles
  const iconMapping = {
    "Student Register": <FaUserGraduate />,
    "Faculty Register": <FaChalkboardTeacher />,
    "College Register": <FaSchool />,
    "Manage Subjects": <FaBook />,
    "Manage Chapters": <FaTasks />,
    "Manage Qualifications": <FaClipboardList />,
    "Manage Topics": <FaEdit />,
    "Map Faculty to Subject": <FaMapMarkerAlt />,
    "Map Faculty to College": <FaMapMarkerAlt />,
    "Self Study": <FaBook />,
    "List of Self Studies": <FaListAlt />,
    "Assign Self-Study to College": <FaClipboardCheck />,
    "Assigned Study Material List": <FaClipboardList />,
    "Create DPP": <FaPlus />,
    "List of DPP": <FaListAlt />,
    "Assign DPP to Class and College": <FaClipboardCheck />,
    "Assigned DPP List": <FaListAlt />,
    "List of Students": <FaUserGraduate />,
    "List of Colleges": <FaSchool />,
    "List of Faculty": <FaChalkboardTeacher />,
    "Question Bank Management": <FaQuestionCircle />,
    "Questions List": <FaListAlt />,
    "Create Test": <FaPlus />,
    "Test List": <FaListAlt />,
    "Assign Test": <FaClipboardCheck />,
    "Assigned Test List": <FaClipboardList />,
  };

  const adminRoutes = [
    { title: "Student Register", route: "/register/student" },
    { title: "Faculty Register", route: "/register/faculty" },
    { title: "College Register", route: "/register/college" },
    { title: "Manage Subjects", route: "/manage/subjects" },
    { title: "Manage Chapters", route: "/manage/chapters" },
    { title: "Manage Qualifications", route: "/manage/qualifications" },
    { title: "Manage Topics", route: "/manage/topics" },
    {
      title: "Map Faculty to Subject",
      route: "/mapping/faculty-to-subjects",
    },
    {
      title: "Map Faculty to College",
      route: "/mapping/faculty-to-colleges",
    },
    { title: "Self Study", route: "/manage/self-study" },
    { title: "List of Self Studies", route: "/list/self-studies" },
    {
      title: "Assign Self-Study to College",
      route: "/assign/self-study-college",
    },
    {
      title: "Assigned Study Material List",
      route: "/list/assigned-study-material-college",
    },
    { title: "Create DPP", route: "/manage/create-dpp" },
    { title: "List of DPP", route: "/list/dpp" },
    { title: "Assign DPP to Class and College", route: "/assign/dpp-class" },
    { title: "Assigned DPP List", route: "/list/assigned-dpp-class" },
    { title: "List of Students", route: "/list/students" },
    { title: "List of Colleges", route: "/list/colleges" },
    { title: "List of Faculty", route: "/list/facultys" },
    { title: "Question Bank Management", route: "/question-bank-management" },
    { title: "Questions List", route: "/question-bank-management/list" },
    { title: "Create Test", route: "/manage/create-test" },
    { title: "Test List", route: "/list/test" },
    { title: "Assign Test", route: "/assign/test" },
    { title: "Assigned Test List", route: "/list/assigned-test" },
  ];

  return (
    <div className="container">
      <div className="sectionHeader">Admin Panel</div>

      <div className={styles.cardsContainer}>
        {adminRoutes.map(({ title, route }) => (
          <AdminCard
            key={route}
            title={title}
            route={route}
            icon={iconMapping[title]}
          />
        ))}
      </div>
    </div>
  );
}

export default Admin;
