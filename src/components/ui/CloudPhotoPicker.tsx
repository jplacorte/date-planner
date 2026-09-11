'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  Cloud,
  FolderCheck,
} from 'lucide-react';

import { apiFetch } from '@/lib/http/api-client';

interface CloudinaryPhoto {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  folder?: string;
  createdAt: string;
}

interface CloudinaryPhotosResponse {
  photos: CloudinaryPhoto[];
  total: number;
  cloudName: string;
}

interface DrivePhoto {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

interface DrivePhotosResponse {
  photos: DrivePhoto[];
  folderId: string;
}

interface CloudPhotoPickerProps {
  onSelectPhoto: (url: string) => void;
  folder?: string;
}

export default function CloudPhotoPicker({
  onSelectPhoto,
  folder,
}: CloudPhotoPickerProps) {
  const [userSelectedTab, setUserSelectedTab] = useState<
    'cloudinary' | 'drive' | null
  >(null);

  // Cloudinary state
  const [cloudinaryPhotos, setCloudinaryPhotos] = useState<CloudinaryPhoto[]>([]);
  const [cloudName, setCloudName] = useState('');
  const [isCloudinaryLoading, setIsCloudinaryLoading] = useState(true);
  const [cloudinaryError, setCloudinaryError] = useState(false);

  // Google Drive fallback state
  const [drivePhotos, setDrivePhotos] = useState<DrivePhoto[]>([]);
  const [driveFolderId, setDriveFolderId] = useState('');
  const [isDriveLoading, setIsDriveLoading] = useState(true);

  // Fetch logic
  const loadCloudinary = useCallback(async () => {
    setIsCloudinaryLoading(true);
    setCloudinaryError(false);
    try {
      const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
      const res = await apiFetch<CloudinaryPhotosResponse>(
        `/api/cloudinary/photos${query}`
      );
      setCloudinaryPhotos(res.photos || []);
      setCloudName(res.cloudName || '');
    } catch {
      setCloudinaryError(true);
    } finally {
      setIsCloudinaryLoading(false);
    }
  }, [folder]);

  const loadDrive = useCallback(async () => {
    setIsDriveLoading(true);
    try {
      const res = await apiFetch<DrivePhotosResponse>('/api/drive/photos');
      setDrivePhotos(res.photos || []);
      setDriveFolderId(res.folderId || '');
    } catch {
      // Drive unconfigured or failed
    } finally {
      setIsDriveLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
        const res = await apiFetch<CloudinaryPhotosResponse>(
          `/api/cloudinary/photos${query}`
        );
        if (!cancelled) {
          setCloudinaryPhotos(res.photos || []);
          setCloudName(res.cloudName || '');
          setIsCloudinaryLoading(false);
        }
      } catch {
        if (!cancelled) {
          setCloudinaryError(true);
          setIsCloudinaryLoading(false);
        }
      }

      try {
        const driveRes = await apiFetch<DrivePhotosResponse>('/api/drive/photos');
        if (!cancelled) {
          setDrivePhotos(driveRes.photos || []);
          setDriveFolderId(driveRes.folderId || '');
          setIsDriveLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsDriveLoading(false);
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [folder]);

  // Derive effective active tab: if user hasn't explicitly clicked a tab,
  // default to Drive only if Cloudinary is empty/failed and Drive has photos.
  const activeTab =
    userSelectedTab ??
    (!isCloudinaryLoading &&
    (cloudinaryError || cloudinaryPhotos.length === 0) &&
    drivePhotos.length > 0
      ? 'drive'
      : 'cloudinary');

  const handleRefresh = () => {
    if (activeTab === 'cloudinary') {
      void loadCloudinary();
    } else {
      void loadDrive();
    }
  };

  const cloudinaryConsoleUrl =
    cloudName && cloudName !== 'dibx7ua1g'
      ? `https://console.cloudinary.com/console/c-${encodeURIComponent(
          cloudName
        )}/media_library/folders`
      : 'https://console.cloudinary.com/app/c-be39a35296904ad2f4da9493bacca0/assets/media_library/folders/d048473fba8801aa3bfff9416153a94fd6?view_mode=list';

  const driveFolderUrl = driveFolderId
    ? `https://drive.google.com/drive/folders/${encodeURIComponent(driveFolderId)}`
    : 'https://drive.google.com';

  const activePhotos =
    activeTab === 'cloudinary'
      ? cloudinaryPhotos.map((p) => ({
          id: p.id,
          name: p.name,
          url: p.url,
          thumbnailUrl: p.thumbnailUrl,
        }))
      : drivePhotos.map((p) => ({
          id: p.id,
          name: p.name,
          url: p.url,
          thumbnailUrl: p.thumbnailUrl,
        }));

  const isLoading =
    activeTab === 'cloudinary' ? isCloudinaryLoading : isDriveLoading;

  return (
    <div className="space-y-2 bg-black/80 p-3 rounded-2xl border border-white/10 text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Storage Tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setUserSelectedTab('cloudinary')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'cloudinary'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>
                Cloudinary{' '}
                {cloudinaryPhotos.length > 0 && `(${cloudinaryPhotos.length})`}
              </span>
            </button>

            {drivePhotos.length > 0 && (
              <button
                type="button"
                onClick={() => setUserSelectedTab('drive')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'drive'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FolderCheck className="w-3.5 h-3.5" />
                <span>Google Drive ({drivePhotos.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Refresh photos"
          >
            <RefreshCw
              className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>

          <a
            href={
              activeTab === 'cloudinary'
                ? cloudinaryConsoleUrl
                : driveFolderUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
          >
            <span>Open Library</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Photos Grid or Empty State */}
      {isLoading ? (
        <div className="py-6 text-center text-zinc-500 font-mono text-[11px]">
          Loading {activeTab === 'cloudinary' ? 'Cloudinary' : 'Google Drive'}{' '}
          photos...
        </div>
      ) : activePhotos.length > 0 ? (
        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-40 overflow-y-auto pr-1">
          {activePhotos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelectPhoto(photo.url)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-white/15 hover:border-white transition-all hover:scale-105 bg-zinc-900"
              title={photo.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnailUrl}
                alt={photo.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[9px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm">
                  Select
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center space-y-1.5 border border-dashed border-white/10 rounded-xl bg-zinc-950/60 p-2">
          <ImageIcon className="w-5 h-5 text-zinc-600 mx-auto" />
          <p className="text-[11px] text-zinc-400 font-medium">
            {activeTab === 'cloudinary'
              ? 'No Cloudinary photos yet'
              : 'No photos in Drive folder'}
          </p>
          <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
            {activeTab === 'cloudinary'
              ? 'Upload photos using the button above or drop photos in Cloudinary!'
              : 'Drop photos into your Google Drive folder, then click Refresh.'}
          </p>
          <a
            href={
              activeTab === 'cloudinary'
                ? cloudinaryConsoleUrl
                : driveFolderUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-accent/20 text-zinc-200 hover:text-accent-soft font-semibold text-[10px] transition-colors mt-1"
          >
            <span>
              {activeTab === 'cloudinary'
                ? 'Open Cloudinary Media Library'
                : 'Open Google Drive Folder'}
            </span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}
