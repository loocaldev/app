import React from 'react';
import styles from '../styles/Checkout.module.css';
import { formatHour, getAvailableHours } from '../utils/dateTime'; // Asegúrate de importar getAvailableHours

const TimePicker = ({ selectedDate, selectedHour, onTimeSelect }) => {
  const availableHours = getAvailableHours(selectedDate); // Obtener las horas disponibles basadas en la fecha seleccionada

  return (
    <div className={styles["time-picker"]}>
      {availableHours.map((hour, index) => {
        const { hour: formattedHour, minute, period } = formatHour(hour);
        return (
          <div
            key={index}
            className={`${styles["time-option"]} ${hour === selectedHour ? styles["selected"] : ""}`}
            onClick={() => {
                console.log("Hora seleccionada:", hour);  // Agregar console.log para ver la hora seleccionada
                onTimeSelect(hour);
              }}
          >
            <span className={styles["time-option-hour"]}>{formattedHour}:{minute}</span>
            <br />
            <span className={styles["time-option-period"]}>{period}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TimePicker;
