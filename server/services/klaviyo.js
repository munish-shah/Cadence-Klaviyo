import axios from 'axios';

const KLAVIYO_BASE_URL = 'https://a.klaviyo.com/api';
const API_VERSION = '2024-10-15';

class KlaviyoService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios.create({
            baseURL: KLAVIYO_BASE_URL,
            headers: {
                'Authorization': `Klaviyo-API-Key ${apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'revision': API_VERSION,
            },
        });
    }

    // Profile Methods
    async getProfiles(options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.pageSize) params.append('page[size]', options.pageSize);
            if (options.filter) params.append('filter', options.filter);

            const response = await this.client.get(`/profiles/?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching profiles:', error.response?.data || error.message);
            throw error;
        }
    }

    async getProfile(profileId) {
        try {
            const response = await this.client.get(`/profiles/${profileId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error.response?.data || error.message);
            throw error;
        }
    }

    async createOrUpdateProfile(profileData) {
        try {
            const response = await this.client.post('/profiles/', {
                data: {
                    type: 'profile',
                    attributes: profileData,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating profile:', error.response?.data || error.message);
            throw error;
        }
    }

    // Segment Methods
    async getSegments() {
        try {
            const response = await this.client.get('/segments/');
            return response.data;
        } catch (error) {
            console.error('Error fetching segments:', error.response?.data || error.message);
            throw error;
        }
    }

    async getSegment(segmentId) {
        try {
            const response = await this.client.get(`/segments/${segmentId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching segment:', error.response?.data || error.message);
            throw error;
        }
    }

    async getSegmentProfiles(segmentId) {
        try {
            const response = await this.client.get(`/segments/${segmentId}/profiles/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching segment profiles:', error.response?.data || error.message);
            throw error;
        }
    }

    async createSegment(name, definition) {
        try {
            const response = await this.client.post('/segments/', {
                data: {
                    type: 'segment',
                    attributes: {
                        name,
                        definition,
                    },
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating segment:', error.response?.data || error.message);
            throw error;
        }
    }

    // Event Methods
    async getEvents(options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.pageSize) params.append('page[size]', options.pageSize);
            if (options.filter) params.append('filter', options.filter);

            const response = await this.client.get(`/events/?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error.response?.data || error.message);
            throw error;
        }
    }

    async createEvent(eventData) {
        try {
            const response = await this.client.post('/events/', {
                data: {
                    type: 'event',
                    attributes: eventData,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating event:', error.response?.data || error.message);
            throw error;
        }
    }

    // Campaign Methods
    async getCampaigns() {
        try {
            const response = await this.client.get('/campaigns/');
            return response.data;
        } catch (error) {
            console.error('Error fetching campaigns:', error.response?.data || error.message);
            throw error;
        }
    }

    async getCampaign(campaignId) {
        try {
            const response = await this.client.get(`/campaigns/${campaignId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching campaign:', error.response?.data || error.message);
            throw error;
        }
    }

    // Metrics Methods
    async getMetrics() {
        try {
            const response = await this.client.get('/metrics/');
            return response.data;
        } catch (error) {
            console.error('Error fetching metrics:', error.response?.data || error.message);
            throw error;
        }
    }

    async queryMetricAggregates(metricId, options = {}) {
        try {
            const response = await this.client.post('/metric-aggregates/', {
                data: {
                    type: 'metric-aggregate',
                    attributes: {
                        metric_id: metricId,
                        measurements: options.measurements || ['count'],
                        interval: options.interval || 'day',
                        filter: options.filter || [],
                        ...options,
                    },
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error querying metrics:', error.response?.data || error.message);
            throw error;
        }
    }

    // Lists Methods
    async getLists() {
        try {
            const response = await this.client.get('/lists/');
            return response.data;
        } catch (error) {
            console.error('Error fetching lists:', error.response?.data || error.message);
            throw error;
        }
    }

    // Flows Methods
    async getFlows() {
        try {
            const response = await this.client.get('/flows/');
            return response.data;
        } catch (error) {
            console.error('Error fetching flows:', error.response?.data || error.message);
            throw error;
        }
    }

    async getFlow(flowId) {
        try {
            const response = await this.client.get(`/flows/${flowId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching flow:', error.response?.data || error.message);
            throw error;
        }
    }

    // Account Info
    async getAccount() {
        try {
            const response = await this.client.get('/accounts/');
            return response.data;
        } catch (error) {
            console.error('Error fetching account:', error.response?.data || error.message);
            throw error;
        }
    }
}

// Export singleton instance
const klaviyoService = new KlaviyoService(process.env.KLAVIYO_API_KEY);

export { KlaviyoService };
export default klaviyoService;
