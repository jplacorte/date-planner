import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

const DATABASE_FILENAME = 'dates_database.json';

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
    scopes: ['https://www.googleapis.com/auth/drive'],
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
        error: 'Google Drive credentials not configured in .env.local',
        exists: false,
      });
    }

    // Find database file in Google Drive folder
    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and name = '${DATABASE_FILENAME}' and trashed = false`,
      fields: 'files(id, name, modifiedTime)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = listRes.data.files || [];
    if (files.length === 0) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'No dates_database.json found in Google Drive yet.',
      });
    }

    const fileId = files[0].id;
    if (!fileId) {
      return NextResponse.json({ success: true, exists: false });
    }

    // Read content of dates_database.json
    const fileContent = await drive.files.get(
      {
        fileId,
        alt: 'media',
        supportsAllDrives: true,
      },
      { responseType: 'text' }
    );

    let parsedData = null;
    try {
      parsedData = typeof fileContent.data === 'string' ? JSON.parse(fileContent.data) : fileContent.data;
    } catch {
      parsedData = null;
    }

    return NextResponse.json({
      success: true,
      exists: true,
      fileId,
      modifiedTime: files[0].modifiedTime,
      data: parsedData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch database from Google Drive';
    console.error('Google Drive Sync GET error:', error);
    return NextResponse.json(
      { success: false, error: message, exists: false },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const drive = getGoogleDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!drive || !folderId) {
      return NextResponse.json(
        { success: false, error: 'Google Drive credentials not configured in .env.local' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const payload = {
      version: 3,
      lastUpdated: new Date().toISOString(),
      dates: body.dates || [],
      coupleProfile: body.coupleProfile || null,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const stream = new Readable();
    stream.push(jsonString);
    stream.push(null);

    // Check if database file already exists
    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and name = '${DATABASE_FILENAME}' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = listRes.data.files || [];

    if (files.length > 0 && files[0].id) {
      // Update existing database file
      const fileId = files[0].id;
      await drive.files.update({
        fileId,
        media: {
          mimeType: 'application/json',
          body: stream,
        },
        supportsAllDrives: true,
      });

      return NextResponse.json({
        success: true,
        message: 'Google Drive database updated successfully',
        fileId,
        lastUpdated: payload.lastUpdated,
      });
    } else {
      // Create new database file
      const createRes = await drive.files.create({
        requestBody: {
          name: DATABASE_FILENAME,
          parents: [folderId],
        },
        media: {
          mimeType: 'application/json',
          body: stream,
        },
        supportsAllDrives: true,
        fields: 'id, name',
      });

      return NextResponse.json({
        success: true,
        message: 'Google Drive database created successfully',
        fileId: createRes.data.id,
        lastUpdated: payload.lastUpdated,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save database to Google Drive';
    console.error('Google Drive Sync POST error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
