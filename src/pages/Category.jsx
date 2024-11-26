import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import GridProducts from "../components/GridProducts";
import { getAllProducts } from "../api/products.api";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";
import SkeletonLoader from "../components/SkeletonLoader";
import styles from "../styles/Category.module.css";
import { Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import useSticky from "../hooks/useSticky.js";
import useScreenSize from "../hooks/useScreenSize"; // Hook para detectar el tamaño de pantalla

function Category() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [unitTypeFilter, setUnitTypeFilter] = useState("all");
  const [isFiltersVisible, setIsFiltersVisible] = useState(true); // Control de visibilidad de filtros
  const isSticky = useSticky();
  const isMobile = useScreenSize(); // Detectar si es mobile

  // Filtrar productos basados en búsqueda y filtros
  const filteredProducts = useAdvancedSearch(products, searchQuery);

  // Cargar productos al montar el componente
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true); // Activar el estado de carga
        const res = await getAllProducts();
        const filtered = res.data.filter((product) =>
          product.categories.some(
            (category) =>
              category.name.toLowerCase() === categoryName.toLowerCase()
          )
        );
        setProducts(filtered);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false); // Desactivar el estado de carga
      }
    }
    fetchProducts();
  }, [categoryName]);

  // Cambiar visibilidad de filtros solo en dispositivos móviles
  useEffect(() => {
    if (!isMobile) {
      setIsFiltersVisible(true); // Siempre visible en desktop
    }
  }, [isMobile]);

  // Ordenar productos
  const getFilteredProducts = () => {
    let filtered = [...filteredProducts];

    if (unitTypeFilter === "weight_volume") {
      filtered = filtered.filter(
        (product) =>
          (!product.is_variable && product.unit_type === "Peso") ||
          (product.is_variable &&
            product.variations.some(
              (variation) => variation.unit_type === "Peso"
            ))
      );
    } else if (unitTypeFilter === "package") {
      filtered = filtered.filter(
        (product) =>
          (!product.is_variable && product.unit_type === "Unidad") ||
          (product.is_variable &&
            product.variations.some(
              (variation) => variation.unit_type === "Unidad"
            ))
      );
    }

    if (sortOrder === "priceAsc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "priceDesc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

  if (!categoryName) {
    return <div>Categoría no encontrada</div>;
  }

  return (
    <div className={styles["container"]}>
      <div
        className={`${styles["container-top"]} ${
          isSticky ? styles["sticky-active"] : ""
        }`}
      >
        <div className={styles["title-search"]}>
          <div className={styles["title-nav-main"]}>
            <FiChevronLeft onClick={() => window.history.back()} />
            <h2>
              {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
            </h2>
          </div>

          <div className={styles["title-search-control"]}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isMobile && (
              <button
                className={styles["toggle-filters"]}
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              >
                {isFiltersVisible ? "Ocultar" : "Filtrar"}
                {isFiltersVisible ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            )}
          </div>
        </div>

        {/* Contenedor de filtros */}
        {isFiltersVisible && (
          <div className={styles["top-nav"]}>
            {/* <div className={styles["control"]}>
              <label>Ordenar</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="az">A-Z</option>
                <option value="priceAsc">Precio: Menor a Mayor</option>
                <option value="priceDesc">Precio: Mayor a Menor</option>
              </select>
            </div> */}
            <div className={styles["control"]}>
              <label>Vendido por</label>
              <select
                value={unitTypeFilter}
                onChange={(e) => setUnitTypeFilter(e.target.value)}
              >
                <option value="all">Ver todo</option>
                <option value="weight_volume">Peso o volumen</option>
                <option value="package">Por unidad o paquete</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className={styles["content-category"]}>
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoader key={index} type="card" />
          ))
        ) : filteredProducts.length > 0 ? (
          <GridProducts products={getFilteredProducts()} />
        ) : (
          <div className={styles["no-products"]}>
            No encontramos el producto que buscas en esta categoría. Explora{" "}
            <Link to="/tienda">toda la tienda aquí</Link>.
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;
