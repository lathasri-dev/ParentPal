import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { User, Heart, Brain, Zap, Save } from 'lucide-react';

const ProfileForm = ({ onProfileCreated, profiles = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        interests: '',
        strengths: '',
        challenges: ''
    });
    const [loading, setLoading] = useState(false);

    // Check if name already exists as the user types
    const isDuplicate = profiles.some(p =>
        p.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
        formData.name.trim() !== ''
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Format list fields
        const payload = {
            ...formData,
            age: Number(formData.age),
            interests: formData.interests.split(',').map(s => s.trim()),
            strengths: formData.strengths.split(',').map(s => s.trim()),
            challenges: formData.challenges.split(',').map(s => s.trim()),
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/child`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.profile) {
                console.log("✅ Profile saved:", data.profile);
                onProfileCreated(data.profile);
                setFormData({ name: '', age: '', interests: '', strengths: '', challenges: '' });
                // No alert needed, saving is automated
            } else {
                console.error("❌ Save error:", data.error || "Unknown error");
                // Silently handle error as per user request to not show errors
            }
        } catch (err) {
            console.error("❌ Connection error:", err);
            // Silently handle
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-50">
            <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <User className="text-indigo-600" />
                Add Child Profile
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text" name="name" required
                            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${isDuplicate ? 'border-orange-400 bg-orange-50' : 'border-gray-300'}`}
                            value={formData.name} onChange={handleChange}
                            placeholder="e.g. Leo"
                        />
                        {isDuplicate && (
                            <p className="text-[10px] text-orange-600 font-bold mt-1 animate-pulse flex items-center gap-1">
                                🎯 Profile already present. Saving will update it.
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                            type="number" name="age" required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.age} onChange={handleChange}
                            placeholder="e.g. 5"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-500" /> Interests (comma separated)
                    </label>
                    <input
                        type="text" name="interests"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.interests} onChange={handleChange}
                        placeholder="e.g. Dinosaurs, Lego, Drawing"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" /> Strengths
                    </label>
                    <input
                        type="text" name="strengths"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.strengths} onChange={handleChange}
                        placeholder="e.g. Creative, Empathetic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Brain className="w-4 h-4 text-blue-500" /> Focus Areas / Challenges
                    </label>
                    <input
                        type="text" name="challenges"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.challenges} onChange={handleChange}
                        placeholder="e.g. Focus, Sharing"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
                </button>
            </form>
        </div>
    );
};

export default ProfileForm;
