import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ProfileForm from '../components/parent/ProfileForm';
import ActivityGenerator from '../components/parent/ActivityGenerator';
import ActivityFeed from '../components/parent/ActivityFeed';
import { Users, BookOpen, LogOut, History, Trash2 } from 'lucide-react';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const [selectedChild, setSelectedChild] = useState(null);
    const [profiles, setProfiles] = useState([]);

    React.useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        console.log(`🔍 Fetching profiles from ${API_BASE_URL}/api/profiles...`);
        try {
            const res = await fetch(`${API_BASE_URL}/api/profiles`);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const data = await res.json();
            console.log("✅ Profiles Received:", data);
            if (res.ok) {
                setProfiles(data);
                if (data.length > 0) setSelectedChild(data[0]);
            }
        } catch (err) {
            console.error("❌ Error fetching profiles:", err);
        }
    };

    const handleProfileCreated = (updatedProfile) => {
        if (!updatedProfile || !updatedProfile._id) return;

        setProfiles(prev => {
            const currentProfiles = prev || [];
            // Check if profile already exists in the list (by ID or Name)
            const exists = currentProfiles.some(p =>
                p._id === updatedProfile._id ||
                (p.name && p.name.toLowerCase().trim() === updatedProfile.name?.toLowerCase().trim())
            );

            if (exists) {
                // Update in place (and move to top)
                const filtered = currentProfiles.filter(p =>
                    p._id !== updatedProfile._id &&
                    (p.name && p.name.toLowerCase().trim() !== updatedProfile.name?.toLowerCase().trim())
                );
                return [updatedProfile, ...filtered];
            }
            // Add as new
            return [updatedProfile, ...currentProfiles];
        });
        setSelectedChild(updatedProfile);
    };

    const handleDeleteProfile = async (id, e) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm("Are you sure you want to delete this profile?")) return;

        console.log(`🗑️ Attempting to delete profile: ${id}`);

        try {
            const res = await fetch(`${API_BASE_URL}/api/child/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok || data.success) {
                console.log("✅ Profile deleted successfully, updating UI...");
                setProfiles(prev => prev.filter(p => p._id !== id));
                setSelectedChild(prev => prev?._id === id ? null : prev);
            } else {
                console.error("❌ Delete failed:", data.message || data.error);
                alert(`Failed to delete: ${data.message || data.error || "Unknown error"}`);
            }
        } catch (err) {
            console.error("❌ Connection error during deletion:", err);
            alert("Connection error: Make sure the server is running.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Parent Dashboard</h1>
                    <p className="text-gray-500">Manage development and generate insights</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-500 font-medium transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:border-red-200"
                    >
                        <LogOut size={20} />
                        Exit
                    </button>
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        {/* Mock User Avatar */}
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">P</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Profiles */}
                <div className="space-y-6">
                    <ProfileForm onProfileCreated={handleProfileCreated} profiles={profiles} />

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users className="text-indigo-500" /> Your Children
                        </h3>
                        {profiles.length === 0 ? (
                            <p className="text-gray-400 italic text-sm">No profiles yet. Add one above.</p>
                        ) : (
                            <div className="space-y-3">
                                {profiles.map(child => (
                                    <div
                                        key={child._id}
                                        onClick={() => setSelectedChild(child)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col relative group ${selectedChild?._id === child._id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-700">{child.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">{child.age} yrs</span>
                                                <button
                                                    onClick={(e) => handleDeleteProfile(child._id, e)}
                                                    className="p-1 px-2 text-gray-400 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-transparent hover:border-red-600"
                                                    title="Delete Profile"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 truncate pr-6">
                                            {(child.interests || []).join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Tools */}
                <div className="lg:col-span-2">
                    {selectedChild ? (
                        <>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100 mb-6">
                                <h2 className="text-2xl font-bold text-indigo-900 mb-2">
                                    Focusing on <span className="text-indigo-600">{selectedChild.name}</span>
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedChild.strengths || []).map((s, i) => (
                                        <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">✨ {s}</span>
                                    ))}
                                    {(selectedChild.challenges || []).map((c, i) => (
                                        <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">🎯 {c}</span>
                                    ))}
                                </div>
                            </div>

                            <ActivityGenerator childId={selectedChild._id} />

                            <div className="mt-8">
                                <ActivityFeed childId={selectedChild._id} />
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-3xl p-12">
                            <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">Select or create a child profile to generate activities.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ParentDashboard;
