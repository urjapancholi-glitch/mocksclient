import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, KeyRound, Loader2, User as UserIcon } from 'lucide-react';

const Login = () => {
    // Shared state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // View state: 'login' | 'register' | 'verify'
    const [view, setView] = useState('login');

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // Reset messages when swapping views
    const switchView = (newView) => {
        setError('');
        setMsg('');
        setView(newView);
    };

    // --- 1. LOGIN FLOW ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!password || !cleanEmail) return;

        setLoading(true);
        setError('');
        setMsg('');

        try {
            const isAdmin = cleanEmail === 'admin@mocks.com' || cleanEmail === 'admin';
            const endpoint = isAdmin ? '/admin/login' : '/login';

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            login(data.user, data.token);
            if (isAdmin) navigate('/admin');
            else navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // --- 2. REGISTER FLOW (Request OTP) ---
    const handleRegisterRequest = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!name || !cleanEmail || !password) return;

        setLoading(true);
        setError('');
        setMsg('');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Move to OTP verification
            setMsg(data.message);
            setView('verify');
        } catch (err) {
            setError(err.message || 'Failed to request OTP');
        } finally {
            setLoading(false);
        }
    };

    // --- 3. VERIFY OTP FLOW (Finalize Registration) ---
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!otp || !cleanEmail || !name || !password) return;

        setLoading(true);
        setError('');
        setMsg('');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email: cleanEmail, password, otp })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            login(data.user, data.token);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)] p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6 transition-all duration-300">

                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-2">
                        <img src="/logo.png" alt="JAIIB Mocks 2026 Logo" className="h-20 w-auto object-contain drop-shadow-sm" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    </div>
                    <div className="inline-block bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 mb-2">
                        <h2 className="text-xl font-extrabold text-[#1a365d] tracking-tight">JAIIB Mocks 2026 <span className="text-sm text-action-blue font-semibold ml-1 pl-2 border-l-2 border-blue-200">by knowwithhits</span></h2>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-2">
                        {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Create Account' : 'Verify Email'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {view === 'login' && 'Enter your credentials to access your account'}
                        {view === 'register' && 'Fill in your details to get started'}
                        {view === 'verify' && `Enter the 6-digit code sent to ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {msg && !error && (
                    <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg text-center">
                        {msg}
                    </div>
                )}

                {/* --- LOGIN VIEW --- */}
                {view === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue sm:text-sm outline-none transition-colors"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    maxLength={50}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue sm:text-sm outline-none transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-action-blue)] hover:bg-[var(--color-action-blue-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-blue transition-colors disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-500">
                                Don't have an account?{' '}
                                <button type="button" onClick={() => switchView('register')} className="font-medium text-action-blue hover:underline">
                                    Register here
                                </button>
                            </p>
                        </div>
                    </form>
                )}

                {/* --- REGISTER VIEW --- */}
                {view === 'register' && (
                    <form onSubmit={handleRegisterRequest} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue sm:text-sm outline-none transition-colors"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue sm:text-sm outline-none transition-colors"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Create Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    maxLength={50}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue sm:text-sm outline-none transition-colors"
                                    placeholder="••••••••"
                                    required
                                    minLength={4}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !name || !email || password.length < 4}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-action-blue)] hover:bg-[var(--color-action-blue-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-blue transition-colors disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Request OTP'}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-500">
                                Already have an account?{' '}
                                <button type="button" onClick={() => switchView('login')} className="font-medium text-action-blue hover:underline">
                                    Login here
                                </button>
                            </p>
                        </div>
                    </form>
                )}

                {/* --- OTP VERIFICATION VIEW --- */}
                {view === 'verify' && (
                    <form onSubmit={handleVerifySubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">6-Digit OTP</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                                    maxLength={6}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue sm:text-sm outline-none transition-colors tracking-widest text-center font-mono"
                                    placeholder="••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-action-blue)] hover:bg-[var(--color-action-blue-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-blue transition-colors disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm Registration'}
                        </button>

                        <button
                            type="button"
                            onClick={() => switchView('register')}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
                        >
                            Go Back
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default Login;
