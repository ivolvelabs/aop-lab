import React from 'react'
import { auth } from '../firebase';
import { useAuth } from '../Contexts/AuthContext';
import {  getAuth, signOut } from "firebase/auth";
import { Button } from '@mui/material';
import { Navigate } from 'react-router-dom';
import Login from '../Auth/Login';

// import Login from './Login';

const HomePage = (props) => {
  const { authUser, setAuthUser, isLoggedIn, setIsLoggedIn, role, setRole } = useAuth();
// console.log(isLoggedIn);
const logout = () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      setIsLoggedIn(false);
      setAuthUser(null);
    //   setLoading(true);
    setRole(null);
    <Navigate to='login' />
    })
    .catch((error) => {
      // An error happened.
    });
};
  return (
    <div>
      <>HomePage</>
      {/* <Button
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            Logout
          </Button> */}
   {/* {isLoggedIn ? <><div>logged in</div><div>user is - {authUser?.email}</div></> : <>logged out</>} */}
    </div>
  );
}

export default HomePage