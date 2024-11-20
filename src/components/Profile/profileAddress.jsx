import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/profileAddress.module.css";
import { CiTrash, CiBookmarkCheck, CiEdit } from "react-icons/ci";
import AddressForm from "../Forms/AddressForm"; // Importa AddressForm

function ProfileAddress() {
  const {
    addresses,
    getAddresses,
    addAddress,
    deleteAddress,
    setPrimaryAddress,
    updateAddress,
  } = useAuth();

  const [formData, setFormData] = useState({
    departament: "",
    town: "",
    address: "",
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null); // ID de la dirección en edición
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    getAddresses();
  }, []);

  const handleDepartamentoChange = (e) => {
    setFormData({ ...formData, departament: e.target.value, town: "" });
  };

  const handleMunicipioChange = (e) => {
    setFormData({ ...formData, town: e.target.value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const newAddress = {
      street: formData.address,
      city: formData.town,
      state: formData.departament,
      postal_code: "000000", // Puedes añadir campos adicionales si es necesario
      country: "Colombia", // Valor predeterminado
      is_default: false,
    };

    const addedAddress = await addAddress(newAddress);
    if (addedAddress) {
      setFormData({ departament: "", town: "", address: "" }); // Limpia el formulario
      setIsPopupOpen(false);
      getAddresses(); // Refresca la lista de direcciones
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (editAddressId) {
      const updatedAddress = {
        street: formData.address,
        city: formData.town,
        state: formData.departament,
        postal_code: "", // Puedes añadir campos adicionales si es necesario
        country: "Colombia",
      };

      await updateAddress(editAddressId, updatedAddress);
      setEditAddressId(null);
      setFormData({ departament: "", town: "", address: "" }); // Limpia el formulario
      getAddresses();
    }
  };

  const startEditAddress = (address) => {
    setEditAddressId(address.id);
    setFormData({
      departament: address.state,
      town: address.city,
      address: address.street,
    });
  };

  const cancelEdit = () => {
    setEditAddressId(null);
    setFormData({ departament: "", town: "", address: "" }); // Limpia el formulario
  };

  const confirmDelete = (addressId) => setConfirmDeleteId(addressId);
  const cancelDelete = () => setConfirmDeleteId(null);
  const handleDelete = (addressId) => {
    deleteAddress(addressId);
    cancelDelete();
  };

  return (
    <div className={styles["profile-address"]}>
      <h2>Mis direcciones</h2>
      <div className={styles["address-lists"]}>
        {(addresses || []).map((address) => (
          <div
            key={address.id}
            className={styles["address-item"]}
            style={{
              backgroundColor: address.is_default ? "#EDE8EF" : "#FFFFFF",
            }}
          >
            <div className={styles["address-item-content"]}>
              <span>{address.street} </span>
              <span>
                {address.city}, {address.state}{" "}
              </span>
              <span>{address.country} </span>
            </div>
            <div className={styles["address-item-action"]}>
              {address.is_default ? (
                <span>Principal</span>
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPrimaryAddress(address.id);
                  }}
                  className={styles["address-main"]}
                >
                  <span>Marcar como principal</span>
                </a>
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  startEditAddress(address);
                }}
                className={styles["address-edit"]}
              >
                <CiEdit />
                <span>Editar</span>
              </a>
              {confirmDeleteId === address.id ? (
                <div className={styles["confirm-delete"]}>
                  <span>¿Estás seguro?</span>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className={styles["delete-confirm"]}
                  >
                    Sí
                  </button>
                  <button
                    onClick={cancelDelete}
                    className={styles["delete-cancel"]}
                  >
                    No
                  </button>
                </div>
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    confirmDelete(address.id);
                  }}
                  className={styles["address-delete"]}
                >
                  <CiTrash />
                  <span>Eliminar</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botón para añadir nueva dirección */}
      <div className={styles["add-address"]}>
        <button
          onClick={() => {
            setIsPopupOpen(true);
            setFormData({ departament: "", town: "", address: "" }); // Limpia el formulario
          }}
        >
          Añadir dirección
        </button>
      </div>

      {/* Popup para añadir nueva dirección */}
      {isPopupOpen && (
        <div
          className={styles["popup-overlay"]}
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className={`${styles["popup-content"]} ${styles["popup-mobile"]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Agregar Nueva Dirección</h3>
            <AddressForm
              formData={formData}
              onDepartamentoChange={handleDepartamentoChange}
              onMunicipioChange={handleMunicipioChange}
              onAddressChange={handleAddressChange}
            />
            <button
              onClick={handleAddAddress}
              className={styles["add-button"]}
            >
              Agregar Dirección
            </button>
          </div>
        </div>
      )}

      {/* Popup para editar dirección */}
      {editAddressId && (
        <div className={styles["popup-overlay"]} onClick={cancelEdit}>
          <div
            className={`${styles["popup-content"]} ${styles["popup-mobile"]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Editar Dirección</h3>
            <AddressForm
              formData={formData}
              onDepartamentoChange={handleDepartamentoChange}
              onMunicipioChange={handleMunicipioChange}
              onAddressChange={handleAddressChange}
            />
            <button
              onClick={handleUpdateAddress}
              className={styles["update-button"]}
            >
              Guardar Cambios
            </button>
            <button
              onClick={cancelEdit}
              className={styles["cancel-button"]}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileAddress;
