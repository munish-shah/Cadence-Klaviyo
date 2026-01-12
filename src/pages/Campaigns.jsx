import { useState, useEffect } from 'react';

function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjectLineInput, setSubjectLineInput] = useState('');
    const [subjectLines, setSubjectLines] = useState(null);
    const [generatingSubjects, setGeneratingSubjects] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [analyzingCampaign, setAnalyzingCampaign] = useState(false);

    useEffect(() => {
        fetch('/api/campaigns')
            .then(res => res.json())
            .then(data => {
                setCampaigns(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error:', err);
                setLoading(false);
            });
    }, []);

    const generateSubjectLines = async () => {
        if (!subjectLineInput.trim()) return;

        setGeneratingSubjects(true);
        setSubjectLines(null);

        try {
            const response = await fetch('/api/ai/subject-lines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purpose: subjectLineInput,
                    audience: 'email subscribers',
                    message: subjectLineInput,
                }),
            });

            const data = await response.json();
            setSubjectLines(data.subjectLines || []);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setGeneratingSubjects(false);
        }
    };

    const analyzeCampaign = async (campaign) => {
        setSelectedCampaign(campaign);
        setAnalyzingCampaign(true);
        setAnalysis(null);

        try {
            const response = await fetch('/api/campaigns/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignData: campaign }),
            });

            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setAnalyzingCampaign(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span className="loading-text">Loading campaigns...</span>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Campaigns</h1>
                        <p className="page-subtitle">Manage your email campaigns and generate AI-powered subject lines.</p>
                    </div>
                    <div className="page-actions">
                        <button className="btn btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Create Campaign
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Subject Line Generator */}
            <div className="card mb-6">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">AI Subject Line Generator</h3>
                        <p className="card-subtitle">Generate high-converting subject lines for your campaigns</p>
                    </div>
                    <span className="badge badge-info">AI Powered</span>
                </div>

                <div className="flex gap-3 mb-5">
                    <input
                        type="text"
                        className="input flex-1"
                        placeholder="Describe your campaign (e.g., 'Spring sale with 25% off all shoes')"
                        value={subjectLineInput}
                        onChange={(e) => setSubjectLineInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && generateSubjectLines()}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={generateSubjectLines}
                        disabled={generatingSubjects || !subjectLineInput.trim()}
                    >
                        {generatingSubjects ? (
                            <>
                                <span className="spinner spinner-sm"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                                Generate
                            </>
                        )}
                    </button>
                </div>

                {subjectLines && (
                    <div>
                        <div className="text-sm font-medium mb-3">Generated Subject Lines</div>
                        <div className="flex flex-col gap-2">
                            {subjectLines.map((line, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4"
                                    style={{
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-subtle)',
                                    }}
                                >
                                    <div className="flex-1">
                                        <div className="font-medium mb-1">{line.text}</div>
                                        <div className="flex items-center gap-3">
                                            <span className={`badge ${line.style === 'urgency' ? 'badge-error' :
                                                    line.style === 'curiosity' ? 'badge-warning' :
                                                        line.style === 'benefit' ? 'badge-success' :
                                                            line.style === 'personalization' ? 'badge-info' :
                                                                'badge-neutral'
                                                }`}>
                                                {line.style}
                                            </span>
                                            <span className="text-sm text-muted">
                                                Predicted open rate:
                                                <span className={`ml-1 font-medium ${line.predictedOpenRate === 'high' ? 'text-success' :
                                                        line.predictedOpenRate === 'medium' ? 'text-warning' :
                                                            'text-muted'
                                                    }`}>
                                                    {line.predictedOpenRate}
                                                </span>
                                            </span>
                                        </div>
                                        {line.reasoning && (
                                            <div className="text-xs text-muted mt-2">{line.reasoning}</div>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => copyToClipboard(line.text)}
                                        title="Copy to clipboard"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid-2">
                {/* Campaign List */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Campaigns</h3>
                        <span className="badge badge-neutral">{campaigns.length} campaigns</span>
                    </div>

                    {campaigns.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Campaign</th>
                                        <th>Status</th>
                                        <th>Open Rate</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map(campaign => (
                                        <tr key={campaign.id}>
                                            <td>
                                                <div className="table-cell-primary">{campaign.attributes?.name}</div>
                                                <div className="text-xs text-muted">
                                                    {campaign.attributes?.send_time
                                                        ? new Date(campaign.attributes.send_time).toLocaleDateString()
                                                        : 'Not scheduled'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${campaign.attributes?.status === 'sent' ? 'badge-success' :
                                                        campaign.attributes?.status === 'draft' ? 'badge-neutral' :
                                                            'badge-warning'
                                                    }`}>
                                                    {campaign.attributes?.status}
                                                </span>
                                            </td>
                                            <td>
                                                {campaign.attributes?.stats?.open_rate
                                                    ? `${(campaign.attributes.stats.open_rate * 100).toFixed(1)}%`
                                                    : '—'}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => analyzeCampaign(campaign)}
                                                >
                                                    Analyze
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <path d="M22 6l-10 7L2 6" />
                            </svg>
                            <h3 className="empty-state-title">No campaigns yet</h3>
                            <p className="empty-state-desc">Create your first campaign to get started.</p>
                        </div>
                    )}
                </div>

                {/* Campaign Analysis */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Campaign Analysis</h3>
                        <span className="badge badge-info">AI Powered</span>
                    </div>

                    {analyzingCampaign ? (
                        <div className="loading" style={{ padding: 'var(--space-8)' }}>
                            <div className="spinner"></div>
                            <span className="loading-text">Analyzing campaign...</span>
                        </div>
                    ) : analysis ? (
                        <div>
                            <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <div
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 'var(--radius-lg)',
                                        background: `linear-gradient(135deg, ${analysis.overallScore >= 80 ? 'var(--success)' :
                                                analysis.overallScore >= 60 ? 'var(--warning)' :
                                                    'var(--error)'
                                            } 0%, ${analysis.overallScore >= 80 ? '#16a34a' :
                                                analysis.overallScore >= 60 ? '#ca8a04' :
                                                    '#dc2626'
                                            } 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        color: 'white',
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{analysis.overallScore}</span>
                                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 600 }}>Score</span>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">{selectedCampaign?.attributes?.name}</div>
                                    <div className="text-muted">Grade: <span className="font-bold">{analysis.grade || 'B+'}</span></div>
                                </div>
                            </div>

                            <div className="mb-5">
                                <div className="text-sm font-medium mb-3">Insights</div>
                                <div className="flex flex-col gap-3">
                                    {analysis.insights?.map((insight, i) => (
                                        <div
                                            key={i}
                                            className="p-3"
                                            style={{
                                                background: insight.type === 'positive' ? 'var(--success-muted)' :
                                                    insight.type === 'negative' ? 'var(--error-muted)' :
                                                        'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius-md)',
                                                borderLeft: `3px solid ${insight.type === 'positive' ? 'var(--success)' :
                                                        insight.type === 'negative' ? 'var(--error)' :
                                                            'var(--warning)'
                                                    }`,
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm">{insight.metric}</span>
                                                <span className="text-sm">{insight.value}</span>
                                            </div>
                                            <p className="text-sm text-muted mb-2">{insight.message}</p>
                                            <p className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                                                Recommendation: {insight.recommendation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <div className="text-sm font-medium mb-2">Summary</div>
                                <p className="text-sm text-secondary">{analysis.summary}</p>
                            </div>

                            {analysis.nextSteps && (
                                <div className="mt-5">
                                    <div className="text-sm font-medium mb-2">Next Steps</div>
                                    <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: 'var(--space-4)' }}>
                                        {analysis.nextSteps.map((step, i) => (
                                            <li key={i} className="mb-1">{step}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 3v18h18" />
                                <path d="M7 12l4-4 4 4 5-5" />
                            </svg>
                            <h3 className="empty-state-title">Select a campaign</h3>
                            <p className="empty-state-desc">Click "Analyze" on any campaign to get AI-powered insights.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Performers */}
            <div className="card mt-6">
                <div className="card-header">
                    <h3 className="card-title">Top Performing Campaigns</h3>
                    <p className="card-subtitle">Your best campaigns by open rate</p>
                </div>
                <div className="grid-3">
                    {campaigns
                        .filter(c => c.attributes?.stats?.open_rate)
                        .sort((a, b) => (b.attributes?.stats?.open_rate || 0) - (a.attributes?.stats?.open_rate || 0))
                        .slice(0, 3)
                        .map((campaign, i) => (
                            <div
                                key={campaign.id}
                                className="p-5"
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: i === 0 ? '2px solid var(--success)' : '1px solid var(--border-subtle)',
                                }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    {i === 0 && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    )}
                                    <span className="badge badge-neutral">#{i + 1}</span>
                                </div>
                                <h4 className="font-semibold mb-2">{campaign.attributes?.name}</h4>
                                <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
                                    <div>
                                        <div className="text-xs text-muted">Open Rate</div>
                                        <div className="text-lg font-bold text-success">
                                            {(campaign.attributes?.stats?.open_rate * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted">Revenue</div>
                                        <div className="text-lg font-bold">
                                            ${(campaign.attributes?.stats?.revenue || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default Campaigns;
