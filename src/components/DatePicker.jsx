import React from 'react';
import styles from '../styles/Checkout.module.css';
import { formatDateString } from '../utils/dateTime';

const DatePicker = ({ dates, onDateSelect, selectedDate }) => {
  return (
    <div className={styles["date-picker"]}>
      {dates.map((date, index) => {
        const { dayOfWeek, month, dayOfMonth } = formatDateString(date);
        return (
          <div
            key={index}
            className={`${styles["date-option"]} ${date === selectedDate ? styles["selected"] : ""}`}
            onClick={() => onDateSelect(date)}
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
  );
};

export default DatePicker;
