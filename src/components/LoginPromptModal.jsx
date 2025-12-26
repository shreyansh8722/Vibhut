import React, { createContext, useContext, useState } from 'react';

const LoginModalContext = createContext();

export const useLoginModal = () => useContext(LoginModalContext);

export const LoginModalProvider = ({ children }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <LoginModalContext.Provider value={{ isLoginOpen, openLogin, closeLogin }}>
      {children}
    </LoginModalContext.Provider>
  );
};