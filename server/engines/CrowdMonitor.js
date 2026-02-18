/**
 * CrowdMonitor.js — Live Crowd Density & Queue Monitoring Engine (Redis Backed)
 * 
 * Interacts with Supabase to fetch real-time check-in counts,
 * calculates queue estimates, and generates heatmap data.
 * Uses Redis for distributed state management in production.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { createClient: createRedisClient } = require('redis');
const { DEPARTMENTS } = require('../journeyData');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

class CrowdMonitor {
    constructor() {
        this.metrics = new Map(); // Local fallback
        this.redis = null;
        this.AVERAGE_SERVICE_MINUTES = 15;
        this.useRedis = !!process.env.REDIS_URL;
    }

    /**
     * Start real-time subscription to department_metrics table
     */
    async startMonitoring() {
        console.log('📡 Starting real-time crowd monitor...');

        if (this.useRedis) {
            try {
                this.redis = createRedisClient({ url: process.env.REDIS_URL });
                await this.redis.connect();
                console.log('🔗 Redis connected for Distributed Crowd Metrics');
            } catch (err) {
                console.error('❌ Redis connection failed, falling back to local memory:', err);
                this.useRedis = false;
            }
        }

        supabase
            .channel('public:department_metrics')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'department_metrics' }, async payload => {
                const metric = payload.new;
                console.log('🔥 Live Metric Update:', metric.node_id, 'Load:', metric.load_percentage);

                if (this.useRedis) {
                    await this.redis.hSet('medimap:metrics', metric.node_id, JSON.stringify(metric));
                } else {
                    this.metrics.set(metric.node_id, metric);
                }
            })
            .subscribe();

        // Initial fetch
        await this.refreshAllMetrics();
    }

    async refreshAllMetrics() {
        const { data, error } = await supabase
            .from('department_metrics')
            .select('*');

        if (error) {
            console.error('Error fetching metrics:', error);
            return;
        }

        for (const metric of data) {
            if (this.useRedis) {
                await this.redis.hSet('medimap:metrics', metric.node_id, JSON.stringify(metric));
            } else {
                this.metrics.set(metric.node_id, metric);
            }
        }
        console.log(`📊 Initialized live metrics for ${data.length} departments.`);
    }

    /**
     * Get real-time crowd data for all departments
     */
    async getLiveSnapshot() {
        const snapshot = [];
        if (this.useRedis) {
            const allMetrics = await this.redis.hGetAll('medimap:metrics');
            Object.keys(allMetrics).forEach(id => {
                const metric = JSON.parse(allMetrics[id]);
                snapshot.push(this._formatMetric(metric));
            });
        } else {
            this.metrics.forEach((metric, id) => {
                snapshot.push(this._formatMetric(metric));
            });
        }
        return snapshot;
    }

    _formatMetric(metric) {
        return {
            nodeId: metric.node_id,
            density: metric.load_percentage,
            congestionScore: metric.congestion_score,
            queueCount: metric.queue_count,
            estimatedWait: this._calculateWaitTime(metric),
            activeDoctors: metric.active_doctors
        };
    }

    /**
     * Calculate estimated wait time in minutes
     */
    _calculateWaitTime(metric) {
        const queue = metric.queue_count || 0;
        const doctors = metric.active_doctors || 1;
        return Math.round((queue * this.AVERAGE_SERVICE_MINUTES) / doctors);
    }

    /**
     * Generate normalized heatmap intensity (0 - 1)
     */
    async getHeatmapIntensity() {
        const intensityMap = {};
        if (this.useRedis) {
            const allMetrics = await this.redis.hGetAll('medimap:metrics');
            Object.keys(allMetrics).forEach(id => {
                const metric = JSON.parse(allMetrics[id]);
                intensityMap[id] = parseFloat(metric.congestion_score.toFixed(2));
            });
        } else {
            this.metrics.forEach((metric, id) => {
                intensityMap[id] = parseFloat(metric.congestion_score.toFixed(2));
            });
        }
        return intensityMap;
    }

    /**
     * Find alternative departments based on live load
     */
    async findLiveAlternative(nodeId) {
        let target;
        if (this.useRedis) {
            const targetRaw = await this.redis.hGet('medimap:metrics', nodeId);
            target = targetRaw ? JSON.parse(targetRaw) : null;
        } else {
            target = this.metrics.get(nodeId);
        }

        if (!target || target.load_percentage < 0.7) return null;

        const deptInfo = DEPARTMENTS[nodeId];
        if (!deptInfo) return null;

        let bestAlt = null;
        let lowestLoad = 1.0;

        const allMetrics = this.useRedis ? await this.redis.hGetAll('medimap:metrics') : null;

        const processCandidate = (metric, id) => {
            if (id === nodeId) return;
            const candidateInfo = DEPARTMENTS[id];
            if (candidateInfo && candidateInfo.category === deptInfo.category) {
                if (metric.load_percentage < lowestLoad) {
                    lowestLoad = metric.load_percentage;
                    bestAlt = {
                        nodeId: id,
                        name: metric.name || candidateInfo.name,
                        load: metric.load_percentage,
                        wait: this._calculateWaitTime(metric)
                    };
                }
            }
        };

        if (this.useRedis && allMetrics) {
            Object.keys(allMetrics).forEach(id => {
                processCandidate(JSON.parse(allMetrics[id]), id);
            });
        } else if (!this.useRedis) {
            this.metrics.forEach((metric, id) => {
                processCandidate(metric, id);
            });
        }

        return bestAlt && bestAlt.load < 0.6 ? bestAlt : null;
    }
}

module.exports = new CrowdMonitor();
