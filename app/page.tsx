"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <main className={styles.main}>
      <h1 className="container">Redirecting...</h1>
    </main>
  );
}
