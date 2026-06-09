export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'Missing url' });

  const fwdHeaders = {};
  if (req.headers.authorization)     fwdHeaders['Authorization']  = req.headers.authorization;
  if (req.headers['notion-version']) fwdHeaders['Notion-Version'] = req.headers['notion-version'];
  if (req.headers['content-type'])   fwdHeaders['Content-Type']   = req.headers['content-type'];

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: fwdHeaders,
    body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
  });

  const text = await response.text();
  res.status(response.status).send(text);
}
