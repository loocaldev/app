import React from "react";

const FilterSelector = ({ onFilter }) => {
  const handleFilterChange = (e) => {
    onFilter(e.target.value);
  };

  return (
    <select onChange={handleFilterChange}>
      <option value="">Todos los productos</option>
      <option value="convencional">Convencional</option>
      <option value="organico">Orgánico</option>
    </select>
  );
};

export default FilterSelector;
