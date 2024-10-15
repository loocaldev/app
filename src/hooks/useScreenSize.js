import { useState, useEffect } from 'react';

// Hook personalizado para detectar el tamaño de la ventana
const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Define 768px como el límite entre mobile y desktop

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Añadir el evento listener para el redimensionamiento de la ventana
    window.addEventListener('resize', handleResize);

    // Limpiar el evento al desmontar el componente
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export default useScreenSize;
