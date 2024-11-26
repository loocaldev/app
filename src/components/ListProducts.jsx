import React, { useState, useEffect } from "react";
import { getAllProducts } from "../api/products.api";
import ProductCardHZ from "./ProductCardHZ";
import CharecterLoocal from "../assets/character_loocal.svg"
import styles from "../styles/ListProducts.module.css";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";
import SkeletonLoader from "./SkeletonLoader";

function ListProducts({ searchQuery }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [numOfProducts, setNumOfProducts] = useState(5);

  const filteredProducts = useAdvancedSearch(products, searchQuery);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(res.data);
      setLoading(false); // Finalizar carga
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setNumOfProducts(4);
      } else {
        setNumOfProducts(3);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={styles.bannerProducts}>
      {loading ? (
        // Mostrar loaders mientras se cargan los productos
        Array.from({ length: numOfProducts }).map((_, index) => (
          <SkeletonLoader key={index} type="card" />
        ))
      ) : filteredProducts.length > 0 ? (
        filteredProducts.slice(0, numOfProducts).map((product) => (
          <ProductCardHZ
            key={product.id}
            product={product}
            highlightedName={product.highlightedName || product.name}
          />
        ))
      ) : (
        <div className={styles["product-not-found"]}>
          <img src={CharecterLoocal}/>
          <span>
            Patroncit@
            <br />
            Aún no tenemos este producto
          </span>
        </div>
      )}
    </div>
  );
}

export default ListProducts;
