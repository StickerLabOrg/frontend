import React from "react";
import { Navigate } from "react-router-dom";
import { UserProvider } from "../context/UserContext";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
