import React from "react";

const SortSelector = ({ onSort }) => {
  const handleSortChange = (e) => {
    onSort(e.target.value);
  };

  return (
    <select onChange={handleSortChange}>
      <option value="az">A-Z</option>
      <option value="priceAsc">Precio más bajo</option>
      <option value="priceDesc">Precio más alto</option>
    </select>
  );
};

export default SortSelector;
