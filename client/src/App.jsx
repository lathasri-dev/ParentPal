import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';

import ParentDashboard from './pages/ParentDashboard';

// Placeholder components (will implement next)
import ChildPlayArea from './pages/ChildPlayArea';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/parent/*" element={<ParentDashboard />} />
                <Route path="/child-login" element={<Navigate to="/child-play" />} /> {/* Mock login for now */}
                <Route path="/child-play" element={<ChildPlayArea />} />
            </Routes>
        </Router>
    );
}

export default App;
