// In-Memory & REST Store for Live Tracking Events (Opens & Clicks)
let trackingEvents = [];

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { type = 'open', campaignId, leadId, email, url, tenantId } = req.body || req.query || {};
    const newEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type,
      campaignId: campaignId || '',
      leadId: leadId || '',
      email: email || '',
      url: url || '',
      tenantId: tenantId || 't1',
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString('pt-BR').slice(0, 5)
    };

    trackingEvents.unshift(newEvent);
    // Keep max 100 recent events
    if (trackingEvents.length > 100) {
      trackingEvents = trackingEvents.slice(0, 100);
    }

    return res.status(200).json({ success: true, event: newEvent, total: trackingEvents.length });
  }

  if (req.method === 'DELETE') {
    trackingEvents = [];
    return res.status(200).json({ success: true, message: 'Events cleared.' });
  }

  // GET: Return all recent tracking events
  return res.status(200).json({
    success: true,
    events: trackingEvents,
    count: trackingEvents.length
  });
}

// Export helper to register events directly from open.js or click.js
export function recordTrackingEvent(eventData) {
  const newEvent = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    type: eventData.type || 'open',
    campaignId: eventData.campaignId || '',
    leadId: eventData.leadId || '',
    email: eventData.email || '',
    url: eventData.url || '',
    tenantId: eventData.tenantId || 't1',
    timestamp: new Date().toISOString(),
    timeFormatted: new Date().toLocaleTimeString('pt-BR').slice(0, 5)
  };

  trackingEvents.unshift(newEvent);
  if (trackingEvents.length > 100) {
    trackingEvents = trackingEvents.slice(0, 100);
  }
  return newEvent;
}
