import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../Contexts/AuthContext'
import MainLayout from '../Layout/MainLayout';

const RequireAuth = () => {
    const {isLoggedIn, authUser } = useAuth();
const location = useLocation();

  return (
    <div>
{
    isLoggedIn ? 
    <MainLayout>
    <Outlet />
    </MainLayout>
    : <Navigate to="/login" />
}
    </div>
  )
}

export default RequireAuth