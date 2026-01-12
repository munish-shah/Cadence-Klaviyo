import { useState, useEffect } from 'react';

function Profiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/profiles')
            .then(res => res.json())
            .then(data => {
                setProfiles(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error:', err);
                setLoading(false);
            });
    }, []);

    const filteredProfiles = profiles.filter(profile => {
        const email = profile.attributes?.email?.toLowerCase() || '';
        const name = `${profile.attributes?.first_name || ''} ${profile.attributes?.last_name || ''}`.toLowerCase();
        return email.includes(searchQuery.toLowerCase()) || name.includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span className="loading-text">Loading profiles...</span>
            </div>
        );
    }

    const getInitials = (profile) => {
        const first = profile.attributes?.first_name?.[0] || '';
        const last = profile.attributes?.last_name?.[0] || '';
        return (first + last).toUpperCase() || '?';
    };

    const getRandomColor = (id) => {
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6'];
        const index = id.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Profiles</h1>
                        <p className="page-subtitle">View and manage your customer profiles from Klaviyo.</p>
                    </div>
                    <div className="page-actions">
                        <button className="btn btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <path d="M17 8l-5-5-5 5" />
                                <path d="M12 3v12" />
                            </svg>
                            Export
                        </button>
                        <button className="btn btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card mb-6">
                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <div style={{ position: 'relative' }}>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                className="input"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>
                    </div>
                    <select className="input" style={{ width: 'auto', minWidth: '150px' }}>
                        <option value="">All Profiles</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="grid-2">
                {/* Profile List */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Customer List</h3>
                        <span className="badge badge-neutral">{filteredProfiles.length} profiles</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {filteredProfiles.map(profile => (
                            <div
                                key={profile.id}
                                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${selectedProfile?.id === profile.id ? 'bg-accent-subtle border border-accent-primary' : 'hover:bg-tertiary'}`}
                                style={{
                                    padding: 'var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    background: selectedProfile?.id === profile.id ? 'var(--accent-subtle)' : 'transparent',
                                    border: selectedProfile?.id === profile.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease-out',
                                }}
                                onClick={() => setSelectedProfile(profile)}
                                onMouseEnter={(e) => {
                                    if (selectedProfile?.id !== profile.id) {
                                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedProfile?.id !== profile.id) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 'var(--radius-full)',
                                        background: getRandomColor(profile.id),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.9375rem',
                                        color: 'white',
                                        flexShrink: 0,
                                    }}
                                >
                                    {getInitials(profile)}
                                </div>
                                <div className="flex-1" style={{ minWidth: 0 }}>
                                    <div className="font-medium text-primary truncate">
                                        {profile.attributes?.first_name} {profile.attributes?.last_name}
                                    </div>
                                    <div className="text-sm text-muted truncate">
                                        {profile.attributes?.email}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">
                                        {profile.attributes?.properties?.total_orders || 0} orders
                                    </div>
                                    <div className="text-xs text-muted">
                                        ${profile.attributes?.properties?.lifetime_value || 0}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profile Detail */}
                <div className="card">
                    {selectedProfile ? (
                        <>
                            <div className="flex items-start gap-5 mb-6" style={{ paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <div
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 'var(--radius-lg)',
                                        background: getRandomColor(selectedProfile.id),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '1.5rem',
                                        color: 'white',
                                        flexShrink: 0,
                                    }}
                                >
                                    {getInitials(selectedProfile)}
                                </div>
                                <div className="flex-1">
                                    <h2 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                        {selectedProfile.attributes?.first_name} {selectedProfile.attributes?.last_name}
                                    </h2>
                                    <p className="text-muted">{selectedProfile.attributes?.email}</p>
                                    <div className="flex gap-2 mt-3">
                                        <span className="badge badge-success">Active</span>
                                        <span className="badge badge-info">Subscribed</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2 mb-6" style={{ gap: 'var(--space-4)' }}>
                                <div className="segment-preview">
                                    <div className="segment-stat">
                                        <span className="segment-stat-label">Total Orders</span>
                                        <span className="segment-stat-value">{selectedProfile.attributes?.properties?.total_orders || 0}</span>
                                    </div>
                                    <div className="segment-stat">
                                        <span className="segment-stat-label">Lifetime Value</span>
                                        <span className="segment-stat-value">${selectedProfile.attributes?.properties?.lifetime_value || 0}</span>
                                    </div>
                                </div>
                                <div className="segment-preview">
                                    <div className="segment-stat">
                                        <span className="segment-stat-label">Avg. Order Value</span>
                                        <span className="segment-stat-value">
                                            ${selectedProfile.attributes?.properties?.total_orders > 0
                                                ? Math.round((selectedProfile.attributes?.properties?.lifetime_value || 0) / selectedProfile.attributes?.properties?.total_orders)
                                                : 0}
                                        </span>
                                    </div>
                                    <div className="segment-stat">
                                        <span className="segment-stat-label">Last Active</span>
                                        <span className="segment-stat-value">2 days ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-header" style={{ marginBottom: 'var(--space-4)' }}>
                                <h3 className="card-title">Recent Activity</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div className="flex items-center gap-3" style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--success-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                                            <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                                            <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Opened "Spring Sale" email</div>
                                        <div className="text-xs text-muted">2 hours ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3" style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                                            <path d="M9 9l5 12 1.774-5.226L21 14 9 9z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Clicked product link</div>
                                        <div className="text-xs text-muted">2 hours ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3" style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2">
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Placed Order #1234</div>
                                        <div className="text-xs text-muted">3 days ago</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button className="btn btn-secondary flex-1">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    Send Email
                                </button>
                                <button className="btn btn-secondary flex-1">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="9" cy="7" r="4" />
                                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                                <circle cx="17" cy="11" r="3" />
                                <path d="M21 21v-1.5a3 3 0 0 0-3-3h-.5" />
                            </svg>
                            <h3 className="empty-state-title">Select a profile</h3>
                            <p className="empty-state-desc">Click on a customer from the list to view their details and activity.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profiles;
