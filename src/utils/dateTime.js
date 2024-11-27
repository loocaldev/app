// utils/dateTimeUtils.js
import { DateTime } from "luxon";



// Formato de una hora en formato 24h a AM/PM
export const formatHour = (hour) => {
  const [hourPart, minutePart] = hour.split(":");
  let formattedHour = parseInt(hourPart);
  let period = "AM";

  if (formattedHour >= 12) {
    period = "PM";
    if (formattedHour > 12) {
      formattedHour -= 12;
    }
  }

  if (formattedHour === 0) {
    formattedHour = 12; // Medianoche como 12 AM
  }

  return { hour: formattedHour, minute: minutePart, period };
};

// Obtener hora actual en Bogotá como objeto Date
export const getCurrentTimeInBogota = () => {
  const now = DateTime.now().setZone("America/Bogota");
  return new Date(now.toISO());
};

// Validar si dos fechas son el mismo día
const isToday = (currentDate, selectedDate) => {
  return (
    currentDate.getFullYear() === selectedDate.getFullYear() &&
    currentDate.getMonth() === selectedDate.getMonth() &&
    currentDate.getDate() === selectedDate.getDate()
  );
};

// Obtener las horas disponibles en una fecha seleccionada
export const getAvailableHours = (selectedDate, additionalHours = 2) => {
  const now = getCurrentTimeInBogota();
  const selectedDateObj = new Date(selectedDate);

  const firstAvailableHour = 9; // 9:00 AM
  const lastAvailableHour = 17.5; // 5:30 PM

  // Si la fecha seleccionada es pasada (excepto hoy), devolver vacío
  if (selectedDateObj < now && !isToday(now, selectedDateObj)) {
    return [];
  }

  let startHour = firstAvailableHour;

  // Si es hoy, calcular las horas basadas en la hora actual + `additionalHours`
  if (isToday(now, selectedDateObj)) {
    const currentHourWithMinutes =
      now.getHours() + now.getMinutes() / 60 + additionalHours;

    // Ajustar al siguiente intervalo de 30 minutos
    startHour = Math.ceil(currentHourWithMinutes * 2) / 2;

    // Validar si el `startHour` está fuera del rango permitido
    if (startHour > lastAvailableHour) {
      return []; // No hay más horas disponibles hoy
    }

    // Ajustar para no permitir horas antes de `firstAvailableHour`
    startHour = Math.max(startHour, firstAvailableHour);
  }

  // Generar las horas disponibles
  const hours = [];
  for (let hour = startHour; hour <= lastAvailableHour; hour += 0.5) {
    const hourString = `${Math.floor(hour)}:${hour % 1 === 0 ? "00" : "30"}`;
    hours.push(hourString);
  }

  // console.log(`Horas disponibles para ${selectedDate}:`, hours);
  return hours;
};



export const getNextAvailableDates = (additionalHours = 2) => {
  const now = getCurrentTimeInBogota();
  const dates = [];
  let daysChecked = 0;

  while (dates.length < 7) {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysChecked);

    const availableHours = getAvailableHours(nextDate, additionalHours);

    // Solo incluir fechas con horas disponibles
    if (availableHours.length > 0) {
      dates.push({
        date: nextDate.toISOString().split("T")[0],
        hours: availableHours,
      });
    }

    daysChecked++;
  }

  // console.log("Fechas disponibles calculadas:", dates);
  return dates;
};


// Obtener los próximos 5 días con horarios disponibles
export const getNextFiveDays = () => {
  const now = getCurrentTimeInBogota();

  const days = [];
  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + i);

    const availableHours = getAvailableHours(nextDate);
    if (availableHours.length > 0) {
      days.push({ date: nextDate.toISOString().split("T")[0], hours: availableHours });
    }
  }

  return days;
};


export const formatDateString = (date) => {
  if (typeof date === "object" && date.date) {
    date = date.date; // Extraer la propiedad `date` si es un objeto con esta clave
  }

  // Convertir a un objeto DateTime de luxon, asegurando la zona horaria
  const parsedDate = DateTime.fromISO(date, { zone: "America/Bogota" });

  // Validar si el objeto DateTime es válido
  if (!parsedDate.isValid) {
    console.error("Fecha inválida en formatDateString:", date);
    return { dayOfWeek: "", month: "", dayOfMonth: "Fecha inválida" };
  }

  // Formatear la fecha
  const dayOfWeek = parsedDate.toFormat("ccc"); // Ejemplo: "mar"
  const month = parsedDate.toFormat("LLL"); // Ejemplo: "nov"
  const dayOfMonth = parsedDate.toFormat("d"); // Ejemplo: "26"

  return { dayOfWeek, month, dayOfMonth };
};
