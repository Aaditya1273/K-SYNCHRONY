import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health Check Endpoint
 */

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    status: 'ok',
    service: 'K-Synchrony ESP32 Backend',
    platform: 'Vercel Serverless',
    network: 'testnet',
    mode: 'serverless',
    timestamp: Date.now()
  });
}
