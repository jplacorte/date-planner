'use client';

import React, { useCallback, useRef, useState } from 'react';

import { useDateContext } from '@/context/DateContext';
import { normalizeGoogleDriveImageUrl } from '@/lib/media/image';
import { uploadImageFile } from '@/lib/media/upload-client';
import type { DateIdea } from '@/types/date';

/**
 * Draft state for a date's memory notes, scrapbook photos and photo ordering.
 *
 * Held above the memory tab rather than inside it, because closing the modal
 * must be able to flush unsaved notes even when another tab is showing.
 */
export function useMemoryEditor(
  selectedDate: DateIdea,
  onSaved: (message: string) => void
) {
  const { saveMemory } = useDateContext();

  const [memoryNotes, setMemoryNotes] = useState(
    selectedDate.memoryNotes || ''
  );
  const [favoriteDish, setFavoriteDish] = useState(
    selectedDate.bestMoments?.favoriteDish || ''
  );
  const [funniestMoment, setFunniestMoment] = useState(
    selectedDate.bestMoments?.funniestMoment || ''
  );
  const [favoriteSong, setFavoriteSong] = useState(
    selectedDate.bestMoments?.favoriteSong || ''
  );
  const [photoCaption, setPhotoCaption] = useState(
    selectedDate.bestMoments?.photoCaption || ''
  );
  const [actualCost, setActualCost] = useState<number | undefined>(
    selectedDate.actualCost
  );
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isUploadingMemoryPhoto, setIsUploadingMemoryPhoto] = useState(false);
  const memoryFileInputRef = useRef<HTMLInputElement>(null);

  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null);
  const [dragOverPhotoIdx, setDragOverPhotoIdx] = useState<number | null>(null);

  const persist = useCallback(
    (photos: string[] | undefined, message: string) => {
      saveMemory(
        selectedDate.id,
        memoryNotes,
        { favoriteDish, funniestMoment, favoriteSong, photoCaption },
        photos,
        actualCost
      );
      onSaved(message);
    },
    [
      saveMemory,
      selectedDate.id,
      memoryNotes,
      favoriteDish,
      funniestMoment,
      favoriteSong,
      photoCaption,
      actualCost,
      onSaved,
    ]
  );

  const handleReorderPhoto = useCallback(
    (fromIdx: number, toIdx: number) => {
      const existing = selectedDate.memoriesPhotos;
      if (!existing) return;

      const photos = [...existing];
      if (toIdx < 0 || toIdx >= photos.length || fromIdx === toIdx) return;

      const [moved] = photos.splice(fromIdx, 1);
      if (moved === undefined) return;
      photos.splice(toIdx, 0, moved);

      persist(photos, `Photo moved to #${toIdx + 1} ✓`);
    },
    [selectedDate.memoriesPhotos, persist]
  );

  const handleSetFeaturedPhoto = useCallback(
    (idx: number) => {
      if (!selectedDate.memoriesPhotos || idx === 0) return;
      handleReorderPhoto(idx, 0);
      onSaved('Set as #1 featured scrapbook photo ✓');
    },
    [selectedDate.memoriesPhotos, handleReorderPhoto, onSaved]
  );

  const handleRemoveMemoryPhoto = useCallback(
    (idx: number) => {
      if (!selectedDate.memoriesPhotos) return;
      const photos = selectedDate.memoriesPhotos.filter((_, i) => i !== idx);
      persist(photos, 'Photo removed ✓');
    },
    [selectedDate.memoriesPhotos, persist]
  );

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedPhotoIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragOverPhotoIdx !== index) setDragOverPhotoIdx(index);
    },
    [dragOverPhotoIdx]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedPhotoIdx !== null && draggedPhotoIdx !== dropIndex) {
        handleReorderPhoto(draggedPhotoIdx, dropIndex);
      }
      setDraggedPhotoIdx(null);
      setDragOverPhotoIdx(null);
    },
    [draggedPhotoIdx, handleReorderPhoto]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedPhotoIdx(null);
    setDragOverPhotoIdx(null);
  }, []);

  const handleMemoryFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingMemoryPhoto(true);
      try {
        const folder = selectedDate.cloudinaryFolder || selectedDate.title;
        const uploaded = await uploadImageFile(file, {
          folder,
          dateTitle: selectedDate.title,
        });
        persist(
          [...(selectedDate.memoriesPhotos || []), uploaded.url],
          'Photo uploaded to scrapbook ✓'
        );
      } catch (error) {
        console.error('Failed to upload memory photo:', error);
        onSaved('Could not upload that photo. Try another image.');
      } finally {
        setIsUploadingMemoryPhoto(false);
        // Allow re-selecting the same file after a failure.
        e.target.value = '';
      }
    },
    [
      selectedDate.memoriesPhotos,
      selectedDate.cloudinaryFolder,
      selectedDate.title,
      persist,
      onSaved,
    ]
  );

  /** Adds an already-hosted photo URL, e.g. picked from Drive. */
  const addPhotoUrl = useCallback(
    (url: string, message: string) => {
      const photos = [...(selectedDate.memoriesPhotos || [])];
      if (!photos.includes(url)) photos.push(url);
      persist(photos, message);
    },
    [selectedDate.memoriesPhotos, persist]
  );

  const handleAutoSaveMemory = useCallback(() => {
    persist(selectedDate.memoriesPhotos, 'Memory saved ✓');
  }, [persist, selectedDate.memoriesPhotos]);

  const handleSaveMemory = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      const photos = selectedDate.memoriesPhotos
        ? [...selectedDate.memoriesPhotos]
        : [];

      if (newPhotoUrl.trim()) {
        const cleanUrl = normalizeGoogleDriveImageUrl(newPhotoUrl.trim());
        if (!photos.includes(cleanUrl)) photos.push(cleanUrl);
      }

      persist(photos, 'Memories & scrapbook saved ✓');
      setNewPhotoUrl('');
    },
    [selectedDate.memoriesPhotos, newPhotoUrl, persist]
  );

  /** True when a draft field differs from the saved record. */
  const hasUnsavedChanges = useCallback(
    () =>
      memoryNotes !== (selectedDate.memoryNotes || '') ||
      favoriteDish !== (selectedDate.bestMoments?.favoriteDish || '') ||
      funniestMoment !== (selectedDate.bestMoments?.funniestMoment || '') ||
      favoriteSong !== (selectedDate.bestMoments?.favoriteSong || '') ||
      photoCaption !== (selectedDate.bestMoments?.photoCaption || '') ||
      actualCost !== selectedDate.actualCost,
    [
      memoryNotes,
      favoriteDish,
      funniestMoment,
      favoriteSong,
      photoCaption,
      actualCost,
      selectedDate,
    ]
  );

  /** Persists pending edits without a toast. Called when the modal closes. */
  const flushPendingChanges = useCallback(() => {
    if (!hasUnsavedChanges()) return;
    saveMemory(
      selectedDate.id,
      memoryNotes,
      { favoriteDish, funniestMoment, favoriteSong, photoCaption },
      selectedDate.memoriesPhotos,
      actualCost
    );
  }, [
    hasUnsavedChanges,
    saveMemory,
    selectedDate,
    memoryNotes,
    favoriteDish,
    funniestMoment,
    favoriteSong,
    photoCaption,
    actualCost,
  ]);

  return {
    memoryNotes,
    setMemoryNotes,
    favoriteDish,
    setFavoriteDish,
    funniestMoment,
    setFunniestMoment,
    favoriteSong,
    setFavoriteSong,
    photoCaption,
    setPhotoCaption,
    actualCost,
    setActualCost,
    newPhotoUrl,
    setNewPhotoUrl,
    isUploadingMemoryPhoto,
    memoryFileInputRef,
    draggedPhotoIdx,
    dragOverPhotoIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleReorderPhoto,
    handleSetFeaturedPhoto,
    handleRemoveMemoryPhoto,
    handleMemoryFileUpload,
    addPhotoUrl,
    handleAutoSaveMemory,
    handleSaveMemory,
    flushPendingChanges,
  };
}

export type MemoryEditor = ReturnType<typeof useMemoryEditor>;
