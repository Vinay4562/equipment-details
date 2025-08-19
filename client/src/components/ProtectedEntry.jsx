import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedEntry() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const location = useLocation()
  if (!token) return <Navigate to="/signin" replace state={{ next: location.pathname }} />
  return <Outlet />
}