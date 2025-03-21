
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/layout/Hero";
import AboutSection from "./components/layout/About";
import Footer from "./components/layout/Footer";
import WishlistPage from "./pages/Wishlist/index";
import Login from "./pages/Auth/Login";
import RegisterGuide from "./pages/Auth/RegisterGuide";
import EmailVerification from "./pages/Auth/EmailVerification";
import AdminDashboard from "./pages/Dashboard/Admin/index";
import GuideDashboard from "./pages/Dashboard/Guide/index";
import AllCategories from "./pages/Dashboard/Admin/Categories/AllCategories";
import AddCategory from "./pages/Dashboard/Admin/Categories/AddCategory";
import { useAuth } from "./context/AuthContext";
import ServiceManagement from "./pages/Dashboard/Admin/Treks/ServiceManagement";
import HighlightsManagement from "./pages/Dashboard/Admin/Treks/HighlightsManagement";
import TrekCardsSection from "./components/layout/TrekCardsSection";
import AddTrek from "./pages/Dashboard/Admin/Treks/AddTrek";
import AllTreks from "./pages/Dashboard/Admin/Treks/AllTreks";
import TrekPreview from "./pages/Dashboard/Admin/Treks/TrekPreview";
import trekApi from "./services/trekApi";
import EditTrek from "./pages/Dashboard/Admin/Treks/EditTrek";
import CommunityPage from "./pages/Community/index";
import GuideProfilePage from "./pages/GuideProfile/index";
import AllGuides from "./pages/Dashboard/Admin/Guide/AllGuides";
import AllReservations from "./pages/Dashboard/Admin/Reservations/AllReservations";
import GuidePosts from "./pages/Dashboard/Guide/Posts/GuidePosts";
import EditProfile from "./pages/Dashboard/Guide/Profile/EditProfile";
import AllTourists from "./pages/Dashboard/Admin/Tourist/AllTourists";
import TouristProfile from "./pages/Dashboard/Tourist/Profile/EditProfile";
import TrekDetails from "./pages/TrekDetails";
import BookingsPage from "./pages/Bookings";
import Support from "./pages/Support";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import TermsOfService from "./pages/Legal/TermsOfService";
import About from "./pages/About";
function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/Auth/Login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "admin") {
      return <Navigate to="/Dashboard/Admin" replace />;
    } else if (user.role === "guide") {
      return <Navigate to="/Dashboard/Guide" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  // Add EmailVerification to the array of paths where navbar and footer should be hidden
  const isLoginPage = [
    "/Auth/Login", 
    "/Auth/RegisterGuide",
    "/Auth/EmailVerification"  // Add this line
  ].includes(location.pathname);
  const isDashboardPage =
    location.pathname.includes("/Dashboard") ||
    location.pathname.includes("/admin/categories") ||
    location.pathname.includes("/admin/treks/service-management") ||
    location.pathname.includes("/admin/treks/highlights-management") ||
    location.pathname.includes("/admin/treks/add-trek") ||
    location.pathname.includes("/admin/treks/all-treks") ||
    location.pathname.includes("/guide/posts/my-posts") ||
    location.pathname.includes("/guide/profile/edit-profile") ||
    (location.pathname.includes("/admin/treks/") &&
      location.pathname.includes("/edit")) ||
    (location.pathname.includes("/admin/treks/") &&
      location.pathname.includes("/preview"));

  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch treks from the API
  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const response = await trekApi.getAllTreks();
        if (response.success) {
          setTreks(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTreks();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading treks...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>; // Show error message
  }

  return (
    <>
      {!isLoginPage && !isDashboardPage && <Navbar />}
      <div className="flex-grow">
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <TrekCardsSection /> 
                <AboutSection />
              </>
            }
          />

          {/* Auth Routes */}
          <Route path="/Auth/Login" element={<Login />} />
          <Route path="/Auth/RegisterGuide" element={<RegisterGuide />} />
          <Route path="/Auth/EmailVerification" element={<EmailVerification />} />

          {/* Dashboard Routes */}
          <Route
            path="Dashboard/Admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="Dashboard/Guide"
            element={
              <ProtectedRoute requiredRole="guide">
                <GuideDashboard />
              </ProtectedRoute>
            }
          />

          {/* Category Management Routes */}
          <Route
            path="admin/categories/all-categories"
            element={
              <ProtectedRoute requiredRole="admin">
                <AllCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/categories/add-category"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddCategory />
              </ProtectedRoute>
            }
          />

          {/* Service Management Route */}
          <Route
            path="admin/treks/service-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <ServiceManagement />
              </ProtectedRoute>
            }
          />

          {/* Highlights Management Route */}
          <Route
            path="admin/treks/highlights-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <HighlightsManagement />
              </ProtectedRoute>
            }
          />

          {/* Trek Management Routes */}
          <Route
            path="admin/treks/add-trek"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddTrek />
              </ProtectedRoute>
            }
          />

          {/* All Treks Route */}
          <Route
            path="admin/treks/all-treks"
            element={
              <ProtectedRoute requiredRole="admin">
                <AllTreks />
              </ProtectedRoute>
            }
          />

          {/* Guide Management Routes */}
          <Route
            path="admin/guides/all-guides"
            element={
              <ProtectedRoute requiredRole="admin">
                <AllGuides />
              </ProtectedRoute>
            }
          />

          {/* Trek Preview Route */}
          <Route
            path="admin/treks/:id/preview"
            element={
              <ProtectedRoute requiredRole="admin">
                <TrekPreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/treks/:id/edit"
            element={
              <ProtectedRoute requiredRole="admin">
                <EditTrek />
              </ProtectedRoute>
            }
          />

          {/* Wishlist Route */}
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Guide Profile Routes */}
          <Route path="/guide/:id" element={<GuideProfilePage />} />

          {/* Community Route */}
          <Route
            path="/community"
            element={
                <CommunityPage />
            }
          />

          <Route
            path="admin/reservations/all-reservations"
            element={
              <ProtectedRoute requiredRole="admin">
                <AllReservations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/guide/posts/my-posts"
            element={
              <ProtectedRoute requiredRole="guide">
                <GuidePosts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/guide/profile/edit-profile"
            element={
              <ProtectedRoute requiredRole="guide">
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/users/all-tourist"
            element={
              <ProtectedRoute requiredRole="admin">
                <AllTourists />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tourist/profile"
            element={
              <ProtectedRoute requiredRole="tourist">
                <TouristProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/treks/:id" element={<TrekDetails />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute requiredRole="tourist">
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />

          {/* Legal Routes */}
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </div>
      {!isLoginPage && !isDashboardPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
