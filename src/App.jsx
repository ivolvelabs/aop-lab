import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  RouterProvider,
  createRoutesFromElements,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./Contexts/AuthContext"; // Import your AuthContext
import MainLayout from "./Layout/MainLayout"; // Import your MainLayout component
import Login from "./Auth/Login";
import HomePage from "./Home/HomePage";
import "./App.css";
import Bookings from "./Bookings/Bookings";
import NotFound from "./NotFound";
import RootLayout from "./Layout/RootLayout";
import Masters from "./Masters/Masters";
import UsersAndPermissions from "./UsersAndPermissions/UsersAndPermissions";
import ThirdParty from "./ThirdParty/ThirdParty";
import RequireAuth from "./Auth/RequireAuth";
import SingleBooking from "./Bookings/SingleBooking";
import Templates from "./Templates/Templates";

const App = () => {
  const { isLoggedIn, role, authUser } = useAuth();

  const mainNavs = [
    {
      path: "/",
      name: "Home",
      roles: ["admin", "technician", "receptionist", "thirdparty"],
      component: <HomePage />,
    },
    {
      path: "bookings",
      name: "Bookings",
      roles: ["admin", "technician", "receptionist", "thirdparty"],
      // element: (
      //   <Outlet>
      //     <Route path="" element={<Bookings />} />
      //     <Route path=":bookingId" element={<SingleBooking />} />
      //   </Outlet>
      // ),
      component: <Bookings />,
    },
    {
      path: "thirdparty",
      name: "Third Party",
      roles: ["admin", "receptionist"],
      component: <ThirdParty />,
    },
    {
      path: "masters",
      name: "Masters",
      roles: ["admin", "technician", "receptionist"],
      component: <Masters />,
    },
    {
      path: "usersandpermissions",
      name: "Users and Permissions",
      roles: ["admin"],
      component: <UsersAndPermissions />,
    },
    {
      path: "templates",
      name: "Templates",
      roles: ["admin", "technician", "receptionist"],
      component: <Templates />,
    },
  ];

  return (
    <Routes>
      <Route
        path="login"
        element={isLoggedIn ? <Navigate to="/" /> : <Login />}
      />
      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="bookings/:bookingId" element={<SingleBooking />} />
          {mainNavs
            .filter((nav) => role && nav.roles.includes(role))
            .map((nav, index) => {
              return <Route path={nav.path} element={nav.component} />;
            })}
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
