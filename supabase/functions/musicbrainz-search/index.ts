const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const publicSite = Deno.env.get('QR_PUBLIC_SITE_URL') ?? '';
  const headers = { ...corsHeaders, 'Access-Control-Allow-Origin': origin || publicSite };

  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405, headers });
  if (!req.headers.get('authorization')) return Response.json({ error: 'Sign-in required' }, { status: 401, headers });
  if (!publicSite || !origin || new URL(origin).origin !== new URL(publicSite).origin) {
    return Response.json({ error: 'Configure QR_PUBLIC_SITE_URL to the deployed site origin.' }, { status: 403, headers });
  }

  try {
    const body = await req.json();
    const term = String(body?.term ?? '').trim().slice(0, 100);
    if (term.length < 2) return Response.json({ error: 'Enter at least two search characters.' }, { status: 400, headers });

    // The API asks clients to identify themselves and keep to one request/second.
    // The browser UI also spaces owner-triggered lookups by at least 1.1 seconds.
    const lucene = term.replace(/[\\"+\-&|!(){}\[\]^~*?:\/]/g, '\\$&');
    const params = new URLSearchParams({ query: `releasegroup:"${lucene}"`, fmt: 'json', limit: '8' });
    const response = await fetch(`https://musicbrainz.org/ws/2/release-group/?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': `QuietRevolutionsVinylScanner/1.0 (${publicSite})` },
    });
    if (!response.ok) return Response.json({ error: `MusicBrainz returned ${response.status}.` }, { status: 502, headers });
    return Response.json(await response.json(), { headers });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Search failed.' }, { status: 500, headers });
  }
});
