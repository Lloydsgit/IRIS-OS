import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Always authenticated - we have NVIDIA keys embedded
const alwaysHasApiKey = () => true;

// BYOK Model - No authentication required, just check for API key
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: 'local-user', name: 'User' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    // BYOK model: Check if API key is configured
    const checkApiKey = () => {
      if (alwaysHasApiKey()) {
        setIsAuthenticated(true);
        setUser({ id: 'local-user', name: 'User', apiKeyConfigured: true });
      } else {
        setIsAuthenticated(false);
        setAuthError({
          type: 'no_api_key',
          message: 'No API key configured. Please add your API key in Settings.'
        });
      }
    };
    checkApiKey();
  }, []);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear keys if needed
    localStorage.removeItem('iris_byok_api_key');
  };

  const navigateToLogin = () => {
    // Redirect to settings for BYOK
    window.location.hash = '/settings';
  };

  const checkUserAuth = async () => {
    setIsAuthenticated(alwaysHasApiKey());
  };

  const checkAppState = async () => {
    setAuthChecked(true);
    setIsAuthenticated(alwaysHasApiKey());
    if (!alwaysHasApiKey()) {
      setAuthError({
        type: 'no_api_key',
        message: 'No API key configured. Please add your API key in Settings.'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
