import { Navigate } from "react-router-dom";
import { useAuth } from "@/core/hooks/useAuth";
import LoginPage from "@/modules/auth/pages/LoginPage";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import MainLayout from "@/layout/MainLayout";
import AuthLayout from "@/layout/AuthLayout";
import OrdersPage from "../modules/Orders/OrdersPage";
import ReservationsPage from "../modules/ReservationsPage/page/ReservationsPage";
import CatalogPage from "../modules/catalog/page/CatalogPage";
import UsersPage from "../modules/Users/pages/UsersPage";
import PromotionsPage from "../modules/Promotions/page/PromotionsPage";
import BranchesPages from "../modules/Branches/pages/BranchesPage";
import FinancePage from "../modules/Finance/page/FinancePage";
import RolesPermissionsPage from "@/modules/RolePermissions/pages/RolesPermissionsPage";
import ChatControlPage from "@/modules/ChatControl/pages/ChatControlPage";
import HelpCenterPage from "@/modules/Help/pages/HelpCenterPage";
import SettingsPage from "@/modules/Settings/pages/SettingsPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

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
        element: <BranchesPages />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "sales",
        element: <PromotionsPage />,
      },
      {
        path: "finance",
        element: <FinancePage />,
      },
      {
        path: "roles",
        element: <RolesPermissionsPage />,
      },
      {
        path: "chat",
        element: <ChatControlPage />,
      },
      {
        path: "help",
        element: <HelpCenterPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
];