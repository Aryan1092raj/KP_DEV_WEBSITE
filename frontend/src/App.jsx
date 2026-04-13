import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import AdminSidebar from "./components/admin/AdminSidebar";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Navbar from "./components/common/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { ProximityContainerProvider } from "./context/ProximityContext";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./router/ProtectedRoute";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const ManageAnnouncements = lazy(() => import("./pages/admin/ManageAnnouncements"));
const ManageEvents = lazy(() => import("./pages/admin/ManageEvents"));
const ManageMembers = lazy(() => import("./pages/admin/ManageMembers"));
const ManageProjects = lazy(() => import("./pages/admin/ManageProjects"));
const ViewContactMessages = lazy(() => import("./pages/admin/ViewContactMessages"));
const ViewApplications = lazy(() => import("./pages/admin/ViewApplications"));
const ApplyPage = lazy(() => import("./pages/public/ApplyPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));
const EventsPage = lazy(() => import("./pages/public/EventsPage"));
const HomePage = lazy(() => import("./pages/public/HomePage"));
const NotFound = lazy(() => import("./pages/public/NotFound"));
const ProjectsPage = lazy(() => import("./pages/public/ProjectsPage"));
const TeamPage = lazy(() => import("./pages/public/TeamPage"));
const TravelLandingPage = lazy(() => import("./pages/public/TravelLandingPage"));

function RouteLoadingFallback() {
  return (
    <div className="page-shell">
      <LoadingSpinner label="Loading page..." />
    </div>
  );
}

function PublicLayout({ onPublicScrollProgressChange, scrollProgress }) {
  const { session, isAdmin } = useAuth();
  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const cloudSlots = Array.from({ length: 9 });

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller || typeof onPublicScrollProgressChange !== "function") {
      return;
    }

    const updateProgress = () => {
      const maxScrollable = scroller.scrollHeight - scroller.clientHeight;
      const nextProgress = maxScrollable > 0 ? scroller.scrollTop / maxScrollable : 0;
      onPublicScrollProgressChange(nextProgress);
    };

    updateProgress();
    scroller.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      scroller.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [location.pathname, onPublicScrollProgressChange]);

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) {
      return;
    }

    scroller.scrollTo({ top: 0, behavior: "auto" });
    onPublicScrollProgressChange?.(0);
  }, [location.pathname, onPublicScrollProgressChange]);

  return (
    <div className="kp-public-shell relative z-10">
      <div className="kp-public-atmosphere" aria-hidden="true">
        <div className="kp-cloud-track kp-cloud-track-top">
          {cloudSlots.map((_, index) => (
            <span className={`kp-cloud-shape kp-cloud-shape-${(index % 6) + 1}`} key={`top-cloud-${index}`} />
          ))}
        </div>
        <div className="kp-cloud-track kp-cloud-track-mid">
          {cloudSlots.map((_, index) => (
            <span className={`kp-cloud-shape kp-cloud-shape-${((index + 2) % 6) + 1}`} key={`mid-cloud-${index}`} />
          ))}
        </div>
        <div className="kp-cloud-track kp-cloud-track-bottom">
          {cloudSlots.map((_, index) => (
            <span
              className={`kp-cloud-shape kp-cloud-shape-foreground kp-cloud-shape-${((index + 4) % 6) + 1}`}
              key={`bottom-cloud-${index}`}
            />
          ))}
        </div>
      </div>
      <Navbar scrollProgress={scrollProgress} />
      <main className="kp-public-scroll" ref={scrollContainerRef}>
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}

function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[280px_1fr]">
      <AdminSidebar onLogout={logout} />
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes({ onPublicScrollProgressChange, scrollProgress }) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route
          element={
            <PublicLayout
              onPublicScrollProgressChange={onPublicScrollProgressChange}
              scrollProgress={scrollProgress}
            />
          }
        >
          <Route element={<TravelLandingPage />} path="/" />
          <Route element={<HomePage />} path="/home" />
          <Route element={<ProjectsPage />} path="/projects" />
          <Route element={<TeamPage />} path="/team" />
          <Route element={<EventsPage />} path="/events" />
          <Route element={<ApplyPage />} path="/apply" />
          <Route element={<ContactPage />} path="/contact" />
        </Route>

        <Route element={<AdminLoginPage />} path="/adminlogin" />

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
          <Route element={<ManageAnnouncements />} path="announcements" />
          <Route element={<ViewApplications />} path="applications" />
          <Route element={<ViewContactMessages />} path="contact-messages" />
        </Route>

        <Route element={<Navigate replace to="/" />} path="/landing" />
        <Route element={<NotFound />} path="*" />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const proximityContainerRef = useRef(null);
  const location = useLocation();
  const transitionKey = `${location.pathname}${location.search}${location.hash}-${location.key}`;
  const [scrollProgress, setScrollProgress] = useState(0);
  const handlePublicScrollProgress = useCallback((nextProgress) => {
    setScrollProgress(nextProgress);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      setScrollProgress(0);
    }
  }, [location.pathname]);

  return (
    <AuthProvider>
      <ProximityContainerProvider containerRef={proximityContainerRef}>
        <div className="relative isolate min-h-screen overflow-x-hidden" ref={proximityContainerRef}>
          <div className="relative z-10 route-page-stage" key={transitionKey}>
            <AppRoutes
              onPublicScrollProgressChange={handlePublicScrollProgress}
              scrollProgress={scrollProgress}
            />
          </div>
        </div>
      </ProximityContainerProvider>
    </AuthProvider>
  );
}
