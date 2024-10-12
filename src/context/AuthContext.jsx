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

  useEffect(() => {
    // Verificar si hay un token almacenado en las cookies al cargar el componente
    const storedToken = getCookie("authToken");
    const storedUserData = localStorage.getItem("userData");

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true); // Si hay un token, el usuario está autenticado
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
      console.log("Sending update request with data:", updatedData);
      const response = await fetch("https://loocal.co/api/update_user", {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Update successful:", data);
        setUserData(data);
        localStorage.setItem("userData", JSON.stringify(data));
      } else {
        console.log("Update failed:", response.statusText);
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating user:", error);
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

  const fetchProtectedData = async () => {
    try {
      // Usar el token almacenado en el contexto
      const response = await fetch("https://loocal.co/api/protected", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Aquí se envía el token JWT
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos protegidos");
      }

      const data = await response.json();
      return data; // Retorna los datos para que puedan ser utilizados en el componente que lo llama
    } catch (error) {
      console.error("Error fetching protected data:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        userData,
        login,
        logout,
        register,
        updateUser,
        fetchProtectedData, // Exponer la función de fetch para que otros componentes la utilicen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
