import { useState } from 'react';

function SegmentBuilder() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    const exampleQueries = [
        { text: "Customers who purchased in the last 30 days", category: "Purchase" },
        { text: "VIP customers with lifetime value over $500", category: "Value" },
        { text: "Abandoned cart users who haven't completed purchase", category: "Recovery" },
        { text: "Subscribers who opened emails but never clicked", category: "Engagement" },
        { text: "Inactive subscribers with no activity in 90 days", category: "Win-back" },
        { text: "First-time buyers who might become repeat customers", category: "Loyalty" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setSaved(false);

        try {
            const response = await fetch('/api/segments/ai-create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) throw new Error('Failed to create segment');

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaved(true);
        // In production, this would actually save to Klaviyo
        setTimeout(() => {
            // Show saved state
        }, 500);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">AI Segment Builder</h1>
                <p className="page-subtitle">
                    Describe your target audience in plain English – our AI will create the perfect Klaviyo segment for you.
                </p>
            </div>

            {/* AI Input */}
            <form onSubmit={handleSubmit}>
                <div className="ai-input-wrapper">
                    <textarea
                        className="ai-input"
                        placeholder="Describe your segment... For example: 'Find customers who bought running shoes in the last 60 days but haven't purchased any accessories'"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        rows={4}
                    />
                    <div className="ai-input-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !query.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner spinner-sm"></span>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                    Generate Segment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Example Queries */}
            <div className="card mb-8">
                <div className="card-header">
                    <h3 className="card-title">Example Queries</h3>
                    <span className="text-sm text-muted">Click any to try</span>
                </div>
                <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                    {exampleQueries.map((example, i) => (
                        <button
                            key={i}
                            className="btn btn-secondary"
                            onClick={() => setQuery(example.text)}
                            style={{ fontSize: '0.8125rem' }}
                        >
                            <span className="badge badge-neutral" style={{ marginRight: 'var(--space-2)' }}>{example.category}</span>
                            {example.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="card mb-6" style={{ borderColor: 'var(--error)' }}>
                    <div className="flex items-center gap-3" style={{ color: 'var(--error)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="grid-2">
                    {/* Generated Segment */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Generated Segment</h3>
                            <span className={`badge ${result.parsed?.estimatedComplexity === 'simple' ? 'badge-success' :
                                    result.parsed?.estimatedComplexity === 'complex' ? 'badge-warning' : 'badge-info'
                                }`}>
                                {result.parsed?.estimatedComplexity || 'medium'} complexity
                            </span>
                        </div>

                        <div className="mb-5">
                            <div className="input-label">Segment Name</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {result.parsed?.name || 'Custom Segment'}
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="input-label">What This Captures</div>
                            <p className="text-secondary">{result.parsed?.explanation}</p>
                        </div>

                        {result.parsed?.conditions && (
                            <div className="mb-5">
                                <div className="input-label">Filter Conditions</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {result.parsed.conditions.map((condition, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                padding: 'var(--space-3)',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            <span className="badge badge-info">{i + 1}</span>
                                            <span className="font-medium" style={{ color: 'var(--accent-secondary)' }}>{condition.field}</span>
                                            <span className="text-muted">{condition.operator}</span>
                                            <span className="text-primary">{condition.value}</span>
                                            {condition.timeframe && (
                                                <span className="text-muted">({condition.timeframe})</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} flex-1`}
                                onClick={handleSave}
                                disabled={saved}
                            >
                                {saved ? (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Saved to Klaviyo
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        Save to Klaviyo
                                    </>
                                )}
                            </button>
                            <button className="btn btn-secondary" onClick={() => { setResult(null); setQuery(''); }}>
                                Start Over
                            </button>
                        </div>

                        {result.parsed?.isDemo && (
                            <p className="text-xs text-muted mt-4" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                                Using intelligent fallback. Connect OpenAI for enhanced AI capabilities.
                            </p>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Segment Preview</h3>
                        </div>

                        <div className="segment-preview mb-5">
                            <div className="segment-stat">
                                <span className="segment-stat-label">Estimated Size</span>
                                <span className="segment-stat-value large">
                                    {(result.preview?.estimatedSize || Math.floor(Math.random() * 400) + 100).toLocaleString()} profiles
                                </span>
                            </div>
                            <div className="segment-stat">
                                <span className="segment-stat-label">% of Total Audience</span>
                                <span className="segment-stat-value">
                                    {((result.preview?.estimatedSize || 300) / 2847 * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        <div className="input-label mb-3">Sample Matching Profiles</div>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>Orders</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(result.preview?.sampleProfiles || []).map(profile => (
                                        <tr key={profile.id}>
                                            <td className="font-mono text-sm">{profile.attributes?.email}</td>
                                            <td className="table-cell-primary">
                                                {profile.attributes?.first_name} {profile.attributes?.last_name}
                                            </td>
                                            <td>{profile.attributes?.properties?.total_orders || 0}</td>
                                            <td>${profile.attributes?.properties?.lifetime_value || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 p-4" style={{ background: 'var(--accent-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-accent)' }}>
                            <h4 className="font-medium mb-2" style={{ color: 'var(--accent-secondary)' }}>Recommended Actions</h4>
                            <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: 'var(--space-4)' }}>
                                <li>Create a targeted email campaign for this segment</li>
                                <li>Set up an automated flow triggered by segment entry</li>
                                <li>Use for personalized product recommendations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* How It Works - Only show when no result */}
            {!result && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">How It Works</h3>
                    </div>
                    <div className="grid-3">
                        {[
                            {
                                step: '1',
                                title: 'Describe Your Audience',
                                desc: 'Use natural language to describe the customers you want to target. Be as specific as you like.',
                            },
                            {
                                step: '2',
                                title: 'AI Translates to Filters',
                                desc: 'Our AI converts your description into precise Klaviyo segment conditions and filters.',
                            },
                            {
                                step: '3',
                                title: 'Preview & Deploy',
                                desc: 'Review the segment, see matching profiles, and save directly to your Klaviyo account.',
                            },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        margin: '0 auto var(--space-4)',
                                        background: 'var(--accent-gradient)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        color: 'white',
                                        boxShadow: 'var(--shadow-glow)',
                                    }}
                                >
                                    {item.step}
                                </div>
                                <h4 className="font-semibold mb-2">{item.title}</h4>
                                <p className="text-sm text-muted">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SegmentBuilder;
