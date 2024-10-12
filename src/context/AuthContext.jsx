import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const [authToken, setAuthToken] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchTokenAndProfile = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          setAuthToken(token);
          await fetchProfileData(token); // Obtener datos del perfil desde Django
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    };
    fetchTokenAndProfile();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Función para obtener el perfil del usuario desde el backend Django
  const fetchProfileData = async (token) => {
    try {
      const response = await axios.get('/api/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfileData(response.data);
      console.log(`TOKEN VALIDATED: ${token}`)
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginWithRedirect, logout, authToken, profileData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
