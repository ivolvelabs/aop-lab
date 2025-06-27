import React, { useState } from "react";
import { auth, db } from "../firebase";
import { useAuth } from "../Contexts/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { Button, Card } from "@mui/material";
import { Navigate } from "react-router-dom";
import Login from "../Auth/Login";
import CardComponent from "../Components/CardComponent";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { useEffect } from "react";

// import Login from './Login';

const HomePage = (props) => {
  const { authUser, setAuthUser, isLoggedIn, setIsLoggedIn, role, setRole } =
    useAuth();
  const [pendingCount, setPendingCount] = useState(null);

  const getPendingBookings = async () => {
    // const bookings = await getDocs(collection(db, "bookings"));
    const coll = collection(db, "bookings");
    const q = query(coll, where("isCompleted", "==", false));
    const snapshot = await getCountFromServer(q);
    setPendingCount(snapshot.data().count);
    console.log(snapshot.data().count);
    // return snapshot.data().count;
  };

  useEffect(() => {
    getPendingBookings();
  }, []);

  // console.log(isLoggedIn);
  const logout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setIsLoggedIn(false);
        setAuthUser(null);
        //   setLoading(true);
        setRole(null);
        <Navigate to="login" />;
      })
      .catch((error) => {
        // An error happened.
      });
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: "20px",
        columnGap: "20px",
        justifyContent: "space-evenly",
      }}
    >
      <CardComponent
        cardType="Total Pending Bookings"
        pendingCount={pendingCount}
        section="Bookings"
        sectionPath="/bookings"
      />
      {/* <CardComponent cardType="Total Pending Bookings" pendingCount={pendingCount} section="Bookings" sectionPath="/bookings" /> */}
      {/* <CardComponent cardType="Total Pending Bookings" pendingCount={pendingCount} section="Bookings" sectionPath="/bookings" /> */}
      {/* <CardComponent cardType="Total Pending Bookings" pendingCount={pendingCount} section="Bookings" sectionPath="/bookings" /> */}
    </div>
  );
};

export default HomePage;
