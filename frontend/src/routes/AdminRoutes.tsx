import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/Auth/PrivateRoutes.tsx";
import { lazy, Suspense } from "react";
import Loader from "../components/Shared/Loading.tsx";

const AdminLogin = lazy(() => import("../pages/Admin/LoginPage"));
const Dashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const Shows = lazy(() => import("../pages/Admin/Shows"));
const Movies = lazy(() => import("../pages/Admin/Movies"));
const Bookings = lazy(() => import("../pages/Admin/Bookings"));
const Theaters = lazy(() => import("../pages/Admin/TheatersPage"));

const AdminRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/shows" element={<Shows />} />
          <Route path="/admin/movies" element={<Movies />} />
          <Route path="/admin/bookings" element={<Bookings />} />
          <Route path="/admin/theater" element={<Theaters />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
