import { Navigate } from "react-router-dom";
import { useAuth } from "@/core/hooks/useAuth";
import LoginPage from "@/modules/auth/pages/LoginPage";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import MainLayout from "@/layout/MainLayout";
import AuthLayout from "@/layout/AuthLayout";
import OrdersPage from "../modules/order/OrdersPage";
import ReservationsPage from "../modules/ReservationsPage/page/ReservationsPage";
import CatalogPage from "../modules/catalog/page/CatalogPage";
import BranchesPage from "../modules/branches/pages/BranchesPage";
import UsersPage from "../modules/Users/pages/UsersPage";
import PromotionsPage from "../modules/Promotions/page/PromotionsPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export const routes = [
  {
    path: "/login",
    element: (
      <PublicRoute>
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
            {
        path: "brands",
        element: <ReservationsPage />,
      },
       {
        path: "catalog",
        element: <CatalogPage />,
      },
      {
        path: "branches",
        element: <BranchesPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "sales",
        element: <PromotionsPage />,
      }
    ],
  },
];