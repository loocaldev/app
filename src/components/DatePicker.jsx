import React, { useRef } from 'react';
import styles from '../styles/NewCheckout.module.css';
import { formatDateString } from '../utils/dateTime';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Función para verificar si un valor es una fecha válida
const formatISODate = (date) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : null; // Retorna null si la fecha no es válida
};

const DatePicker = ({ dates, onDateSelect, selectedDate }) => {
  const datePickerRef = useRef(null);

  const scrollLeft = () => {
    datePickerRef.current.scrollBy({ left: -100, behavior: 'smooth' });
  };

  const scrollRight = () => {
    datePickerRef.current.scrollBy({ left: 100, behavior: 'smooth' });
  };

  return (
    <div className={styles["date-picker-container"]}>
      <FiChevronLeft onClick={scrollLeft} className={styles["scroll-button"]} />
      <div className={styles["date-picker"]} ref={datePickerRef}>
        {dates.map((date, index) => {
          const formattedDate = formatISODate(date); // Asegura el formato
          
          // Si el formato es inválido, ignora esta fecha
          if (!formattedDate) {
            console.warn(`Fecha inválida en dates: ${date}`);
            return null;
          }
          
          const { dayOfWeek, month, dayOfMonth } = formatDateString(date);
          
          return (
            <div
              key={index}
              className={`${styles["date-option"]} ${formattedDate === selectedDate ? styles["selected"] : ""}`}
              onClick={() => onDateSelect(formattedDate)}
            >
              <span className={styles["date-option-day"]}>{dayOfWeek}</span>
              <br />
              <span className={styles["date-option-date"]}>
                {month} {dayOfMonth}
              </span>
            </div>
          );
        })}
      </div>
      <FiChevronRight onClick={scrollRight} className={styles["scroll-button"]} />
    </div>
  );
};

export default DatePicker;
