import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("userToken");

  if (token) {
    return <>{children}</>; 
  } else {
    return <Navigate to="/login" replace />; 
  }
}
