import React, { useState, useEffect } from "react";
import { getAllProducts } from "../api/products.api";
import ProductCard from "./ProductCard";
import styles from "../styles/ListProducts.module.css";
import { useCart } from "../hooks/useCart";
import character_loocal from "../assets/character_loocal.svg"
import ProductCardSQRead from "./ProductCardSQRead";
import ProductCardSQ from "./ProductCardSQ";
import ProductCardHZ from "./ProductCardHZ"

function ListProducts({ searchQuery }) {
  const [products, setProducts] = useState([]);
  const [numOfProducts, setNumOfProducts] = useState(5);

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
      if (window.innerWidth < 768) {
        setNumOfProducts(4);
      } else {
        setNumOfProducts(3);
      }
    }
    handleResize(); // Check initial width
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.bannerProducts}>
      {filteredProducts.length > 0 ? (
        filteredProducts
          .slice(0, numOfProducts)
          .map((product) => <ProductCardHZ key={product.id} product={product} />)
      ) : (
        <div className={styles["product-not-found"]}>
          <span>Patroncit@<br/>Aún no tenemos este producto</span>
          <img src={character_loocal}/>
        </div>
      )}
    </div>
  );
}

export default ListProducts;
