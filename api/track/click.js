// Serverless Function for Email Link Click Tracking & Redirection
export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { campaignId, leadId, email, url } = req.query || {};

  console.log(`🖱️ EMAIL LINK CLICKED! Campaign: ${campaignId}, Lead: ${leadId}, Email: ${email}, TargetURL: ${url}`);

  const destination = url ? decodeURIComponent(url) : 'https://growie-ruddy.vercel.app';

  // 302 Temporary Redirect to destination URL
  return res.redirect(302, destination);
}
