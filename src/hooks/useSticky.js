// Agrega este script en el componente o en el archivo JavaScript principal
import { useEffect, useState } from 'react';

function useSticky() {
  const [isSticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const topElement = document.querySelector('.container-top');
      setSticky(window.scrollY > topElement.offsetTop);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isSticky;
}

export default useSticky;
