import { useState, useEffect } from "react";
import Fuse from "fuse.js";

// Normaliza texto eliminando tildes y caracteres especiales
const normalizeText = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const useAdvancedSearch = (data, searchQuery, options = {}) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(data);
      return;
    }

    const fuse = new Fuse(data, {
      keys: ["name"],
      threshold: 0.3,
      distance: 100,
      includeMatches: true,
      ignoreLocation: true,
      ...options,
    });

    const fuseResults = fuse.search(normalizeText(searchQuery));
    const highlightedResults = fuseResults.map(({ item, matches }) => {
      let highlightedName = item.name;

      if (matches) {
        matches.forEach((match) => {
          if (match.key === "name") {
            const originalName = item.name;
            const normalizedOriginal = normalizeText(originalName);

            const highlightedParts = [];
            let lastIndex = 0;

            match.indices.forEach(([start, end]) => {
              const originalStart = normalizedOriginal.slice(0, start).length;
              const originalEnd = normalizedOriginal.slice(0, end + 1).length;

              highlightedParts.push(originalName.slice(lastIndex, originalStart));
              highlightedParts.push(
                `<mark>${originalName.slice(originalStart, originalEnd)}</mark>`
              );
              lastIndex = originalEnd;
            });

            highlightedParts.push(originalName.slice(lastIndex));
            highlightedName = highlightedParts.join("");
          }
        });
      }

      return {
        ...item,
        highlightedName,
      };
    });

    setResults(highlightedResults);
  }, [data, searchQuery, options]);

  return results;
};
