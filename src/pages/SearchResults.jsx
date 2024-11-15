import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GridProducts from "../components/GridProducts";
import { getAllProducts } from "../api/products.api";
import styles from "../styles/SearchResults.module.css";

function SearchResults() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        const filteredProducts = response.data.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  return (
    <div className={styles.container}>
      <h2>Resultados para "{searchQuery}"</h2>
      {products.length > 0 ? (
        <GridProducts products={products} />
      ) : (
        <p>No se encontraron resultados para "{searchQuery}".</p>
      )}
    </div>
  );
}

export default SearchResults;
