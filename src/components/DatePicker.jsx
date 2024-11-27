import React, { useRef } from "react";
import styles from "../styles/NewCheckout.module.css";
import { formatDateString, getNextAvailableDates } from "../utils/dateTime.js";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { DateTime } from "luxon";
import { getAvailableHours2, getNextAvailableDates2, isTodayAvailable } from "../utils/dateTime2.js";

const DatePicker = ({ dates, onDateSelect, selectedDate }) => {
  const datePickerRef = useRef(null);
  const selectedFormatDate = DateTime.fromISO(selectedDate)  

  const scrollLeft = () => {
    datePickerRef.current.scrollBy({ left: -100, behavior: "smooth" });
  };

  const scrollRight = () => {
    datePickerRef.current.scrollBy({ left: 100, behavior: "smooth" });
  };

  const availableDates2 = getNextAvailableDates2();


  return (
    <>
    <div className={styles["date-picker-container"]}>
      <FiChevronLeft onClick={scrollLeft} className={styles["scroll-button"]} />
      <div className={styles["date-picker"]} ref={datePickerRef}>
      {availableDates2.map((date, index) => {
          const dateObj = DateTime.fromISO(date).setLocale("es");
          const dayName = dateObj.toFormat("cccc"); // Nombre completo del día (Lunes, Martes, etc.)
          const formattedDate = dateObj.toFormat("LLL dd"); // Mes y día (Nov 26, Nov 27, etc.)

          return (
            <div
                key={`${date}-${index}`}
                className={`${styles["date-option"]} ${
                  DateTime.fromISO(date).toISODate() === selectedFormatDate.toISODate() ? styles["selected"] : ""
                }`}
                onClick={() => onDateSelect(date)}
              >
              <h4>
                {dayName}
              </h4>
              <span>{formattedDate}</span>
            </div>
          );
        })}
      </div>
      <FiChevronRight
        onClick={scrollRight}
        className={styles["scroll-button"]}
      />
    </div>
    </>
  );
};

export default DatePicker;
