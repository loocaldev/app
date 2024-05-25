import { useState } from "react";

const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return { searchQuery, handleSearch };
};

export default useSearch;
