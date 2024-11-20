import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
    const storedToken = getCookie("authToken");
    const storedRefreshToken = getCookie("refreshToken");
    const storedUserData = localStorage.getItem("userData");
  
    if (storedToken && storedRefreshToken) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
  
      const tokenPayload = parseJwt(storedToken);
      const isTokenExpired = tokenPayload.exp * 1000 < Date.now();
  
      if (isTokenExpired) {
        refreshAccessToken();
      } else {
        setIsAuthenticated(true);
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        } else {
          getUserDetails(storedToken);
        }
  
        // Verifica la expiración periódicamente
        const interval = setInterval(() => {
          const tokenExpired = tokenPayload.exp * 1000 < Date.now();
          if (tokenExpired) {
            logout();
            clearInterval(interval); // Limpia el intervalo
          }
        }, 10000); // Verifica cada 10 segundos
      }
    }
  }, []);
  
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return null;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await fetch("https://loocal.co/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setToken(data.access);
        setCookie("authToken", data.access);
      } else {
        console.warn("Token refresh failed, logging out.");
        logout();
      }
    } catch (error) {
      console.error("Error refreshing access token:", error);
      logout();
    }
  };

  const handleResponse = async (response, retryCallback) => {
    if (response.status === 401) {
      await refreshAccessToken();
      return retryCallback(); // Reintenta la operación tras refrescar el token.
    }
    return response;
  };

  useEffect(() => {
  }, [userData]);

  const register = async (username, password) => {
    try {
      const response = await fetch("https://loocal.co/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        // Guardar tokens y establecer estado de autenticación
        setCookie("authToken", data.tokens.access);
        setCookie("refreshToken", data.tokens.refresh);
        setToken(data.tokens.access);
        setRefreshToken(data.tokens.refresh);
        setIsAuthenticated(true);
  
        // Obtener detalles del usuario después del registro
        await getUserDetails(data.tokens.access);
        return { success: true };
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.username?.[0] || "Error desconocido en el registro.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error en registro:", error.message);
      return { error: error.message };
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch("https://loocal.co/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setCookie("authToken", data.tokens.access);
        setCookie("refreshToken", data.tokens.refresh);
        setToken(data.tokens.access);
        setRefreshToken(data.tokens.refresh);
        setIsAuthenticated(true);
        await getUserDetails(data.tokens.access); // Obtiene detalles del usuario
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Credenciales inválidas."); // Maneja el error
      }
    } catch (error) {
      console.error("Error en login:", error);
      throw error; // Propaga el error al componente
    }
  };

  const getUserDetails = async (authToken) => {
    try {
      const response = await fetch("https://loocal.co/api/profile/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          
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

  const getProfilePictureUrl = () => {
    if (!userData?.userprofile?.profile_picture) {
      return "/default-placeholder.png"; // Ruta a la imagen por defecto
    }
    const baseUrl = userData.userprofile.profile_picture;
    const timestamp = new Date().getTime(); // Genera un timestamp único
    return `${baseUrl}?t=${timestamp}`; // Añade el timestamp como parámetro
  };
  

  const logout = async () => {
    try {
      const response = await fetch("https://loocal.co/api/logout/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (response.ok) {
        resetAuthState();
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  const resetAuthState = () => {
    deleteCookie("authToken");
    deleteCookie("refreshToken");
    setToken("");
    setRefreshToken("");
    setIsAuthenticated(false);
    setUserData(null); // Limpia el estado del usuario
    setAddresses([]);
  };

  // Nueva función para actualizar los datos del usuario

  const updateUser = async (updatedData) => {
    try {
      const isFormData = updatedData instanceof FormData;
      const headers = { Authorization: `Bearer ${token}` };
  
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }
  
      const response = await fetch("https://loocal.co/api/update_user/", {
        method: "PATCH",
        headers: headers,
        body: isFormData ? updatedData : JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        await getUserDetails(token);
        return true;
      } else {
        console.error("Update failed:", response.statusText);
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  };
  
  
  

  const getOrders = async () => {
    try {
      const response = await fetch("https://loocal.co/api/orders/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data; // En lugar de usar setOrders, devolvemos los datos directamente
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      throw error; // Devolvemos el error para manejarlo en el componente
    }
  };

  // Función para obtener las direcciones
  const getAddresses = async () => {
    try {
      const response = await fetch("https://loocal.co/api/get_addresses/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Ordenar para que la dirección principal esté siempre al inicio
        const sortedAddresses = data.sort((a, b) => (a.is_default ? -1 : 1));
        setAddresses(sortedAddresses);
      } else {
        throw new Error("Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const updateAddress = async (id, updatedAddress) => {
    try {
      const response = await fetch(
        `https://loocal.co/api/update_address/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify(updatedAddress),
        }
      );
      if (response.ok) {
        const data = await response.json();
        getAddresses(); // Refrescar la lista de direcciones
      } else {
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
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify({ ...addressData, is_default: isFirstAddress }),
      });

      if (response.ok) {
        const data = await response.json();
        getAddresses(); // Actualiza lista para reflejar cambios
        return data;
      } else {
        const errorData = await response.json();
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
      const response = await fetch(
        `https://loocal.co/api/delete_address/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        }
      );

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
      const response = await fetch(
        `https://loocal.co/api/update_address/${addressId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify({ is_default: true }), // Marcar como principal
        }
      );

      if (response.ok) {
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
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch("https://loocal.co/api/forgot_password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      } else {
        const data = await response.json();
        return {
          success: false,
          error: data.error || "Error al procesar la solicitud.",
        };
      }
    } catch (error) {
      return { success: false, error: "Error de red. Inténtalo más tarde." };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch("https://loocal.co/api/reset_password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      } else {
        const data = await response.json();
        return {
          success: false,
          error: data.error || "Error al restablecer la contraseña.",
        };
      }
    } catch (error) {
      return { success: false, error: "Error de red. Inténtalo más tarde." };
    }
  };

  const sendVerificationCode = async (phoneNumber) => {
    try {
      const response = await fetch("https://loocal.co/api/send_verification_code/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
  
      return await handleResponse(response, () => sendVerificationCode(phoneNumber));
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw error;
    }
  };
  
  const verifyCode = async (phoneNumber, code) => {
    try {
      const response = await fetch("https://loocal.co/api/verify_code/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, code }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        console.error("Error verifying code:", data.error);
        throw new Error(data.error || "Error verifying code");
      }
      return { success: true };
    } catch (error) {
      console.error("Error verifying code:", error.message);
      return { success: false, error: error.message };
    }
  };

  const sendEmailOtp = async (email) => {
    try {
      const response = await fetch("https://loocal.co/api/send_email_verification_code/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar el código.");
      }
  
      return { success: true, message: "Código enviado exitosamente." };
    } catch (error) {
      console.error("Error sending email OTP:", error.message);
      return { success: false, error: error.message };
    }
  };
  
  const verifyEmailOtp = async (email, otpCode) => {
    try {
      const response = await fetch("https://loocal.co/api/verify_email_otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al verificar el código.");
      }
  
      return { success: true, message: "Correo verificado exitosamente." };
    } catch (error) {
      console.error("Error verifying email OTP:", error.message);
      return { success: false, error: error.message };
    }
  };

  // Función para establecer una cookie
  const setCookie = (name, value, days = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; Secure; SameSite=Strict`;
  };
  
  const getCookie = (name) => {
    const cookieValue = document.cookie.match(
      "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
    );
    return cookieValue ? cookieValue.pop() : "";
  };

  // Función para eliminar una cookie
  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
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
        changePassword,
        forgotPassword, // Agregado
        resetPassword,
        sendVerificationCode,
        verifyCode,
        sendEmailOtp,
        verifyEmailOtp,
        getProfilePictureUrl
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
