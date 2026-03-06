import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, Loader2 } from 'lucide-react';

const MockInterface = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [mock, setMock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
    const [flagged, setFlagged] = useState({}); // { questionIndex: boolean }
    const [currentIdx, setCurrentIdx] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        // Add scroll lock for Focus Mode
        document.body.classList.add('focus-mode-scroll-lock');
        return () => document.body.classList.remove('focus-mode-scroll-lock');
    }, []);

    useEffect(() => {
        const fetchMock = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mock/${id}`);
                if (!res.ok) throw new Error('Mock not found');
                const data = await res.json();
                setMock(data);
                setTimeLeft(data.durationMinutes * 60);
            } catch (err) {
                console.error(err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchMock();
    }, [id, navigate]);

    // Timer logic
    useEffect(() => {
        if (loading || timeLeft <= 0 || submitting || !hasStarted) return;

        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [loading, timeLeft, submitting, hasStarted]);

    const handleAutoSubmit = useCallback(async () => {
        // Wrapper for interval closure
        await submitTest();
    }, [answers, mock, user]);

    const submitTest = async () => {
        if (submitting || !mock) return;
        setSubmitting(true);

        try {
            // Format answers for backend
            const answersPayload = Object.keys(answers).map(idx => ({
                questionIndex: parseInt(idx),
                selectedOption: answers[idx]
            }));

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mock/${id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: answersPayload, userId: user._id || user.id })
            });

            const data = await res.json();
            if (res.ok) {
                navigate(`/mock/${id}/result`, { state: { result: data.result, mock } });
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Submission failed', err);
            alert('Failed to submit test. Please try again.');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getNavNodeColor = (idx) => {
        if (idx === currentIdx) return 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200';
        if (flagged[idx]) return 'bg-yellow-400 text-yellow-900 border-yellow-500';
        if (answers[idx] !== undefined) return 'bg-green-500 text-white border-green-600';
        return 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[var(--color-bg-light)]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-action-blue"></div>
            </div>
        );
    }

    if (!mock || !mock.questions || mock.questions.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-700">No questions available for this test.</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-action-blue hover:underline">Return to Dashboard</button>
            </div>
        );
    }

    if (!hasStarted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col md:overflow-hidden">
                <header className="flex-none bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex justify-center items-center shadow-sm">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain mr-3" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    <span className="text-xl font-bold text-gray-800 tracking-wider">knowwithhits</span>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
                    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-200 max-w-3xl w-full">
                        <div className="text-center mb-8">
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-action-blue text-xs font-bold uppercase tracking-wider mb-3">Pre-Test Instructions</span>
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{mock.title}</h1>
                            <p className="text-gray-500 mt-2">{mock.description}</p>
                        </div>

                        <div className="space-y-6 text-gray-700">
                            {mock.instructions && mock.instructions.filter(i => i.trim() !== '').length > 0 ? (
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <Flag className="h-5 w-5 mr-2 text-action-blue" /> Specific Exam Instructions
                                    </h3>
                                    <ul className="list-disc pl-5 space-y-3">
                                        {mock.instructions.filter(i => i.trim() !== '').map((inst, idx) => (
                                            <li key={idx} className="pl-1 leading-relaxed">{inst}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-center text-gray-500">
                                    <Flag className="h-5 w-5 mr-3 text-gray-400" />
                                    <p>No specific instructions provided for this exam. Please review the universal rules below.</p>
                                </div>
                            )}

                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                                    <AlertCircle className="h-5 w-5 mr-2 text-blue-600" /> Universal Exam Rules
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm flex items-start">
                                        <div className="bg-blue-100 p-2 rounded-md mr-3 text-action-blue"><Clock className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
                                            <p className="font-bold text-gray-900">{mock.durationMinutes} Minutes</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm flex items-start">
                                        <div className="bg-blue-100 p-2 rounded-md mr-3 text-action-blue"><CheckCircle className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Questions</p>
                                            <p className="font-bold text-gray-900">{mock.questions.length} Questions</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm flex items-start">
                                        <div className="bg-green-100 p-2 rounded-md mr-3 text-green-600">+</div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Correct Answer</p>
                                            <p className="font-bold text-green-700">+{mock.positiveMarks} Marks</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-red-50 shadow-sm flex items-start">
                                        <div className="bg-red-100 p-2 rounded-md mr-3 text-red-600">-</div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Incorrect Answer</p>
                                            <p className="font-bold text-red-700">-{mock.negativeMarks} Marks</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-blue-800 mt-4 px-2">
                                    <strong>Note:</strong> The timer begins immediately after you click the button below. Do not refresh the page during the exam.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => setHasStarted(true)}
                                className="w-full flex justify-center items-center py-4 px-4 bg-action-blue hover:bg-action-blue-hover text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-lg"
                            >
                                <PlayCircle className="h-6 w-6 mr-2" />
                                I am ready, Start Exam
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const question = mock.questions[currentIdx];

    return (
        <div className="min-h-screen md:h-screen flex flex-col bg-white md:overflow-hidden">
            {/* Sticky Top Header */}
            <header className="flex-none bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 z-10 shadow-sm">

                {/* Branding & Test Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Logo/Branding (Hidden on very small screens to save space) */}
                    <div className="hidden md:flex flex-col items-center justify-center pr-4 border-r border-gray-200">
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-1">knowwithhits</span>
                    </div>

                    <div className="text-center sm:text-left flex-1">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                            <span className="text-sm font-bold text-action-blue uppercase tracking-wider">JAIIB Mocks 2026</span>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">{mock.title}</h1>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Question {currentIdx + 1} of {mock.questions.length}</p>
                    </div>
                </div>

                {/* Timer */}
                <div className={`flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2 rounded-lg font-mono text-lg font-bold border ${timeLeft < 300 ? 'text-red-600 border-red-200 bg-red-50 animate-pulse' : 'text-gray-700 border-gray-200 bg-gray-50'}`}>
                    <Clock className="h-5 w-5" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </header>

            {/* Main Split Interface */}
            <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">

                {/* Left Column (75%) - Question Area */}
                <div className="w-full md:w-3/4 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 md:overflow-y-auto">
                    <div className="flex-1 p-4 sm:p-8 md:p-12 max-w-4xl mx-auto w-full">
                        <div className="flex justify-between items-start mb-8 gap-4">
                            <h2 className="text-2xl font-medium text-gray-900 leading-snug">
                                <span className="text-gray-400 mr-2">{currentIdx + 1}.</span>
                                {question.text}
                            </h2>
                            <div className="flex flex-col items-end shrink-0 mt-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-green-50 text-green-700 border border-green-200">
                                    +{question.positiveMarks ?? mock.positiveMarks} Marks
                                </span>
                                <span className="text-xs text-red-500 font-medium mt-1.5 px-1">
                                    -{question.negativeMarks ?? mock.negativeMarks} for wrong
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {question.options.map((opt, optIdx) => (
                                <label
                                    key={optIdx}
                                    className={`
                    block w-full text-left p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${answers[currentIdx] === optIdx
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    <div className="flex items-start">
                                        <div className="flex items-center h-6">
                                            <input
                                                type="radio"
                                                name={`question-${currentIdx}`}
                                                checked={answers[currentIdx] === optIdx}
                                                onChange={() => {
                                                    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
                                                }}
                                                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <span className={`text-lg ${answers[currentIdx] === optIdx ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                                                {opt}
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Fixed Footer within Question Area */}
                    <div className="flex-none bg-gray-50 border-t border-gray-200 p-4 px-4 sm:px-8 flex flex-wrap gap-4 sm:gap-0 justify-between items-center">
                        <div className="flex space-x-2 sm:space-x-4">
                            <button
                                onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
                                disabled={currentIdx === 0}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </button>

                            <button
                                onClick={() => setFlagged(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}
                                className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${flagged[currentIdx]
                                    ? 'border-yellow-400 bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
                                    : 'border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50'
                                    }`}
                            >
                                <Flag className={`h-4 w-4 mr-2 ${flagged[currentIdx] ? 'fill-current' : ''}`} />
                                {flagged[currentIdx] ? 'Unmark Review' : 'Mark for Review'}
                            </button>
                        </div>

                        {currentIdx < mock.questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentIdx(p => Math.min(mock.questions.length - 1, p + 1))}
                                className="flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-action-blue hover:bg-action-blue-hover focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        ) : (
                            <button
                                onClick={submitTest}
                                disabled={submitting}
                                className="flex items-center px-8 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                {submitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                                Submit Exam
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column (25%) - Navigation Palette */}
                <div className="w-full md:w-1/4 bg-gray-50 flex flex-col p-4 sm:p-6 md:overflow-y-auto">
                    <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-6">Question Palette</h3>

                    <div className="grid grid-cols-5 gap-3 mb-8">
                        {mock.questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIdx(idx)}
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border transition-all duration-200
                  ${getNavNodeColor(idx)}
                `}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto space-y-4">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Legend</h4>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-green-500 border border-green-600 mr-3"></div> Answered</div>
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-500 mr-3"></div> Marked for Review</div>
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-white border border-gray-300 mr-3"></div> Unvisited</div>
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-blue-600 border border-blue-600 ring-2 ring-blue-200 mr-3"></div> Current</div>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <button
                                onClick={submitTest}
                                disabled={submitting}
                                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors"
                            >
                                {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'End Exam'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MockInterface;
