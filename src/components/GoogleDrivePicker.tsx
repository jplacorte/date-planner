'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ExternalLink, Image as ImageIcon, FolderCheck } from 'lucide-react';

interface DrivePhoto {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

interface GoogleDrivePickerProps {
  onSelectPhoto: (url: string) => void;
}

export default function GoogleDrivePicker({ onSelectPhoto }: GoogleDrivePickerProps) {
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [folderId, setFolderId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchDrivePhotos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/drive/photos');
      if (res.ok) {
        const data = await res.json();
        if (data.photos) {
          setPhotos(data.photos);
        }
        if (data.folderId) {
          setFolderId(data.folderId);
        }
      }
    } catch (e) {
      console.error('Error fetching Google Drive photos:', e);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/drive/photos')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.photos) setPhotos(data.photos);
        if (data.folderId) setFolderId(data.folderId);
        setHasLoaded(true);
      })
      .catch((e) => {
        console.error('Error fetching Google Drive photos:', e);
        if (isMounted) setHasLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const folderUrl = folderId
    ? `https://drive.google.com/drive/folders/${folderId}`
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
            onClick={fetchDrivePhotos}
            disabled={loading}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Refresh photos"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
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

      {loading && !hasLoaded ? (
        <div className="py-6 text-center text-zinc-500 font-mono text-[11px]">
          Connecting to Google Drive...
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-40 overflow-y-auto pr-1">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelectPhoto(photo.url)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-white/15 hover:border-white transition-all hover:scale-105"
              title={photo.name}
            >
              <img
                src={photo.url}
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
          <p className="text-[11px] text-zinc-400 font-medium">No photos in folder yet</p>
          <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
            Drop or upload photos into your shared Google Drive folder, then click Refresh!
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
