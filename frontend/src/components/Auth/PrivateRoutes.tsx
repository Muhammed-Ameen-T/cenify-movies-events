import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { RootState } from "../../store/store";

interface PrivateRouteProps {
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  if (!currentUser) {
    // Redirect to the appropriate login page based on the requested path
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    } else if (location.pathname.startsWith('/vendor')) {
      return <Navigate to="/vendor/login" state={{ from: location }} replace />;
    } 
    return <Navigate to="/" replace />;
  }

  return currentUser.role && allowedRoles.includes(currentUser.role) ? (
    <Outlet />
  ) : (
    <Navigate to={`/${currentUser.role || ""}`} replace />
  );
};

export default PrivateRoute;