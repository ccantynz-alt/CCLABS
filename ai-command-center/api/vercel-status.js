/**
 * Vercel deployment status – serverless endpoint for real build status (Empire State).
 * Same token as deploy: set VERCEL_TOKEN in Vercel project env (Settings → Environment Variables).
 * GET /api/vercel-status → { deployments: [ { id, url, state: "READY"|"ERROR"|"BUILDING"|... } ] }
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

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return res.status(503).json({
      error: 'VERCEL_TOKEN not set',
      hint: 'Add VERCEL_TOKEN in Vercel project Settings → Environment Variables, then redeploy.',
    });
  }

  const projectId = process.env.VERCEL_PROJECT_ID || '';
  const params = new URLSearchParams({ limit: '20', target: 'production' });
  if (projectId) params.set('projectId', projectId);

  try {
    const apiRes = await fetch(`${VERCEL_API}/v6/deployments?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(apiRes.status).json({
        error: 'Vercel API error',
        detail: errText.slice(0, 300),
      });
    }

    const data = await apiRes.json();
    const deployments = (data.deployments || []).map((d) => ({
      id: d.uid,
      url: d.url || d.alias?.[0] || '',
      state: d.state || d.readyState || 'UNKNOWN',
    }));

    return res.status(200).json({ deployments });
  } catch (e) {
    return res.status(500).json({
      error: 'Status check failed',
      detail: e.message || String(e),
    });
  }
}
