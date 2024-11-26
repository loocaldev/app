import { useState, useEffect } from "react";
import axios from "axios";

const useTransportCost = (town) => {
  const [transportCost, setTransportCost] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!town) return;

    const fetchCost = async () => {
      setLoading(true);
      try {
        const encodedCity = encodeURIComponent(town);
        const response = await axios.get(`https://loocal.co/api/orders/transport-cost?city=${encodedCity}`);
        setTransportCost(response.data.cost || 0);
        console.log(response)
      } catch (error) {
        console.error("Error al calcular transporte:", error);
        setTransportCost(0);
      } finally {
        setLoading(false);
      }
    };
    console.log("Ciudad: ", town)
    fetchCost();
  }, [town]);

  return { transportCost, loading };
};

export default useTransportCost;
