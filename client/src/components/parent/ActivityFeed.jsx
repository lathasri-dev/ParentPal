import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { History, Clock, Info } from 'lucide-react';

const ActivityFeed = ({ childId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (childId) {
            fetchActivities();
            // Polling for real-time updates every 10 seconds
            const interval = setInterval(fetchActivities, 10000);
            return () => clearInterval(interval);
        }
    }, [childId]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/activity/${childId}`);
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'paint': return '🎨';
            case 'learn': return '📚';
            case 'story': return '📖';
            case 'chat': return '🦉';
            case 'game': return '🎮';
            case 'video': return '🎬';
            case 'rhyme': return '🎵';
            case 'system': return '⚙️';
            default: return '✨';
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <History className="text-indigo-500" /> Recent Activity
            </h3>

            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 italic">No activity recorded yet today.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity._id} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-indigo-100 transition-colors">
                            <div className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-gray-100">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-800">{activity.activityName}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium bg-white px-2 py-0.5 rounded-full border border-gray-100">
                                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
                <Info className="text-indigo-400 shrink-0" size={20} />
                <p className="text-xs text-indigo-700 leading-relaxed">
                    This feed updates automatically when your child uses Child Mode.
                </p>
            </div>
        </div>
    );
};

export default ActivityFeed;
