import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Orders from "./pages/OrderPage";
import Drivers from "./pages/DriverPage";
import DriverDetails from "./pages/DriverDetails";
import Products from "./pages/ProductPage";
import InvoicePage from "./pages/Invoice/InvoicePage";
import InvoiceDetail from "./pages/Invoice/InvoiceDetail";
import ProtectedRoute from "./components/protected/ProtectedRoute";
import OrderDetails from "./pages/OrderDetails";
import AssignOrders from "./pages/AssignOrders";
import TodayOrders from "./pages/Invoice/TodayOrders";
import OrderZone from "./pages/OrderZone";
import Users from "./pages/Users";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/zones"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <OrderZone />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers/assign"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AssignOrders />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/drivers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Drivers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DriverDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <InvoiceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TodayOrders />
                </ProtectedRoute>
              }
            />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
