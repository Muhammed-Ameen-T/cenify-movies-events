import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loader from '../components/Shared/Loading.tsx';
import Layout from '../layout/DashboardLayout.tsx';
import TheaterDetailsForm from '../components/Vendor/TheaterDetailsForm.tsx';
import PrivateRoute from '../components/Auth/PrivateRoutes.tsx';
import TheaterSeatLayoutCustomizer from '../pages/Vendor/SeatLayout.tsx';
import TheaterLayoutCustomizer from '../pages/Vendor/SeatLayout.tsx';

const LoginPage = lazy(() => import('../pages/Vendor/LoginPage.tsx'));
const RegisterPage = lazy(() => import('../pages/Vendor/RegisterPage.tsx'));
const VendorDashboard = lazy(() => import('../pages/Vendor/VendorDashboard.tsx'));
const TheaterDetailsPage = lazy(() => import('../pages/Vendor/TheaterDetailsForm.tsx'));
const TheaterManagement = lazy(() => import('../pages/Vendor/Theaters.tsx'));
const EventDetails = lazy(() => import('../pages/Vendor/EventDetails.tsx'));
const EventManagement = lazy(() => import('../pages/Vendor/Events.tsx'));
import Appii from '../pages/Vendor/RealSeatLayoutPage.tsx';

const VendorRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/vendor/login" element={<LoginPage />} />
        <Route path="/vendor/register" element={<RegisterPage />} />
        <Route element={<PrivateRoute allowedRoles={["vendor"]} />}>
          <Route path="/vendor" element={<Layout />}>
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="create-theater" element={<TheaterDetailsForm />} />
            <Route path="theaters" element={<TheaterManagement />} />
            <Route path="events-create" element={<VendorDashboard />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="seats" element={<Appii />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
    
  );
};

export default VendorRoutes;