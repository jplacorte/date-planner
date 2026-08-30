import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const clientId = process.argv[2] || process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.argv[3] || process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.log(`
Usage:
  node scripts/get-refresh-token.mjs <GOOGLE_CLIENT_ID> <GOOGLE_CLIENT_SECRET>

How to get Client ID & Secret:
  1. Go to Google Cloud Console (https://console.cloud.google.com)
  2. Under APIs & Services -> Credentials -> Create Credentials -> OAuth Client ID
  3. Application Type: "Web application"
  4. Authorized redirect URIs: Add "http://localhost:8085"
  5. Click Create and copy the Client ID & Client Secret!
`);
  process.exit(1);
}

const REDIRECT_URI = 'http://localhost:8085';
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive',
  ],
});

console.log('\n======================================================');
console.log('1. Open this link in your browser to authorize Google Drive:');
console.log('------------------------------------------------------');
console.log(authUrl);
console.log('======================================================\n');
console.log('Waiting for authorization callback on http://localhost:8085 ...');

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/') {
      const code = parsedUrl.query.code;
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorization Successful!</h1><p>You can close this tab and return to your terminal.</p>');

        const { tokens } = await oauth2Client.getToken(code);
        console.log('\nSUCCESS! Tokens received.');
        console.log('Refresh Token:', tokens.refresh_token);

        const envPath = path.resolve(process.cwd(), '.env.local');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

        // Update or append OAuth keys
        if (!envContent.includes('GOOGLE_OAUTH_CLIENT_ID')) {
          envContent += `\nGOOGLE_OAUTH_CLIENT_ID="${clientId}"\nGOOGLE_OAUTH_CLIENT_SECRET="${clientSecret}"\nGOOGLE_OAUTH_REFRESH_TOKEN="${tokens.refresh_token}"\n`;
        } else {
          envContent = envContent.replace(/GOOGLE_OAUTH_CLIENT_ID=.*(\r?\n)?/, `GOOGLE_OAUTH_CLIENT_ID="${clientId}"\n`);
          envContent = envContent.replace(/GOOGLE_OAUTH_CLIENT_SECRET=.*(\r?\n)?/, `GOOGLE_OAUTH_CLIENT_SECRET="${clientSecret}"\n`);
          envContent = envContent.replace(/GOOGLE_OAUTH_REFRESH_TOKEN=.*(\r?\n)?/, `GOOGLE_OAUTH_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
        }

        fs.writeFileSync(envPath, envContent);
        console.log('Saved OAuth credentials directly to .env.local!');
        server.close();
        process.exit(0);
      }
    }
  } catch (err) {
    console.error('Error exchanging token:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error during authorization: ' + err.message);
  }
});

server.listen(8085);
