import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, Clock, CheckCircle, AlertCircle, Folder, ChevronRight, ArrowLeft, Link as LinkIcon, FileText } from 'lucide-react';

const Dashboard = () => {
    const [mocks, setMocks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Navigation State
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const [showImportantQuestions, setShowImportantQuestions] = useState(false);
    const [importantQuestions, setImportantQuestions] = useState([]);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([fetchMocks(), fetchCategories(), fetchImportantQuestions()]).finally(() => setLoading(false));
    }, []);

    const fetchMocks = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mock`);
            if (res.ok) setMocks(await res.json());
        } catch (err) {
            console.error('Failed to fetch mocks:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`);
            if (res.ok) setCategories(await res.json());
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchImportantQuestions = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/important-questions`);
            if (res.ok) setImportantQuestions(await res.json());
        } catch (err) {
            console.error('Failed to fetch important questions:', err);
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

    const mainFolders = categories.filter(c => c.type === 'Main');
    const subFolders = selectedCategoryId ? categories.filter(c => c.type === 'Sub' && c.parentId === selectedCategoryId) : [];
    const displayedMocks = selectedSubCategoryId
        ? mocks.filter(m => m.subCategory === selectedSubCategoryId)
        : mocks.filter(m => !m.category); // Show uncategorized if at root

    const handleBack = () => {
        if (showImportantQuestions) {
            setShowImportantQuestions(false);
        } else if (selectedSubCategoryId) {
            setSelectedSubCategoryId(null);
        } else if (selectedCategoryId) {
            setSelectedCategoryId(null);
        }
    };

    const currentMainFolder = categories.find(c => c._id === selectedCategoryId);
    const currentSubFolder = categories.find(c => c._id === selectedSubCategoryId);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center text-sm text-gray-500 mb-4 h-6">
                    {(selectedCategoryId || selectedSubCategoryId) && (
                        <button
                            onClick={handleBack}
                            className="flex items-center text-action-blue hover:underline mr-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </button>
                    )}

                    <span
                        className={`cursor-pointer ${(!selectedCategoryId && !showImportantQuestions) ? 'font-bold text-gray-900' : 'hover:text-action-blue'}`}
                        onClick={() => { setSelectedCategoryId(null); setSelectedSubCategoryId(null); setShowImportantQuestions(false); }}
                    >
                        Home
                    </span>

                    {currentMainFolder && (
                        <>
                            <ChevronRight className="h-4 w-4 mx-2" />
                            <span
                                className={`cursor-pointer ${!selectedSubCategoryId ? 'font-bold text-gray-900' : 'hover:text-action-blue'}`}
                                onClick={() => setSelectedSubCategoryId(null)}
                            >
                                {currentMainFolder.name}
                            </span>
                        </>
                    )}

                    {currentSubFolder && (
                        <>
                            <ChevronRight className="h-4 w-4 mx-2" />
                            <span className="font-bold text-gray-900">
                                {currentSubFolder.name}
                            </span>
                        </>
                    )}

                    {showImportantQuestions && (
                        <>
                            <ChevronRight className="h-4 w-4 mx-2" />
                            <span className="font-bold text-gray-900">
                                Important Questions
                            </span>
                        </>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                    {!selectedCategoryId && !showImportantQuestions ? 'Exam Categories'
                        : showImportantQuestions ? 'Most Important Questions JAIIB/DBF 2026'
                            : !selectedSubCategoryId ? `${currentMainFolder?.name} Subcategories`
                                : `${currentSubFolder?.name} Tests`}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    {!selectedCategoryId && !showImportantQuestions ? 'Select an exam category to browse available mock tests.'
                        : showImportantQuestions ? 'Click on the titles below to view the linked PDF files.'
                            : 'Select a test below to enter Focus Mode and begin.'}
                </p>
            </div>

            {/* Folder Grid View */}
            {!selectedSubCategoryId && !showImportantQuestions && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
                    {!selectedCategoryId && mainFolders.map(folder => (
                        <div
                            key={folder._id}
                            onClick={() => setSelectedCategoryId(folder._id)}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-action-blue hover:shadow-md transition-all duration-200 cursor-pointer flex items-center shadow-sm group"
                        >
                            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-action-blue group-hover:text-white transition-colors text-action-blue">
                                <Folder className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-action-blue transition-colors line-clamp-2">{folder.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{categories.filter(c => c.parentId === folder._id).length} Subfolders</p>
                            </div>
                        </div>
                    ))}

                    {!selectedCategoryId && (
                        <div
                            onClick={() => setShowImportantQuestions(true)}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-action-blue hover:shadow-md transition-all duration-200 cursor-pointer flex items-center shadow-sm group"
                        >
                            <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center mr-4 group-hover:bg-yellow-500 group-hover:text-white transition-colors text-yellow-600">
                                <LinkIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2">Most Important Questions JAIIB/DBF 2026</h3>
                                <p className="text-xs text-gray-500 mt-1">{importantQuestions.length} Links</p>
                            </div>
                        </div>
                    )}

                    {selectedCategoryId && !selectedSubCategoryId && subFolders.map(folder => (
                        <div
                            key={folder._id}
                            onClick={() => setSelectedSubCategoryId(folder._id)}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-action-blue hover:shadow-md transition-all duration-200 cursor-pointer flex items-center shadow-sm group"
                        >
                            <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
                                <Folder className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{folder.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{mocks.filter(m => m.subCategory === folder._id).length} Tests</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Important Questions Detail View */}
            {showImportantQuestions && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    {importantQuestions.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <LinkIcon className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions added yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Check back later for important study material.</p>
                        </div>
                    ) : (
                        importantQuestions.map(q => (
                            <a
                                key={q._id}
                                href={q.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-action-blue hover:shadow-md transition-all duration-200 flex items-center shadow-sm group"
                            >
                                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center mr-3 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-action-blue transition-colors line-clamp-2">{q.title}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Click to view PDF</p>
                                </div>
                            </a>
                        ))
                    )}
                </div>
            )}

            {/* Empty States for Folders */}
            {!selectedCategoryId && !showImportantQuestions && mainFolders.length === 0 && displayedMocks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Folder className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No content available</h3>
                    <p className="mt-1 text-sm text-gray-500">Check back later for new exams.</p>
                </div>
            )}

            {selectedCategoryId && !selectedSubCategoryId && subFolders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Folder className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No subcategories found</h3>
                    <p className="mt-1 text-sm text-gray-500">This main folder is currently empty.</p>
                </div>
            )}

            {/* Mocks Grid View */}
            {!showImportantQuestions && (selectedSubCategoryId || (!selectedCategoryId && displayedMocks.length > 0)) && (
                <>
                    {displayedMocks.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No mock tests available</h3>
                            <p className="mt-1 text-sm text-gray-500">Check back later for new exams in this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {displayedMocks.map((mock) => {
                                const status = getTestStatus(mock._id);

                                return (
                                    <div
                                        key={mock._id}
                                        className="bg-white overflow-hidden rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col h-full group"
                                    >
                                        <div className="p-6 flex-1">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-action-blue transition-colors">{mock.title}</h3>
                                                {status?.taken && (
                                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Done
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
                                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-action-blue hover:bg-action-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-blue transition-all duration-200 transform group-hover:scale-[1.02]"
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
                </>
            )}
        </div>
    );
};

export default Dashboard;
