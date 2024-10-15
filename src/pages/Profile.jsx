import React from "react";
import styles from "../styles/Profile.module.css";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { token, isAuthenticated, logout, userData } = useAuth();
  return (
    <div className={styles["container"]}>
      <div className={styles["content"]}>
        <h1>{userData.username}</h1>
        <h2>Mi cuenta</h2>
      </div>
    </div>
  );
}

export default Profile;
