import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../Contexts/AuthContext'
import MainLayout from '../Layout/MainLayout';
import { Box, CircularProgress } from '@mui/material';

const RequireAuth = () => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
{
    isLoggedIn ? 
    <MainLayout>
    <Outlet />
    </MainLayout>
    : <Navigate to="/login" state={{ from: location }} replace />
}
    </div>
  )
}

export default RequireAuth
