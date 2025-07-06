import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loader from '../components/Shared/Loading.tsx';
import UserLayout from '../layout/UserLayout.tsx';
import TheaterProfilePage from '../pages/User/Profile.tsx';
import MovieDetailPage from '../components/User/MovieDetailsSection.tsx';
import ShowSelectionPage from '../pages/User/ShowListingPage.tsx';
import MovieListingPage from '../pages/User/MovieListingPage.tsx';
import ActorProfilePage from '../pages/User/ActorProfilePage.tsx';
import BookingSuccessPage from '../pages/User/BookingSuccessPage.tsx';
import CheckoutPage from '../pages/User/CheckoutPage.tsx';
import PrivateRoute from '../components/Auth/PrivateRoutes.tsx';
import ScrollToTop from '../components/Shared/ScrollToTop.tsx';
import TheaterSeatSelection from '../pages/User/SeatSelectionPage.tsx';

const HomePage = lazy(() => import('../pages/User/Home.tsx'));
const PasswordResetPage = lazy(() => import('../pages/Shared/ForgotPassword.tsx'));

const UserRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ScrollToTop />
      <Routes>
        <Route element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route element={<PrivateRoute allowedRoles={['user']} />}>
            <Route path="account">
              <Route index element={<Navigate to="account-tab" replace />} />
              <Route path="account-tab" element={<TheaterProfilePage />} />
              <Route path="bookings-tab" element={<TheaterProfilePage />} />
              <Route path="notifications-tab" element={<TheaterProfilePage />} />
              <Route path="wallet-tab" element={<TheaterProfilePage />} />
              <Route path="moviepass-tab" element={<TheaterProfilePage />} />
            </Route>
          </Route>  
          <Route path="user" element={<Navigate to="/" replace />} />
          <Route path="movie-details/:id" element={<MovieDetailPage />} />
          <Route path="movie-listing" element={<MovieListingPage />} />
          <Route path="show-selection/:movieId" element={<ShowSelectionPage />} />
          <Route path="actor-profile/:id" element={<ActorProfilePage />} />
        </Route>
        <Route path="seat-selection/:showId" element={<TheaterSeatSelection />} />
        <Route element={<PrivateRoute allowedRoles={['user']} />}>
          <Route path="checkout/:showId" element={<CheckoutPage />} />
        </Route>  
        <Route path="booking-success/:id" element={<BookingSuccessPage />} />
        <Route path="forgot-password" element={<PasswordResetPage />} />
        <Route path="*" element={<Navigate to="/pagenotfound" replace />} />
        <Route path="user" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;