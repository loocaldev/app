const formatPriceToCOP = (price) => {
  const numericPrice = Number(price);
  if (!isNaN(numericPrice)) {
    return numericPrice.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return "N/A"; // Devuelve un valor por defecto si no es un número válido
};

// Exportamos la función como default
export default formatPriceToCOP;
