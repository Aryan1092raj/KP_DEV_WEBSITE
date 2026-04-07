import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import AdminSidebar from "./components/admin/AdminSidebar";
import Footer from "./components/common/Footer";
import Navbar from "./components/common/Navbar";
import Particles from "./components/common/Particles";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import ManageAnnouncements from "./pages/admin/ManageAnnouncements";
import ManageEvents from "./pages/admin/ManageEvents";
import ManageMembers from "./pages/admin/ManageMembers";
import ManageProjects from "./pages/admin/ManageProjects";
import ManageTimeline from "./pages/admin/ManageTimeline";
import ViewContactMessages from "./pages/admin/ViewContactMessages";
import ViewApplications from "./pages/admin/ViewApplications";
import ApplyPage from "./pages/public/ApplyPage";
import ContactPage from "./pages/public/ContactPage";
import EventsPage from "./pages/public/EventsPage";
import HomePage from "./pages/public/HomePage";
import NotFound from "./pages/public/NotFound";
import ProjectsPage from "./pages/public/ProjectsPage";
import TeamPage from "./pages/public/TeamPage";
import ProtectedRoute from "./router/ProtectedRoute";

function PublicLayout() {
  const { session, isAdmin } = useAuth();

  return (
    <div className="relative z-10">
      <Navbar authenticated={Boolean(session && isAdmin)} />
      <Outlet />
      <Footer />
    </div>
  );
}

function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[280px_1fr]">
      <AdminSidebar onLogout={logout} />
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<HomePage />} path="/" />
        <Route element={<ProjectsPage />} path="/projects" />
        <Route element={<TeamPage />} path="/team" />
        <Route element={<EventsPage />} path="/events" />
        <Route element={<ApplyPage />} path="/apply" />
        <Route element={<ContactPage />} path="/contact" />
      </Route>

      <Route element={<AdminLoginPage />} path="/admin/login" />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
        path="/admin"
      >
        <Route element={<AdminDashboard />} index />
        <Route element={<ManageMembers />} path="members" />
        <Route element={<ManageProjects />} path="projects" />
        <Route element={<ManageEvents />} path="events" />
        <Route element={<ManageTimeline />} path="timeline" />
        <Route element={<ManageAnnouncements />} path="announcements" />
        <Route element={<ViewApplications />} path="applications" />
        <Route element={<ViewContactMessages />} path="contact-messages" />
      </Route>

      <Route element={<Navigate replace to="/" />} path="/home" />
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
}

export default function App() {
  const particleColors = ["#ffffff"];

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <AuthProvider>
      <div className="relative isolate min-h-screen overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 opacity-75 dark:opacity-90">
            <Particles
              alphaParticles
              cameraDistance={24}
              disableRotation={false}
              moveParticlesOnHover
              particleBaseSize={400}
              particleColors={particleColors}
              particleCount={1000}
              particleHoverFactor={0.65}
              particleSpread={40}
              pixelRatio={1}
              sizeRandomness={0.85}
              speed={0.2}
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,26,52,0.42),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,31,0.5),rgba(6,10,19,0.72))]" />
        </div>

        <div className="relative z-10">
          <AppRoutes />
        </div>
      </div>
    </AuthProvider>
  );
}
