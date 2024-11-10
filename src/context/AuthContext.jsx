import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Obtener el token CSRF de la cookie
const getCSRFToken = () => {
  const cookieValue = document.cookie.match(
    "(^|;)\\s*csrftoken\\s*=\\s*([^;]+)"
  );
  return cookieValue ? cookieValue.pop() : "";
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const storedToken = getCookie("authToken");
    const storedUserData = localStorage.getItem("userData");

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      } else {
        getUserDetails(storedToken);
      }
    }
  }, []);

  const register = async (username, password) => {
    try {
      const response = await fetch("https://loocal.co/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setCookie("authToken", data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        getUserDetails(data.token);
      } else {
        throw new Error("ERROR");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const login = async (username, password) => {
    try {
      // Realizar la solicitud de inicio de sesión al backend
      const response = await fetch("https://loocal.co/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(), // Incluir el token CSRF en el encabezado
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Establecer el token en una cookie
        setCookie("authToken", data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        getUserDetails(data.token);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getUserDetails = async (authToken) => {
    try {
      const response = await fetch("https://loocal.co/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        localStorage.setItem("userData", JSON.stringify(data)); // Guardar datos en localStorage
      } else {
        throw new Error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const logout = async () => {
    try {
      // Realizar la solicitud de logout al backend
      const response = await fetch("https://loocal.co/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(), // Incluir el token CSRF en el encabezado
        },
      });

      if (response.ok) {
        // Eliminar la cookie de token y datos del usuario de localStorage
        deleteCookie("authToken");
        localStorage.removeItem("userData");
        setToken("");
        setIsAuthenticated(false);
        setUserData(null); // Limpiar los datos del usuario al cerrar sesión
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Nueva función para actualizar los datos del usuario

  const updateUser = async (updatedData) => {
    try {
      const isFormData = updatedData instanceof FormData; // Verifica si el objeto es FormData
      const headers = {
        Authorization: `Token ${token}`,
        "X-CSRFToken": getCSRFToken(),
      };

      // No incluir "Content-Type" cuando estás enviando FormData, ya que el navegador lo gestiona automáticamente
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch("https://loocal.co/api/update_user/", {
        method: "PATCH",
        headers: headers,
        body: isFormData ? updatedData : JSON.stringify(updatedData), // Si es FormData, lo enviamos directamente
      });

      if (response.ok) {
        console.log("Update successful.");

        // Realizar una nueva solicitud al backend para obtener los datos actualizados del usuario
        await getUserDetails(token);
      } else {
        console.log("Update failed:", response.statusText);
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const getOrders = async () => {
    try {
      const response = await fetch("https://loocal.co/api/orders/", {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Órdenes del usuario:", data);
        return data; // En lugar de usar setOrders, devolvemos los datos directamente
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error; // Devolvemos el error para manejarlo en el componente
    }
  };

  // Función para obtener las direcciones
  const getAddresses = async () => {
    try {
      const response = await fetch("https://loocal.co/api/get_addresses/", {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Ordenar para que la dirección principal esté siempre al inicio
        const sortedAddresses = data.sort((a, b) => (a.is_default ? -1 : 1));
        setAddresses(sortedAddresses);
        console.log("Direcciones recibidas desde API en AuthContext:", sortedAddresses);
      } else {
        throw new Error("Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const updateAddress = async (id, updatedAddress) => {
    try {
      const response = await fetch(`https://loocal.co/api/update_address/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify(updatedAddress),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Dirección actualizada con éxito:", data);
        getAddresses(); // Refrescar la lista de direcciones
      } else {
        console.log("Fallo al actualizar la dirección:", response.statusText);
      }
    } catch (error) {
      console.error("Error al actualizar dirección:", error);
    }
  };

  const addAddress = async (addressData) => {
    try {
      const isFirstAddress = addresses.length === 0;
      const response = await fetch("https://loocal.co/api/add_address/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ ...addressData, is_default: isFirstAddress }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Address added successfully:", data);
        getAddresses(); // Actualiza lista para reflejar cambios
        return data;
      } else {
        const errorData = await response.json();
        console.log("Failed to add address:", errorData);
        throw new Error("Failed to add address");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  };
  
  const deleteAddress = async (id) => {
    try {
      const addressToDelete = addresses.find((address) => address.id === id);
      const response = await fetch(`https://loocal.co/api/delete_address/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "X-CSRFToken": getCSRFToken(),
        },
      });
  
      if (response.ok) {
        // Filtrar la dirección eliminada y verificar si era la predeterminada
        let updatedAddresses = addresses.filter((address) => address.id !== id);
  
        // Si se eliminó la dirección predeterminada, configurar una nueva como predeterminada
        if (addressToDelete.is_default && updatedAddresses.length > 0) {
          const newPrimaryAddressId = updatedAddresses[0].id;
          await setPrimaryAddress(newPrimaryAddressId);
        }
  
        getAddresses(); // Volver a obtener las direcciones para reflejar la lista actualizada y ordenada
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const setPrimaryAddress = async (addressId) => {
    try {
      const response = await fetch(`https://loocal.co/api/update_address/${addressId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ is_default: true }), // Marcar como principal
      });
  
      if (response.ok) {
        console.log("Address marked as primary successfully.");
        getAddresses(); // Actualiza las direcciones para reflejar el cambio
      } else {
        throw new Error("Failed to set primary address");
      }
    } catch (error) {
      console.error("Error setting primary address:", error);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch("https://loocal.co/api/change_password/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
  
      if (response.ok) {
        console.log("Password changed successfully");
        return true;
      } else {
        console.log("Failed to change password");
        return false;
      }
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  };

  // Función para establecer una cookie
  const setCookie = (name, value) => {
    document.cookie = `${name}=${value}; path=/`;
  };

  // Función para eliminar una cookie
  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  };

  // Función para obtener el valor de una cookie
  const getCookie = (name) => {
    const cookieValue = document.cookie.match(
      "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
    );
    return cookieValue ? cookieValue.pop() : "";
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        userData,
        addresses, // <-- Asegurarse de que esté aquí
        login,
        logout,
        register,
        updateUser,
        getOrders,
        getAddresses, // <-- Incluir este método
        addAddress,
        deleteAddress,
        setPrimaryAddress,
        updateAddress,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
