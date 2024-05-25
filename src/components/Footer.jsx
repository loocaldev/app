import React from "react";
import logoWhite from "../assets/logo-white.svg";

import styles from "../styles/Footer.module.css";

import { FaFacebook, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <>
      <div className={styles.Footer}>
        <div className={styles.FooterContent}>
          <div className={styles["footer-logos"]}>
            <img src={logoWhite} />
            <div className={styles["footer-social"]}>
              <div className={styles["footer-social-circle"]}>
                <FaFacebook />
              </div>
              <div className={styles["footer-social-circle"]}>
                <FaInstagram />
              </div>
            </div>
          </div>
          <div className={styles["footer-menu"]}>
            <div className={styles["footer-menu-column"]}>
              <h4>Sobre Loocal</h4>
              <ul>
                <li>Nosotros</li>
                <li>Trabaja con nosotros</li>
                <li>Contáctanos</li>
              </ul>
            </div>
            <div className={styles["footer-menu-column"]}>
              <h4>Contáctanos</h4>
              <ul>
                <li>Nosotros</li>
                <li>Trabaja con nosotros</li>
                <li>Contáctanos</li>
              </ul>
            </div>
          </div>
          <div className={styles["footer-extra-info"]}>
            <div className={styles["footer-divider"]}>
              <hr />
            </div>
            <div className={styles["footer-copyright"]}>
              <span>Loocal ©2024. Todos los derechos reservados</span><br/>
              <span>Términos y condiciones | Política de privacidad | Política de cookies</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;
