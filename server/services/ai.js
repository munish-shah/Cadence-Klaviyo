// AI Service with flexible OpenAI integration
// Falls back to intelligent demo responses when API key is not available

let openai = null;
let OPENAI_AVAILABLE = false;
let initAttempted = false;

// Check multiple possible env variable names
function getApiKey() {
    return process.env.OPENAI_API_KEY ||
        process.env.OPENAI_KEY ||
        process.env.AZURE_OPENAI_API_KEY ||
        process.env.AI_API_KEY ||
        null;
}

// Lazy initialization of OpenAI client
async function getOpenAI() {
    if (initAttempted) return openai;
    initAttempted = true;

    const apiKey = getApiKey();

    if (apiKey && apiKey.length > 10 && !apiKey.includes('xxxx')) {
        try {
            const OpenAI = (await import('openai')).default;

            // Check if it's Azure OpenAI
            if (process.env.AZURE_OPENAI_ENDPOINT) {
                openai = new OpenAI({
                    apiKey,
                    baseURL: process.env.AZURE_OPENAI_ENDPOINT,
                });
            } else {
                openai = new OpenAI({ apiKey });
            }

            OPENAI_AVAILABLE = true;
            console.log('✓ OpenAI client initialized successfully');
        } catch (err) {
            console.log('✗ OpenAI initialization failed:', err.message);
            OPENAI_AVAILABLE = false;
        }
    } else {
        console.log('ℹ OpenAI API key not found - AI features will use intelligent fallbacks');
        OPENAI_AVAILABLE = false;
    }
    return openai;
}

// Initialize on first import
getOpenAI();

class AIService {
    // Convert natural language to Klaviyo segment filter
    async parseNaturalLanguageToSegment(query) {
        try {
            const client = await getOpenAI();
            if (!client) {
                return this.getFallbackSegment(query);
            }

            const response = await client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert at converting natural language queries into Klaviyo segment filter definitions.
            
Klaviyo segments use a definition format with conditions. Common filter properties:
- properties.$email, properties.$first_name, properties.$last_name
- properties.$city, properties.$region, properties.$country
- Metric conditions: has/has not done [Metric Name] in the last X days
- Profile properties: custom profile fields

Return ONLY valid JSON (no markdown):
{
  "name": "descriptive segment name",
  "definition": "klaviyo filter definition or description",
  "explanation": "what this segment captures",
  "estimatedComplexity": "simple|medium|complex",
  "conditions": [{"field": "...", "operator": "...", "value": "..."}]
}`,
                    },
                    { role: 'user', content: query },
                ],
                temperature: 0.3,
                max_tokens: 600,
            });

            const content = response.choices[0].message.content.trim();
            // Remove markdown code blocks if present
            const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            return JSON.parse(jsonContent);
        } catch (error) {
            console.error('AI segment parsing:', error.message);
            return this.getFallbackSegment(query);
        }
    }

    getFallbackSegment(query) {
        const queryLower = query.toLowerCase();

        // Intelligent fallback based on query keywords
        const conditions = [];
        let name = 'Custom Segment';
        let explanation = '';

        if (queryLower.includes('purchas') || queryLower.includes('bought') || queryLower.includes('order')) {
            conditions.push({ field: 'Placed Order', operator: 'has done', value: 'at least 1 time' });
            name = 'Purchasers';
            explanation = 'Customers who have made at least one purchase';

            if (queryLower.includes('30 day') || queryLower.includes('last month')) {
                conditions[0].timeframe = 'in the last 30 days';
                name = 'Recent Purchasers (30 days)';
                explanation = 'Customers who purchased in the last 30 days';
            } else if (queryLower.includes('90 day')) {
                conditions[0].timeframe = 'in the last 90 days';
                name = 'Recent Purchasers (90 days)';
            }
        }

        if (queryLower.includes('vip') || queryLower.includes('high value') || queryLower.includes('loyal')) {
            conditions.push({ field: 'Lifetime Value', operator: 'greater than', value: '$500' });
            name = 'VIP Customers';
            explanation = 'High-value customers with significant lifetime value';
        }

        if (queryLower.includes('abandon') || queryLower.includes('cart')) {
            conditions.push({ field: 'Started Checkout', operator: 'has done', value: 'at least 1 time' });
            conditions.push({ field: 'Placed Order', operator: 'has not done', value: 'since starting checkout' });
            name = 'Cart Abandoners';
            explanation = 'Customers who started checkout but did not complete purchase';
        }

        if (queryLower.includes('inactive') || queryLower.includes('haven\'t') || queryLower.includes('dormant')) {
            conditions.push({ field: 'Any Activity', operator: 'has not done', value: 'in the last 90 days' });
            name = 'Inactive Subscribers';
            explanation = 'Subscribers with no activity in the last 90 days';
        }

        if (queryLower.includes('open') && queryLower.includes('click')) {
            conditions.push({ field: 'Opened Email', operator: 'has done', value: 'at least 1 time' });
            conditions.push({ field: 'Clicked Email', operator: 'has not done', value: 'ever' });
            name = 'Openers Who Never Click';
            explanation = 'Subscribers who open emails but never click links';
        }

        if (queryLower.includes('email') && queryLower.includes('never')) {
            conditions.push({ field: 'Opened Email', operator: 'has not done', value: 'ever' });
            name = 'Never Engaged';
            explanation = 'Subscribers who have never opened any email';
        }

        if (conditions.length === 0) {
            // Generic fallback
            name = this.generateSegmentName(query);
            explanation = `Segment based on: ${query}`;
            conditions.push({ field: 'Custom Filter', operator: 'matches', value: query });
        }

        return {
            name,
            definition: JSON.stringify(conditions),
            explanation,
            estimatedComplexity: conditions.length > 2 ? 'complex' : conditions.length > 1 ? 'medium' : 'simple',
            conditions,
            isDemo: true,
        };
    }

    generateSegmentName(query) {
        const words = query.split(' ')
            .filter(w => w.length > 3)
            .slice(0, 3)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        return words.join(' ') + ' Segment';
    }

    async generateSubjectLines(context) {
        try {
            const client = await getOpenAI();
            if (!client) {
                return this.getFallbackSubjectLines(context);
            }

            const response = await client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are an email marketing expert specializing in high-converting subject lines.
Generate 5 diverse subject lines. Return ONLY valid JSON:
{"subjectLines": [{"text": "subject line", "style": "urgency|curiosity|benefit|personalization|social_proof", "predictedOpenRate": "low|medium|high", "reasoning": "why this works"}]}`,
                    },
                    {
                        role: 'user',
                        content: `Campaign: ${context.purpose || 'promotional'}
Audience: ${context.audience || 'subscribers'}
Key message: ${context.message || 'special offer'}
Brand tone: ${context.tone || 'friendly professional'}`,
                    },
                ],
                temperature: 0.85,
                max_tokens: 800,
            });

            const content = response.choices[0].message.content.trim();
            const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            return JSON.parse(jsonContent);
        } catch (error) {
            console.error('Subject line generation:', error.message);
            return this.getFallbackSubjectLines(context);
        }
    }

    getFallbackSubjectLines(context) {
        const purpose = (context.purpose || 'promotional').toLowerCase();

        let lines = [
            { text: "You're going to love this →", style: 'curiosity', predictedOpenRate: 'high', reasoning: 'Creates intrigue with arrow CTA' },
            { text: 'Quick question for you...', style: 'personalization', predictedOpenRate: 'high', reasoning: 'Conversational opener drives opens' },
            { text: 'Last chance: ends tonight', style: 'urgency', predictedOpenRate: 'high', reasoning: 'Time pressure creates FOMO' },
            { text: 'Here\'s what you missed', style: 'curiosity', predictedOpenRate: 'medium', reasoning: 'Fear of missing out on content' },
            { text: 'A little something just for you', style: 'personalization', predictedOpenRate: 'medium', reasoning: 'Exclusive feel increases engagement' },
        ];

        if (purpose.includes('welcome')) {
            lines = [
                { text: 'Welcome to the family 🎉', style: 'personalization', predictedOpenRate: 'high', reasoning: 'Warm welcome with celebration' },
                { text: "You're in! Here's what's next", style: 'benefit', predictedOpenRate: 'high', reasoning: 'Confirms action and sets expectations' },
                { text: 'Thanks for joining us', style: 'personalization', predictedOpenRate: 'medium', reasoning: 'Simple gratitude message' },
                { text: 'Your exclusive access starts now', style: 'benefit', predictedOpenRate: 'high', reasoning: 'Emphasizes exclusivity' },
                { text: "Let's get started (it only takes 2 min)", style: 'benefit', predictedOpenRate: 'medium', reasoning: 'Low-commitment CTA' },
            ];
        } else if (purpose.includes('abandon') || purpose.includes('cart')) {
            lines = [
                { text: 'Forgot something?', style: 'curiosity', predictedOpenRate: 'high', reasoning: 'Direct reminder without pressure' },
                { text: 'Your cart is feeling lonely', style: 'personalization', predictedOpenRate: 'medium', reasoning: 'Playful personification' },
                { text: 'Still thinking it over?', style: 'curiosity', predictedOpenRate: 'medium', reasoning: 'Acknowledges hesitation' },
                { text: 'Complete your order before it sells out', style: 'urgency', predictedOpenRate: 'high', reasoning: 'Scarcity drives action' },
                { text: 'Here\'s 10% off to help you decide', style: 'benefit', predictedOpenRate: 'high', reasoning: 'Incentive removes friction' },
            ];
        }

        return { subjectLines: lines, isDemo: true };
    }

    async predictOptimalSendTime(engagementData) {
        try {
            const client = await getOpenAI();
            if (!client) {
                return this.getFallbackSendTime();
            }

            const response = await client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `Analyze engagement data and predict optimal send times. Return ONLY valid JSON:
{"optimalHours": [9,14,19], "optimalDays": ["Tuesday","Thursday"], "confidence": 0.85, "reasoning": "explanation", "hourlyProbabilities": [array of 24 values 0-1], "insights": ["insight1", "insight2"]}`,
                    },
                    { role: 'user', content: JSON.stringify(engagementData) },
                ],
                temperature: 0.2,
                max_tokens: 800,
            });

            const content = response.choices[0].message.content.trim();
            const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            return JSON.parse(jsonContent);
        } catch (error) {
            console.error('Send time prediction:', error.message);
            return this.getFallbackSendTime();
        }
    }

    getFallbackSendTime() {
        return {
            optimalHours: [10, 14, 20],
            optimalDays: ['Tuesday', 'Wednesday', 'Thursday'],
            confidence: 0.82,
            reasoning: 'Based on industry benchmarks: 10 AM catches morning inbox check, 2 PM hits post-lunch browsing, 8 PM reaches evening relaxation time. Mid-week days show highest engagement as Monday inbox is crowded and Friday attention wanes.',
            hourlyProbabilities: [
                0.05, 0.03, 0.02, 0.02, 0.03, 0.08, // 12am-5am
                0.25, 0.45, 0.65, 0.85, 0.90, 0.75, // 6am-11am
                0.60, 0.70, 0.85, 0.80, 0.65, 0.55, // 12pm-5pm
                0.50, 0.60, 0.80, 0.70, 0.40, 0.15, // 6pm-11pm
            ],
            insights: [
                'Morning sends (9-11 AM) show 23% higher open rates',
                'Avoid Mondays - inbox competition reduces visibility by 15%',
                'Weekend sends have 40% lower engagement for B2C',
            ],
            isDemo: true,
        };
    }

    async generateFlowRecommendations(customerData) {
        try {
            const client = await getOpenAI();
            if (!client) {
                return this.getFallbackFlows();
            }

            const response = await client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a marketing automation expert. Recommend high-impact email flows.
Return ONLY valid JSON:
{"recommendations": [{"name": "...", "trigger": "...", "description": "...", "expectedImpact": "high|medium|low", "expectedRevenue": "$X,XXX/month", "steps": [{"action": "...", "delay": "...", "description": "..."}]}]}`,
                    },
                    { role: 'user', content: JSON.stringify(customerData) },
                ],
                temperature: 0.5,
                max_tokens: 1000,
            });

            const content = response.choices[0].message.content.trim();
            const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            return JSON.parse(jsonContent);
        } catch (error) {
            console.error('Flow recommendation:', error.message);
            return this.getFallbackFlows();
        }
    }

    getFallbackFlows() {
        return {
            recommendations: [
                {
                    name: 'Welcome Series',
                    trigger: 'Subscribes to list',
                    description: 'Convert new subscribers into customers with a strategic 5-email welcome sequence that builds trust and drives first purchase.',
                    expectedImpact: 'high',
                    expectedRevenue: '$2,500/month',
                    steps: [
                        { action: 'Send Email', delay: 'Immediate', description: 'Welcome + brand story + 10% first order discount' },
                        { action: 'Send Email', delay: '2 days', description: 'Best sellers showcase + social proof' },
                        { action: 'Conditional Split', delay: '3 days', description: 'Check if purchased' },
                        { action: 'Send Email', delay: '4 days', description: 'Discount reminder (non-purchasers only)' },
                        { action: 'Send Email', delay: '7 days', description: 'Educational content + soft CTA' },
                    ],
                },
                {
                    name: 'Abandoned Cart Recovery',
                    trigger: 'Started Checkout → No Purchase (1 hour)',
                    description: 'Recover 10-15% of abandoned carts with timely, personalized reminders.',
                    expectedImpact: 'high',
                    expectedRevenue: '$4,200/month',
                    steps: [
                        { action: 'Send Email', delay: '1 hour', description: 'Gentle reminder with cart contents' },
                        { action: 'Send Email', delay: '24 hours', description: 'Social proof + reviews' },
                        { action: 'Send Email', delay: '72 hours', description: 'Final reminder + 5% discount' },
                    ],
                },
                {
                    name: 'Post-Purchase Nurture',
                    trigger: 'Placed Order',
                    description: 'Turn one-time buyers into repeat customers through strategic follow-up.',
                    expectedImpact: 'medium',
                    expectedRevenue: '$1,800/month',
                    steps: [
                        { action: 'Send Email', delay: 'Immediate', description: 'Order confirmation + what to expect' },
                        { action: 'Send Email', delay: '3 days', description: 'Shipping update + usage tips' },
                        { action: 'Send Email', delay: '14 days', description: 'Review request + referral program' },
                        { action: 'Send Email', delay: '30 days', description: 'Cross-sell recommendations' },
                    ],
                },
                {
                    name: 'Win-Back Campaign',
                    trigger: 'No purchase in 90 days (previous customer)',
                    description: 'Re-engage lapsed customers before they churn permanently.',
                    expectedImpact: 'medium',
                    expectedRevenue: '$1,200/month',
                    steps: [
                        { action: 'Send Email', delay: '90 days', description: 'We miss you + what\'s new' },
                        { action: 'Send Email', delay: '97 days', description: 'Exclusive return offer (15% off)' },
                        { action: 'Send Email', delay: '104 days', description: 'Last chance + survey' },
                    ],
                },
                {
                    name: 'Browse Abandonment',
                    trigger: 'Viewed Product → No Add to Cart (30 min)',
                    description: 'Capture interest from window shoppers with targeted follow-up.',
                    expectedImpact: 'medium',
                    expectedRevenue: '$950/month',
                    steps: [
                        { action: 'Send Email', delay: '30 minutes', description: 'Still interested? + product highlight' },
                        { action: 'Send Email', delay: '24 hours', description: 'Similar products you might love' },
                    ],
                },
            ],
            isDemo: true,
        };
    }

    async analyzeCampaignPerformance(campaignData) {
        try {
            const client = await getOpenAI();
            if (!client) {
                return this.getFallbackAnalysis(campaignData);
            }

            const response = await client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `Analyze campaign performance and provide actionable insights.
Return ONLY valid JSON:
{"overallScore": 85, "grade": "A-", "insights": [{"type": "positive|negative|warning", "metric": "...", "value": "...", "benchmark": "...", "message": "...", "recommendation": "..."}], "summary": "...", "nextSteps": ["step1", "step2"]}`,
                    },
                    { role: 'user', content: JSON.stringify(campaignData) },
                ],
                temperature: 0.3,
                max_tokens: 800,
            });

            const content = response.choices[0].message.content.trim();
            const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            return JSON.parse(jsonContent);
        } catch (error) {
            console.error('Campaign analysis:', error.message);
            return this.getFallbackAnalysis(campaignData);
        }
    }

    getFallbackAnalysis(campaignData) {
        const openRate = campaignData?.stats?.open_rate || 0.35;
        const clickRate = campaignData?.stats?.click_rate || 0.08;

        const score = Math.round(
            (openRate > 0.3 ? 30 : openRate * 100) +
            (clickRate > 0.05 ? 30 : clickRate * 600) +
            20 // base score
        );

        const grade = score >= 85 ? 'A' : score >= 75 ? 'B+' : score >= 65 ? 'B' : score >= 55 ? 'C+' : 'C';

        return {
            overallScore: Math.min(score, 95),
            grade,
            insights: [
                {
                    type: openRate > 0.25 ? 'positive' : 'warning',
                    metric: 'Open Rate',
                    value: `${(openRate * 100).toFixed(1)}%`,
                    benchmark: '25% industry avg',
                    message: openRate > 0.25 ? 'Performing above industry average' : 'Below industry average',
                    recommendation: openRate > 0.25
                        ? 'Continue A/B testing subject lines to maintain performance'
                        : 'Test more engaging subject lines with personalization and urgency',
                },
                {
                    type: clickRate > 0.04 ? 'positive' : 'warning',
                    metric: 'Click Rate',
                    value: `${(clickRate * 100).toFixed(1)}%`,
                    benchmark: '4% industry avg',
                    message: clickRate > 0.04 ? 'Strong click engagement' : 'Click rate has room for improvement',
                    recommendation: 'Test button placement, color, and copy. Consider adding multiple CTAs.',
                },
                {
                    type: 'positive',
                    metric: 'Deliverability',
                    value: '98.2%',
                    benchmark: '95%+ is healthy',
                    message: 'Excellent inbox placement',
                    recommendation: 'Maintain list hygiene with regular cleaning of bounced addresses',
                },
            ],
            summary: `Campaign performing ${score >= 70 ? 'well' : 'adequately'} with ${grade} overall grade. ${openRate > 0.3 ? 'Strong subject line performance.' : 'Focus on improving subject lines.'} ${clickRate > 0.05 ? 'Good click engagement.' : 'Consider CTA optimization.'}`,
            nextSteps: [
                'A/B test subject line variations for next campaign',
                'Segment audience for more targeted messaging',
                'Review click heatmap to optimize email layout',
            ],
            isDemo: true,
        };
    }

    // New method: Generate email content
    async generateEmailContent(context) {
        try {
            const client = await getOpenAI();
            if (!client) {
                return this.getFallbackEmailContent(context);
            }

            const response = await client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `Generate email marketing content. Return ONLY valid JSON:
{"subject": "...", "preheader": "...", "headline": "...", "body": "...", "cta": "...", "ps": "..."}`,
                    },
                    { role: 'user', content: JSON.stringify(context) },
                ],
                temperature: 0.7,
                max_tokens: 600,
            });

            const content = response.choices[0].message.content.trim();
            const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            return JSON.parse(jsonContent);
        } catch (error) {
            console.error('Email content generation:', error.message);
            return this.getFallbackEmailContent(context);
        }
    }

    getFallbackEmailContent(context) {
        return {
            subject: "Something special just for you",
            preheader: "You don't want to miss this...",
            headline: "Your Exclusive Offer Awaits",
            body: "We've noticed you've been interested in our products, and we wanted to reach out with something special. For a limited time, enjoy exclusive access to our latest collection.",
            cta: "Shop Now",
            ps: "P.S. This offer expires in 48 hours!",
            isDemo: true,
        };
    }
}

const aiService = new AIService();
export default aiService;
