import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { RootState } from "../../store/store";

interface PrivateRouteProps {
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const currentUser  = useSelector((state: RootState) => state.auth.user);
  
  console.log('current user',currentUser)
  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return currentUser.role && allowedRoles.includes(currentUser.role) ? <Outlet /> : <Navigate to={`/${currentUser.role || ""}`} />;
};

export default PrivateRoute;