import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function - ESP32 Trigger Endpoint
 * This handles POST /api/trigger requests from ESP32
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for ESP32
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const { device, action, sensor, data } = req.body;

    // Validate request
    if (!device || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: device, action'
      });
    }

    // Simulate IoT data anchoring (MOCK mode for Vercel)
    const txId = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dataHash = `mock_hash_${Math.random().toString(36).substr(2, 16)}`;

    // Simulate payment nonce
    let paymentNonce = null;
    if (action === 'open' || action === 'access') {
      paymentNonce = `mock_payment_${Date.now()}`;
    }

    const duration = Date.now() - startTime;

    // Return success response
    const response = {
      success: true,
      message: `Access ${action} for ${device}`,
      mode: 'serverless',
      data: {
        device,
        action,
        txId,
        dataHash,
        paymentNonce,
        probability: 0.99,
        timestamp: Date.now(),
        duration: `${duration}ms`,
        sensor: sensor || 'unknown',
        metadata: data || {}
      },
      ui: {
        status: action === 'open' ? 'Access Granted' : 'Action Completed',
        color: 'green',
        icon: action === 'open' ? '🔓' : '✓'
      }
    };

    return res.status(200).json(response);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      ui: {
        status: 'Error',
        color: 'red',
        icon: '❌'
      }
    });
  }
}
