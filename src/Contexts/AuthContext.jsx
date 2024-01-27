import React, { useEffect, useState, useContext } from "react";
import { auth } from "../firebase";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
  // const context = useContext(AuthContext);
  // if (!context) {
  //   throw new Error("useAuth must be used within an AuthProvider");
  // }
  // return context;
}

export function AuthProvider(props) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthUser(user);
        setIsLoggedIn(true);
        setRole("admin");
      } else {
        setAuthUser(null);
        setIsLoggedIn(false);
        setRole(null);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    authUser,
    setAuthUser,
    isLoggedIn,
    setIsLoggedIn,
    role,
    setRole,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
