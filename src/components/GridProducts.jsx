import React, { useState, useEffect } from "react";
import { getAllProducts } from "../api/products.api";
import ProductCardSQ from "./ProductCardSQ";
import styles from "../styles/GridProducts.module.css";
import { useCart } from "../hooks/useCart";
import character_loocal from "../assets/character_loocal.svg";

function GridProducts({ searchQuery, filter, sortOrder }) {
  const [products, setProducts] = useState([]);
  const [visibleRows, setVisibleRows] = useState(2); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); 

  const { cart } = useCart();

  useEffect(() => {
    async function loadProducts() {
      const res = await getAllProducts();
      setProducts(res.data);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes((searchQuery || "").toLowerCase())
    )
    .filter((product) => {
      if (filter === "convencional") return product.type === "convencional";
      if (filter === "organico") return product.type === "organico";
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "az") return a.name.localeCompare(b.name);
      if (sortOrder === "priceAsc") return a.price - b.price;
      if (sortOrder === "priceDesc") return b.price - a.price;
      return 0;
    });

  const numProductsPerRow = 6;
  const visibleProducts = isMobile
    ? filteredProducts 
    : filteredProducts.slice(0, visibleRows * numProductsPerRow); 

  return (
    <div className={styles.productsContainer}>
      <div className={styles.bannerProducts}>
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <ProductCardSQ key={product.id} product={product} />
          ))
        ) : (
          <div className={styles["product-not-found"]}>
            <span>Patroncit@<br />Aún no tenemos este producto</span>
            <img src={character_loocal} />
          </div>
        )}
      </div>

      {!isMobile && visibleRows * numProductsPerRow < filteredProducts.length && (
        <button
          className={styles.showMoreButton}
          onClick={() => setVisibleRows((prev) => prev + 2)} 
        >
          Ver más
        </button>
      )}
    </div>
  );
}

export default GridProducts;
