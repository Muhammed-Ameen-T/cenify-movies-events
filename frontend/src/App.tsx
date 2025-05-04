import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import Loader from "./components/Shared/Loading.tsx";
import Toast from "./components/Shared/Toaster.tsx";
import AdminRoutes from "./routes/AdminRoutes";
import VendorRoutes from "./routes/VendorRoutes";
import UserRoutes from "./routes/UserRoutes";
import "./App.css";

const App: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  console.log("new user", user);

  return (
    <Suspense fallback={<Loader />}>
      <Toast />
      <Router>
        <AdminRoutes />
        <VendorRoutes />
        <UserRoutes />
      </Router>
    </Suspense>
  );
};

export default App;
