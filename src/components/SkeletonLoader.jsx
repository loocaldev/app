import React from "react";
import styles from "../styles/SkeletonLoader.module.css";

function SkeletonLoader({ type = "card" }) {
  return (
    <div className={`${styles.skeleton} ${styles[type]}`}>
      <div className={styles.shimmer}></div>
    </div>
  );
}

export default SkeletonLoader;
