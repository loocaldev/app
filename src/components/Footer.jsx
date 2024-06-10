import React from "react";
import logoWhite from "../assets/logo-white.svg";
import { Link } from "react-router-dom";

import styles from "../styles/Footer.module.css";

import { FaFacebook, FaInstagram, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

function Footer() {
  return (
    <>
      <div className={styles.Footer}>
        <div className={styles.FooterContent}>
          <div className={styles["footer-firstrow"]}>
            <div className={styles["footer-logos"]}>
              <img src={logoWhite} />
              <div className={styles["footer-social"]}>
                <div className={styles["footer-social-circle"]}>
                  <a href="https://www.facebook.com/somosloocal" target="_blank"><FaFacebook /></a>
                </div>
                <div className={styles["footer-social-circle"]}>
                  <a href="https://www.instagram.com/somosloocal" target="_blank"><FaInstagram /></a>
                </div>
                <div className={styles["footer-social-circle"]}>
                  <a href="https://www.instagram.com/somosloocal" target="_blank"><FaLinkedin /></a>
                </div>
              </div>
            </div>
          </div>
          <div className={styles["footer-secondrow"]}>
            <div className={styles["footer-menu"]}>
              <div className={styles["footer-menu-column"]}>
                <h4>Sobre Loocal</h4>
                <ul>
                  <li><Link to="/">¿Qué es Loocal?</Link></li>
                  <li><Link to="/">Trabaja con nosotros</Link></li>
                </ul>
              </div>
              <div className={styles["footer-menu-column"]}>
                <h4>Contáctanos</h4>
                <ul>
                  <li><a href="https://wa.me/573197363596" target="_blank"><FaWhatsapp />+57 319 7363596</a></li>
                  <li><a href="mailto:info@loocal.co" target="_blank"><FiMail />info@loocal.co</a></li>
                </ul>
              </div>
              <div className={styles["footer-menu-column"]}>
                <h4>Quiero ser aliado</h4>
                <ul>
                  <li><Link to="/">Para productores</Link></li>
                  <li><Link to="/">Para transportadores</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className={styles["footer-lastrow"]}>
            <div className={styles["footer-extra-info"]}>
              <div className={styles["footer-divider"]}>
                <hr />
              </div>
              <div className={styles["footer-copyright"]}>
                <span>Loocal ©2024. Todos los derechos reservados</span>
                <br />
                <span>
                  <Link to="/">Términos y condiciones</Link> • <Link to="/">Política de privacidad</Link> • <Link to="/">Política de cookies</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;
