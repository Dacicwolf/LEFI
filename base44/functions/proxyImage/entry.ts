import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { url } = await req.json();
  if (!url) return Response.json({ error: 'Missing url' }, { status: 400 });

  const response = await fetch(url);
  if (!response.ok) return Response.json({ error: 'Failed to fetch image' }, { status: 502 });

  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const contentType = response.headers.get('content-type') || 'image/png';

  return Response.json({ base64, contentType });
});