import React from "react";

const ProductVariationSelector = ({ variations, onVariationChange }) => {
  return (
    <div>
      <label htmlFor="variation-select">Seleccione una variación:</label>
      <select id="variation-select" onChange={(e) => onVariationChange(variations[e.target.value])}>
        {variations.map((variation, index) => (
          <option key={variation.id} value={index}>
            {variation.attribute_value} - {variation.price} COP
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductVariationSelector;
