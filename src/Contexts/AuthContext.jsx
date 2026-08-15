import React, { useEffect, useState, useContext } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";

const AuthContext = React.createContext();

const isAccountActive = (data) => data?.active !== false && !data?.archivedAt;

const isLoginAllowed = (data) =>
  isAccountActive(data) &&
  (data?.role !== "thirdparty" || data?.loginAccess !== false);

const findThirdPartyByAuthUid = async (uid) => {
  const directDocSnap = await getDoc(doc(db, "thirdparty", uid));
  if (directDocSnap.exists()) {
    return {
      id: directDocSnap.id,
      ...directDocSnap.data(),
    };
  }

  const authUidQuery = query(
    collection(db, "thirdparty"),
    where("authUid", "==", uid),
    limit(1)
  );
  const authUidSnapshot = await getDocs(authUidQuery);

  if (authUidSnapshot.empty) return null;

  const thirdPartyDoc = authUidSnapshot.docs[0];
  return {
    id: thirdPartyDoc.id,
    ...thirdPartyDoc.data(),
  };
};

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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsAuthLoading(true);
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = { id: userDocSnap.id, ...userDocSnap.data() };
            if (!isLoginAllowed(userData)) {
              await signOut(auth);
              setUser(null);
              setRole(null);
              setAuthUser(null);
              setIsLoggedIn(false);
              return;
            }
            setUser(userData);
            setRole(userData.role);
          } else {
            const thirdPartyData = await findThirdPartyByAuthUid(user.uid);
            if (thirdPartyData) {
              if (!isLoginAllowed(thirdPartyData)) {
                await signOut(auth);
                setUser(null);
                setRole(null);
                setAuthUser(null);
                setIsLoggedIn(false);
                return;
              }
              setUser(thirdPartyData);
              setRole(thirdPartyData.role);
            } else {
              setUser(null);
              setRole(null);
            }
          }

          setAuthUser(user);
          setIsLoggedIn(true);
        } else {
          setAuthUser(null);
          setUser(null);
          setIsLoggedIn(false);
          setRole(null);
        }
      } catch (error) {
        console.error("Auth state sync failed:", error);
        setAuthUser(null);
        setUser(null);
        setIsLoggedIn(false);
        setRole(null);
      } finally {
        setIsAuthLoading(false);
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
    isAuthLoading,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
