import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loader from '../components/Shared/Loading.tsx';
import UserLayout from '../layout/UserLayout.tsx';
import TheaterProfilePage from '../pages/User/Profile.tsx';

const HomePage = lazy(() => import('../pages/User/Home.tsx'));
const PasswordResetPage = lazy(() => import('../pages/Shared/ForgotPassword.tsx'));
const PageNotFound = lazy(() => import('../components/Shared/PageNotFound.tsx'));

const UserRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Routes with Navbar */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/account" element={<TheaterProfilePage />} />
          <Route path="/user" element={<Navigate to="/" />} />
        </Route>
          <Route path="*" element={<PageNotFound />} />
        {/* Route without Navbar */}
        <Route path="/forgot-password" element={<PasswordResetPage />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;