import React, { useState, useEffect } from "react";
import styles from "../styles/SearchBar.module.css";

import { FiSearch } from "react-icons/fi";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const [placeholder, setPlaceholder] = useState("Buscar productos...");
  const words = ["Tomate...", "Zanahoría...", "Pepino...", "Lechuga...", "Manzana..."];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isInitial = true; // State to handle the initial placeholder
  let speed = 150;
  const initialDelay = 2000; // Initial delay before starting the typewriter effect
  const pauseDuration = 5000; // Pause duration after finishing each word

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = isInitial ? "Escribe el producto que quieres comprar..." : words[wordIndex];

      if (isDeleting) {
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          if (isInitial) {
            isInitial = false; // Switch to the main words list after deleting the initial placeholder
            wordIndex = 0;
          } else {
            wordIndex = (wordIndex + 1) % words.length;
          }
          speed = 1500; // Pause before starting the next word
        } else {
          speed = 100; // Speed for deleting characters
        }
      } else {
        charIndex++;
        if (charIndex === currentWord.length) {
          isDeleting = true;
          speed = pauseDuration; // Pause after finishing the word
        } else {
          speed = 150; // Speed for typing characters
        }
      }

      const updatedText = currentWord.substring(0, charIndex);
      setPlaceholder(updatedText);

      setTimeout(handleTyping, speed);
    };

    setTimeout(handleTyping, initialDelay);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className={styles.SearchBar}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
      />
      <button className={styles.searchButton} aria-label="Search">
        <FiSearch className={styles.searchIcon} />
      </button>
    </div>
  );
};

export default SearchBar;
