import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages to create next
import Login from './pages/Login';
import Dashboard from './pages/UserDashboard';
import MockInterface from './pages/focus/MockInterface';
import ResultSummary from './pages/focus/ResultSummary';
import AdminPanel from './pages/admin/AdminPanel';

// Protected Route Guard
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isAdmin } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (requireAdmin && !isAdmin()) return <Navigate to="/" replace />;

    return children;
};

// Layout wrapper for common UI
const Layout = ({ children }) => {
    const { user, logout, isAdmin } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <img src="/logo.png" alt="JAIIB Mocks 2026 Logo" className="h-8 w-auto object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                        JAIIB Mocks 2026 <span className="text-sm text-gray-500 font-normal hidden md:inline-block border-l border-gray-300 ml-2 pl-2">by knowwithhits</span>
                    </h1>
                </div>
                {user && (
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
                        <span className="text-sm text-gray-600 hidden sm:inline truncate max-w-[150px]">{user.email}</span>
                        {isAdmin() && (
                            <a href="/admin" className="text-sm font-medium text-action-blue hover:text-action-blue-hover">Admin</a>
                        )}
                        <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Logout</button>
                    </div>
                )}
            </header>
            <main className="flex-1 flex flex-col overflow-auto bg-[var(--color-bg-light)]">
                {children}
            </main>
        </div>
    );
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Layout><AdminPanel /></Layout></ProtectedRoute>} />

            {/* Focus Mode Routes do not use the standard layout to remove distractions */}
            <Route path="/mock/:id" element={<ProtectedRoute><MockInterface /></ProtectedRoute>} />
            <Route path="/mock/:id/result" element={<ProtectedRoute><ResultSummary /></ProtectedRoute>} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
