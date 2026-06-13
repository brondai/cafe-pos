import type { HealthStatus } from './schema.js';

export function getHealthStatus(): HealthStatus {
  return {
    status: 'ok',
    service: 'cafe-pos-api',
    timestamp: new Date().toISOString(),
  };
}
