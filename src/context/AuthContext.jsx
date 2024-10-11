import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const { isAuthenticated, user, loginWithRedirect, logout, getAccessTokenSilently, isLoading } = useAuth0();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserData(user);  // Guardamos los datos del usuario proporcionados por Auth0
    }
  }, [isAuthenticated, user]);

  const getUserDetails = async () => {
    try {
      const token = await getAccessTokenSilently();  // Obtener token JWT
      console.log(token)
      
      const response = await fetch("https://loocal.co/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,  // Bearer token
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setUserData(data);  // Almacena los detalles del usuario en el estado
      } else {
        throw new Error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleLogin = async () => {
    await loginWithRedirect();  // Redirige al login de Auth0
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });  // Redirige al logout de Auth0
  };

  // En este punto, eliminamos las funciones que manejan cookies y tokens manualmente,
  // ya que Auth0 se encargará de la autenticación y manejo de tokens.

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userData,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        getUserDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// import React, { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// // Obtener el token CSRF de la cookie
// const getCSRFToken = () => {
//   const cookieValue = document.cookie.match(
//     "(^|;)\\s*csrftoken\\s*=\\s*([^;]+)"
//   );
//   return cookieValue ? cookieValue.pop() : "";
// };

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [token, setToken] = useState("");
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     // Verificar si hay un token almacenado en las cookies al cargar el componente
//     const storedToken = getCookie("authToken");
//     const storedUserData = localStorage.getItem("userData");

//     if (storedToken) {
//       setToken(storedToken);
//       setIsAuthenticated(true); // Si hay un token, el usuario está autenticado
//       if (storedUserData) {
//         setUserData(JSON.parse(storedUserData));
//       } else {
//         getUserDetails(storedToken);
//       }
//     }
//   }, []);

//   const register = async (username, password) => {
//     try {
//       const response = await fetch(
//         "https://loocal.co/api/register",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ username, password }),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         setCookie("authToken", data.token);
//         setToken(data.token);
//         setIsAuthenticated(true);
//         getUserDetails(data.token);
//       } else {
//         throw new Error("ERROR");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const login = async (username, password) => {
//     try {
//       // Realizar la solicitud de inicio de sesión al backend
//       const response = await fetch(
//         "https://loocal.co/api/login",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCSRFToken(), // Incluir el token CSRF en el encabezado
//           },
//           body: JSON.stringify({ username, password }),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         // Establecer el token en una cookie
//         setCookie("authToken", data.token);
//         setToken(data.token);
//         setIsAuthenticated(true);
//         getUserDetails(data.token);
//       } else {
//         throw new Error("Login failed");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   const getUserDetails = async (authToken) => {
//     try {
//       const response = await fetch(
//         "https://loocal.co/api/profile",
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Token ${authToken}`,
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCSRFToken(),
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         setUserData(data);
//         localStorage.setItem("userData", JSON.stringify(data)); // Guardar datos en localStorage
//       } else {
//         throw new Error("Failed to fetch user details");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   const logout = async () => {
//     try {
//       // Realizar la solicitud de logout al backend
//       const response = await fetch(
//         "https://loocal.co/api/logout",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Token ${token}`,
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCSRFToken(), // Incluir el token CSRF en el encabezado
//           },
//         }
//       );

//       if (response.ok) {
//         // Eliminar la cookie de token y datos del usuario de localStorage
//         deleteCookie("authToken");
//         localStorage.removeItem("userData");
//         setToken("");
//         setIsAuthenticated(false);
//         setUserData(null); // Limpiar los datos del usuario al cerrar sesión
//       } else {
//         throw new Error("Logout failed");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   // Nueva función para actualizar los datos del usuario
//   const updateUser = async (updatedData) => {
//     try {
//       console.log("Sending update request with data:", updatedData);
//       const response = await fetch(
//         "https://loocal.co/api/update_user",
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Token ${token}`,
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCSRFToken(),
//           },
//           body: JSON.stringify(updatedData),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Update successful:", data);
//         setUserData(data);
//         localStorage.setItem("userData", JSON.stringify(data));
//       } else {
//         console.log("Update failed:", response.statusText);
//         throw new Error("Update failed");
//       }
//     } catch (error) {
//       console.error("Error updating user:", error);
//     }
//   };
//   // Función para establecer una cookie
//   const setCookie = (name, value) => {
//     document.cookie = `${name}=${value}; path=/`;
//   };

//   // Función para eliminar una cookie
//   const deleteCookie = (name) => {
//     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
//   };

//   // Función para obtener el valor de una cookie
//   const getCookie = (name) => {
//     const cookieValue = document.cookie.match(
//       "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
//     );
//     return cookieValue ? cookieValue.pop() : "";
//   };

//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, token, userData, login, logout, register, updateUser }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
