import React,{ lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import LoginPage from './pages/Vendor/LoginPage.tsx';
import RegisterPage from './pages/Vendor/RegisterPage.tsx';
import HomePage from './pages/User/Home/Home';
import OwnerDashboard from './pages/Vendor/Dashboard.tsx';
import AdminLogin from './pages/Admin/LoginPage';
import Dashboard from './pages/Admin/AdminDashboard';
import Theaters from './pages/Admin/TheatersPage';
import PageNotFound from "./components/Shared/PageNotFound.tsx";
import Loader from "./components/Shared/Loading.tsx"
import PrivateRoute from "./components/Auth/PrivateRoutes.tsx";
import Toast from './components/Shared/Toaster.tsx';
import './App.css'
import TheaterDetailsPage from './pages/Vendor/TheaterDetailsForm.tsx';
import PasswordResetPage from './pages/Shared/ForgotPassword.tsx';
import Shows from './pages/Admin/Shows.tsx';
import Movies from './pages/Admin/Movies.tsx';
import Bookings from './pages/Admin/Bookings.tsx';

const App: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  console.log('new user',user)
  return (
    <Suspense fallback={<Loader/>}>
      <Toast />
      <Router>
        <Routes>
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/shows" element={<Shows />} />
            <Route path="/admin/movies" element={<Movies />} />
            <Route path="/admin/bookings" element={<Bookings />} />
            <Route path="/admin/theater" element={<Theaters />} />
          </Route>
            <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/user" element={<Navigate to="/" />} />
          {/* <Route path="/forgot-password" element={<PasswordResetPage/>} /> */}

          <Route path="/vendor/login" element={<LoginPage />} />
          <Route path="/vendor/register" element={<RegisterPage />} />
          <Route path="/vendor/dashboard" element={<OwnerDashboard />} />
          <Route path="/vendor/details" element={<TheaterDetailsPage/>} />
          

          <Route path="/" element={<HomePage/>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </Suspense>
  );
};

export default App;