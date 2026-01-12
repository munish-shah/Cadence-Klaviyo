import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SegmentBuilder from './pages/SegmentBuilder';
import FlowStudio from './pages/FlowStudio';
import Analytics from './pages/Analytics';
import Campaigns from './pages/Campaigns';
import Profiles from './pages/Profiles';

// App Context for global state
const AppContext = createContext(null);

export function useApp() {
    return useContext(AppContext);
}

// Icons - clean, consistent stroke-based icons
const Icons = {
    Dashboard: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    ),
    Segment: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 1 9 9" />
            <circle cx="12" cy="12" r="4" />
        </svg>
    ),
    Flow: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="2" width="12" height="5" rx="1" />
            <rect x="6" y="17" width="12" height="5" rx="1" />
            <path d="M12 7v4" />
            <path d="M8 11h8" />
            <path d="M8 11v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" />
            <path d="M12 15v2" />
        </svg>
    ),
    Analytics: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 12l4-4 4 4 5-5" />
            <circle cx="20" cy="7" r="1.5" fill="currentColor" />
        </svg>
    ),
    Campaign: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            <path d="M3 7l9 6 9-6" />
        </svg>
    ),
    Profiles: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            <circle cx="17" cy="11" r="3" />
            <path d="M21 21v-1.5a3 3 0 0 0-3-3h-.5" />
        </svg>
    ),
    Settings: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    Help: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
        </svg>
    ),
    ChevronRight: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    ),
};

function Sidebar() {
    const location = useLocation();
    const { apiStatus } = useApp();

    const mainNavItems = [
        { path: '/', label: 'Dashboard', icon: <Icons.Dashboard /> },
        { path: '/segments', label: 'Segment Builder', icon: <Icons.Segment />, badge: 'AI' },
        { path: '/flows', label: 'Flow Studio', icon: <Icons.Flow /> },
        { path: '/analytics', label: 'Analytics', icon: <Icons.Analytics /> },
        { path: '/campaigns', label: 'Campaigns', icon: <Icons.Campaign /> },
        { path: '/profiles', label: 'Profiles', icon: <Icons.Profiles /> },
    ];

    const secondaryNavItems = [
        { path: '/settings', label: 'Settings', icon: <Icons.Settings /> },
        { path: '/help', label: 'Help & Docs', icon: <Icons.Help /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">C</div>
                <span className="sidebar-logo-text">Cadence</span>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-label">Platform</div>
                <nav className="sidebar-nav">
                    {mainNavItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-label">Support</div>
                <nav className="sidebar-nav">
                    {secondaryNavItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="sidebar-footer">
                <div className="api-status">
                    <span className={`status-indicator ${apiStatus?.demoMode ? 'demo' : 'connected'}`}></span>
                    <span className="status-text">
                        <strong>{apiStatus?.demoMode ? 'Demo Mode' : 'Connected'}</strong>
                        <br />
                        {apiStatus?.demoMode ? 'Using sample data' : 'Klaviyo API active'}
                    </span>
                </div>
            </div>
        </aside>
    );
}

// Placeholder pages for settings and help
function Settings() {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Configure your Cadence workspace and integrations.</p>
            </div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">API Configuration</h3>
                </div>
                <div className="input-group">
                    <label className="input-label">Klaviyo API Key</label>
                    <input type="password" className="input" placeholder="pk_••••••••••••••••" />
                </div>
                <div className="input-group">
                    <label className="input-label">OpenAI API Key (Optional)</label>
                    <input type="password" className="input" placeholder="sk-••••••••••••••••" />
                </div>
                <button className="btn btn-primary">Save Settings</button>
            </div>
        </div>
    );
}

function Help() {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Help & Documentation</h1>
                <p className="page-subtitle">Learn how to get the most out of Cadence.</p>
            </div>
            <div className="grid-2">
                <a href="https://developers.klaviyo.com/en/docs" target="_blank" rel="noopener noreferrer" className="card card-interactive" style={{ textDecoration: 'none' }}>
                    <h3 className="card-title mb-2">Klaviyo API Docs</h3>
                    <p className="text-muted text-sm">Official Klaviyo developer documentation for API reference and guides.</p>
                </a>
                <a href="https://help.klaviyo.com" target="_blank" rel="noopener noreferrer" className="card card-interactive" style={{ textDecoration: 'none' }}>
                    <h3 className="card-title mb-2">Klaviyo Help Center</h3>
                    <p className="text-muted text-sm">Comprehensive guides and tutorials for using Klaviyo effectively.</p>
                </a>
            </div>
        </div>
    );
}

function AppContent() {
    return (
        <>
            <Sidebar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/segments" element={<SegmentBuilder />} />
                    <Route path="/flows" element={<FlowStudio />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/profiles" element={<Profiles />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                </Routes>
            </main>
        </>
    );
}

function App() {
    const [apiStatus, setApiStatus] = useState({ status: 'checking', demoMode: true });

    useEffect(() => {
        fetch('/api/status')
            .then(res => res.json())
            .then(data => setApiStatus(data))
            .catch(() => setApiStatus({ status: 'error', demoMode: true }));
    }, []);

    return (
        <AppContext.Provider value={{ apiStatus }}>
            <Router>
                <div className="app-container">
                    <AppContent />
                </div>
            </Router>
        </AppContext.Provider>
    );
}

export default App;
