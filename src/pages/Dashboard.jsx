import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Icons
const TrendUpIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 6l-9.5 9.5-5-5L1 18" />
        <path d="M17 6h6v6" />
    </svg>
);

const TrendDownIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 18l-9.5-9.5-5 5L1 6" />
        <path d="M17 18h6v-6" />
    </svg>
);

const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const MailOpenIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
        <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
    </svg>
);

const ClickIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 9l5 12 1.774-5.226L21 14 9 9z" />
        <path d="M16.071 16.071l4.243 4.243" />
        <circle cx="7.5" cy="4.5" r="2.5" />
        <path d="M3.5 8.5L1 11" />
        <path d="M11.5 3.5L14 1" />
    </svg>
);

const DollarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics/dashboard')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching dashboard:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span className="loading-text">Loading dashboard...</span>
            </div>
        );
    }

    const metrics = data?.metrics || {};
    const engagementTrend = data?.engagementTrend || [];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 18, 0.95)',
                titleColor: '#fafafa',
                bodyColor: '#a1a1aa',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: { weight: '600' },
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

    const revenueChartData = {
        labels: engagementTrend.map(d => `Mar ${d.date.split('-')[2]}`),
        datasets: [
            {
                label: 'Revenue',
                data: engagementTrend.map(d => d.revenue),
                borderColor: '#818cf8',
                backgroundColor: 'rgba(129, 140, 248, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#818cf8',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                borderWidth: 2,
            },
        ],
    };

    const engagementChartData = {
        labels: engagementTrend.map(d => `Mar ${d.date.split('-')[2]}`),
        datasets: [
            {
                label: 'Opens',
                data: engagementTrend.map(d => d.opens),
                backgroundColor: '#6366f1',
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Clicks',
                data: engagementTrend.map(d => d.clicks),
                backgroundColor: '#a78bfa',
                borderRadius: 4,
                borderSkipped: false,
            },
        ],
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="page-subtitle">Your marketing performance overview for this period.</p>
                    </div>
                    <div className="page-actions">
                        <Link to="/segments" className="btn btn-primary">
                            <PlusIcon />
                            Create Segment
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon purple">
                        <UsersIcon />
                    </div>
                    <div className="metric-label">Total Profiles</div>
                    <div className="metric-value">{metrics.totalProfiles?.toLocaleString() || '2,847'}</div>
                    <div className="metric-change positive">
                        <TrendUpIcon />
                        +12.5% from last month
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon green">
                        <MailOpenIcon />
                    </div>
                    <div className="metric-label">Average Open Rate</div>
                    <div className="metric-value">{((metrics.avgOpenRate || 0.412) * 100).toFixed(1)}%</div>
                    <div className="metric-change positive">
                        <TrendUpIcon />
                        +3.2% above avg
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon blue">
                        <ClickIcon />
                    </div>
                    <div className="metric-label">Click Rate</div>
                    <div className="metric-value">{((metrics.avgClickRate || 0.098) * 100).toFixed(1)}%</div>
                    <div className="metric-change positive">
                        <TrendUpIcon />
                        +1.8% from last month
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon orange">
                        <DollarIcon />
                    </div>
                    <div className="metric-label">Email Revenue</div>
                    <div className="metric-value">${((metrics.totalRevenue || 156780) / 1000).toFixed(1)}K</div>
                    <div className="metric-change positive">
                        <TrendUpIcon />
                        +{((metrics.revenueGrowth || 0.23) * 100).toFixed(0)}% growth
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2 mb-8">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Revenue Trend</h3>
                            <p className="card-subtitle">Email-attributed revenue this week</p>
                        </div>
                        <span className="badge badge-success">+23%</span>
                    </div>
                    <div className="chart-container">
                        <Line data={revenueChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Engagement Breakdown</h3>
                            <p className="card-subtitle">Opens vs clicks per day</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="flex items-center gap-2 text-sm">
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#6366f1' }}></span>
                                Opens
                            </span>
                            <span className="flex items-center gap-2 text-sm">
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#a78bfa' }}></span>
                                Clicks
                            </span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <Bar data={engagementChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Recent Campaigns & Quick Actions */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Campaigns</h3>
                        <Link to="/campaigns" className="card-action">
                            View All <ArrowRightIcon />
                        </Link>
                    </div>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Campaign</th>
                                    <th>Status</th>
                                    <th>Open Rate</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.recentCampaigns || []).slice(0, 4).map(campaign => (
                                    <tr key={campaign.id}>
                                        <td className="table-cell-primary">{campaign.attributes.name}</td>
                                        <td>
                                            <span className={`badge ${campaign.attributes.status === 'sent' ? 'badge-success' : 'badge-warning'}`}>
                                                {campaign.attributes.status}
                                            </span>
                                        </td>
                                        <td>
                                            {campaign.attributes.stats?.open_rate
                                                ? `${(campaign.attributes.stats.open_rate * 100).toFixed(1)}%`
                                                : '—'}
                                        </td>
                                        <td className="font-medium">
                                            {campaign.attributes.stats?.revenue
                                                ? `$${campaign.attributes.stats.revenue.toLocaleString()}`
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link to="/segments" className="btn btn-primary w-full" style={{ justifyContent: 'flex-start' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 3a9 9 0 0 1 9 9" />
                                <circle cx="12" cy="12" r="4" />
                            </svg>
                            Create AI-Powered Segment
                        </Link>
                        <Link to="/flows" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="6" y="2" width="12" height="5" rx="1" />
                                <rect x="6" y="17" width="12" height="5" rx="1" />
                                <path d="M12 7v4M8 11h8M8 11v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2M12 15v2" />
                            </svg>
                            Build Automation Flow
                        </Link>
                        <Link to="/analytics" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 3v18h18" />
                                <path d="M7 12l4-4 4 4 5-5" />
                            </svg>
                            View Send Time Analysis
                        </Link>
                        <Link to="/profiles" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="9" cy="7" r="4" />
                                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                                <circle cx="17" cy="11" r="3" />
                                <path d="M21 21v-1.5a3 3 0 0 0-3-3h-.5" />
                            </svg>
                            Browse Customer Profiles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
