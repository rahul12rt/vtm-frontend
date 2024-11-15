"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./AdminCard.module.css";

const AdminCard = ({ title, route, icon }) => {
  const router = useRouter();

  const handleNavigation = () => {
    router.push(route);
  };

  return (
    <div className={styles.card} onClick={handleNavigation}>
      <div className={styles.icon}>{icon}</div>
      <h3>{title}</h3>
    </div>
  );
};

export default AdminCard;
