/**
 * Aura-to-Vercel Deployer – serverless endpoint to trigger a real Vercel deployment.
 * Set VERCEL_TOKEN in your Vercel project env (Settings → Environment Variables).
 * POST body: { "projectName": "your-vercel-project-name" }
 */

const VERCEL_API = 'https://api.vercel.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return res.status(503).json({
      error: 'VERCEL_TOKEN not set',
      hint: 'Add VERCEL_TOKEN in Vercel project Settings → Environment Variables, then redeploy.',
    });
  }

  let projectName;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    projectName = (body.projectName || 'ai-command-center').trim().toLowerCase().replace(/\./g, '-');
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const deployRes = await fetch(`${VERCEL_API}/v13/deployments?forceNew=1`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: projectName,
        project: projectName,
        target: 'production',
      }),
    });

    if (!deployRes.ok) {
      const errText = await deployRes.text();
      return res.status(deployRes.status).json({
        error: 'Deploy failed',
        detail: errText.slice(0, 300),
      });
    }

    const deployment = await deployRes.json();
    return res.status(200).json({
      url: deployment.url,
      status: deployment.readyState,
      id: deployment.id,
      alias: deployment.alias || [],
    });
  } catch (e) {
    return res.status(500).json({
      error: 'Deploy request failed',
      detail: e.message || String(e),
    });
  }
}
