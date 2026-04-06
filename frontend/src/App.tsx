import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Bookings from './pages/Bookings';
import Tickets from './pages/Tickets';
import KanbanBoard from './pages/KanbanBoard';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import AdminBookings from './pages/AdminBookings';
import AdminTickets from './pages/AdminTickets';
import AdminAssets from './pages/AdminAssets';
import AdminUsers from './pages/AdminUsers';
import AdminPanel from './pages/AdminPanel';
import ResourceDetails from './pages/ResourceDetails';
import AuthCallback from './pages/AuthCallback';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import SupportLanding from './pages/SupportLanding';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<SupportLanding />} />
        <Route element={<Layout />}>
          {/* Routes accessible to everyone who is logged in */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetails />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Admin only routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/assets" element={<AdminAssets />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
