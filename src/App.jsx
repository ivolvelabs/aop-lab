import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "./Contexts/AuthContext";
import "./App.css";
import RequireAuth from "./Auth/RequireAuth";
import { NAV_ITEMS } from "./config/navigation";

const Login = lazy(() => import("./Auth/Login"));
const HomePage = lazy(() => import("./Home/HomePage"));
const Bookings = lazy(() => import("./Bookings/Bookings"));
const Masters = lazy(() => import("./Masters/Masters"));
const UsersAndPermissions = lazy(() =>
  import("./UsersAndPermissions/UsersAndPermissions")
);
const ThirdParty = lazy(() => import("./ThirdParty/ThirdParty"));
const SingleBooking = lazy(() => import("./Bookings/SingleBooking"));
const Templates = lazy(() => import("./Templates/Templates"));
const SubCategories = lazy(() => import("./Masters/SubCategories/SubCategories"));
const ItemNames = lazy(() => import("./Masters/ItemNames/ItemNames"));
const MyBookings = lazy(() => import("./Bookings/MyBookings"));

const RouteLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
    <CircularProgress />
  </Box>
);

const withSuspense = (component) => (
  <Suspense fallback={<RouteLoader />}>{component}</Suspense>
);

const App = () => {
  const { isLoggedIn, role, isAuthLoading } = useAuth();

  const routeComponents = {
    "/": <HomePage />,
    "/bookings": <Bookings />,
    "/thirdparty": <ThirdParty />,
    "/masters": <Masters />,
    "/usersandpermissions": <UsersAndPermissions />,
    "/templates": <Templates />,
  };

  if (isAuthLoading) {
    return <RouteLoader />;
  }

  return (
    <Routes>
      <Route
        path="login"
        element={isLoggedIn ? <Navigate to="/" /> : withSuspense(<Login />)}
      />
      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route>
        <Route element={<RequireAuth />}>
          <Route path="/" element={withSuspense(<HomePage />)} />
          <Route
            path="bookings/:bookingId"
            element={withSuspense(<SingleBooking />)}
          />
          <Route
            path="myBookings/:bookingId"
            element={withSuspense(<MyBookings />)}
          />
          <Route
            path="masters/:categoryId"
            element={withSuspense(<SubCategories />)}
          />
          <Route
            path="masters/:categoryId/:subCatId"
            element={withSuspense(<ItemNames />)}
          />
          {NAV_ITEMS.filter((nav) => nav.path !== "/" && role && nav.roles.includes(role)).map((nav) => {
              const routePath = nav.path.replace(/^\//, "");
              return (
                <Route
                  key={nav.path}
                  path={routePath}
                  element={withSuspense(routeComponents[nav.path])}
                />
              );
            })}
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
