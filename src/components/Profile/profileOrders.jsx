import React, { useEffect, useState } from "react";
import styles from "../../styles/ProfileOrders.module.css";
import { FaAngleDown, FaAngleUp, FaHeadset } from "react-icons/fa6";
import formatPriceToCOP from "../../utils/formatPrice";
import { useAuth } from "../../context/AuthContext";

function profileOrders() {
  const { getOrders } = useAuth(); // Asegúrate de tener un método en AuthContext para obtener las órdenes
  const [orders, setOrders] = useState([]); // Inicializa orders como un arreglo vacío
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders(); // Llama al método que obtiene las órdenes del backend
        setOrders(response || []); // Asegura que siempre sea un arreglo
      } catch (error) {
        console.error("Error al obtener las órdenes:", error);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrderContent = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (!orders.length) {
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
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
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
                {order.items.map((item) => (
                  <div key={item.product.id} className={styles["order-item"]}>
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
                ))}
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

export default profileOrders;
