import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import RequireAuth from './lib/RequireAuth';
import Layout from './components/Layout';
import MarketingLayout from './marketing/MarketingLayout';
import Landing from './pages/Landing';
import Blog from './marketing/Blog';
import BlogPost from './marketing/BlogPost';
import About from './marketing/About';
import Contact from './marketing/Contact';
import Careers from './marketing/Careers';
import Pricing from './marketing/Pricing';
import Privacy from './marketing/Privacy';
import Terms from './marketing/Terms';
import NotFound from './marketing/NotFound';
import Login from './marketing/Login';
import Signup from './marketing/Signup';
import CrmDashboard from './pages/CrmDashboard';
import VisitorHome from './pages/VisitorHome';
import BookingFlow from './pages/BookingFlow';
import SuccessPage from './pages/SuccessPage';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ---- Landing is self-contained (own nav + footer) ---- */}
          <Route path="/" element={<Landing />} />

          {/* ---- Other marketing pages (shared CloseCRM nav + footer) ---- */}
          <Route element={<MarketingLayout />}>
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          {/* ---- Auth ---- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ---- App (requires a logged-in user) ---- */}
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><CrmDashboard /></RequireAuth>} />

          {/* ---- Public Booking Page & Aliases ---- */}
          <Route path="/book/:uid/:slug" element={<BookingPage />} />
          <Route path="/booking/:uid/:slug" element={<BookingPage />} />
          <Route path="/book/:slug" element={<BookingPage />} />
          <Route path="/booking/:slug" element={<BookingPage />} />

          {/* ---- Legacy LinksMeet app ---- */}
          <Route path="/schedule" element={<Layout><VisitorHome /></Layout>} />
          <Route path="/book-legacy/:eventTypeId" element={<Layout><BookingFlow /></Layout>} />
          <Route path="/success" element={<Layout><SuccessPage /></Layout>} />
          <Route path="/admin" element={<Layout><Dashboard /></Layout>} />
          <Route path="/legacy" element={<Navigate to="/schedule" replace />} />

          {/* ---- Fallback NotFound ---- */}
          <Route element={<MarketingLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
