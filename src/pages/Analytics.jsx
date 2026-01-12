import { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Analytics() {
    const [data, setData] = useState(null);
    const [sendTimeData, setSendTimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState('opens');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, sendTimeRes] = await Promise.all([
                    fetch('/api/analytics/dashboard'),
                    fetch('/api/analytics/send-time', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                    })
                ]);

                const analytics = await analyticsRes.json();
                const sendTime = await sendTimeRes.json();

                setData(analytics);
                setSendTimeData(sendTime);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const heatmapColors = useMemo(() => {
        if (!sendTimeData?.hourlyProbabilities) return [];
        return sendTimeData.hourlyProbabilities.map(val => {
            const hue = val > 0.7 ? 142 : val > 0.4 ? 45 : 0;
            const saturation = 70;
            const lightness = 20 + (val * 30);
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
    }, [sendTimeData]);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span className="loading-text">Loading analytics...</span>
            </div>
        );
    }

    const engagementTrend = data?.engagementTrend || [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 18, 0.95)',
                titleColor: '#fafafa',
                bodyColor: '#a1a1aa',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.04)' },
                ticks: { color: '#71717a', font: { size: 11 } },
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.04)' },
                ticks: { color: '#71717a', font: { size: 11 } },
            },
        },
    };

    const engagementChartData = {
        labels: engagementTrend.map(d => `Mar ${d.date.split('-')[2]}`),
        datasets: [
            {
                label: 'Opens',
                data: engagementTrend.map(d => d.opens),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: selectedMetric === 'opens',
                tension: 0.4,
                pointRadius: selectedMetric === 'opens' ? 4 : 0,
                borderWidth: selectedMetric === 'opens' ? 2.5 : 1.5,
                hidden: selectedMetric !== 'opens',
            },
            {
                label: 'Clicks',
                data: engagementTrend.map(d => d.clicks),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: selectedMetric === 'clicks',
                tension: 0.4,
                pointRadius: selectedMetric === 'clicks' ? 4 : 0,
                borderWidth: selectedMetric === 'clicks' ? 2.5 : 1.5,
                hidden: selectedMetric !== 'clicks',
            },
            {
                label: 'Conversions',
                data: engagementTrend.map(d => Math.floor(d.clicks * 0.3)),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: selectedMetric === 'conversions',
                tension: 0.4,
                pointRadius: selectedMetric === 'conversions' ? 4 : 0,
                borderWidth: selectedMetric === 'conversions' ? 2.5 : 1.5,
                hidden: selectedMetric !== 'conversions',
            },
        ],
    };

    const channelData = {
        labels: ['Email', 'SMS', 'Push', 'Web'],
        datasets: [{
            data: [68, 18, 9, 5],
            backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Analytics</h1>
                        <p className="page-subtitle">Deep insights into your marketing performance and optimal timing.</p>
                    </div>
                    <div className="page-actions">
                        <select className="input" style={{ width: 'auto' }}>
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                        <button className="btn btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <path d="M7 10l5 5 5-5" />
                                <path d="M12 15V3" />
                            </svg>
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Engagement Trend */}
            <div className="card mb-6">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Engagement Trend</h3>
                        <p className="card-subtitle">Track opens, clicks, and conversions over time</p>
                    </div>
                    <div className="flex gap-2">
                        {['opens', 'clicks', 'conversions'].map(metric => (
                            <button
                                key={metric}
                                className={`btn btn-ghost ${selectedMetric === metric ? 'btn-primary' : ''}`}
                                onClick={() => setSelectedMetric(metric)}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {metric}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-container" style={{ height: 320 }}>
                    <Line data={engagementChartData} options={chartOptions} />
                </div>
            </div>

            <div className="grid-2 mb-6">
                {/* Optimal Send Time Heatmap */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Optimal Send Times</h3>
                            <p className="card-subtitle">AI-predicted best hours to send</p>
                        </div>
                        <span className="badge badge-info">AI Powered</span>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="mb-4">
                        <div className="flex gap-1 mb-2" style={{ justifyContent: 'space-between' }}>
                            {['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'].map(label => (
                                <span key={label} className="text-xs text-muted" style={{ width: '40px', textAlign: 'center' }}>{label}</span>
                            ))}
                        </div>
                        <div className="heatmap" style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '3px' }}>
                            {Array(24).fill(0).map((_, hour) => {
                                const probability = sendTimeData?.hourlyProbabilities?.[hour] || 0.2;
                                const isOptimal = sendTimeData?.optimalHours?.includes(hour);
                                return (
                                    <div
                                        key={hour}
                                        className="heatmap-cell"
                                        title={`${hour}:00 - ${Math.round(probability * 100)}% engagement likelihood`}
                                        style={{
                                            height: 40,
                                            borderRadius: 4,
                                            background: heatmapColors[hour] || '#1c1c21',
                                            border: isOptimal ? '2px solid var(--accent-secondary)' : 'none',
                                            cursor: 'pointer',
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-muted">Lower engagement</span>
                            <span className="text-xs text-muted">Higher engagement</span>
                        </div>
                    </div>

                    {/* Insights */}
                    {sendTimeData && (
                        <div className="segment-preview">
                            <div className="segment-stat">
                                <span className="segment-stat-label">Best Hours</span>
                                <span className="segment-stat-value">{sendTimeData.optimalHours?.map(h => `${h}:00`).join(', ')}</span>
                            </div>
                            <div className="segment-stat">
                                <span className="segment-stat-label">Best Days</span>
                                <span className="segment-stat-value">{sendTimeData.optimalDays?.join(', ')}</span>
                            </div>
                            <div className="segment-stat">
                                <span className="segment-stat-label">Confidence</span>
                                <span className="segment-stat-value">{((sendTimeData.confidence || 0.78) * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    )}

                    {sendTimeData?.insights && (
                        <div className="mt-4">
                            <div className="text-xs font-medium text-muted mb-2">Key Insights</div>
                            {sendTimeData.insights.map((insight, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-secondary mb-2"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4M12 8h.01" />
                                    </svg>
                                    {insight}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Channel Distribution */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Channel Distribution</h3>
                        <p className="card-subtitle">Engagement by channel type</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                        <div style={{ width: 200, height: 200 }}>
                            <Doughnut
                                data={channelData}
                                options={{
                                    cutout: '70%',
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(15, 15, 18, 0.95)',
                                            titleColor: '#fafafa',
                                            bodyColor: '#a1a1aa',
                                            borderColor: 'rgba(99, 102, 241, 0.3)',
                                            borderWidth: 1,
                                            cornerRadius: 8,
                                        },
                                    },
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            {channelData.labels.map((label, i) => (
                                <div key={label} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <span
                                            style={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: 3,
                                                background: channelData.datasets[0].backgroundColor[i]
                                            }}
                                        />
                                        <span className="font-medium">{label}</span>
                                    </div>
                                    <span className="text-muted">{channelData.datasets[0].data[i]}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Breakdown */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Performance Breakdown</h3>
                    <p className="card-subtitle">Detailed metrics by day</p>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Sent</th>
                                <th>Delivered</th>
                                <th>Opens</th>
                                <th>Open Rate</th>
                                <th>Clicks</th>
                                <th>CTR</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {engagementTrend.map(day => {
                                const sent = Math.floor(Math.random() * 2000) + 3000;
                                const delivered = Math.floor(sent * 0.98);
                                const openRate = ((day.opens / delivered) * 100).toFixed(1);
                                const ctr = ((day.clicks / day.opens) * 100).toFixed(1);

                                return (
                                    <tr key={day.date}>
                                        <td className="table-cell-primary">Mar {day.date.split('-')[2]}</td>
                                        <td>{sent.toLocaleString()}</td>
                                        <td>{delivered.toLocaleString()}</td>
                                        <td>{day.opens.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${parseFloat(openRate) > 30 ? 'badge-success' : 'badge-neutral'}`}>
                                                {openRate}%
                                            </span>
                                        </td>
                                        <td>{day.clicks.toLocaleString()}</td>
                                        <td>{ctr}%</td>
                                        <td className="font-medium text-success">${day.revenue.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
