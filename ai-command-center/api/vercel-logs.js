/**
 * Vercel build logs – serverless endpoint for real deployment events (Self-Healing Bridge).
 * GET /api/vercel-logs?deploymentId=dpl_xxx → { logs: string } (build log text from events).
 * Requires VERCEL_TOKEN in project env.
 */

const VERCEL_API = 'https://api.vercel.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const deploymentId = req.query.deploymentId;
  if (!deploymentId) {
    return res.status(400).json({ error: 'Missing deploymentId query' });
  }

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return res.status(503).json({ error: 'VERCEL_TOKEN not set' });
  }

  try {
    const apiRes = await fetch(
      `${VERCEL_API}/v3/deployments/${encodeURIComponent(deploymentId)}/events?limit=200&direction=backward`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(apiRes.status).json({
        error: 'Vercel API error',
        detail: errText.slice(0, 300),
      });
    }

    const events = await apiRes.json();
    const lines = (Array.isArray(events) ? events : [])
      .filter((e) => e.payload && (e.payload.text != null || e.payload.message != null))
      .map((e) => e.payload.text || e.payload.message || '')
      .filter(Boolean);
    const logs = lines.join('\n') || 'No build log events returned.';

    return res.status(200).json({ logs });
  } catch (e) {
    return res.status(500).json({
      error: 'Logs fetch failed',
      detail: e.message || String(e),
    });
  }
}
