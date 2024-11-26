import React, { useEffect, useState } from "react";
import styles from "../../styles/ProfileOrders.module.css";
import { FaAngleDown, FaAngleUp, FaHeadset } from "react-icons/fa6";
import formatPriceToCOP from "../../utils/formatPrice";
import { useAuth } from "../../context/AuthContext";

function ProfileOrders() {
  const { getOrders } = useAuth(); // Asegúrate de tener un método en AuthContext para obtener las órdenes
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getOrders();
        console.log("Datos recibidos del backend:", response);
        if (Array.isArray(response)) {
          const validatedOrders = response.filter((order) =>
            validateOrderStructure(order)
          );
          setOrders(validatedOrders);
        } else {
          throw new Error("El servidor devolvió datos no válidos");
        }
      } catch (err) {
        console.error("Error al obtener las órdenes:", err);
        setError("No pudimos obtener tus órdenes. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await getOrders();
      console.log("Datos recibidos del backend:", response);
      if (Array.isArray(response)) {
        const validatedOrders = response
          .filter((order) => validateOrderStructure(order))
          .map((order) => ({
            ...order,
            subtotal: parseFloat(order.subtotal), // Convierte subtotal a número
            total: parseFloat(order.total), // Convierte total a número
            items: order.items.map((item) => ({
              ...item,
              subtotal: parseFloat(item.subtotal), // Convierte subtotales en los ítems
              quantity: parseInt(item.quantity, 10), // Asegura que quantity sea un entero
            })),
          }));
        setOrders(validatedOrders);
      } else {
        throw new Error("El servidor devolvió datos no válidos");
      }
    } catch (err) {
      console.error("Error al obtener las órdenes:", err);
      setError("No pudimos obtener tus órdenes. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };
  

  const validateOrderStructure = (order) => {
    return (
      order &&
      typeof order.custom_order_id === "string" &&
      Array.isArray(order.items) &&
      !isNaN(parseFloat(order.subtotal)) // Permite subtotales como cadenas numéricas
    );
  };

  const validateOrderItem = (item) => {
    return (
      item &&
      typeof item.quantity === "number" &&
      !isNaN(parseFloat(item.subtotal)) && // Permite subtotales como cadenas numéricas
      item.product_name &&
      typeof item.product_name === "string"
    );
  };
  

  const toggleOrderContent = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading) {
    return <div>Cargando tus órdenes...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return <div>Aún no tienes órdenes</div>;
  }

  return (
    <>
      <h2>Mis pedidos</h2>
      <div className={styles["order-list"]}>
        {orders.map((order) => (
          <div key={order.custom_order_id} className={styles["order-box"]}>
            <div className={styles["order-top"]}>
              <div className={styles["order-resume"]}>
                <span>
                  <b>{order.custom_order_id}</b> &nbsp;
                </span>
                <span>{order.items.length} productos &nbsp;</span>
                <span>{formatPriceToCOP(order.subtotal)} </span>
              </div>
              <div
                className={styles["order-action"]}
                onClick={() => toggleOrderContent(order.custom_order_id)}
              >
                <span>
                  {new Date(order.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {expandedOrders[order.custom_order_id] ? (
                  <FaAngleUp />
                ) : (
                  <FaAngleDown />
                )}
              </div>
            </div>
            <div
              className={`${styles["order-content"]} ${
                expandedOrders[order.custom_order_id] ? styles["expanded"] : ""
              }`}
            >
              <div className={styles["order-item-list"]}>
                {order.items.map((item, index) =>
                  validateOrderItem(item) ? (
                    <div key={index} className={styles["order-item"]}>
                      <div className={styles["order-item-product"]}>
                        <span>
                          {item.product_name}
                          {item.product_variation
                            ? ` - ${item.product_variation.attribute_options[0].name}`
                            : ""}
                        </span>
                      </div>
                      <div className={styles["order-item-cantprice"]}>
                        <span>x{item.quantity} &nbsp;</span>
                        <span>{formatPriceToCOP(item.subtotal)}</span>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className={styles["order-item-error"]}>
                      <span>Producto inválido</span>
                    </div>
                  )
                )}
              </div>
              <div className={styles["order-support"]}>
                <FaHeadset />
                <span>Necesito ayuda</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ProfileOrders;
