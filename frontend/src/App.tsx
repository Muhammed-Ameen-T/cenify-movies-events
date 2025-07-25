import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "./store/store";
import Loader from "./components/Shared/Loading.tsx";
import Toast from "./components/Shared/Toaster.tsx";
import AdminRoutes from "./routes/AdminRoutes";
import VendorRoutes from "./routes/VendorRoutes";
import UserRoutes from "./routes/UserRoutes";
import PageNotFound from "./components/Shared/PageNotFound.tsx";
import "./App.css";

const App: React.FC = () => {
  // const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Suspense fallback={<Loader />}>
      <Toast />
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/vendor/*" element={<VendorRoutes />} />
          <Route path="/pagenotfound" element={<PageNotFound />} />
          <Route path="/*" element={<UserRoutes />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes> 
      </Router>
    </Suspense>
  );
};

export default App;