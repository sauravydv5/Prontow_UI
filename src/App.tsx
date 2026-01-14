import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import Dashboard from "./pages/Dashboard";
import ProductManagement from "./pages/ProductManagement";
import OrderManagement from "./pages/OrderManagement";
import InventoryTracking from "./pages/InventoryTracking";
import CustomerRelationship from "./pages/CustomerRelationship";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Games from "./games/Games";
import SpinTheWheel from "./games/SpinTheWheel";
import CreateNewWheel from "./games/CreateNewWheel";
import PaymentsAndSettlements from "./pages/PaymentsAndSettlements";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import SupportDetails from "./pages/SupportDetails";
import GeneralSettings from "./pages/GeneralSettings";
import Opinio from "./games/Opinio";
import Notifications from "./pages/Notifications";
import CreateMatch from "./games/CreateMatch";
import AskQuestion from "./games/AskQuestion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors duration={2000} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="settings/forgot-password" element={<ForgotPassword />} />
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/inventory" element={<InventoryTracking />} />
          <Route path="/customers" element={<CustomerRelationship />} />
          <Route path="/payments-and-settlements" element={<PaymentsAndSettlements />} />

          <Route path="/support" element={<Support />} />
          <Route path="/support/support-details/:ticketId" element={<SupportDetails />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/general" element={<GeneralSettings />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/games" element={<Games />} />
          <Route path="/games/spin-the-wheel" element={<SpinTheWheel />} />
          <Route path="/games/spin-the-wheel/create-new-wheel" element={<CreateNewWheel />} />
          <Route path="/games/opinio" element={<Opinio />} />
          <Route path="/games/opinio/ask-question/:matchId" element={<AskQuestion />} />
          <Route path="/games/create-match" element={<CreateMatch />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
