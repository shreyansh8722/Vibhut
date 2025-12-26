import React, { createContext, useState, useContext } from 'react';

// Explicitly export context
export const LoginModalContext = createContext();

// Custom hook for consuming the context
export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
};

// Explicitly export provider
export const LoginModalProvider = ({ children }) => {
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const openLoginPrompt = () => {
    setIsLoginPromptOpen(true);
  };

  const closeLoginPrompt = () => {
    setIsLoginPromptOpen(false);
  };

  return (
    <LoginModalContext.Provider value={{ isLoginPromptOpen, openLoginPrompt, closeLoginPrompt }}>
      {children}
    </LoginModalContext.Provider>
  );
};

export default LoginModalProvider;