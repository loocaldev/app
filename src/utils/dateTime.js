// utils/dateTimeUtils.js

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

// Formato de fecha: dd/mm/yyyy -> nombres de mes/día
export const formatDateString = (dateString) => {
  const [day, month, year] = dateString.split("/");
  const dateObj = new Date(year, month - 1, day);
  const today = new Date();
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  if (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  ) {
    return {
      dayOfWeek: daysOfWeek[dateObj.getDay()],
      dayOfMonth: "",
      month: "Hoy",
    };
  } else {
    return {
      dayOfWeek: daysOfWeek[dateObj.getDay()],
      dayOfMonth: dateObj.getDate(),
      month: months[dateObj.getMonth()],
    };
  }
};

// Horas disponibles basadas en la fecha seleccionada
export const getAvailableHours = (selectedDate) => {
  const availableHours = [];
  const today = new Date();
  const currentHour = today.getHours();
  const [day, month, year] = selectedDate.split("/");
  const selectedDateObj = new Date(year, month - 1, day);

  if (selectedDateObj.getDate() === today.getDate()) {
    // Si la fecha seleccionada es hoy
    const startingHour = currentHour < 14 ? 18 : currentHour + 4;
    for (let hour = startingHour; hour <= 18; hour++) {
      availableHours.push(`${hour}:00`);
    }
  } else {
    // Si la fecha seleccionada no es hoy
    for (let hour = 8; hour <= 18; hour++) {
      availableHours.push(`${hour}:00`);
    }
  }

  return availableHours;
};
