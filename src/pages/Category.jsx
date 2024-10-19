import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import GridProducts from "../components/GridProducts";
import { getAllProducts } from "../api/products.api";

function Category() {
  const { categoryName } = useParams(); // Obtener la categoría desde los parámetros de la URL
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("az");

  useEffect(() => {
    if (categoryName) {  
      async function loadProducts() {
        try {
          const res = await getAllProducts();
          console.log("Productos obtenidos:", res.data);
          const filteredProducts = res.data.filter((product) =>
            product.categories.some((category) => {
              console.log("Comparando", category.name, "con", categoryName); // Verificación
              return category.name.toLowerCase() === categoryName.toLowerCase();
            })
          );
          setProducts(filteredProducts);
        } catch (error) {
          console.error("Error al cargar productos:", error);
        }
      }
      loadProducts();
    }
  }, [categoryName]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  // Si categoryName no está definido, mostramos un mensaje
  if (!categoryName) {
    return <div>Categoría no encontrada</div>;
  }

  return (
    <div>
      {/* Asegúrate de que categoryName esté definido antes de usar charAt */}
      <h2>{categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : "Categoría"}</h2>

      <div>
        {/* Opcional: Controles de búsqueda y ordenación */}
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select value={sortOrder} onChange={(e) => handleSort(e.target.value)}>
          <option value="az">A-Z</option>
          <option value="priceAsc">Precio: Menor a Mayor</option>
          <option value="priceDesc">Precio: Mayor a Menor</option>
        </select>
      </div>

      {/* Mostrar los productos filtrados */}
      <GridProducts products={products} searchQuery={searchQuery} sortOrder={sortOrder} />
    </div>
  );
}

export default Category;
