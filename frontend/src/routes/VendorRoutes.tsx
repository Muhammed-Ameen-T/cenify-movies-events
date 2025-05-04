import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "../components/Shared/Loading.tsx";

const LoginPage = lazy(() => import("../pages/Vendor/LoginPage.tsx"));
const RegisterPage = lazy(() => import("../pages/Vendor/RegisterPage.tsx"));
const VendorDashboard = lazy(() => import("../pages/Vendor/VendorDashboard.tsx"));
const TheaterDetailsPage = lazy(() => import("../pages/Vendor/TheaterDetailsForm.tsx"));
const TheaterManagement = lazy(() => import("../pages/Vendor/Theaters.tsx"));
const EventDetails = lazy(() => import("../pages/Vendor/EventDetails.tsx"));
const EventManagement = lazy(() => import("../pages/Vendor/Events.tsx"));
const Insights = lazy(() => import("../pages/Vendor/Insights.tsx"));

const VendorRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/vendor/login" element={<LoginPage />} />
        <Route path="/vendor/register" element={<RegisterPage />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/details" element={<TheaterDetailsPage />} />
        <Route path="/vendor/theaters" element={<TheaterManagement />} />
        <Route path="/vendor/events/create" element={<VendorDashboard />} />
        <Route path="/vendor/insights/bookings" element={<EventDetails />} />
      </Routes>
    </Suspense>
  );
};

export default VendorRoutes;
