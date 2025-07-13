import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/Auth/PrivateRoutes';
import { lazy, Suspense } from 'react';
import Loader from '../components/Shared/Loading';
import AdminLayout from '../layout/AdminLayout';
// import UserManagement from '../pages/Admin/Users';
import MovieCreationForm from '../pages/Admin/MovieCreation';
import EditMovieForm from '../pages/Admin/EditMoviePage';
import UserManagementExample from '../pages/Admin/UserManagement';
import VendorNotifications from '../pages/Admin/AdminNotifications';

const AdminLogin = lazy(() => import('../pages/Admin/LoginPage'));
const Dashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const Shows = lazy(() => import('../pages/Admin/Shows'));
const Movies = lazy(() => import('../pages/Admin/Movies'));
const Bookings = lazy(() => import('../pages/Admin/Bookings'));
const Theaters = lazy(() => import('../pages/Admin/TheatersPage'));

const AdminRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout activePage="dashboard" />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<AdminLayout activePage="shows" />}>
            <Route path="shows" element={<Shows />} />
          </Route>
          <Route element={<AdminLayout activePage="movies" />}>
            <Route path="movies" element={<Movies />} />
            <Route path="create-movie" element={<MovieCreationForm />} />
            <Route path="movies/edit/:id" element={<EditMovieForm />} />
          </Route>
          <Route element={<AdminLayout activePage="bookings" />}>
            <Route path="bookings" element={<Bookings />} />
          </Route>
          <Route element={<AdminLayout activePage="theaters" />}>
            <Route path="theater" element={<Theaters />} />
          </Route>
          <Route element={<AdminLayout activePage="users" />}>
            {/* <Route path="example" element={<UserManagement />} /> */}
            <Route path="users" element={<UserManagementExample />} />
          </Route>
          <Route element={<AdminLayout activePage="notifications" />}>
            <Route path="notifications" element={<VendorNotifications />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/pagenotfound" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;