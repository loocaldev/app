import React, { useState, useRef, useEffect } from "react";
import SliderProducts from "../components/SliderProducts";
import SearchBar from "../components/SearchBar";
import FilterSelector from "../components/FilterSelector";
import SortSelector from "../components/SortSelector";
import { Link } from "react-router-dom";
import styles from "../styles/Store.module.css";
import graphLoocal from "../assets/graphLoccal2024.png";
import { getAllCategories, getAllProducts } from "../api/products.api";

function Store() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [isScrollable, setIsScrollable] = useState({});

  const scrollRefs = useRef([]);
  const productRef = useRef(null);

  // Cargar productos y categorías desde la API
  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);
        console.log("Productos traídos desde la API:", productsRes.data); // Verificar los productos
        console.log("Categorías traídas desde la API:", categoriesRes.data); // Verificar las categorías

        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error al cargar productos o categorías:", error);
      }
    }
    loadData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (filter) => {
    setFilter(filter);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  // Verificar si hay scroll en el contenedor
  const checkScrollable = (index) => {
    const scrollRef = scrollRefs.current[index];
    if (scrollRef) {
      // Verificar si el contenido es más ancho que el contenedor
      const isScrollable = scrollRef.scrollWidth > scrollRef.clientWidth;
      setIsScrollable((prev) => ({ ...prev, [index]: isScrollable }));
    }
  };

  useEffect(() => {
    // Verificar el scroll para cada categoría después de que los productos se hayan cargado
    categories.forEach((_, index) => {
      checkScrollable(index);
    });
  }, [categories, products]);

  const scrollProducts = (index, direction) => {
    const scrollRef = scrollRefs.current[index];
    if (scrollRef) {
      const scrollAmount = 300; // Puedes ajustar este valor
      scrollRef.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Filtrar productos por categoría
  const getProductsByCategory = (categoryId) => {
    return products.filter(
      (product) =>
        product.categories &&
        product.categories.some((category) => category.id === categoryId)
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles["sidebar-title"]}>
          <h2>Tienda</h2>
          {/* <img src={graphLoocal} /> */}
        </div>
        <div className={styles["sidebar-nav"]}>
          <nav>
            <ul>
              <li>
                <a href="/tienda/promociones">Promociones</a>
              </li>
              <li>
                <a href="/tienda/frutas">Frutas</a>
              </li>
              <li>
                <a href="/tienda/verduras">Verduras</a>
              </li>
              <li>
                <a href="/tienda/granos-hortalizas">Granos y Hortalizas</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className={styles.content}>
        {/* <SearchBar onSearch={handleSearch} />
        <FilterSelector onFilter={handleFilter} />
        <SortSelector onSort={handleSort} /> */}
        <div className={styles["content-nav"]}>
          <div className={styles["content-nav-item"]}>
            <p>Promociones</p>
          </div>
          <div className={styles["content-nav-item"]}>
            <p>Frutas</p>
          </div>
          <div className={styles["content-nav-item"]}>
            <p>Verduras</p>
          </div>
          <div className={styles["content-nav-item"]}>
            <p>Granos y hortalizas</p>
          </div>
        </div>

        {/* Aquí va todo el Grid de productos distribudos en diferentes secciones por alguna agregación, por ejemplo categoría*/}
        <div className={styles["content-section"]}>
          {/* Renderizar dinámicamente una sección por cada categoría */}
          {categories.map((category, index) => {
            const categoryProducts = getProductsByCategory(category.id); // Filtramos productos por categoría
            console.log(
              `Productos en la categoría ${category.name}:`,
              categoryProducts
            ); // Verificar productos filtrados

            return (
              categoryProducts.length > 0 && ( // Renderiza la categoría solo si tiene productos
                <div key={category.id} className={styles["content-section"]}>
                  <div className={styles["content-section-header"]}>
                    <div className={styles["content-section-title"]}>
                      <h3>{category.name}</h3>
                    </div>
                    <div className={styles["content-section-arrows"]}>
                      {isScrollable[index] && (
                        <>
                          <Link to={`/tienda/${category.name.toLowerCase()}`}>
                            <span>Ver más</span>
                          </Link>
                          <svg
                            onClick={() => scrollProducts(index, "left")}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M15.5303 3.96967C15.8232 4.26256 15.8232 4.73744 15.5303 5.03033L8.56066 12L15.5303 18.9697C15.8232 19.2626 15.8232 19.7374 15.5303 20.0303C15.2374 20.3232 14.7626 20.3232 14.4697 20.0303L6.96967 12.5303C6.67678 12.2374 6.67678 11.7626 6.96967 11.4697L14.4697 3.96967C14.7626 3.67678 15.2374 3.67678 15.5303 3.96967Z"
                              fill="black"
                            />
                          </svg>
                          <svg
                            onClick={() => scrollProducts(index, "right")}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.46967 3.96967C8.76256 3.67678 9.23744 3.67678 9.53033 3.96967L17.0303 11.4697C17.3232 11.7626 17.3232 12.2374 17.0303 12.5303L9.53033 20.0303C9.23744 20.3232 8.76256 20.3232 8.46967 20.0303C8.17678 19.7374 8.17678 19.2626 8.46967 18.9697L15.4393 12L8.46967 5.03033C8.17678 4.73744 8.17678 4.26256 8.46967 3.96967Z"
                              fill="black"
                            />
                          </svg>
                        </>
                      )}
                    </div>
                  </div>
                  <SliderProducts
                    products={categoryProducts} // Pasamos los productos filtrados por categoría
                    searchQuery={searchQuery}
                    sortOrder={sortOrder}
                    scrollRef={(el) => (scrollRefs.current[index] = el)} // Asignar referencia
                  />
                </div>
              )
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Store;
