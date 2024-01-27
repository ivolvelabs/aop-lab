

import React from "react";
import { BrowserRouter, Routes, Route, Outlet, RouterProvider, createRoutesFromElements, createBrowserRouter, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from "./Contexts/AuthContext"; // Import your AuthContext
import MainLayout from "./Layout/MainLayout"; // Import your MainLayout component
import Login from "./Auth/Login";
import HomePage from "./Home/HomePage";
import "./App.css"
import Bookings from "./Bookings/Bookings";
import NotFound from "./NotFound";
import RootLayout from "./Layout/RootLayout";
import Masters from "./Masters/Masters";
import UsersAndPermissions from "./UsersAndPermissions/UsersAndPermissions";
import ThirdParty from "./ThirdParty/ThirdParty";
import RequireAuth from "./Auth/RequireAuth";


const App = () => {
  const { isLoggedIn } = useAuth();

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route>
//       <Route
//           path="/"
//           element={isLoggedIn ? <MainLayout /> : <Login />}
//         />

//         <Route element={isLoggedIn ? <MainLayout /> : <Login />}>
//           <Route path="/bookings" element={<Bookings />} />
//           <Route path="/home" element={<HomePage />} />
//           <Route path="/masters" element={<Masters />} />
//           {/* <ProtectedRoute path="/users" element={<Users />} allowedRoles={['admin']} />
//           <ProtectedRoute path="/permissions" element={<Permissions />} allowedRoles={['admin']} />
//           <ProtectedRoute path="/masters" element={<Masters />} allowedRoles={['admin', 'technician']} />
//           <ProtectedRoute path="/thirdparty" element={<Thirdparty />} allowedRoles={['technician']} /> */}
//         </Route>
//       {/* <Route path="/" element={isLoggedIn ? <Navigate to={<HomePage />} /> : <Navigate to={<Login />} /> } /> */}
//     </Route>
//   )
// ) 

  return (
    // <RouterProvider router={router} />
    // <div>
      <Routes>
        <Route>
           {/* public routes */}
          <Route path="login" element={isLoggedIn ? <Navigate to='/'/> : <Login />} />
          
          
          {/* Private routes */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomePage />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="masters" element={<Masters />} />
            <Route path="usersandpermissions" element={<UsersAndPermissions />} />
            <Route path="thirdparty" element={<ThirdParty />} />
        </Route>

        <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    // </div>
  );
}

export default App;