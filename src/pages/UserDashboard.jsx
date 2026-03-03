import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const [mocks, setMocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMocks();
    }, []);

    const fetchMocks = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mock`);
            if (res.ok) {
                const data = await res.json();
                setMocks(data);
            }
        } catch (err) {
            console.error('Failed to fetch mocks:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTestStatus = (mockId) => {
        if (!user || (!user.testsTaken && !user.roles)) return null;

        // Safety check just in case testsTaken isn't loaded correctly on pure login 
        // Usually we would fetch user profile details fresh on dashboard load
        const attempts = user.testsTaken?.filter(t => t.mockId === mockId) || [];

        if (attempts.length > 0) {
            // Get highest score attempt
            const best = attempts.reduce((prev, current) => (prev.score > current.score) ? prev : current);
            return { taken: true, bestScore: best.score };
        }
        return { taken: false };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full pt-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-action-blue)]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Available Mock Tests</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Select a test below to enter Focus Mode and begin.
                </p>
            </div>

            {mocks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No mock tests available</h3>
                    <p className="mt-1 text-sm text-gray-500">Check back later for new exams.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {mocks.map((mock) => {
                        const status = getTestStatus(mock._id);

                        return (
                            <div
                                key={mock._id}
                                className="bg-white overflow-hidden rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col h-full"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{mock.title}</h3>
                                        {status?.taken && (
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                                        {mock.description || 'No description provided for this mock test.'}
                                    </p>

                                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                                        <div className="flex items-center">
                                            <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                                            {mock.durationMinutes} mins
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium text-green-600">+{mock.positiveMarks}</span>
                                            <span className="mx-1">/</span>
                                            <span className="font-medium text-red-500">-{mock.negativeMarks}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 p-4 bg-gray-50 mt-auto">
                                    <button
                                        onClick={() => navigate(`/mock/${mock._id}`)}
                                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-action-blue)] hover:bg-[var(--color-action-blue-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-blue transition-colors"
                                    >
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        {status?.taken ? 'Retake Test' : 'Start Test'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
