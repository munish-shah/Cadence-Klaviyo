import express from 'express';
import klaviyoService from '../services/klaviyo.js';
import aiService from '../services/ai.js';

const router = express.Router();

// Check if we're in demo mode (no valid Klaviyo API key)
const DEMO_MODE = !process.env.KLAVIYO_API_KEY || process.env.KLAVIYO_API_KEY.includes('xxxx');

if (DEMO_MODE) {
    console.log('ℹ Running in DEMO MODE - using sample data');
}

// ============= STATUS ENDPOINT =============
router.get('/status', (req, res) => {
    res.json({
        status: 'connected',
        demoMode: DEMO_MODE,
        klaviyoConnected: !DEMO_MODE,
        aiConnected: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('xxxx'),
        timestamp: new Date().toISOString(),
    });
});

// ============= DEMO DATA =============
const generateDemoData = () => {
    const profiles = [
        { id: 'demo-1', attributes: { email: 'sarah.johnson@email.com', first_name: 'Sarah', last_name: 'Johnson', properties: { total_orders: 12, lifetime_value: 1250 } } },
        { id: 'demo-2', attributes: { email: 'michael.chen@email.com', first_name: 'Michael', last_name: 'Chen', properties: { total_orders: 8, lifetime_value: 890 } } },
        { id: 'demo-3', attributes: { email: 'emily.rodriguez@email.com', first_name: 'Emily', last_name: 'Rodriguez', properties: { total_orders: 23, lifetime_value: 3200 } } },
        { id: 'demo-4', attributes: { email: 'david.kim@email.com', first_name: 'David', last_name: 'Kim', properties: { total_orders: 5, lifetime_value: 420 } } },
        { id: 'demo-5', attributes: { email: 'lisa.patel@email.com', first_name: 'Lisa', last_name: 'Patel', properties: { total_orders: 15, lifetime_value: 1850 } } },
        { id: 'demo-6', attributes: { email: 'james.wilson@email.com', first_name: 'James', last_name: 'Wilson', properties: { total_orders: 3, lifetime_value: 275 } } },
        { id: 'demo-7', attributes: { email: 'amanda.taylor@email.com', first_name: 'Amanda', last_name: 'Taylor', properties: { total_orders: 19, lifetime_value: 2100 } } },
        { id: 'demo-8', attributes: { email: 'robert.brown@email.com', first_name: 'Robert', last_name: 'Brown', properties: { total_orders: 7, lifetime_value: 680 } } },
    ];

    const campaigns = [
        { id: 'camp-1', attributes: { name: 'Spring Collection Launch', status: 'sent', send_time: '2024-03-15T10:00:00Z', stats: { open_rate: 0.42, click_rate: 0.12, revenue: 8500 } } },
        { id: 'camp-2', attributes: { name: 'VIP Early Access Sale', status: 'sent', send_time: '2024-03-10T14:00:00Z', stats: { open_rate: 0.56, click_rate: 0.18, revenue: 12300 } } },
        { id: 'camp-3', attributes: { name: 'Weekend Flash Sale', status: 'sent', send_time: '2024-03-08T09:00:00Z', stats: { open_rate: 0.38, click_rate: 0.09, revenue: 5200 } } },
        { id: 'camp-4', attributes: { name: 'New Arrivals Newsletter', status: 'sent', send_time: '2024-03-05T11:00:00Z', stats: { open_rate: 0.35, click_rate: 0.08, revenue: 3100 } } },
        { id: 'camp-5', attributes: { name: 'Customer Appreciation Week', status: 'draft', stats: {} } },
    ];

    const flows = [
        { id: 'flow-1', attributes: { name: 'Welcome Series', status: 'live', trigger_type: 'List trigger', created: '2024-01-15' } },
        { id: 'flow-2', attributes: { name: 'Abandoned Cart', status: 'live', trigger_type: 'Metric trigger', created: '2024-01-20' } },
        { id: 'flow-3', attributes: { name: 'Post-Purchase Follow-up', status: 'live', trigger_type: 'Metric trigger', created: '2024-02-01' } },
        { id: 'flow-4', attributes: { name: 'Win-Back Campaign', status: 'draft', trigger_type: 'Segment trigger', created: '2024-02-15' } },
        { id: 'flow-5', attributes: { name: 'Birthday Celebration', status: 'live', trigger_type: 'Date trigger', created: '2024-03-01' } },
    ];

    const segments = [
        { id: 'seg-1', attributes: { name: 'Active Subscribers', created: '2024-01-10', profile_count: 2340 } },
        { id: 'seg-2', attributes: { name: 'VIP Customers', created: '2024-01-15', profile_count: 456 } },
        { id: 'seg-3', attributes: { name: 'Recent Purchasers', created: '2024-02-01', profile_count: 890 } },
        { id: 'seg-4', attributes: { name: 'Cart Abandoners', created: '2024-02-10', profile_count: 234 } },
    ];

    const engagementTrend = [
        { date: '2024-03-01', opens: 1240, clicks: 320, revenue: 4500 },
        { date: '2024-03-02', opens: 1580, clicks: 410, revenue: 5800 },
        { date: '2024-03-03', opens: 1320, clicks: 340, revenue: 4200 },
        { date: '2024-03-04', opens: 1680, clicks: 480, revenue: 6700 },
        { date: '2024-03-05', opens: 1890, clicks: 520, revenue: 7200 },
        { date: '2024-03-06', opens: 2100, clicks: 580, revenue: 8100 },
        { date: '2024-03-07', opens: 1750, clicks: 450, revenue: 6400 },
    ];

    return { profiles, campaigns, flows, segments, engagementTrend };
};

const DEMO_DATA = generateDemoData();

// ============= PROFILES =============
router.get('/profiles', async (req, res, next) => {
    try {
        if (DEMO_MODE) {
            return res.json({ data: DEMO_DATA.profiles });
        }
        const profiles = await klaviyoService.getProfiles(req.query);
        res.json(profiles);
    } catch (error) {
        next(error);
    }
});

router.get('/profiles/:id', async (req, res, next) => {
    try {
        if (DEMO_MODE) {
            const profile = DEMO_DATA.profiles.find(p => p.id === req.params.id);
            return res.json({ data: profile || DEMO_DATA.profiles[0] });
        }
        const profile = await klaviyoService.getProfile(req.params.id);
        res.json(profile);
    } catch (error) {
        next(error);
    }
});

// ============= SEGMENTS =============
router.get('/segments', async (req, res, next) => {
    try {
        if (DEMO_MODE) {
            return res.json({ data: DEMO_DATA.segments });
        }
        const segments = await klaviyoService.getSegments();
        res.json(segments);
    } catch (error) {
        next(error);
    }
});

router.post('/segments/ai-create', async (req, res, next) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Use AI to parse the natural language query
        const parsed = await aiService.parseNaturalLanguageToSegment(query);

        // Generate sample profiles for preview
        const sampleProfiles = DEMO_MODE
            ? DEMO_DATA.profiles.slice(0, 5)
            : (await klaviyoService.getProfiles({ pageSize: 5 })).data || [];

        // Estimate segment size (demo calculation)
        const estimatedSize = Math.floor(Math.random() * 300) + 150;

        res.json({
            parsed,
            preview: {
                estimatedSize,
                sampleProfiles,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.post('/segments/create', async (req, res, next) => {
    try {
        const { name, definition } = req.body;

        if (DEMO_MODE) {
            return res.json({
                success: true,
                data: { id: `seg-${Date.now()}`, attributes: { name, definition } },
                message: 'Segment created successfully (demo mode)',
            });
        }

        const segment = await klaviyoService.createSegment(name, definition);
        res.json({ success: true, data: segment });
    } catch (error) {
        next(error);
    }
});

// ============= CAMPAIGNS =============
router.get('/campaigns', async (req, res, next) => {
    try {
        if (DEMO_MODE) {
            return res.json({ data: DEMO_DATA.campaigns });
        }
        const campaigns = await klaviyoService.getCampaigns();
        res.json(campaigns);
    } catch (error) {
        next(error);
    }
});

router.post('/campaigns/analyze', async (req, res, next) => {
    try {
        const { campaignData } = req.body;
        const analysis = await aiService.analyzeCampaignPerformance(campaignData);
        res.json(analysis);
    } catch (error) {
        next(error);
    }
});

// ============= FLOWS =============
router.get('/flows', async (req, res, next) => {
    try {
        if (DEMO_MODE) {
            return res.json({ data: DEMO_DATA.flows });
        }
        const flows = await klaviyoService.getFlows();
        res.json(flows);
    } catch (error) {
        next(error);
    }
});

router.post('/flows/recommendations', async (req, res, next) => {
    try {
        const { customerData } = req.body;
        const recommendations = await aiService.generateFlowRecommendations(customerData || {});
        res.json(recommendations);
    } catch (error) {
        next(error);
    }
});

// ============= ANALYTICS =============
router.get('/analytics/dashboard', async (req, res, next) => {
    try {
        const totalProfiles = DEMO_MODE
            ? DEMO_DATA.profiles.length * 350
            : ((await klaviyoService.getProfiles({ pageSize: 1 }))?.meta?.count || 2847);

        const metrics = {
            totalProfiles,
            avgOpenRate: 0.412,
            avgClickRate: 0.098,
            totalRevenue: 156780,
            revenueGrowth: 0.23,
        };

        res.json({
            metrics,
            engagementTrend: DEMO_DATA.engagementTrend,
            recentCampaigns: DEMO_MODE ? DEMO_DATA.campaigns : (await klaviyoService.getCampaigns())?.data || [],
        });
    } catch (error) {
        next(error);
    }
});

router.post('/analytics/send-time', async (req, res, next) => {
    try {
        const { engagementData } = req.body;
        const prediction = await aiService.predictOptimalSendTime(engagementData || {});
        res.json(prediction);
    } catch (error) {
        next(error);
    }
});

// ============= AI FEATURES =============
router.post('/ai/subject-lines', async (req, res, next) => {
    try {
        const context = req.body;
        const result = await aiService.generateSubjectLines(context);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/ai/email-content', async (req, res, next) => {
    try {
        const context = req.body;
        const result = await aiService.generateEmailContent(context);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// ============= EVENTS =============
router.post('/events/track', async (req, res, next) => {
    try {
        if (DEMO_MODE) {
            return res.json({ success: true, message: 'Event tracked (demo mode)' });
        }
        const result = await klaviyoService.trackEvent(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export default router;
