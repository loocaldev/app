import React from "react";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import graphLoocal from '../assets/graphLoccal2024.png'

import styles from "../styles/SliderHome.module.css";

const cards = [
  {
    schema: "purple",
    image: graphLoocal,
    title: "Primer envio gratis",
    description: "Recibe en casa sin costo adicional",
    button: "Comprar ahora",
  },
  {
    schema: "orange",
    image: graphLoocal,
    title: "Martes de descuentos",
    description: "Compra ahora y ahorra mucho",
    button: "Comprar ahora",
  },
  {
    schema: "green",
    image: graphLoocal,
    title: "Outlet",
    description: "Fechas cortas para consumir rapido",
    button: "Comprar ahora",
  },
];

function SliderHome() {
  const settings1 = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };
  return (
    <div className={styles.banner}>
      <Slider {...settings1}>
        {cards.map((card, index) => (
          <div key={index} className={`${styles.cardWrapper} ${styles[card.schema]}`}>
            <div className={styles.card}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <button>{card.button}</button>
            </div>
            <div className={styles['card-image']}>
              <img src={card.image}></img>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default SliderHome;
