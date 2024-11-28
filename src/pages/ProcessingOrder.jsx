import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function ProcessingOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId");
  const hash = searchParams.get("hash");
  const amount = searchParams.get("amount");

  useEffect(() => {
    const openWompiCheckout = () => {
      const checkout = new WidgetCheckout({
        currency: "COP",
        amountInCents: amount,
        reference: orderId,
        publicKey: "pub_test_gyZVH3hcyjvHHH8xA8AAvzue2QRBj49O",
        signature: { integrity: hash },
        redirectUrl: `${window.location.origin}/order-status`,
        customerData: {
          email: "test@example.com", // Actualizar con datos reales
          fullName: "Test User",
          phoneNumber: "+573000000000",
        },
      });

      checkout.open((result) => {
        const transaction = result.transaction;
        if (transaction && transaction.status === "APPROVED") {
          navigate(`/order-status?orderId=${orderId}`);
        } else {
          toast.error("Transacción no aprobada o cerrada.");
          navigate(`/checkout?retry=true`);
        }
      });

      checkout.onClose(() => {
        toast.error("El widget se cerró sin completar el pago.");
        navigate(`/checkout?retry=true`);
      });
    };

    openWompiCheckout();
  }, [orderId, hash, amount, navigate]);

  return <div>Procesando tu orden...</div>;
}

export default ProcessingOrder;
