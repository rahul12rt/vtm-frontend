"use client";
import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import styles from "./Instruction.module.css";
import { FaVideo, FaCircle, FaExclamationCircle } from "react-icons/fa";
import { decrypt } from "../_utils/encryptionUtils";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const ProctoringInstructions = () => {
  return (
    <div className={styles.instruction}>
      <h3>You&rsquo;re about to start this assignment</h3>
      <div>
        <p className={styles.warning}>
          This assignment is going to be monitored via Webcam. Please make sure
          that your Webcam is functional throughout the assignment.
        </p>
        <p className={styles.info}>
          <FaExclamationCircle style={{ color: "#66bb6a", marginRight: 6 }} />
          Points to keep in mind during this assignment:
        </p>
        <ul>
          <li className={styles.li}>
            <FaCircle className={styles.greenDot} />
            Stay on Fullscreen until the end of the assignment.
          </li>
          <li className={styles.li}>
            <FaCircle className={styles.greenDot} />
            Do not move out of the Tab or switch Windows.
          </li>
          <li className={styles.li}>
            <FaCircle className={styles.greenDot} />
            Disable system Notifications.
          </li>
        </ul>
        <p className={styles.infoData}>
          Interaction with external pop-ups can lead to auto-submission of the
          assignment.
        </p>
      </div>
    </div>
  );
};

const SystemChecks = ({ onNext }) => {
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);
  const router = useRouter();

  // Check for Webcam availability
  const checkWebcam = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setWebcamEnabled(true);
    } catch (error) {
      setWebcamEnabled(false);
    }
  };

  const handleFullScreenToggle = () => {
    if (!isFullScreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    checkWebcam();
  }, []);

  useEffect(() => {
    setNextEnabled(isFullScreen && checkboxChecked);
  }, [isFullScreen, checkboxChecked]);
  const toggleCheckbox = () => {
    setCheckboxChecked((prev) => !prev);
  };

  const handleStartClick = () => {
    // if (nextEnabled) {
    //   router.push("/test");
    // }
    router.push("/test");
  };

  return (
    <div className={styles.systemCheck}>
      <h3>System Checks</h3>
      <div className={styles.checkContainer}>
        <p className={styles.checkItem}>
          <FaVideo className={styles.icon} /> Webcam Status:{" "}
          {webcamEnabled ? (
            <span className={styles.success}>Enabled</span>
          ) : (
            <span className={styles.error}>Disabled</span>
          )}
        </p>
        <p className={styles.checkItem}>
          <p className={styles.info}>
            Please make sure you are in fullscreen mode to proceed with the
            assignment.
          </p>
          <button className="submitButton" onClick={handleFullScreenToggle}>
            {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </button>
        </p>
      </div>

      {/* <p className={styles.info}>
        <span onClick={toggleCheckbox} className={styles.disclaimer}>
          By clicking here, you acknowledge and agree to follow all the
          guidelines.
        </span>
      </p> */}

      <p className={styles.info} style={{ marginBottom: 20 }}>
        <input
          type="checkbox"
          checked={checkboxChecked}
          onChange={(e) => setCheckboxChecked(e.target.checked)}
          style={{ marginRight: 6 }}
          className={styles.checkbox}
        />
        <span onClick={toggleCheckbox} className={styles.disclaimer}>
          By clicking here, you acknowledge and agree to follow all the
          guidelines.
        </span>
      </p>

      <button
        className="submitButton"
        onClick={handleStartClick}
        disabled={!nextEnabled}
        style={{ cursor: !nextEnabled ? "not-allowed" : "pointer" }}
      >
        Start
      </button>
    </div>
  );
};

const Instruction = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const router = useRouter();
  useEffect(() => {
    const encryptedId = Cookies.get("utmt_id");
    if (encryptedId) {
      const id = decrypt(encryptedId);
    } else {
      router.push("/404");
    }
  }, []);

  const goToNextTab = () => {
    if (tabIndex < 1) {
      setTabIndex(tabIndex + 1);
    }
  };

  return (
    <div className="container">
      <div className="sectionHeader">Instructions</div>
      <Tabs
        className={styles.tabContainer}
        selectedIndex={tabIndex}
        onSelect={(index) => setTabIndex(index)}
      >
        <TabList className={styles.tabList}>
          <Tab className={styles.tab} selectedClassName={styles.activeTab}>
            Proctoring Instructions
          </Tab>
          <Tab className={styles.tab} selectedClassName={styles.activeTab}>
            System Checks
          </Tab>
        </TabList>

        {/* Tab Panels */}
        <TabPanel>
          <ProctoringInstructions />
          <button className="submitButton" onClick={goToNextTab}>
            Next
          </button>
        </TabPanel>
        <TabPanel>
          <SystemChecks onNext={goToNextTab} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default Instruction;
