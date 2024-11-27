import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GridProducts from "../components/GridProducts";
import { getAllProducts } from "../api/products.api";
import styles from "../styles/SearchResults.module.css";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";

function SearchResults() {
  const [products, setProducts] = useState([]); // Todos los productos
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query"); // Query desde la URL

  // Usar `useAdvancedSearch` para obtener los resultados destacados
  const advancedResults = useAdvancedSearch(products, searchQuery, {
    keys: ["name", "description", "categories.name"], // Claves a buscar
    threshold: 0.3, // Sensibilidad de coincidencia
    distance: 100, // Prioridad a resultados cercanos
    includeMatches: true, // Incluir coincidencias para resaltar
  });

  useEffect(() => {
    // Cargar los productos al montar el componente
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Resultados para "{searchQuery}"</h2>
      {advancedResults.length > 0 ? (
        <GridProducts products={advancedResults} /> // Pasar resultados destacados
      ) : (
        <p>No se encontraron resultados para "{searchQuery}".</p>
      )}
    </div>
  );
}

export default SearchResults;
