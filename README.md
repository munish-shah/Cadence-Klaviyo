# Cadence

An AI-powered marketing automation platform that transforms how marketers interact with Klaviyo. Built for the Klaviyo Winter 2026 Hackathon.

## Problem Statement

Email marketers face three critical challenges:

1. **Complex Segmentation**: Creating targeted segments requires deep knowledge of Klaviyo's filter syntax and data model
2. **Guesswork Timing**: Determining optimal send times is based on trial-and-error rather than data
3. **Manual Flow Design**: Building automation flows is time-consuming and lacks intelligent recommendations

## Solution

Cadence bridges the gap between marketing intent and technical execution through:

- **Natural Language Segment Builder**: Describe your audience in plain English, and AI translates it into precise Klaviyo segments
- **Optimal Send Time Predictor**: ML-powered analysis of engagement patterns visualized through an intuitive heatmap
- **Smart Flow Recommendations**: AI-generated automation flows based on your customer data and industry best practices
- **Campaign Performance Analysis**: Get AI-powered insights and actionable recommendations for every campaign

## Technical Architecture

```
cadence/
├── Frontend (React + Vite)
│   ├── Dashboard - Key metrics and engagement trends
│   ├── Segment Builder - AI-powered natural language segmentation
│   ├── Flow Studio - Visual automation builder with recommendations
│   ├── Analytics - Send time optimization and performance data
│   ├── Campaigns - Subject line generator and analysis
│   └── Profiles - Customer management and activity tracking
│
├── Backend (Node.js + Express)
│   ├── Klaviyo API Integration layer
│   ├── AI Service (OpenAI GPT-4)
│   └── RESTful API endpoints
│
└── External Services
    ├── Klaviyo APIs (Profiles, Segments, Campaigns, Flows, Metrics)
    └── OpenAI GPT-4 (natural language processing)
```

## Klaviyo Integration

This project deeply integrates with multiple Klaviyo APIs:

| API | Usage |
|-----|-------|
| Profiles API | Fetch customer data, display profile details, track activity |
| Segments API | Create segments from AI-parsed natural language queries |
| Campaigns API | List campaigns, retrieve performance metrics |
| Flows API | Display existing flows, inform AI recommendations |
| Metrics API | Power analytics dashboard and engagement trends |
| Events API | Track custom events for behavior analysis |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Klaviyo account with API access
- OpenAI API key (optional - demo mode works without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/munishshah/cadence.git
cd cadence

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

The application will be available at http://localhost:5173

### Environment Variables

```
KLAVIYO_API_KEY=pk_your_key_here
KLAVIYO_PUBLIC_KEY=your_public_key
OPENAI_API_KEY=sk_your_key_here (optional)
```

## Features

### AI Segment Builder
- Natural language input for segment creation
- Real-time preview with sample matching profiles
- Estimated segment size calculation
- One-click save to Klaviyo

### Flow Studio
- Visual flow builder with drag-and-drop nodes
- AI-generated flow recommendations with expected revenue
- Integration with existing Klaviyo flows
- Support for triggers, actions, delays, and conditional splits

### Analytics Dashboard
- Engagement trend visualization
- AI-powered optimal send time heatmap
- Channel distribution breakdown
- Detailed performance metrics table

### Campaign Manager
- AI subject line generator with multiple styles
- Campaign performance analysis with AI insights
- Predicted open rates for generated subject lines
- Top performer tracking

### Profile Management
- Searchable customer list
- Detailed profile view with activity timeline
- Lifetime value and order history
- Quick actions for email and profile editing

## AI Usage Disclosure

This project uses OpenAI's GPT-4 API for:
- Converting natural language queries to Klaviyo segment filters
- Generating email subject line variations
- Predicting optimal send times based on engagement patterns
- Creating personalized flow recommendations
- Analyzing campaign performance

When OpenAI is not configured, the system provides intelligent fallback responses based on marketing best practices.

## Project Structure

```
├── index.html          # Application entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration with API proxy
├── server/
│   ├── index.js        # Express server setup
│   ├── routes/
│   │   └── api.js      # API endpoints
│   └── services/
│       ├── klaviyo.js  # Klaviyo API wrapper
│       └── ai.js       # OpenAI integration
└── src/
    ├── main.jsx        # React entry point
    ├── index.css       # Design system
    ├── App.jsx         # Main app with routing
    └── pages/
        ├── Dashboard.jsx
        ├── SegmentBuilder.jsx
        ├── FlowStudio.jsx
        ├── Analytics.jsx
        ├── Campaigns.jsx
        └── Profiles.jsx
```

## Demo Mode

The application includes a comprehensive demo mode that activates when Klaviyo API keys are not configured. This allows:
- Full UI exploration without live data
- Testing of AI features with intelligent fallback responses
- Sample data for all pages and features

## Future Enhancements

- Real-time segment size estimation via Klaviyo API
- A/B test subject line integration
- SMS and push notification flow support
- Custom event tracking interface
- Multi-account management
- Webhook configuration UI

## License

MIT License - See LICENSE file for details.

## Author

Munish Shah - Klaviyo Winter 2026 Hackathon
