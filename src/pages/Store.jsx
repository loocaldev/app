import React, { useState } from "react";
import GridProducts from "../components/GridProducts";
import SearchBar from "../components/SearchBar";
import FilterSelector from "../components/FilterSelector";
import SortSelector from "../components/SortSelector";
import styles from "../styles/Store.module.css";

function Store() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("az");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (filter) => {
    setFilter(filter);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  return (
    <div className={styles.containerStore}>
      <SearchBar onSearch={handleSearch} />
      <FilterSelector onFilter={handleFilter} />
      <SortSelector onSort={handleSort} />
      <GridProducts
        searchQuery={searchQuery}
        filter={filter}
        sortOrder={sortOrder}
      />
    </div>
  );
}

export default Store;
