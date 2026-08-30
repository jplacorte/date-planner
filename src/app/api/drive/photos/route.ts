import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export interface DrivePhoto {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  createdTime?: string;
}

function getGoogleDriveClient() {
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const oauth2Client = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
    oauth2Client.setCredentials({ refresh_token: oauthRefreshToken });
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

export async function GET() {
  try {
    const drive = getGoogleDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!drive || !folderId) {
      return NextResponse.json({
        success: false,
        error: 'Google Drive not configured in .env.local',
        photos: [],
      });
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 50,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files || [];

    const photos: DrivePhoto[] = files.map((file) => ({
      id: file.id || '',
      name: file.name || 'Photo',
      url: `https://lh3.googleusercontent.com/d/${file.id}`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
      createdTime: file.createdTime || undefined,
    }));

    return NextResponse.json({
      success: true,
      photos,
      folderId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list Google Drive photos';
    console.error('Google Drive list error:', error);
    return NextResponse.json(
      { success: false, error: message, photos: [] },
      { status: 500 }
    );
  }
}
