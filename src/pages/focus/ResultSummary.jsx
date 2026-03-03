import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle, Trophy } from 'lucide-react';

const ResultSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const result = location.state?.result;
    const mock = location.state?.mock;

    if (!result || !mock) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-700">No result data available.</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-action-blue hover:underline">Return to Dashboard</button>
            </div>
        );
    }

    const data = [
        { name: 'Correct', value: result.correct, color: '#10B981' }, // Green
        { name: 'Incorrect', value: result.incorrect, color: '#EF4444' }, // Red
        { name: 'Unanswered', value: result.unanswered, color: '#9CA3AF' }, // Gray
    ];

    const maxScore = result.totalQuestions * result.positiveMarks;
    const percentage = maxScore > 0 ? ((result.score / maxScore) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Test Results</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-blue-50 to-white">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-800">{mock.title}</h2>
                            <p className="text-gray-500 mt-1">Completed successfully.</p>
                        </div>

                        <div className="text-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-w-[200px]">
                            <div className="flex items-center justify-center text-action-blue mb-2">
                                <Trophy className="h-8 w-8" />
                            </div>
                            <div className="text-4xl font-extrabold text-gray-900">
                                {result.score} <span className="text-lg text-gray-400 font-medium">/ {maxScore}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-500 mt-1">
                                {percentage}% Score Rating
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [`${value} Questions`, 'Count']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex flex-col justify-center space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-start">
                                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-2xl font-bold text-green-700">{result.correct}</div>
                                        <div className="text-sm font-medium text-green-600">Correct</div>
                                        <div className="text-xs text-green-500 mt-1">+{result.positiveMarks} points each</div>
                                    </div>
                                </div>

                                <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-start">
                                    <XCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-2xl font-bold text-red-700">{result.incorrect}</div>
                                        <div className="text-sm font-medium text-red-600">Incorrect</div>
                                        <div className="text-xs text-red-500 mt-1">-{result.negativeMarks} points each</div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200 flex items-start col-span-2">
                                    <MinusCircle className="h-6 w-6 text-gray-500 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-2xl font-bold text-gray-700">{result.unanswered}</div>
                                        <div className="text-sm font-medium text-gray-600">Unanswered / Skipped</div>
                                        <div className="text-xs text-gray-500 mt-1">0 points applied</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Detailed Results Section */}
                {result.detailedResults && result.detailedResults.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                        <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-2xl font-bold text-gray-800">Detailed Analysis</h2>
                            <p className="text-gray-500 mt-1">Review your answers and learn from the explanations.</p>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {result.detailedResults.map((q, idx) => {
                                const isCorrect = q.userSelectedOption === q.correctOptionIndex;
                                const isUnanswered = q.userSelectedOption === null;

                                return (
                                    <div key={idx} className="p-6 md:p-10">
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="font-bold text-gray-400 min-w-8">Q{idx + 1}.</span>
                                            <div className="text-gray-900 font-medium text-lg flex-1">
                                                {q.questionText}
                                            </div>
                                            <div className="flex-none">
                                                {isCorrect ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Correct</span>
                                                ) : isUnanswered ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unanswered</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Incorrect</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pl-11 pr-4 space-y-3">
                                            {q.options.map((opt, optIdx) => {
                                                const isUserChoice = q.userSelectedOption === optIdx;
                                                const isCorrectOption = q.correctOptionIndex === optIdx;

                                                let style = "border-gray-200 bg-white text-gray-700";
                                                let icon = null;

                                                if (isCorrectOption) {
                                                    style = "border-green-500 bg-green-50 text-green-900 font-medium";
                                                    icon = <CheckCircle className="h-5 w-5 text-green-500 flex-none bg-white rounded-full" />;
                                                } else if (isUserChoice && !isCorrectOption) {
                                                    style = "border-red-300 bg-red-50 text-red-800";
                                                    icon = <XCircle className="h-5 w-5 text-red-500 flex-none bg-white rounded-full" />;
                                                }

                                                return (
                                                    <div key={optIdx} className={`p-4 border rounded-xl flex items-center justify-between ${style}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-6 w-6 rounded-full border border-current flex items-center justify-center text-xs opacity-50">
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </div>
                                                            <span>{opt}</span>
                                                        </div>
                                                        {icon && <span>{icon}</span>}
                                                    </div>
                                                );
                                            })}

                                            {/* Explanation block */}
                                            {q.explanation && (
                                                <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                                                    <span className="font-bold text-action-blue uppercase tracking-wider text-xs mb-2 block">Explanation</span>
                                                    <p className="text-gray-800">{q.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResultSummary;
