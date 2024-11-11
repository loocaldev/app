// src/components/TimePicker.jsx
import React, { useRef } from 'react';
import styles from '../styles/NewCheckout.module.css';
import { formatHour, getAvailableHours } from '../utils/dateTime';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const TimePicker = ({ selectedDate, selectedHour, onTimeSelect }) => {
  const availableHours = getAvailableHours(selectedDate); // Usar la función de utilidades
  const timePickerRef = useRef(null);

  const scrollLeft = () => {
    timePickerRef.current.scrollBy({ left: -100, behavior: 'smooth' });
  };

  const scrollRight = () => {
    timePickerRef.current.scrollBy({ left: 100, behavior: 'smooth' });
  };

  return (
    <div className={styles["time-picker-container"]}>
      <FiChevronLeft onClick={scrollLeft} className={styles["scroll-button"]} />
      <div className={styles["time-picker"]} ref={timePickerRef}>
        {availableHours.map((hour, index) => {
          const { hour: formattedHour, minute, period } = formatHour(hour);
          return (
            <div
              key={index}
              className={`${styles["time-option"]} ${hour === selectedHour ? styles["selected"] : ""}`}
              onClick={() => onTimeSelect(hour)}
            >
              <span className={styles["time-option-hour"]}>{formattedHour}:{minute}</span>
              <br />
              <span className={styles["time-option-period"]}>{period}</span>
            </div>
          );
        })}
      </div>
      <FiChevronRight onClick={scrollRight} className={styles["scroll-button"]} />
    </div>
  );
};

export default TimePicker;
