import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { Lightbulb, Loader2, CheckCircle } from 'lucide-react';

const ActivityGenerator = ({ childId }) => {
    const [goal, setGoal] = useState('');
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contextUsed, setContextUsed] = useState([]);

    const handleGenerate = async () => {
        if (!childId) return alert("Please select a child first");

        setLoading(true);
        setActivities([]); // clear previous

        try {
            const res = await fetch(`${API_BASE_URL}/api/generate-activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ childId, specificGoal: goal })
            });
            if (!res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await res.json();
                    throw new Error(errorData.details || errorData.error || `Server Error: ${res.status}`);
                } else {
                    const text = await res.text();
                    throw new Error(`Server Error ${res.status}: ${text.substring(0, 50)}...`);
                }
            }
            const data = await res.json();

            if (data.activities) {
                setActivities(data.activities.activities || data.activities);
                setContextUsed(data.contextUsed || []);
            }
        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-50 mt-6">
            <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-500" />
                AI Activity Generator
            </h3>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Specific goal? (e.g. 'Improve patience', 'Learn counting')"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || !childId}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <SparklesIcon />} Generate
                </button>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {activities.map((act, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                        <h4 className="font-bold text-lg text-indigo-800 mb-1">{act.title}</h4>
                        <p className="text-gray-700 mb-2">{act.description}</p>
                        <div className="text-sm text-gray-500 flex gap-4">
                            <span className="font-semibold text-purple-600">Materials: {act.materials_needed}</span>
                            <span className="font-semibold text-green-600">Benefit: {act.educational_benefit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {contextUsed.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
                    <strong>AI Context Used (RAG):</strong>
                    <ul className="list-disc ml-4 mt-1">
                        {contextUsed.map((doc, i) => (
                            <li key={i}>{doc.text.substring(0, 100)}... <span className="italic">({doc.source})</span></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const SparklesIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
);

export default ActivityGenerator;
