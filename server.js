import express from 'express';
import { OAuth2Client } from 'google-auth-library';

const app = express();
const port = process.env.PORT || 3000;

// Google OAuth basic setup
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://timecashking-api.onrender.com/integrations/google/callback';

const oauth2Client = new OAuth2Client({
  clientId: googleClientId,
  clientSecret: googleClientSecret,
  redirectUri: googleRedirectUri,
});

app.get('/integrations/google/auth', (req, res) => {
  if (!googleClientId || !googleClientSecret) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }
  const scopes = [
    'openid',
    'email',
    'profile',
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.redirect(url);
});

app.get('/integrations/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: 'Missing code' });
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // For demo: decode id_token if present
    const idToken = tokens.id_token;
    res.json({
      ok: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        id_token: idToken,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'OAuth callback failed', detail: String(err) });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

app.get('/', (req, res) => {
  res.json({ status: 'up', service: 'timecashking-api' });
});

app.listen(port, () => {
  console.log('server listening on port ' + port);
});
