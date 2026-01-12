import { useState, useEffect } from 'react';

function FlowStudio() {
    const [flows, setFlows] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFlow, setActiveFlow] = useState(null);
    const [showBuilder, setShowBuilder] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [flowsRes, recsRes] = await Promise.all([
                    fetch('/api/flows'),
                    fetch('/api/flows/recommendations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                    })
                ]);

                const flowsData = await flowsRes.json();
                const recsData = await recsRes.json();

                setFlows(flowsData.data || []);
                setRecommendations(recsData.recommendations || []);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span className="loading-text">Loading flows...</span>
            </div>
        );
    }

    const demoFlow = {
        name: "Welcome Series",
        nodes: [
            { id: 1, type: 'trigger', title: 'List Trigger', desc: 'When someone subscribes to Newsletter' },
            { id: 2, type: 'action', title: 'Send Email', desc: 'Welcome email with 10% discount' },
            { id: 3, type: 'delay', title: 'Wait', desc: '2 days' },
            { id: 4, type: 'condition', title: 'Conditional Split', desc: 'Has made a purchase?' },
            { id: 5, type: 'action', title: 'Send Email', desc: 'Discount reminder (non-purchasers)' },
            { id: 6, type: 'action', title: 'Send Email', desc: 'Thank you + recommendations (purchasers)' },
        ]
    };

    const NodeIcon = ({ type }) => {
        switch (type) {
            case 'trigger':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                );
            case 'action':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <path d="M22 6l-10 7L2 6" />
                    </svg>
                );
            case 'delay':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                );
            case 'condition':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Flow Studio</h1>
                        <p className="page-subtitle">Design and manage automated marketing flows powered by AI recommendations.</p>
                    </div>
                    <div className="page-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowBuilder(true)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Create Flow
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    className={`btn ${!showBuilder ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowBuilder(false)}
                >
                    Existing Flows
                </button>
                <button
                    className={`btn ${showBuilder ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowBuilder(true)}
                >
                    Flow Builder
                </button>
            </div>

            {showBuilder ? (
                /* Flow Builder View */
                <div className="grid-2">
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Visual Flow Builder</h3>
                                <p className="card-subtitle">Drag and drop to build your automation</p>
                            </div>
                        </div>

                        <div className="flow-canvas">
                            <div className="flow-canvas-grid"></div>
                            <div className="flow-nodes">
                                {demoFlow.nodes.map((node, i) => (
                                    <div key={node.id}>
                                        <div className={`flow-node ${node.type}`}>
                                            <div className="flow-node-header">
                                                <div className="flow-node-icon">
                                                    <NodeIcon type={node.type} />
                                                </div>
                                                <div>
                                                    <div className="flow-node-title">{node.title}</div>
                                                    <div className="flow-node-desc">{node.desc}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {i < demoFlow.nodes.length - 1 && <div className="flow-connector"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button className="btn btn-primary flex-1">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                </svg>
                                Save Flow
                            </button>
                            <button className="btn btn-secondary">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                Activate
                            </button>
                        </div>
                    </div>

                    {/* Node Palette */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Add Nodes</h3>
                        </div>
                        <p className="text-sm text-muted mb-4">Click to add nodes to your flow</p>
                        <div className="flex flex-col gap-3">
                            {[
                                { type: 'trigger', title: 'Trigger', desc: 'Start the flow when an event occurs', color: 'var(--success)' },
                                { type: 'action', title: 'Send Email', desc: 'Send an email to the customer', color: 'var(--accent-secondary)' },
                                { type: 'delay', title: 'Time Delay', desc: 'Wait before the next step', color: 'var(--warning)' },
                                { type: 'condition', title: 'Conditional Split', desc: 'Branch based on conditions', color: '#f97316' },
                                { type: 'action', title: 'Send SMS', desc: 'Send a text message', color: 'var(--info)' },
                                { type: 'action', title: 'Update Profile', desc: 'Modify profile properties', color: '#ec4899' },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    className="flex items-center gap-3 p-3"
                                    style={{
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-default)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease-out',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 'var(--radius-md)',
                                            background: `${item.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: item.color,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <NodeIcon type={item.type} />
                                    </div>
                                    <div>
                                        <div className="font-medium">{item.title}</div>
                                        <div className="text-xs text-muted">{item.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Existing Flows + Recommendations */
                <div className="grid-2">
                    {/* Existing Flows */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Your Flows</h3>
                            <span className="badge badge-neutral">{flows.length} flows</span>
                        </div>
                        {flows.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {flows.map(flow => (
                                    <div
                                        key={flow.id}
                                        className="flex items-center gap-4 p-4"
                                        style={{
                                            background: activeFlow?.id === flow.id ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                                            border: activeFlow?.id === flow.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                                            borderRadius: 'var(--radius-lg)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease-out',
                                        }}
                                        onClick={() => setActiveFlow(flow)}
                                    >
                                        <div
                                            style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 'var(--radius-md)',
                                                background: flow.attributes?.status === 'live' ? 'var(--success-muted)' : 'var(--bg-elevated)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: flow.attributes?.status === 'live' ? 'var(--success)' : 'var(--text-muted)',
                                            }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="6" y="2" width="12" height="5" rx="1" />
                                                <rect x="6" y="17" width="12" height="5" rx="1" />
                                                <path d="M12 7v4M8 11h8M8 11v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2M12 15v2" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{flow.attributes?.name}</div>
                                            <div className="text-sm text-muted">{flow.attributes?.trigger_type || 'List trigger'}</div>
                                        </div>
                                        <span className={`badge ${flow.attributes?.status === 'live' ? 'badge-success' : 'badge-neutral'}`}>
                                            {flow.attributes?.status || 'draft'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="6" y="2" width="12" height="5" rx="1" />
                                    <rect x="6" y="17" width="12" height="5" rx="1" />
                                    <path d="M12 7v4M8 11h8" />
                                </svg>
                                <h3 className="empty-state-title">No flows yet</h3>
                                <p className="empty-state-desc">Create your first automation flow to get started.</p>
                            </div>
                        )}
                    </div>

                    {/* AI Recommendations */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">AI Recommendations</h3>
                                <p className="card-subtitle">Smart flow suggestions for your audience</p>
                            </div>
                            <span className="badge badge-info">AI</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {recommendations.map((rec, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: 'var(--space-5)',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--border-subtle)',
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold">{rec.name}</h4>
                                            <div className="text-sm text-muted">{rec.trigger}</div>
                                        </div>
                                        <span className={`badge ${rec.expectedImpact === 'high' ? 'badge-success' : 'badge-info'}`}>
                                            {rec.expectedImpact} impact
                                        </span>
                                    </div>
                                    <p className="text-sm text-secondary mb-4">{rec.description}</p>

                                    {rec.expectedRevenue && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                                                <path d="M12 18V6" />
                                            </svg>
                                            <span className="text-sm font-medium text-success">{rec.expectedRevenue} estimated</span>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <div className="text-xs text-muted mb-2">Flow Steps:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.steps?.slice(0, 3).map((step, j) => (
                                                <span
                                                    key={j}
                                                    className="text-xs"
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: 'var(--bg-secondary)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: 'var(--text-muted)',
                                                    }}
                                                >
                                                    {typeof step === 'string' ? step : step.description}
                                                </span>
                                            ))}
                                            {rec.steps?.length > 3 && (
                                                <span className="text-xs text-muted">+{rec.steps.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-secondary w-full"
                                        onClick={() => setShowBuilder(true)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        Use This Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FlowStudio;
