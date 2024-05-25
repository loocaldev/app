import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import styles from "../styles/Faqs.module.css";

const faqs = [
  {
    title: "¿Cómo recibo mi pedido?",
    content: "Recibes tu pedido en casa en menos de 24 horas.",
  },
  {
    title: "¿Cómo aseguro la calidad de los productos?",
    content:
      "Seleccionamos los mejores productos para tu hogar. Si no estas de acuerdo, te devolvemos el dinero.",
  },
  {
    title: "¿Puedo hablar con un asistente humano?",
    content: (
      <>
        Sí. Escribe al WhatsApp{" "}
        <a
          href="https://wa.me/573197363596"
          target="_blank"
          rel="noopener noreferrer"
        >
          +57 319 7363596
        </a>
      </>
    ),
  },
];

function Faqs() {
  const [extendedIndexes, setExtendedIndexes] = useState([]);

  const toggleExtendContent = (index) => {
    if (extendedIndexes.includes(index)) {
      setExtendedIndexes(extendedIndexes.filter((i) => i !== index));
    } else {
      setExtendedIndexes([...extendedIndexes, index]);
    }
  };
  return (
    <>
      <div className={styles.faqsContainer}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles["faqs-card"]} onClick={() => toggleExtendContent(index)}>
            <div className={styles["faq-title"]}>
              <h4>{faq.title}</h4>
              {extendedIndexes.includes(index) ? (
                <FiChevronUp />
              ) : (
                <FiChevronDown />
              )}
            </div>
            {extendedIndexes.includes(index) && (
              <div className={styles["faq-content"]}>
                <p>{faq.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Faqs;
