import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/profileAddress.module.css";
import { CiTrash, CiBookmarkCheck, CiEdit } from "react-icons/ci";

function profileAddress() {
  const { addresses, getAddresses, addAddress, deleteAddress, setPrimaryAddress, updateAddress } = useAuth();
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    is_default: false,
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editAddress, setEditAddress] = useState(null); // Nuevo estado para la dirección en edición

  useEffect(() => {
    getAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditAddress({
      ...editAddress,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const addedAddress = await addAddress(newAddress);
    if (addedAddress) {
      setNewAddress({
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        is_default: false,
      });
      setIsPopupOpen(false);
      getAddresses();
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (editAddress) {
      await updateAddress(editAddress.id, editAddress);
      setEditAddress(null);
      getAddresses();
    }
  };

  const startEditAddress = (address) => setEditAddress(address);
  const cancelEdit = () => setEditAddress(null);

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
            style={{ backgroundColor: address.is_default ? "#EDE8EF" : "#FFFFFF" }}
          >
            <div className={styles["address-item-content"]}>
              <span>{address.street} </span>
              <span>{address.city}, {address.state} </span>
              <span>{address.postal_code} </span>
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
              <a href="#" onClick={(e) => { e.preventDefault(); startEditAddress(address); }} className={styles["address-edit"]}>
                <CiEdit />
                <span>Editar</span>
              </a>
              {confirmDeleteId === address.id ? (
                <div className={styles["confirm-delete"]}>
                  <span>¿Estás seguro?</span>
                  <button onClick={() => handleDelete(address.id)} className={styles["delete-confirm"]}>Sí</button>
                  <button onClick={cancelDelete} className={styles["delete-cancel"]}>No</button>
                </div>
              ) : (
                <a href="#" onClick={(e) => { e.preventDefault(); confirmDelete(address.id); }} className={styles["address-delete"]}>
                  <CiTrash />
                  <span>Eliminar</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formulario para agregar una nueva dirección */}
      <div className={styles["add-address"]}>
        <button onClick={() => setIsPopupOpen(true)}>Añadir dirección</button>
      </div>

      {isPopupOpen && (
        <div className={styles["popup-overlay"]} onClick={() => setIsPopupOpen(false)}>
          <div
            className={`${styles["popup-content"]} ${styles["popup-mobile"]}`}
            onClick={(e) => e.stopPropagation()} // Evitar cerrar el popup al hacer clic dentro de él
          >
            <h3>Agregar Nueva Dirección</h3>
            <form onSubmit={handleAddAddress} className={styles["address-form"]}>
              <input type="text" name="street" placeholder="Calle" value={newAddress.street} onChange={handleInputChange} required />
              <input type="text" name="city" placeholder="Ciudad" value={newAddress.city} onChange={handleInputChange} required />
              <input type="text" name="state" placeholder="Estado" value={newAddress.state} onChange={handleInputChange} required />
              <input type="text" name="postal_code" placeholder="Código Postal" value={newAddress.postal_code} onChange={handleInputChange} required />
              <input type="text" name="country" placeholder="País" value={newAddress.country} onChange={handleInputChange} required />
              <label>
                <input type="checkbox" name="is_default" checked={newAddress.is_default} onChange={handleInputChange} />
                Establecer como dirección predeterminada
              </label>
              <button type="submit" className={styles["add-button"]}>Agregar Dirección</button>
            </form>
          </div>
        </div>
      )}

      {/* Formulario de edición de dirección */}
      {editAddress && (
        <div className={styles["popup-overlay"]} onClick={cancelEdit}>
          <div
            className={`${styles["popup-content"]} ${styles["popup-mobile"]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Editar Dirección</h3>
            <form onSubmit={handleUpdateAddress} className={styles["address-form"]}>
              <input type="text" name="street" placeholder="Calle" value={editAddress.street} onChange={handleEditInputChange} required />
              <input type="text" name="city" placeholder="Ciudad" value={editAddress.city} onChange={handleEditInputChange} required />
              <input type="text" name="state" placeholder="Estado" value={editAddress.state} onChange={handleEditInputChange} required />
              <input type="text" name="postal_code" placeholder="Código Postal" value={editAddress.postal_code} onChange={handleEditInputChange} required />
              <input type="text" name="country" placeholder="País" value={editAddress.country} onChange={handleEditInputChange} required />
              <button type="submit" className={styles["update-button"]}>Guardar Cambios</button>
              <button type="button" onClick={cancelEdit} className={styles["cancel-button"]}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default profileAddress;
