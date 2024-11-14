import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import GridProducts from "../components/GridProducts";
import { getAllProducts } from "../api/products.api";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import useScreenSize from "../hooks/useScreenSize";
import styles from "../styles/Category.module.css";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ProductCardHZ from '../components/ProductCardHZ.jsx'

function Category() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [unitTypeFilter, setUnitTypeFilter] = useState("all");
  const [isTopNavOpen, setIsTopNavOpen] = useState(true);
  const isMobile = useScreenSize(); // Detectar si es móvil

  useEffect(() => {
    if (categoryName) {
      async function loadProducts() {
        try {
          const res = await getAllProducts();
          const filteredProducts = res.data.filter((product) =>
            product.categories.some(
              (category) =>
                category.name.toLowerCase() === categoryName.toLowerCase()
            )
          );
          setProducts(filteredProducts);
        } catch (error) {
          console.error("Error al cargar productos:", error);
        }
      }
      loadProducts();
    }
  }, [categoryName]);

  const handleSearch = (query) => setSearchQuery(query);
  const handleSortChange = (order) => setSortOrder(order);
  const handleUnitTypeFilterChange = (e) => setUnitTypeFilter(e.target.value);

  const getFilteredProducts = () => {
    let filtered = products;

    // Filtrar por unit_type
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

    // Ordenar por precio
    if (sortOrder === "priceAsc") {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "priceDesc") {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  if (!categoryName) {
    return <div>Categoría no encontrada</div>;
  }

  return (
    <div className={styles["container"]}>
      <div className={styles["container-top"]}>
        <div className={styles["title-search"]}>
          <h2>
            {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
          </h2>
          <div className={styles["title-search-control"]}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isMobile && (
              <button
                className={styles["toggle-nav-btn"]}
                onClick={() => setIsTopNavOpen(!isTopNavOpen)}
              >
                {isTopNavOpen ? "Cerrar" : "Filtrar"}
                {isTopNavOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}{" "}
                
              </button>
            )}
          </div>
        </div>

        {/* Botón para mostrar/ocultar el top-nav en mobile */}
        {/* Controles de búsqueda, orden y filtro */}
        {(isTopNavOpen || !isMobile) && (
          <div className={styles["top-nav"]}>
            <div className={styles["control"]}>
              <label>Ordenar</label>
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="az">A-Z</option>
                <option value="priceAsc">Precio: Menor a Mayor</option>
                <option value="priceDesc">Precio: Mayor a Menor</option>
              </select>
            </div>
            <div className={styles["control"]}>
              <label>Vendido por</label>
              <select
                value={unitTypeFilter}
                onChange={handleUnitTypeFilterChange}
              >
                <option value="all">Ver todo</option>
                <option value="weight_volume">Peso o volumen</option>
                <option value="package">Por unidad o paquete</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Mostrar productos filtrados */}
      <GridProducts
        products={getFilteredProducts()}
        searchQuery={searchQuery}
        sortOrder={sortOrder}
      />
    </div>
  );
}

export default Category;
