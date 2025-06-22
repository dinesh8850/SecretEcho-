import React, { createContext, useContext, useState } from 'react';

// 1. Create the context
export const UserContext = createContext();

// 2. Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null initially

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 3. Create a custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
