'use client';

import React, { useCallback, useState } from 'react';

import { useDateContext } from '@/context/DateContext';
import type {
  CostLevel,
  DateCategory,
  DateIdea,
  DateSetting,
  TimeOfDay,
} from '@/types/date';

/**
 * Edit state for a date's title and specification fields.
 *
 * Lives in a hook because two separate parts of the detail modal edit the same
 * record: the title editor on the cover banner and the full form in the
 * details tab. Both need the same draft values and the same save path.
 */
export function useDateDetailsEditor(
  selectedDate: DateIdea,
  onSaved: (message: string) => void
) {
  const { updateDate } = useDateContext();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [editedTitle, setEditedTitle] = useState(selectedDate.title || '');
  const [editedSubtitle, setEditedSubtitle] = useState(
    selectedDate.subtitle || ''
  );
  const [editedDescription, setEditedDescription] = useState(
    selectedDate.description || ''
  );
  const [editedCategory, setEditedCategory] = useState<DateCategory>(
    selectedDate.category || 'dining'
  );
  const [editedEstimatedCost, setEditedEstimatedCost] = useState<CostLevel>(
    selectedDate.estimatedCost || '₱₱'
  );
  const [editedDuration, setEditedDuration] = useState(
    selectedDate.duration || '2-3 hours'
  );
  const [editedDressCode, setEditedDressCode] = useState(
    selectedDate.dressCode || 'Smart Casual'
  );
  const [editedLocationName, setEditedLocationName] = useState(
    selectedDate.locationName || ''
  );
  const [editedLocationAddress, setEditedLocationAddress] = useState(
    selectedDate.locationAddress || ''
  );
  const [editedSetting, setEditedSetting] = useState<DateSetting>(
    selectedDate.setting || 'indoor'
  );
  const [editedBestTimeOfDay, setEditedBestTimeOfDay] = useState<TimeOfDay>(
    selectedDate.bestTimeOfDay || 'sunset'
  );
  const [editedVibeTags, setEditedVibeTags] = useState(
    selectedDate.vibeTags?.join(', ') || ''
  );

  /** Reseeds the title draft from the record, then opens the inline editor. */
  const handleOpenEditTitle = useCallback(() => {
    setEditedTitle(selectedDate.title);
    setEditedSubtitle(selectedDate.subtitle || '');
    setIsEditingTitle(true);
  }, [selectedDate]);

  /** Reseeds every draft field on open so a cancelled edit leaves no residue. */
  const handleToggleEditDetails = useCallback(() => {
    setIsEditingDetails((wasEditing) => {
      if (wasEditing) return false;

      setEditedTitle(selectedDate.title);
      setEditedSubtitle(selectedDate.subtitle || '');
      setEditedDescription(selectedDate.description || '');
      setEditedCategory(selectedDate.category);
      setEditedEstimatedCost(selectedDate.estimatedCost);
      setEditedDuration(selectedDate.duration || '2-3 hours');
      setEditedDressCode(selectedDate.dressCode || 'Smart Casual');
      setEditedLocationName(selectedDate.locationName || '');
      setEditedLocationAddress(selectedDate.locationAddress || '');
      setEditedSetting(selectedDate.setting || 'indoor');
      setEditedBestTimeOfDay(selectedDate.bestTimeOfDay || 'sunset');
      setEditedVibeTags(selectedDate.vibeTags?.join(', ') || '');
      return true;
    });
  }, [selectedDate]);

  const handleSaveTitle = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!editedTitle.trim()) return;

      updateDate({
        ...selectedDate,
        title: editedTitle.trim(),
        subtitle: editedSubtitle.trim(),
      });
      setIsEditingTitle(false);
      onSaved('Date title & tagline saved ✓');
    },
    [editedTitle, editedSubtitle, selectedDate, updateDate, onSaved]
  );

  const handleSaveDetails = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!editedTitle.trim()) return;

      const tags = editedVibeTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      updateDate({
        ...selectedDate,
        title: editedTitle.trim(),
        subtitle: editedSubtitle.trim(),
        description: editedDescription.trim(),
        category: editedCategory,
        estimatedCost: editedEstimatedCost,
        duration: editedDuration.trim(),
        dressCode: editedDressCode.trim(),
        locationName: editedLocationName.trim(),
        locationAddress: editedLocationAddress.trim() || undefined,
        setting: editedSetting,
        bestTimeOfDay: editedBestTimeOfDay,
        // Never let a cleared tag field wipe the existing tags.
        vibeTags: tags.length > 0 ? tags : selectedDate.vibeTags,
      });
      setIsEditingDetails(false);
      onSaved('Date specifications saved ✓');
    },
    [
      editedTitle,
      editedSubtitle,
      editedDescription,
      editedCategory,
      editedEstimatedCost,
      editedDuration,
      editedDressCode,
      editedLocationName,
      editedLocationAddress,
      editedSetting,
      editedBestTimeOfDay,
      editedVibeTags,
      selectedDate,
      updateDate,
      onSaved,
    ]
  );

  return {
    isEditingTitle,
    setIsEditingTitle,
    isEditingDetails,
    setIsEditingDetails,
    editedTitle,
    setEditedTitle,
    editedSubtitle,
    setEditedSubtitle,
    editedDescription,
    setEditedDescription,
    editedCategory,
    setEditedCategory,
    editedEstimatedCost,
    setEditedEstimatedCost,
    editedDuration,
    setEditedDuration,
    editedDressCode,
    setEditedDressCode,
    editedLocationName,
    setEditedLocationName,
    editedLocationAddress,
    setEditedLocationAddress,
    editedSetting,
    setEditedSetting,
    editedBestTimeOfDay,
    setEditedBestTimeOfDay,
    editedVibeTags,
    setEditedVibeTags,
    handleOpenEditTitle,
    handleToggleEditDetails,
    handleSaveTitle,
    handleSaveDetails,
  };
}

export type DateDetailsEditor = ReturnType<typeof useDateDetailsEditor>;
