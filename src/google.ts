import { docs_v1, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as http from 'http';
import { URL } from 'url';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

/**
 * Starts a local HTTP server to capture the authorization code from Google's redirect.
 */
function getAuthCode(): Promise<string> {
    console.log("auth server start");
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) return;
      const reqUrl = new URL(req.url, 'http://localhost:3000');
      const code = reqUrl.searchParams.get('code');

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authentication successful! You can close this window.</h1>');
        server.close();
        resolve(code);
      }
    });

    server.listen(3000, () => {
      // Generate the URL the user needs to visit to consent
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/documents'],
      });
      console.log('Authorize this app by visiting this url:\n', authUrl);
    });
  });
}

/**
 * Authenticates the user and returns an authenticated Docs client.
 */
async function getAuthenticatedDocsClient(): Promise<docs_v1.Docs> {
  const code = await getAuthCode();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  return google.docs({ version: 'v1', auth: oauth2Client });
}

/**
 * Appends text to a document using user-delegated OAuth2 credentials.
 */
async function appendText(docsClient: docs_v1.Docs, documentId: string, text: string) {
  const res = await docsClient.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            endOfSegmentLocation: { segmentId: '' },
            text,
          },
        },
      ],
    },
  });
  console.log('Update successful:', res.data);
}

// Run the flow

async function a()
{

const docsClient = await getAuthenticatedDocsClient();
const DOCUMENT_ID = '19Z06Syc2PqjEe6nqbMMplqqxFVodzFMEMw5VEJ40Ga8';
await appendText(docsClient, DOCUMENT_ID, '\nUpdated using OAuth2 user authentication!');
console.log("complete");
}

console.log("start");


export default a;