import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function Protectadmin({ children }: Props) {
  const token = localStorage.getItem("userToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (token === "admin") {  
    return <>{children}</>;
  } else {
    return <Navigate to="/home" replace />;
  }
}

