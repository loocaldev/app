import React, { useState } from "react";
import { useSwipeable } from "react-swipeable"; // Importamos la librería de deslizamiento
import styles from "../styles/Carousel.module.css";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";

const Carousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + items.length) % items.length
    );
  };

  // Manejo de gestos con swipe
  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true, // También para dispositivos de escritorio
  });

  return (
    <div className={styles.carouselContainer}>
      {/* Usamos los handlers de deslizamiento en el contenedor */}
      <div
        {...handlers}
        className={styles.carouselContent}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }} // Desplaza el contenido
      >
        {items.map((item, index) => (
          <div className={styles.carouselItem} key={index}>
            <div
              className={styles.carouselBg}
              style={{ backgroundColor: `${item.background}` }}
            >
              <div className={styles.carouselText} style={{ color: `${item.color}`}}>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
                {item.path && (
                  <button style={{ backgroundColor: `${item.color}` }} onClick={() => navigate(item.path)}>
                    {item.buttonText}
                  </button>
                )}
              </div>
              <div className={styles.carouselImg}>
                <img src={item.image} alt={item.title} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Puntos de navegación fuera de la tarjeta */}
      <div className={styles.carouselIndicators}>
        {items.map((_, index) => (
          <div
            key={index}
            className={classNames(styles.indicator, {
              [styles.active]: index === currentIndex,
            })}
            onClick={() => setCurrentIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
