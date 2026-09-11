'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  FolderCheck,
} from 'lucide-react';

import { apiFetch } from '@/lib/http/api-client';

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

interface GoogleDrivePickerProps {
  onSelectPhoto: (url: string) => void;
}

export default function GoogleDrivePicker({
  onSelectPhoto,
}: GoogleDrivePickerProps) {
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [folderId, setFolderId] = useState('');
  // Starts true: the first load begins immediately in the effect below, and
  // setting it there would be a synchronous state update during render.
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const applyResult = useCallback((result: DrivePhotosResponse) => {
    setPhotos(result.photos);
    setFolderId(result.folderId);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    apiFetch<DrivePhotosResponse>('/api/drive/photos', {
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) applyResult(result);
      })
      .catch((error: unknown) => {
        // Drive being unconfigured is an expected state, not a failure to show.
        if (!controller.signal.aborted) {
          console.warn('Could not load Google Drive photos:', error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setHasLoaded(true);
        }
      });

    return () => controller.abort();
  }, [applyResult]);

  /** Manual refresh from the button; safe to set state synchronously here. */
  const refreshDrivePhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      applyResult(await apiFetch<DrivePhotosResponse>('/api/drive/photos'));
    } catch (error) {
      console.warn('Could not refresh Google Drive photos:', error);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [applyResult]);

  const folderUrl = folderId
    ? `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`
    : 'https://drive.google.com';

  return (
    <div className="space-y-2 bg-black/80 p-3 rounded-2xl border border-white/10 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-[11px]">
          <FolderCheck className="w-3.5 h-3.5 text-white" />
          <span>My Google Drive Photos ({photos.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refreshDrivePhotos()}
            disabled={isLoading}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Refresh photos"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
          >
            <span>Open Folder</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {isLoading && !hasLoaded ? (
        <div className="py-6 text-center text-zinc-500 font-mono text-[11px]">
          Connecting to Google Drive...
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-40 overflow-y-auto pr-1">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelectPhoto(photo.url)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-white/15 hover:border-white transition-all hover:scale-105"
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
            No photos in folder yet
          </p>
          <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
            Drop or upload photos into your shared Google Drive folder, then
            click Refresh!
          </p>
          <a
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-[10px] transition-colors mt-1"
          >
            <span>Upload to Google Drive</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}
