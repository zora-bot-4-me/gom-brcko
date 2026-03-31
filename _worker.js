// Cloudflare Worker — GOM Brčko
// Handles GitHub OAuth for Decap CMS + serves static assets

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── OAuth: redirect to GitHub login ──────────────────
    if (url.pathname === '/oauth') {
      const params = new URLSearchParams({
        client_id:    env.GH_CLIENT_ID,
        redirect_uri: `${url.origin}/oauth/callback`,
        scope:        'repo',
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`, 302
      );
    }

    // ── OAuth: callback — exchange code for token ─────────
    if (url.pathname === '/oauth/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Nedostaje OAuth kod.', { status: 400 });
      }

      const tokenRes = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Accept':       'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id:     env.GH_CLIENT_ID,
            client_secret: env.GH_CLIENT_SECRET,
            code,
          }),
        }
      );

      const data  = await tokenRes.json();
      const token = data.access_token;

      if (!token) {
        return new Response('OAuth greška: token nije dobiven.', { status: 500 });
      }

      // Vrati token CMS-u putem postMessage
      const html = `<!DOCTYPE html><html><body><script>
        (function() {
          const msg = 'authorization:github:success:' +
            JSON.stringify({ token: ${JSON.stringify(token)}, provider: 'github' });
          window.opener && window.opener.postMessage(msg, '*');
          window.close();
        })();
      </script></body></html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // ── Sve ostalo: statički fajlovi ─────────────────────
    return env.ASSETS.fetch(request);
  },
};
