import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loader from '../components/Shared/Loading.tsx';
import Layout from '../layout/VendorLayout.tsx';
import TheaterDetailsForm from '../components/Vendor/TheaterDetailsForm.tsx';
import PrivateRoute from '../components/Auth/PrivateRoutes.tsx';

const LoginPage = lazy(() => import('../pages/Vendor/LoginPage.tsx'));
const RegisterPage = lazy(() => import('../pages/Vendor/RegisterPage.tsx'));
const VendorDashboard = lazy(() => import('../pages/Vendor/VendorDashboard.tsx'));
const TheaterManagement = lazy(() => import('../pages/Vendor/Theaters.tsx'));
import SeatLayoutMain from '../pages/SeatLayout/MainSeat.tsx';
import ScreenManagement from '../pages/Vendor/ScreenManagement.tsx';
import CreateScreenForm from '../components/Vendor/CreateScreenForm.tsx';
import CreateShowForm from '../components/Vendor/createShowForm.tsx';
import ShowManagement from '../pages/Vendor/ShowManagement.tsx';
import UpdateShowForm from '../components/Vendor/updateShowForm.tsx';
import SeatLayoutManagement from '../pages/Vendor/SeatLayoutManagement.tsx';
import VendorBookings from '../pages/Vendor/BookingsManagement.tsx';
import VendorNotifications from '../pages/Vendor/VendorNotifications.tsx';
import VendorWalletTab from '../pages/Vendor/VendorWallet.tsx';
import UpdateTheater from '../pages/Vendor/UpdateTheaterPage.tsx';

const VendorRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<PrivateRoute allowedRoles={["vendor"]} />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="create-theater" element={<TheaterDetailsForm />} />
            <Route path="theaters" element={<TheaterManagement />} />
            <Route path="seats" element={<SeatLayoutManagement />} />
            <Route path="create-seats" element={<SeatLayoutMain />} />
            <Route path="screens" element={<ScreenManagement />} />
            <Route path="create-screens" element={<CreateScreenForm />} />
            <Route path="create-show" element={<CreateShowForm />} />
            <Route path="shows" element={<ShowManagement />} />
            <Route path="bookings" element={<VendorBookings />} />
            <Route path="notifications" element={<VendorNotifications />} />
            <Route path="wallet" element={<VendorWalletTab />} />
            <Route path="update-show/:id" element={<UpdateShowForm />} />
            <Route path="update-theater/:id" element={<UpdateTheater />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/pagenotfound" replace />} />
      </Routes>
    </Suspense>
  );
};

export default VendorRoutes;