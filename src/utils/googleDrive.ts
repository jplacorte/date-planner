import { google } from 'googleapis';
import { Readable } from 'stream';

export interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

/**
 * Initializes Google Drive API client using either:
 * 1. OAuth2 user credentials (personal Gmail quota - recommended for personal Drive uploads)
 * 2. Service Account JWT (requires Google Workspace Shared Drive for writes, or read-only)
 */
function getGoogleDriveClient() {
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  // 1. If OAuth2 credentials are provided, use user-level authorization (unlimited personal quota)
  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const oauth2Client = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
    oauth2Client.setCredentials({ refresh_token: oauthRefreshToken });
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  // 2. Fallback to Service Account JWT
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Uploads a buffer or stream to Google Drive and sets public read permissions.
 */
export async function uploadFileToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    const drive = getGoogleDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!drive) {
      return {
        success: false,
        error: 'Google Drive credentials not configured in .env.local',
      };
    }

    const fileStream = new Readable();
    fileStream.push(fileBuffer);
    fileStream.push(null);

    // Create file metadata
    const requestBody: { name: string; parents?: string[] } = {
      name: `date_${Date.now()}_${fileName}`,
    };

    if (folderId) {
      requestBody.parents = [folderId];
    }

    // 1. Upload file to Google Drive
    const fileResponse = await drive.files.create({
      requestBody,
      media: {
        mimeType: mimeType || 'image/jpeg',
        body: fileStream,
      },
      fields: 'id, name, webViewLink, thumbnailLink',
      supportsAllDrives: true,
    });

    const fileId = fileResponse.data.id;
    if (!fileId) {
      return {
        success: false,
        error: 'Google Drive failed to return a file ID.',
      };
    }

    // 2. Set file permission to anyone with link (reader) so web app can display it
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        supportsAllDrives: true,
      });
    } catch (permError) {
      console.warn('Could not set public permission on Google Drive file:', permError);
    }

    // 3. Generate direct high-res CDN embed URL
    const directPhotoUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    return {
      success: true,
      url: directPhotoUrl,
      fileId,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Google Drive upload error';
    console.error('Google Drive Upload Error:', error);
    return {
      success: false,
      error: message,
    };
  }
}
