import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "../components/Shared/Loading.tsx";

const HomePage = lazy(() => import("../pages/User/Home.tsx"));
const PasswordResetPage = lazy(() => import("../pages/Shared/ForgotPassword.tsx"));
const PageNotFound = lazy(() => import("../components/Shared/PageNotFound.tsx"));

const UserRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/forgot-password" element={<PasswordResetPage />} />
        <Route path="/user" element={<Navigate to="/" />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
