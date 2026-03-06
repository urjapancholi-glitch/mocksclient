import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Loader2, Plus, Edit2, Trash2, ArrowLeft, CheckCircle, Users } from 'lucide-react';

import { FolderTree } from 'lucide-react';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('mocks');
    const [mocks, setMocks] = useState([]);
    const [loadingMocks, setLoadingMocks] = useState(false);

    // Categories State
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'Main', parentId: '' });

    // User State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Create Mock State
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newMock, setNewMock] = useState({
        title: '',
        description: '',
        durationMinutes: 60,
        positiveMarks: 4,
        negativeMarks: 1,
        category: '',
        subCategory: '',
        instructions: [''],
        questions: []
    });

    const [newQuestion, setNewQuestion] = useState({
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        positiveMarks: '',
        negativeMarks: ''
    });

    useEffect(() => {
        if (activeTab === 'mocks' && !showCreate) fetchMocks();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'folders' || showCreate) fetchCategories();
    }, [activeTab, showCreate]);

    const fetchMocks = async () => {
        setLoadingMocks(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mock/admin`);
            if (res.ok) {
                setMocks(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMocks(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/admin/users`);
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`);
            if (res.ok) {
                setCategories(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!newCategory.name) return alert('Name is required');
        try {
            const url = newCategory._id
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/admin/${newCategory._id}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/admin`;
            const method = newCategory._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });

            if (res.ok) {
                setShowCreateCategory(false);
                setNewCategory({ name: '', type: 'Main', parentId: '' });
                fetchCategories();
            } else {
                alert('Failed to save category');
            }
        } catch (err) {
            alert('Server error saving category');
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this folder?')) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/admin/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCategories(categories.filter(c => c._id !== id));
            }
        } catch (err) { }
    };

    const deleteMock = async (id) => {
        if (!window.confirm('Are you sure you want to delete this mock?')) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mock/admin/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMocks(mocks.filter(m => m._id !== id));
            }
        } catch (err) { }
    };

    const handleAddQuestion = () => {
        if (!newQuestion.text || newQuestion.options.some(opt => !opt.trim())) {
            alert('Please fill out the question text and all 4 options.');
            return;
        }

        const questionToAdd = { ...newQuestion };
        if (questionToAdd.positiveMarks === '') delete questionToAdd.positiveMarks;
        if (questionToAdd.negativeMarks === '') delete questionToAdd.negativeMarks;

        setNewMock(prev => ({
            ...prev,
            questions: [...prev.questions, questionToAdd]
        }));

        // Reset question form
        setNewQuestion({
            text: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            explanation: '',
            positiveMarks: '',
            negativeMarks: ''
        });
    };

    const handleRemoveQuestion = (index) => {
        setNewMock(prev => {
            const updated = [...prev.questions];
            updated.splice(index, 1);
            return { ...prev, questions: updated };
        });
    };

    const handleEditMock = (selectedMock) => {
        // Create a deep copy to avoid direct state mutation issues if user cancels
        setNewMock(JSON.parse(JSON.stringify(selectedMock)));
        setShowCreate(true);
    };

    const handleSaveMock = async () => {
        if (!newMock.title) return alert('Title is required');
        if (newMock.questions.length === 0) return alert('At least 1 question is required');

        setCreating(true);
        try {
            const isEditing = !!newMock._id;
            const url = isEditing
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mock/admin/${newMock._id}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mock/admin`;
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMock)
            });

            if (res.ok) {
                setShowCreate(false);
                setNewMock({
                    title: '',
                    description: '',
                    durationMinutes: 60,
                    positiveMarks: 4,
                    negativeMarks: 1,
                    category: '',
                    subCategory: '',
                    instructions: [''],
                    questions: []
                });
                fetchMocks();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create mock');
            }
        } catch (err) {
            console.error(err);
            alert('Server error creating mock');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row flex-1 bg-gray-50 min-h-0">

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col flex-none">
                <div className="p-4 border-b border-gray-100 hidden md:block">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Administration</h2>
                </div>
                <nav className="p-4 space-y-2 flex-row md:flex-col flex overflow-x-auto">
                    <button
                        onClick={() => { setActiveTab('mocks'); setShowCreate(false); }}
                        className={`md:w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'mocks' ? 'bg-blue-50 text-action-blue' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FileText className="mr-3 h-5 w-5" />
                        Manage Mocks
                    </button>
                    <button
                        onClick={() => { setActiveTab('users'); setShowCreate(false); }}
                        className={`md:w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-blue-50 text-action-blue' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Users className="mr-3 h-5 w-5" />
                        Manage Users
                    </button>
                    <button
                        onClick={() => { setActiveTab('folders'); setShowCreate(false); setShowCreateCategory(false); }}
                        className={`md:w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'folders' ? 'bg-blue-50 text-action-blue' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FolderTree className="mr-3 h-5 w-5" />
                        Manage Folders
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <div className="max-w-5xl mx-auto">

                    {/* View: Users List */}
                    {activeTab === 'users' && !showCreate && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {loadingUsers ? (
                                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
                                ) : users.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">No users registered yet.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mocks Attempted</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score Details (Mock - Score)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {users.map((u) => (
                                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.testsTaken?.length || 0}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {u.testsTaken?.length > 0 ? (
                                                                <ul className="list-disc pl-4 space-y-1">
                                                                    {u.testsTaken.map((mockResult, idx) => (
                                                                        <li key={idx}>
                                                                            <span className="font-medium">{mockResult.mockId?.title || 'Unknown Mock'}</span> - Score: <span className="font-bold text-gray-800">{mockResult.score}</span> (C: {mockResult.correct}, I: {mockResult.incorrect}, U: {mockResult.unanswered})
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                'No mocks taken'
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: Categories List */}
                    {activeTab === 'folders' && !showCreateCategory && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center gap-4">
                                <h1 className="text-2xl font-bold text-gray-900">Manage Folders</h1>
                                <button
                                    onClick={() => {
                                        setNewCategory({ name: '', type: 'Main', parentId: '' });
                                        setShowCreateCategory(true);
                                    }}
                                    className="flex items-center px-4 py-2 bg-action-blue text-white rounded-lg text-sm font-medium hover:bg-action-blue-hover transition-colors"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Folder
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {loadingCategories ? (
                                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
                                ) : categories.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">No folders configured. Create one to get started.</div>
                                ) : (
                                    <div className="p-6 space-y-6">
                                        {categories.filter(c => c.type === 'Main').map(main => (
                                            <div key={main._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                                                        <FolderTree className="h-5 w-5 mr-2 text-action-blue" />
                                                        {main.name}
                                                    </h3>
                                                    <div className="space-x-4">
                                                        <button
                                                            onClick={() => {
                                                                setNewCategory({ ...main });
                                                                setShowCreateCategory(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        ><Edit2 className="h-4 w-4 inline" /></button>
                                                        <button onClick={() => deleteCategory(main._id)} className="text-red-600 hover:text-red-900 transition-colors"><Trash2 className="h-4 w-4 inline" /></button>
                                                    </div>
                                                </div>
                                                <div className="pl-6 space-y-2">
                                                    {categories.filter(sub => sub.type === 'Sub' && sub.parentId === main._id).map(sub => (
                                                        <div key={sub._id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-md">
                                                            <span className="font-medium text-gray-700">{sub.name}</span>
                                                            <div className="space-x-4">
                                                                <button
                                                                    onClick={() => {
                                                                        setNewCategory({ ...sub });
                                                                        setShowCreateCategory(true);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                ><Edit2 className="h-4 w-4 inline" /></button>
                                                                <button onClick={() => deleteCategory(sub._id)} className="text-red-600 hover:text-red-900 transition-colors"><Trash2 className="h-4 w-4 inline" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {categories.filter(sub => sub.type === 'Sub' && sub.parentId === main._id).length === 0 && (
                                                        <div className="text-sm text-gray-400 italic py-2">No subfolders added yet.</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: Create Category Form */}
                    {activeTab === 'folders' && showCreateCategory && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowCreateCategory(false)}
                                    className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{newCategory._id ? 'Edit Folder' : 'Create New Folder'}</h1>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4 max-w-xl">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Folder Name</label>
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm"
                                        placeholder="e.g. JAIIB Exam 2026"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Folder Level</label>
                                    <select
                                        value={newCategory.type}
                                        onChange={e => setNewCategory({ ...newCategory, type: e.target.value, parentId: e.target.value === 'Main' ? '' : newCategory.parentId })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm"
                                    >
                                        <option value="Main">Main Folder</option>
                                        <option value="Sub">Sub Folder</option>
                                    </select>
                                </div>
                                {newCategory.type === 'Sub' && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Parent Main Folder</label>
                                        <select
                                            value={newCategory.parentId}
                                            onChange={e => setNewCategory({ ...newCategory, parentId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm"
                                        >
                                            <option value="">Select Parent Folder</option>
                                            {categories.filter(c => c.type === 'Main').map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button
                                    onClick={handleSaveCategory}
                                    disabled={!newCategory.name || (newCategory.type === 'Sub' && !newCategory.parentId)}
                                    className="w-full mt-4 flex justify-center items-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    {newCategory._id ? 'Update Folder' : 'Save Folder'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View: Mock Tests List */}
                    {activeTab === 'mocks' && !showCreate && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h1 className="text-2xl font-bold text-gray-900">Mock Tests</h1>
                                <button
                                    onClick={() => {
                                        setNewMock({
                                            title: '',
                                            description: '',
                                            durationMinutes: 60,
                                            positiveMarks: 4,
                                            negativeMarks: 1,
                                            category: '',
                                            subCategory: '',
                                            instructions: [''],
                                            questions: []
                                        });
                                        setShowCreate(true);
                                    }}
                                    className="flex items-center px-4 py-2 bg-action-blue text-white rounded-lg text-sm font-medium hover:bg-action-blue-hover transition-colors"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Create New Mock
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {loadingMocks ? (
                                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
                                ) : mocks.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">No mock tests configured. Create one to get started.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marking Scheme</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {mocks.map((mock) => (
                                                    <tr key={mock._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mock.title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mock.questions?.length || 0}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mock.durationMinutes}m</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">+{mock.positiveMarks} / -{mock.negativeMarks}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-4">
                                                            <button onClick={() => handleEditMock(mock)} className="text-blue-600 hover:text-blue-900 transition-colors"><Edit2 className="h-4 w-4 inline" /></button>
                                                            <button onClick={() => deleteMock(mock._id)} className="text-red-600 hover:text-red-900 transition-colors"><Trash2 className="h-4 w-4 inline" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: Create Mock Form */}
                    {activeTab === 'mocks' && showCreate && (
                        <div className="space-y-6 pb-20">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{newMock._id ? 'Edit Mock' : 'Create New Mock'}</h1>
                                    <p className="text-sm text-gray-500">Define test parameters and add questions.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Left Column: Meta Details */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Test Details</h3>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Exam Title</label>
                                            <input
                                                type="text"
                                                value={newMock.title}
                                                onChange={e => setNewMock({ ...newMock, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm"
                                                placeholder="e.g., JEE Advanced Mock 1"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                value={newMock.description}
                                                onChange={e => setNewMock({ ...newMock, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm resize-none"
                                                rows="3"
                                                placeholder="Brief description of the exam syllabus..."
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Main Folder</label>
                                            <select
                                                value={newMock.category}
                                                onChange={e => setNewMock({ ...newMock, category: e.target.value, subCategory: '' })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm"
                                            >
                                                <option value="">Select Main Folder</option>
                                                {categories.filter(c => c.type === 'Main').map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Sub Folder</label>
                                            <select
                                                value={newMock.subCategory}
                                                onChange={e => setNewMock({ ...newMock, subCategory: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm"
                                                disabled={!newMock.category}
                                            >
                                                <option value="">Select Sub Folder</option>
                                                {categories.filter(c => c.type === 'Sub' && c.parentId === newMock.category).map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                                Instructions
                                                <button
                                                    onClick={() => setNewMock({ ...newMock, instructions: [...(newMock.instructions || []), ''] })}
                                                    className="text-action-blue hover:text-blue-800 text-xs flex items-center"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> Add Rule
                                                </button>
                                            </label>
                                            {(newMock.instructions || []).map((inst, idx) => (
                                                <div key={idx} className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={inst}
                                                        onChange={e => {
                                                            const upd = [...newMock.instructions];
                                                            upd[idx] = e.target.value;
                                                            setNewMock({ ...newMock, instructions: upd });
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm"
                                                        placeholder={`Instruction point ${idx + 1}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const upd = [...newMock.instructions];
                                                            upd.splice(idx, 1);
                                                            setNewMock({ ...newMock, instructions: upd });
                                                        }}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">Duration (mins)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={newMock.durationMinutes}
                                                    onChange={e => setNewMock({ ...newMock, durationMinutes: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-700">Default Positive Marks</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={newMock.positiveMarks}
                                                    onChange={e => setNewMock({ ...newMock, positiveMarks: e.target.value === '' ? 0 : Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none text-sm text-green-700"
                                                />
                                            </div>
                                            <div className="space-y-1 col-start-2">
                                                <label className="text-xs font-medium text-gray-700">Default Negative Marks</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={newMock.negativeMarks}
                                                    onChange={e => setNewMock({ ...newMock, negativeMarks: e.target.value === '' ? 0 : Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none text-sm text-red-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveMock}
                                        disabled={creating || !newMock.title}
                                        className="w-full flex justify-center items-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {creating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                                        {newMock._id ? 'Update Mock Test' : 'Publish Mock Test'}
                                    </button>
                                </div>

                                {/* Right Column: Questions Array */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h3 className="text-lg font-bold text-gray-800">Question Bank <span className="text-xs bg-action-blue text-white px-2 py-1 rounded-full ml-2">{newMock.questions.length}</span></h3>
                                        </div>

                                        {/* New Question Form */}
                                        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 space-y-4">
                                            <h4 className="text-sm font-bold text-action-blue flex items-center"><Plus className="h-4 w-4 mr-1" /> Add New Question</h4>

                                            <textarea
                                                value={newQuestion.text}
                                                onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm resize-y"
                                                placeholder="Enter the question text here..."
                                                rows="3"
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {newQuestion.options.map((opt, idx) => (
                                                    <div key={idx} className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            name="correctOption"
                                                            checked={newQuestion.correctOptionIndex === idx}
                                                            onChange={() => setNewQuestion({ ...newQuestion, correctOptionIndex: idx })}
                                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                            title="Mark as correct answer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={e => {
                                                                const newOpts = [...newQuestion.options];
                                                                newOpts[idx] = e.target.value;
                                                                setNewQuestion({ ...newQuestion, options: newOpts });
                                                            }}
                                                            className={`flex-1 px-3 py-2 border rounded-md outline-none text-sm transition-colors ${newQuestion.correctOptionIndex === idx ? 'border-green-400 bg-green-50' : 'border-gray-300 focus:border-action-blue'}`}
                                                            placeholder={`Option ${idx + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <textarea
                                                value={newQuestion.explanation || ''}
                                                onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                                className="w-full px-3 py-2 mt-2 border border-blue-200 rounded-lg focus:ring-action-blue focus:border-action-blue outline-none text-sm resize-y"
                                                placeholder="Explanation / Rationale for correct answer (shown after test ends)..."
                                                rows="2"
                                            />

                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-700">Specific Positive Marks (Optional)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={newQuestion.positiveMarks}
                                                        onChange={e => setNewQuestion({ ...newQuestion, positiveMarks: e.target.value === '' ? '' : Number(e.target.value) })}
                                                        placeholder={`Default: ${newMock.positiveMarks}`}
                                                        className="w-full px-3 py-2 border rounded-md outline-none text-sm border-gray-300 focus:border-green-500"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-700">Specific Negative Marks (Optional)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={newQuestion.negativeMarks}
                                                        onChange={e => setNewQuestion({ ...newQuestion, negativeMarks: e.target.value === '' ? '' : Number(e.target.value) })}
                                                        placeholder={`Default: ${newMock.negativeMarks}`}
                                                        className="w-full px-3 py-2 border rounded-md outline-none text-sm border-gray-300 focus:border-red-500"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAddQuestion}
                                                className="w-full py-2 bg-white border border-action-blue text-action-blue font-medium rounded-lg text-sm hover:bg-blue-100 transition-colors"
                                            >
                                                Save Question to Bank
                                            </button>
                                        </div>

                                        {/* Render Added Questions */}
                                        <div className="space-y-3">
                                            {newMock.questions.map((q, idx) => (
                                                <div key={idx} className="p-4 border border-gray-200 rounded-lg relative group bg-white hover:border-gray-300 transition-colors">
                                                    <button
                                                        onClick={() => handleRemoveQuestion(idx)}
                                                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <p className="text-sm font-medium text-gray-900 pr-8 mb-3"><span className="text-gray-400 mr-1">{idx + 1}.</span>{q.text}</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {q.options.map((opt, optIdx) => (
                                                            <div key={optIdx} className={`text-xs px-2 py-1.5 rounded border ${q.correctOptionIndex === optIdx ? 'bg-green-100 border-green-200 text-green-800 font-medium' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                                {optIdx + 1}) {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-gray-700">
                                                            <span className="font-semibold">Explanation:</span> {q.explanation}
                                                        </div>
                                                    )}
                                                    <div className="mt-2 text-xs flex gap-3 text-gray-500">
                                                        <span><span className="font-semibold">Marks:</span> +{q.positiveMarks ?? newMock.positiveMarks} / -{q.negativeMarks ?? newMock.negativeMarks}</span>
                                                        {(q.positiveMarks !== undefined || q.negativeMarks !== undefined) && (
                                                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Custom Marking</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {newMock.questions.length === 0 && (
                                                <p className="text-center text-sm text-gray-400 py-8 italic border-2 border-dashed border-gray-200 rounded-xl">
                                                    No questions added yet.
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
