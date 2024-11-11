import React from "react";
import styles from '../styles/FooterLight.module.css'
import logoWhite from "../assets/logo-white.svg";
import { useNavigate, Link } from "react-router-dom";

function FooterLight() {
  return (
    <div className={styles.Footer}>
      <div className={styles.FooterContent}>
        <div className={styles["footer-firstrow"]}>
          <div className={styles["footer-logos"]}>
            <img src={logoWhite} />
          </div>
        </div>

        <div className={styles["footer-lastrow"]}>
          <div className={styles["footer-extra-info"]}>
            <div className={styles["footer-copyright"]}>
              <span>Loocal ©2024. Todos los derechos reservados</span>
              <br />
              <span>
                <Link to="/">Términos y condiciones</Link> •{" "}
                <Link to="/">Política de privacidad</Link> •{" "}
                <Link to="/">Política de cookies</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FooterLight;
