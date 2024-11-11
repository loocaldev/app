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
// export const formatDateString = (dateString) => {
//   const [day, month, year] = dateString.split("/");
//   const dateObj = new Date(year, month - 1, day);
//   const today = new Date();
//   const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
//   const months = [
//     "Ene",
//     "Feb",
//     "Mar",
//     "Abr",
//     "May",
//     "Jun",
//     "Jul",
//     "Ago",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dic",
//   ];

//   if (
//     dateObj.getDate() === today.getDate() &&
//     dateObj.getMonth() === today.getMonth() &&
//     dateObj.getFullYear() === today.getFullYear()
//   ) {
//     return {
//       dayOfWeek: daysOfWeek[dateObj.getDay()],
//       dayOfMonth: "",
//       month: "Hoy",
//     };
//   } else {
//     return {
//       dayOfWeek: daysOfWeek[dateObj.getDay()],
//       dayOfMonth: dateObj.getDate(),
//       month: months[dateObj.getMonth()],
//     };
//   }
// };


export const formatDateString = (date) => {
  // Convertir a objeto Date si date es un string
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  // Verificar si el objeto Date es válido
  if (isNaN(parsedDate.getTime())) {
    console.error("Fecha inválida en formatDateString:", date);
    return { dayOfWeek: "", month: "", dayOfMonth: "Fecha inválida" };
  }

  const dayOfWeek = parsedDate.toLocaleDateString("es-CO", { weekday: "short" });
  const month = parsedDate.toLocaleDateString("es-CO", { month: "short" });
  const dayOfMonth = parsedDate.getDate();

  return { dayOfWeek, month, dayOfMonth };
};

// Horas disponibles basadas en la fecha seleccionada
export const getAvailableHours = (selectedDate) => {
  const hours = [];
  const now = new Date();
  const isToday = selectedDate === now.toISOString().split("T")[0];

  let startHour = isToday ? now.getHours() + 4 : 9; // Comienza desde 4 horas después si es hoy, o desde las 9 AM si es otro día

  for (let hour = startHour; hour < 18; hour++) { // Hasta las 6 PM
    hours.push(`${hour}:00`); // Agrega solo la hora redondeada para simplificar
    hours.push(`${hour}:30`); // Agrega también la media hora
  }

  return hours;
};