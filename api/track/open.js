import { recordTrackingEvent } from './events.js';

// Serverless Function for 1x1 Email Open Tracking Pixel
export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { campaignId, leadId, email, tenantId } = req.query || {};

  // 1x1 Transparent GIF Buffer
  const pixelBuffer = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  // Set No-Cache headers so email clients re-request image
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Content-Length', pixelBuffer.length);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Record Open Event in System Store
  try {
    recordTrackingEvent({
      type: 'open',
      campaignId: campaignId || '',
      leadId: leadId || '',
      email: email || '',
      tenantId: tenantId || 't1'
    });
  } catch (e) {}

  console.log(`👁️ EMAIL TRACKING PIXEL OPENED! Campaign: ${campaignId}, Lead: ${leadId}, Email: ${email}, Time: ${new Date().toISOString()}`);

  // Return pixel image
  return res.status(200).send(pixelBuffer);
}
