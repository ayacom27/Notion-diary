export const config = {
  api: { bodyParser: false },
};

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

  // raw bodyをそのまま転送（JSON・multipartどちらも対応）
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: fwdHeaders,
    body: rawBody.length > 0 ? rawBody : undefined,
  });

  const buf = await response.arrayBuffer();
  res.status(response.status);
  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
  res.send(Buffer.from(buf));
}
