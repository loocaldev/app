import { DateTime } from "luxon";

const now = DateTime.now().setZone("America/Bogota");
const minimumOrderLeadTime = 4;
const minTime = now.set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
const maxTime = now.set({ hour: 18, minute: 0, second: 0, millisecond: 0 });

// Verificar si hoy tiene horas disponibles
export const isTodayAvailable = () => {
    const roundedNow = now
      .plus({ minutes: 30 - (now.minute % 30) })
      .set({ second: 0, millisecond: 0 });
  
    const startTime = DateTime.max(
      roundedNow.plus({ hours: minimumOrderLeadTime }),
      minTime
    );
  
    // Si el tiempo inicial es menor que maxTime, hoy tiene horas disponibles
    return startTime < maxTime;
  };

export const getNextAvailableDates2 = () => {
  // Generar las próximas 7 fechas, incluyendo hoy si está disponible
  const startDay = isTodayAvailable() ? 0 : 1;
  return Array.from({ length: 7 }, (_, i) =>
    now.plus({ days: i + startDay }).toISODate()
  );
};

export const getAvailableHours2 = (selectedDate2) => {
  const isToday = (DateTime.fromISO(selectedDate2).setZone("America/Bogota")).hasSame(now, "day");

  const roundedNow = now
    .plus({ minutes: 30 - (now.minute % 30) })
    .set({ second: 0, millisecond: 0 });

  const startTime = isToday
    ? DateTime.max(roundedNow.plus({ hours: minimumOrderLeadTime }), minTime)
    : minTime;

  const availableHours = [];
  let currentTime = startTime;

  while (currentTime < maxTime) {
    availableHours.push(currentTime.toFormat("HH:mm"));
    currentTime = currentTime.plus({ minutes: 30 });
  }

  return availableHours;
};
