import { Navigate } from "react-router-dom";

import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { loading, session, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Checking your session..." />;
  }

  if (!session || !isAdmin) {
    return <Navigate replace to="/admin/login" />;
  }

  return children;
}
