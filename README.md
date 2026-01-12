# Cadence

An AI-powered marketing automation platform that transforms how marketers interact with Klaviyo.

## Problem Statement

Email marketers face three critical challenges that limit their effectiveness:

1. **Complex Segmentation**: Creating targeted customer segments requires deep knowledge of Klaviyo's filter syntax and data model. Marketers often need developer support for sophisticated targeting.

2. **Guesswork Timing**: Determining optimal send times is based on trial-and-error rather than data-driven insights. This leads to lower engagement rates and missed revenue opportunities.

3. **Manual Flow Design**: Building automation flows is time-consuming and lacks intelligent recommendations based on customer behavior patterns.

These challenges create a gap between marketing intent and technical execution, slowing down campaigns and reducing their effectiveness.

## Solution Overview

Cadence bridges this gap through AI-powered features:

- **Natural Language Segment Builder**: Describe your audience in plain English (e.g., "customers who bought shoes but never bought socks"), and AI translates it into precise Klaviyo segment filters with real-time preview and estimated size.

- **Optimal Send Time Predictor**: ML-powered analysis of engagement patterns visualized through an intuitive heatmap showing the best hours and days to send.

- **Smart Flow Recommendations**: AI-generated automation flow suggestions based on your customer data and industry best practices, with expected revenue estimates.

- **Campaign Performance Analysis**: Get AI-powered insights and actionable recommendations for every campaign, including predicted open rates for subject line variations.

- **Customer Profile Management**: Browse and manage customer profiles with activity timelines and quick actions.

## Architecture / Design Decisions

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  Dashboard | Segments | Flows | Analytics | Campaigns | Profiles
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────────┐
│                   Backend (Node.js + Express)                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ API Routes   │  │ Klaviyo      │  │ AI Service       │  │
│  │ /api/*       │  │ Service      │  │ (OpenAI GPT-4)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Klaviyo  │   │ Klaviyo  │   │ OpenAI   │
    │ APIs     │   │ Metrics  │   │ GPT-4    │
    └──────────┘   └──────────┘   └──────────┘
```

**Key Design Decisions:**

1. **Demo Mode Fallback**: The application works fully without API keys by providing intelligent fallback responses. This ensures judges can test all features immediately.

2. **Lazy OpenAI Initialization**: OpenAI client is initialized dynamically to prevent startup crashes when API key is missing.

3. **Intelligent AI Fallbacks**: When OpenAI is unavailable, the AI service provides contextually relevant responses based on keyword analysis and marketing best practices.

4. **Unified Design System**: Custom CSS variables create a consistent, premium dark-mode UI across all pages without relying on external CSS frameworks.

## Klaviyo API / SDK / MCP Usage

| API | Endpoint | Usage |
|-----|----------|-------|
| Profiles API | `GET /api/profiles` | Fetch customer profiles, display in Profiles page, power segment previews |
| Segments API | `GET /api/segments`, `POST /api/segments` | List existing segments, create new segments from AI-parsed queries |
| Campaigns API | `GET /api/campaigns` | Retrieve campaign list and performance metrics for analysis |
| Flows API | `GET /api/flows` | Display existing automation flows, inform AI recommendations |
| Metrics API | `GET /api/metrics` | Power analytics dashboard, engagement trends, send time analysis |
| Events API | `POST /api/events` | Track custom events for behavior analysis |

**Integration approach**: All Klaviyo API calls go through a centralized service layer (`server/services/klaviyo.js`) that handles authentication, error handling, and response normalization.

## Getting Started / Setup Instructions

```bash
# Clone the repository
git clone https://github.com/munish-shah/Cadence-Klaviyo.git
cd Cadence-Klaviyo

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (optional - demo mode works without them)

# Start development server
npm run dev
```

The application will be available at http://localhost:5173

**Environment Variables:**
```
KLAVIYO_API_KEY=pk_your_private_key
KLAVIYO_PUBLIC_KEY=your_public_key
OPENAI_API_KEY=sk_your_openai_key (optional)
```

## Demo

### Dashboard
View key metrics (total profiles, open rate, click rate, revenue) with interactive charts showing engagement trends.

### AI Segment Builder
1. Navigate to "Segment Builder" in the sidebar
2. Type a natural language description like "Customers who purchased in the last 30 days"
3. Click "Generate Segment"
4. Review the AI-generated filter conditions and sample matching profiles
5. Click "Save to Klaviyo" to create the segment

### Optimal Send Time
1. Go to "Analytics"
2. View the heatmap showing engagement probability by hour
3. See recommended send times (e.g., 10:00, 14:00, 20:00 on Tuesday-Thursday)

### Subject Line Generator
1. Navigate to "Campaigns"
2. Enter a campaign description in the AI Subject Line Generator
3. Click "Generate" to receive 5 subject line variations with predicted open rates

### Flow Studio
1. Go to "Flow Studio"
2. View AI recommendations with expected revenue
3. Click "Flow Builder" to see the visual drag-and-drop interface

## Testing / Error Handling

- **Demo Mode**: Automatically activates when Klaviyo API keys are missing, providing sample data for all features
- **AI Fallbacks**: Intelligent fallback responses when OpenAI is unavailable, based on keyword analysis
- **Error Boundaries**: All API calls wrapped in try-catch with user-friendly error messages
- **Input Validation**: Form inputs validated before API submission
- **Loading States**: Spinner and loading text displayed during async operations

## Future Improvements / Stretch Goals

1. **Real Segment Size Estimation**: Query Klaviyo API to get actual profile counts for generated segments
2. **A/B Test Integration**: Connect subject line generator directly to Klaviyo A/B testing
3. **SMS Flow Support**: Extend flow builder to support SMS and push notification nodes
4. **Webhook Configuration**: UI for setting up and managing Klaviyo webhooks
5. **Multi-Account Support**: Manage multiple Klaviyo accounts from one interface
6. **OAuth Implementation**: Full OAuth flow for secure third-party authorization

## Author

Munish Shah - Klaviyo Winter 2026 Hackathon

## License

MIT License
