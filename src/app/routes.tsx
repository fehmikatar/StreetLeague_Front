import { createBrowserRouter } from "react-router";
import { Layout } from "@/app/components/Layout";
import { PublicLayout } from "@/app/components/PublicLayout";
import { Home } from "@/app/pages/Home";
import { Team } from "@/app/pages/Team";
import { Matches } from "@/app/pages/Matches";
import { Booking } from "@/app/pages/Booking";
import { Community } from "@/app/pages/Community";
import { PerformanceEnhanced } from "@/app/pages/PerformanceEnhanced";
import { Sponsors } from "@/app/pages/Sponsors";
import { Admin } from "@/app/pages/Admin";
import { NotFound } from "@/app/pages/NotFound";
import LoginPage from "@/app/pages/auth/LoginPage";
import SignupPage from "@/app/pages/auth/SignupPage";
import PasswordResetPage from "@/app/pages/auth/PasswordResetPage";
import FieldsListPage from "@/app/pages/fields/FieldsListPage";
import AddFieldPage from "@/app/pages/fields/AddFieldPage";
import FieldDetailPage from "@/app/pages/fields/FieldDetailPage";
import UserProfile from "@/app/pages/UserProfile";
import NotificationsCenter from "@/app/pages/NotificationsCenter";
import MatchDetailPage from "@/app/pages/MatchDetailPage";
import BookingForm from "@/app/pages/BookingForm";
import UserDashboard from "@/app/pages/UserDashboard";
import PublicHomePage from "@/app/pages/public/PublicHomePage";
import AboutPage from "@/app/pages/public/AboutPage";
import ContactPage from "@/app/pages/public/ContactPage";
import BrowsePage from "@/app/pages/public/BrowsePage";
// Healthcare Module
import HealthDashboard from "@/app/pages/healthcare/HealthDashboard";
import HealthProfile from "@/app/pages/healthcare/HealthProfile";
import MedicalRecords from "@/app/pages/healthcare/MedicalRecords";
import Appointments from "@/app/pages/healthcare/Appointments";
import DietPlans from "@/app/pages/healthcare/DietPlans";
import HealthTrends from "@/app/pages/healthcare/HealthTrends";
import HealthAlerts from "@/app/pages/healthcare/HealthAlerts";
import ComplianceTracking from "@/app/pages/healthcare/ComplianceTracking";

export const router = createBrowserRouter([
  // Public Routes (no authentication required)
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: PublicHomePage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "browse", Component: BrowsePage },
    ],
  },
  // Auth Routes (standalone, no layout)
  {
    path: "/auth/login",
    Component: LoginPage,
  },
  {
    path: "/auth/signup",
    Component: SignupPage,
  },
  {
    path: "/auth/password-reset",
    Component: PasswordResetPage,
  },
  // Authenticated Routes (requires login)
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: UserDashboard },
      { path: "home", Component: Home },
      { path: "team", Component: Team },
      { path: "matches", Component: Matches },
      { path: "booking", Component: Booking },
      { path: "community", Component: Community },
      { path: "performance", Component: PerformanceEnhanced },
      // Healthcare Module Routes
      { path: "healthcare", Component: HealthDashboard },
      { path: "healthcare/profile", Component: HealthProfile },
      { path: "healthcare/records", Component: MedicalRecords },
      { path: "healthcare/appointments", Component: Appointments },
      { path: "healthcare/diet", Component: DietPlans },
      { path: "healthcare/trends", Component: HealthTrends },
      { path: "healthcare/alerts", Component: HealthAlerts },
      { path: "healthcare/compliance", Component: ComplianceTracking },
      { path: "sponsors", Component: Sponsors },
      { path: "admin", Component: Admin },
      { path: "fields", Component: FieldsListPage },
      { path: "fields/add", Component: AddFieldPage },
      { path: "fields/:id", Component: FieldDetailPage },
      { path: "user-profile", Component: UserProfile },
      { path: "notifications", Component: NotificationsCenter },
      { path: "matches/:id", Component: MatchDetailPage },
      { path: "booking-form", Component: BookingForm },
    ],
  },
  // 404 Not Found
  {
    path: "*",
    Component: NotFound,
  },
]);