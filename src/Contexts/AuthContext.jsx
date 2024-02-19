import React, { useEffect, useState, useContext } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

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
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(
          db,
          "users",
          user.uid
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
          setRole(docSnap.data().role);
        } else {
          const docRef = doc(db, "thirdparty", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser(docSnap.data());
            setRole(docSnap.data().role);
          } else {
            return "No such document";
          }
        }

        setAuthUser(user);
        setIsLoggedIn(true);
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
    user,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
