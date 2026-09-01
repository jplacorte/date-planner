'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Heart, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Edit3,
  Check,
  Sparkles, 
  Compass, 
  Camera, 
  Upload,
  Shirt, 
  Smile, 
  Music, 
  Utensils, 
  ExternalLink,
  BookHeart,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  GripVertical,
  Eye
} from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { DateStatus, ItineraryStep, DateCategory, CostLevel, TimeOfDay, DateSetting } from '../types/date';
import { normalizeGoogleDriveImageUrl } from '../utils/image';
import { formatDateString, formatTimeString } from '../utils/date';
import { uploadImageFile } from '../utils/upload';
import GoogleDrivePicker from './GoogleDrivePicker';
import { AestheticDatePicker, AestheticTimePicker } from './AestheticDateTimePicker';

const presetImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80',
];

export default function DateDetailModal() {
  const { 
    selectedDate, 
    setSelectedDate, 
    toggleFavorite, 
    toggleChecklistItem, 
    addChecklistItem, 
    removeChecklistItem, 
    toggleItineraryStep, 
    addItineraryStep,
    updateItineraryStep,
    removeItineraryStep,
    updateDateCoverImage,
    updateDateStatus, 
    updateDate,
    saveMemory,
    deleteDate 
  } = useDateContext();

  const [activeTab, setActiveTab] = useState<'checklist' | 'itinerary' | 'details' | 'memory'>('checklist');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<'prep' | 'outfit' | 'booking' | 'custom'>('custom');

  // Title & Details edit state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const showSavedFeedback = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => {
      setSavedFeedback((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const [editedTitle, setEditedTitle] = useState(selectedDate?.title || '');
  const [editedSubtitle, setEditedSubtitle] = useState(selectedDate?.subtitle || '');
  const [editedDescription, setEditedDescription] = useState(selectedDate?.description || '');
  const [editedCategory, setEditedCategory] = useState<DateCategory>(selectedDate?.category || 'dining');
  const [editedEstimatedCost, setEditedEstimatedCost] = useState<CostLevel>(selectedDate?.estimatedCost || '₱₱');
  const [editedDuration, setEditedDuration] = useState(selectedDate?.duration || '2-3 hours');
  const [editedDressCode, setEditedDressCode] = useState(selectedDate?.dressCode || 'Smart Casual');
  const [editedLocationName, setEditedLocationName] = useState(selectedDate?.locationName || '');
  const [editedLocationAddress, setEditedLocationAddress] = useState(selectedDate?.locationAddress || '');
  const [editedSetting, setEditedSetting] = useState<DateSetting>(selectedDate?.setting || 'indoor');
  const [editedBestTimeOfDay, setEditedBestTimeOfDay] = useState<TimeOfDay>(selectedDate?.bestTimeOfDay || 'sunset');
  const [editedVibeTags, setEditedVibeTags] = useState(selectedDate?.vibeTags?.join(', ') || '');

  const handleOpenEditTitle = () => {
    if (!selectedDate) return;
    setEditedTitle(selectedDate.title);
    setEditedSubtitle(selectedDate.subtitle || '');
    setIsEditingTitle(true);
  };

  const handleToggleEditDetails = () => {
    if (!selectedDate) return;
    if (!isEditingDetails) {
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
      setIsEditingDetails(true);
    } else {
      setIsEditingDetails(false);
    }
  };

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDate || !editedTitle.trim()) return;
    updateDate({
      ...selectedDate,
      title: editedTitle.trim(),
      subtitle: editedSubtitle.trim(),
    });
    setIsEditingTitle(false);
    showSavedFeedback('Date title & tagline saved ✓');
  };

  const handleSaveDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDate || !editedTitle.trim()) return;
    const tags = editedVibeTags
      .split(',')
      .map((t) => t.trim())
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
      vibeTags: tags.length > 0 ? tags : selectedDate.vibeTags,
    });
    setIsEditingDetails(false);
    showSavedFeedback('Date specifications saved ✓');
  };

  // Cover photo change state
  const [isChangingCover, setIsChangingCover] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Itinerary state
  const [newStepTime, setNewStepTime] = useState('6:00 PM');
  const [newStepActivity, setNewStepActivity] = useState('');
  const [newStepLocation, setNewStepLocation] = useState('');
  const [newStepNotes, setNewStepNotes] = useState('');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepData, setEditStepData] = useState<{
    time: string;
    activity: string;
    location: string;
    notes: string;
  }>({ time: '', activity: '', location: '', notes: '' });

  // Memory Editor State
  const [memoryNotes, setMemoryNotes] = useState(selectedDate?.memoryNotes || '');
  const [favoriteDish, setFavoriteDish] = useState(selectedDate?.bestMoments?.favoriteDish || '');
  const [funniestMoment, setFunniestMoment] = useState(selectedDate?.bestMoments?.funniestMoment || '');
  const [favoriteSong, setFavoriteSong] = useState(selectedDate?.bestMoments?.favoriteSong || '');
  const [photoCaption, setPhotoCaption] = useState(selectedDate?.bestMoments?.photoCaption || '');
  const [actualCost, setActualCost] = useState<number | undefined>(selectedDate?.actualCost);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isUploadingMemoryPhoto, setIsUploadingMemoryPhoto] = useState(false);
  const memoryFileInputRef = useRef<HTMLInputElement>(null);

  // Photo arrangement & preview state
  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null);
  const [dragOverPhotoIdx, setDragOverPhotoIdx] = useState<number | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  if (!selectedDate) return null;

  const completedChecklist = (selectedDate.checklist || []).filter((i) => i.completed).length;
  const totalChecklist = (selectedDate.checklist || []).length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const itineraryList = selectedDate.itinerary || [];
  const completedItineraryCount = itineraryList.filter((s) => s.completed).length;

  // Photo arrangement handlers
  const handleReorderPhoto = (fromIdx: number, toIdx: number) => {
    if (!selectedDate?.memoriesPhotos) return;
    const photos = [...selectedDate.memoriesPhotos];
    if (toIdx < 0 || toIdx >= photos.length || fromIdx === toIdx) return;
    const [moved] = photos.splice(fromIdx, 1);
    photos.splice(toIdx, 0, moved);
    saveMemory(
      selectedDate.id,
      memoryNotes,
      { favoriteDish, funniestMoment, favoriteSong, photoCaption },
      photos,
      actualCost
    );
    showSavedFeedback(`Photo moved to #${toIdx + 1} ✓`);
  };

  const handleSetFeaturedPhoto = (idx: number) => {
    if (!selectedDate?.memoriesPhotos || idx === 0) return;
    handleReorderPhoto(idx, 0);
    showSavedFeedback('Set as #1 featured scrapbook photo ✓');
  };

  const handleRemoveMemoryPhoto = (idx: number) => {
    if (!selectedDate?.memoriesPhotos) return;
    const photos = selectedDate.memoriesPhotos.filter((_, i) => i !== idx);
    saveMemory(
      selectedDate.id,
      memoryNotes,
      { favoriteDish, funniestMoment, favoriteSong, photoCaption },
      photos,
      actualCost
    );
    showSavedFeedback('Photo removed ✓');
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhotoIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverPhotoIdx !== index) {
      setDragOverPhotoIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedPhotoIdx !== null && draggedPhotoIdx !== dropIndex) {
      handleReorderPhoto(draggedPhotoIdx, dropIndex);
    }
    setDraggedPhotoIdx(null);
    setDragOverPhotoIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedPhotoIdx(null);
    setDragOverPhotoIdx(null);
  };

  // Cover photo upload handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const res = await uploadImageFile(file);
      updateDateCoverImage(selectedDate.id, res.url);
      setIsChangingCover(false);
      showSavedFeedback('Cover photo updated ✓');
    } catch (err) {
      console.error('Failed to upload cover photo:', err);
      alert('Could not upload cover image. Please try another image.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleApplyCoverUrl = (url: string) => {
    if (!url.trim()) return;
    const cleanUrl = normalizeGoogleDriveImageUrl(url.trim());
    updateDateCoverImage(selectedDate.id, cleanUrl);
    setCustomCoverUrl('');
    setIsChangingCover(false);
    showSavedFeedback('Cover photo updated ✓');
  };

  // Memory photo file upload handler
  const handleMemoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingMemoryPhoto(true);
      const res = await uploadImageFile(file);
      const photos = [...(selectedDate.memoriesPhotos || []), res.url];
      saveMemory(
        selectedDate.id,
        memoryNotes,
        { favoriteDish, funniestMoment, favoriteSong, photoCaption },
        photos,
        actualCost
      );
      showSavedFeedback('Photo uploaded to scrapbook ✓');
    } catch (err) {
      console.error('Failed to upload memory photo:', err);
      alert('Could not upload photo. Please try another image.');
    } finally {
      setIsUploadingMemoryPhoto(false);
    }
  };

  // Checklist handlers
  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(selectedDate.id, newChecklistText, newChecklistCategory);
    setNewChecklistText('');
    showSavedFeedback('Checklist item added ✓');
  };

  // Itinerary handlers
  const handleAddItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepActivity.trim()) return;
    addItineraryStep(selectedDate.id, {
      time: formatTimeString(newStepTime) || '6:00 PM',
      activity: newStepActivity.trim(),
      location: newStepLocation.trim() || undefined,
      notes: newStepNotes.trim() || undefined,
    });
    setNewStepActivity('');
    setNewStepLocation('');
    setNewStepNotes('');
    showSavedFeedback('Timeline step added ✓');
  };

  const startEditStep = (step: ItineraryStep) => {
    setEditingStepId(step.id);
    setEditStepData({
      time: formatTimeString(step.time) || step.time,
      activity: step.activity,
      location: step.location || '',
      notes: step.notes || '',
    });
  };

  const handleSaveStepEdit = (stepId: string) => {
    if (!editStepData.activity.trim()) return;
    updateItineraryStep(selectedDate.id, stepId, {
      time: formatTimeString(editStepData.time) || '6:00 PM',
      activity: editStepData.activity.trim(),
      location: editStepData.location.trim() || undefined,
      notes: editStepData.notes.trim() || undefined,
    });
    setEditingStepId(null);
    showSavedFeedback('Itinerary step saved ✓');
  };

  const insertStarterTimeline = () => {
    const defaultSteps = [
      { time: '5:30 PM', activity: 'Meet up & Pick matching outfits', location: 'Home / Meeting Point' },
      { time: '6:30 PM', activity: `Arrive at ${selectedDate.locationName}`, location: selectedDate.locationName },
      { time: '7:00 PM', activity: 'Main Experience & Candlelight moments', notes: 'Take romantic Polaroid photos' },
      { time: '9:00 PM', activity: 'Sweet Dessert & Evening Stroll', notes: 'Play soundtrack & talk' },
    ];
    defaultSteps.forEach((s) => addItineraryStep(selectedDate.id, s));
    showSavedFeedback('Starter timeline inserted ✓');
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    const photos = selectedDate.memoriesPhotos ? [...selectedDate.memoriesPhotos] : [];
    if (newPhotoUrl.trim()) {
      const cleanPhotoUrl = normalizeGoogleDriveImageUrl(newPhotoUrl.trim());
      if (!photos.includes(cleanPhotoUrl)) {
        photos.push(cleanPhotoUrl);
      }
    }
    saveMemory(
      selectedDate.id,
      memoryNotes,
      {
        favoriteDish,
        funniestMoment,
        favoriteSong,
        photoCaption,
      },
      photos,
      actualCost
    );
    setNewPhotoUrl('');
    showSavedFeedback('Memories & scrapbook saved ✓');
  };

  const handleStatusChange = (status: DateStatus) => {
    updateDateStatus(selectedDate.id, status, selectedDate.scheduledDate, selectedDate.scheduledTime);
    showSavedFeedback(`Status set to ${status} ✓`);
  };

  const handleDateChange = (dateVal: string) => {
    const newStatus = selectedDate.status === 'wishlist' ? 'planned' : selectedDate.status;
    updateDateStatus(selectedDate.id, newStatus, dateVal, selectedDate.scheduledTime);
    showSavedFeedback(`Scheduled date saved for ${formatDateString(dateVal, { month: 'short', day: 'numeric', weekday: 'short' })} ✓`);
  };

  const handleClearDate = () => {
    updateDateStatus(selectedDate.id, selectedDate.status, '', selectedDate.scheduledTime);
    showSavedFeedback('Scheduled date cleared ✓');
  };

  const handleTimeChange = (timeVal: string) => {
    const newStatus = selectedDate.status === 'wishlist' ? 'planned' : selectedDate.status;
    updateDateStatus(selectedDate.id, newStatus, selectedDate.scheduledDate, timeVal);
    showSavedFeedback(`Scheduled time set to ${formatTimeString(timeVal)} ✓`);
  };

  const handleClearTime = () => {
    updateDateStatus(selectedDate.id, selectedDate.status, selectedDate.scheduledDate, '');
    showSavedFeedback('Scheduled time cleared ✓');
  };

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    selectedDate.locationAddress || selectedDate.locationName
  )}`;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-lg overscroll-contain pb-safe"
        data-lenis-prevent
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl rounded-t-[28px] sm:rounded-3xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-2xl my-0 sm:my-auto flex flex-col max-h-[92vh] sm:max-h-[88vh]"
          data-lenis-prevent
        >
          {/* Real-time Save Feedback Toast */}
          <AnimatePresence>
            {savedFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold shadow-2xl flex items-center gap-1.5 border border-white/40 pointer-events-none"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                <span>{savedFeedback}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Header Cover Banner */}
          <div className="relative h-48 sm:h-64 w-full shrink-0">
            <img
              src={selectedDate.coverImage}
              alt={selectedDate.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-black/40" />

            {/* Mobile Sheet Drag Indicator Bar */}
            <div className="absolute top-2 inset-x-0 sm:hidden flex justify-center z-20">
              <div className="w-10 h-1 bg-white/30 rounded-full" />
            </div>

            {/* Top Close, Favorite & Cover Change Actions */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10">
              <button
                onClick={() => toggleFavorite(selectedDate.id)}
                className="p-1.5 sm:p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-white hover:text-zinc-300 transition-colors"
                title="Favorite Date"
              >
                <Heart
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    selectedDate.isFavorite ? 'text-white fill-white' : 'text-white'
                  }`}
                />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangingCover(!isChangingCover)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.15] text-white text-[11px] sm:text-xs font-medium hover:bg-white hover:text-black transition-all shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>

                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1.5 sm:p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Change Cover Photo Dropdown Popover */}
            <AnimatePresence>
              {isChangingCover && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-12 inset-x-2 sm:inset-x-auto sm:right-4 z-30 sm:w-80 rounded-2xl bg-zinc-950/95 border border-white/20 p-3.5 sm:p-4 backdrop-blur-2xl shadow-2xl space-y-3 max-w-[calc(100vw-1rem)] sm:max-w-none"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Update Cover Photo
                    </span>
                    <button
                      onClick={() => setIsChangingCover(false)}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Upload button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:bg-zinc-200 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingCover ? 'Uploading...' : 'Upload from Device'}</span>
                    </button>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Preset Aesthetics */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Aesthetic Presets
                    </span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {presetImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleApplyCoverUrl(img)}
                          className="relative h-9 sm:h-10 rounded-lg overflow-hidden border border-white/15 hover:border-white transition-all hover:scale-105"
                        >
                          <img src={img} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Google Drive Folder Picker */}
                  <GoogleDrivePicker onSelectPhoto={(url) => handleApplyCoverUrl(url)} />

                  {/* URL Input */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="url"
                      placeholder="Paste image or Drive link..."
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                      className="flex-1 bg-black border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoverUrl(customCoverUrl)}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold transition-all border border-white/15"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title & Info on Cover */}
            <div className="absolute bottom-3 sm:bottom-4 left-3.5 sm:left-6 right-3.5 sm:right-6 z-10 space-y-1.5">
              {isEditingTitle ? (
                <form
                  onSubmit={handleSaveTitle}
                  onClick={(e) => e.stopPropagation()}
                  className="space-y-2 bg-black/90 p-3 sm:p-3.5 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                      <Edit3 className="w-3 h-3 text-white" />
                      Edit Title & Tagline
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedTitle(selectedDate.title);
                        setEditedSubtitle(selectedDate.subtitle || '');
                        setIsEditingTitle(false);
                      }}
                      className="text-zinc-400 hover:text-white text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Date Title *"
                    className="w-full bg-zinc-900 border border-white/20 rounded-xl px-3 py-1.5 text-sm font-serif font-bold text-white focus:outline-none focus:border-white"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editedSubtitle}
                    onChange={(e) => setEditedSubtitle(e.target.value)}
                    placeholder="Tagline / Subtitle (optional)"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1 text-xs text-zinc-200 focus:outline-none focus:border-white"
                  />
                  <div className="flex justify-end gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditedTitle(selectedDate.title);
                        setEditedSubtitle(selectedDate.subtitle || '');
                        setIsEditingTitle(false);
                      }}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white text-black text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                      {selectedDate.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/80 border border-white/[0.1] text-white font-mono text-[10px] sm:text-xs font-bold">
                      {selectedDate.estimatedCost}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/80 border border-white/[0.1] text-zinc-300 text-[10px] sm:text-xs">
                      {selectedDate.duration}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 group/title">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h2 className="text-lg xs:text-xl sm:text-3xl font-bold font-serif text-white leading-snug break-words">
                        {selectedDate.title}
                      </h2>
                      <p className="text-xs text-zinc-400 font-light line-clamp-1">
                        {selectedDate.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenEditTitle}
                      className="p-1.5 px-2.5 rounded-xl bg-black/80 hover:bg-white text-zinc-300 hover:text-black border border-white/15 transition-all shadow-md shrink-0 flex items-center gap-1 text-[11px] font-semibold"
                      title="Edit Date Title"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium">Edit Title</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Status & Schedule Bar */}
          <div className="bg-black px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-xs font-medium text-zinc-500 shrink-0">Status:</span>
              <div className="flex gap-1 bg-zinc-900 p-0.5 sm:p-1 rounded-xl border border-white/[0.06] overflow-x-auto scrollbar-none">
                {(['wishlist', 'planned', 'booked', 'completed'] as DateStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                      selectedDate.status === st
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetic Date & Time Pickers */}
            <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
              <AestheticDatePicker
                value={selectedDate.scheduledDate}
                onChange={handleDateChange}
                onClear={handleClearDate}
                label="Pick Date"
                align="right"
              />

              <AestheticTimePicker
                value={selectedDate.scheduledTime}
                onChange={handleTimeChange}
                onClear={handleClearTime}
                label="Set Time"
                align="right"
              />
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center overflow-x-auto scrollbar-none touch-scroll border-b border-white/[0.08] bg-zinc-950 px-3 sm:px-6 shrink-0">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'checklist'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Checklist ({completedChecklist}/{totalChecklist})</span>
            </button>
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'itinerary'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Itinerary ({itineraryList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'details'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Location & Vibe</span>
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'memory'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BookHeart className="w-4 h-4" />
              <span>Memories & Photos</span>
            </button>
          </div>

          {/* Modal Tab Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 overscroll-contain touch-scroll" data-lenis-prevent>
            
            {/* --- TAB 1: PRE-DATE CHECKLIST --- */}
            {activeTab === 'checklist' && (
              <div className="space-y-5">
                
                {/* Progress Header */}
                <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Checklist Progress</span>
                    <span className="text-white font-mono font-bold">
                      {completedChecklist}/{totalChecklist} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Add New Checklist Item Form */}
                <form onSubmit={handleAddChecklist} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add preparation item, outfit detail, or reservation task..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    className="flex-1 bg-black border border-white/[0.1] rounded-2xl px-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                  <select
                    value={newChecklistCategory}
                    onChange={(e) => setNewChecklistCategory(e.target.value as 'prep' | 'outfit' | 'booking' | 'custom')}
                    className="bg-black border border-white/[0.1] rounded-2xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="custom">Custom</option>
                    <option value="prep">Prep</option>
                    <option value="outfit">Outfit</option>
                    <option value="booking">Booking</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-2xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Checklist Items List */}
                <div className="space-y-2">
                  {selectedDate.checklist?.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(selectedDate.id, item.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        item.completed
                          ? 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                          : 'bg-black border-white/[0.08] hover:border-white/[0.2] text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                        )}
                        <span className={`text-xs sm:text-sm ${item.completed ? 'line-through text-zinc-600' : 'font-medium'}`}>
                          {item.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-zinc-900 border border-white/[0.04] text-zinc-400">
                            {item.category}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChecklistItem(selectedDate.id, item.id);
                          }}
                          className="p-1 text-zinc-600 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* --- TAB 2: ITINERARY (EDIT & ADD) --- */}
            {activeTab === 'itinerary' && (
              <div className="space-y-5">
                
                {/* Header Summary */}
                <div className="bg-black p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-400 font-medium">Timeline Milestones: </span>
                    <span className="text-white font-mono font-bold">
                      {completedItineraryCount} of {itineraryList.length} Completed
                    </span>
                  </div>

                  {itineraryList.length === 0 && (
                    <button
                      onClick={insertStarterTimeline}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all border border-white/15"
                    >
                      + Quick Starter Timeline
                    </button>
                  )}
                </div>

                {/* Add Itinerary Step Form */}
                <form onSubmit={handleAddItinerary} className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-white" />
                      Add Itinerary Step
                    </label>
                    <div className="flex gap-1">
                      {['5:00 PM', '6:30 PM', '8:00 PM', '9:30 PM'].map((presetTime) => (
                        <button
                          key={presetTime}
                          type="button"
                          onClick={() => setNewStepTime(presetTime)}
                          className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-white/[0.06]"
                        >
                          {presetTime}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4 sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Time (e.g. 6:30 PM)"
                        value={newStepTime}
                        onChange={(e) => setNewStepTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div className="sm:col-span-9">
                      <input
                        type="text"
                        required
                        placeholder="Activity (e.g. Sunset Champagne Toast & Star Viewing)"
                        value={newStepActivity}
                        onChange={(e) => setNewStepActivity(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Venue / Specific Location (optional)"
                      value={newStepLocation}
                      onChange={(e) => setNewStepLocation(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Special note, tip, outfit note (optional)"
                      value={newStepNotes}
                      onChange={(e) => setNewStepNotes(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step to Timeline</span>
                  </button>
                </form>

                {/* Itinerary Timeline List */}
                {itineraryList.length > 0 ? (
                  <div className="relative border-l-2 border-zinc-800 ml-4 space-y-4 py-2">
                    {itineraryList.map((step) => {
                      const isEditing = editingStepId === step.id;

                      return (
                        <div key={step.id} className="relative pl-6">
                          {/* Checkpoint Timeline Circle */}
                          <button
                            onClick={() => toggleItineraryStep(selectedDate.id, step.id)}
                            className={`absolute -left-[9px] top-3.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                              step.completed
                                ? 'bg-white border-white text-black'
                                : 'bg-zinc-950 border-zinc-600 hover:border-white'
                            }`}
                            title="Toggle Completed"
                          >
                            {step.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </button>

                          {/* Step Content / Inline Editor */}
                          {isEditing ? (
                            <div className="bg-zinc-900 p-4 rounded-2xl border border-white/20 space-y-2.5 shadow-xl">
                              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-2">
                                <span>Edit Timeline Step</span>
                                <button
                                  type="button"
                                  onClick={() => setEditingStepId(null)}
                                  className="text-zinc-400 hover:text-white"
                                >
                                  ✕
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <input
                                  type="text"
                                  placeholder="Time (e.g. 6:30 PM)"
                                  value={editStepData.time}
                                  onChange={(e) => setEditStepData({ ...editStepData, time: e.target.value })}
                                  className="sm:col-span-3 bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                                />
                                <input
                                  type="text"
                                  value={editStepData.activity}
                                  onChange={(e) => setEditStepData({ ...editStepData, activity: e.target.value })}
                                  placeholder="Activity"
                                  className="sm:col-span-9 bg-black border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editStepData.location}
                                  onChange={(e) => setEditStepData({ ...editStepData, location: e.target.value })}
                                  placeholder="Location / Venue"
                                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                                />
                                <input
                                  type="text"
                                  value={editStepData.notes}
                                  onChange={(e) => setEditStepData({ ...editStepData, notes: e.target.value })}
                                  placeholder="Notes & Tips"
                                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                                />
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingStepId(null)}
                                  className="px-3 py-1 rounded-xl bg-white/10 text-zinc-300 text-xs font-semibold hover:bg-white/20"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveStepEdit(step.id)}
                                  className="px-4 py-1 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200"
                                >
                                  Save Step
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group bg-black p-3.5 rounded-2xl border border-white/[0.08] hover:border-white/[0.2] transition-all space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-white/[0.06]">
                                    {formatTimeString(step.time)}
                                  </span>
                                  {step.location && (
                                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-zinc-500" />
                                      {step.location}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEditStep(step)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                    title="Edit Step"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => removeItineraryStep(selectedDate.id, step.id)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-600 hover:text-white transition-colors"
                                    title="Delete Step"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div 
                                onClick={() => toggleItineraryStep(selectedDate.id, step.id)}
                                className="cursor-pointer"
                              >
                                <h4 className={`text-xs sm:text-sm font-semibold transition-colors ${step.completed ? 'line-through text-zinc-600' : 'text-white'}`}>
                                  {step.activity}
                                </h4>
                                {step.notes && (
                                  <p className="text-xs text-zinc-500 font-light mt-0.5">{step.notes}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-black p-8 rounded-2xl border border-white/[0.08] text-center space-y-2">
                    <Clock className="w-6 h-6 text-zinc-600 mx-auto" />
                    <h4 className="text-xs font-semibold text-white">No Itinerary Steps Added</h4>
                    <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                      Plan your time together by adding checkpoints or click below for a starter timeline.
                    </p>
                    <button
                      onClick={insertStarterTimeline}
                      className="px-4 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all mt-2"
                    >
                      Insert Starter Timeline
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* --- TAB 3: DETAILS --- */}
            {activeTab === 'details' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                    {isEditingDetails ? 'Edit Date Information' : 'Date Specifications & Vibe'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleEditDetails}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.08] hover:bg-white text-zinc-200 hover:text-black border border-white/10 text-xs font-semibold transition-all shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingDetails ? 'Cancel Edit' : 'Edit Information'}</span>
                  </button>
                </div>

                {isEditingDetails ? (
                  <form onSubmit={handleSaveDetails} className="space-y-4 bg-black p-4 sm:p-5 rounded-2xl border border-white/15 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Date Title *</label>
                        <input
                          type="text"
                          required
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          placeholder="Date Title"
                          className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-xs font-serif font-bold text-white focus:outline-none focus:border-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Tagline / Subtitle</label>
                        <input
                          type="text"
                          value={editedSubtitle}
                          onChange={(e) => setEditedSubtitle(e.target.value)}
                          placeholder="Tagline / Subtitle"
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Description</label>
                      <textarea
                        rows={3}
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Detailed overview and what makes this date special..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-400">Category</label>
                        <select
                          value={editedCategory}
                          onChange={(e) => setEditedCategory(e.target.value as DateCategory)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="dining">Fine Dining</option>
                          <option value="outdoor">Outdoor Scenic</option>
                          <option value="creative">Art & Craft</option>
                          <option value="nightlife">Nightlife</option>
                          <option value="cozy">Cozy At Home</option>
                          <option value="adventure">Thrill Adventure</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-400">Budget Level</label>
                        <select
                          value={editedEstimatedCost}
                          onChange={(e) => setEditedEstimatedCost(e.target.value as CostLevel)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="₱">₱ (Budget)</option>
                          <option value="₱₱">₱₱ (Moderate)</option>
                          <option value="₱₱₱">₱₱₱ (Elevated)</option>
                          <option value="₱₱₱₱">₱₱₱₱ (Splurge)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-400">Setting</label>
                        <select
                          value={editedSetting}
                          onChange={(e) => setEditedSetting(e.target.value as DateSetting)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none capitalize"
                        >
                          <option value="indoor">Indoor</option>
                          <option value="outdoor">Outdoor</option>
                          <option value="home">Home</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-400">Time of Day</label>
                        <select
                          value={editedBestTimeOfDay}
                          onChange={(e) => setEditedBestTimeOfDay(e.target.value as TimeOfDay)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none capitalize"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="sunset">Sunset</option>
                          <option value="night">Night</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Location / Venue Name</label>
                        <input
                          type="text"
                          value={editedLocationName}
                          onChange={(e) => setEditedLocationName(e.target.value)}
                          placeholder="e.g. Spiral at Sofitel"
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Location Address / Area</label>
                        <input
                          type="text"
                          value={editedLocationAddress}
                          onChange={(e) => setEditedLocationAddress(e.target.value)}
                          placeholder="e.g. CCP Complex, Roxas Blvd, Pasay"
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Dress Code</label>
                        <input
                          type="text"
                          value={editedDressCode}
                          onChange={(e) => setEditedDressCode(e.target.value)}
                          placeholder="e.g. Cocktail Attire"
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Vibe Tags (comma separated)</label>
                        <input
                          type="text"
                          value={editedVibeTags}
                          onChange={(e) => setEditedVibeTags(e.target.value)}
                          placeholder="Romantic, Candlelight, Live Jazz"
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsEditingDetails(false)}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
                        Overview
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light bg-black p-4 rounded-2xl border border-white/[0.08]">
                        {selectedDate.description}
                      </p>
                    </div>

                    {/* Location Box */}
                    <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-zinc-400" />
                            {selectedDate.locationName}
                          </h4>
                          {selectedDate.locationAddress && (
                            <p className="text-xs text-zinc-400 mt-1">{selectedDate.locationAddress}</p>
                          )}
                        </div>

                        <a
                          href={mapSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold transition-colors"
                        >
                          <span>Directions</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-black p-3.5 rounded-2xl border border-white/[0.08] space-y-1">
                        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-zinc-500" />
                          Dress Code
                        </span>
                        <p className="text-xs text-zinc-200">
                          {selectedDate.dressCode || 'Smart Casual'}
                        </p>
                      </div>

                      <div className="bg-black p-3.5 rounded-2xl border border-white/[0.08] space-y-1">
                        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-zinc-500" />
                          Setting
                        </span>
                        <p className="text-xs text-zinc-200 capitalize">
                          {selectedDate.setting} • {selectedDate.bestTimeOfDay}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
                        Vibe Tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDate.vibeTags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-300 text-xs flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-zinc-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* --- TAB 4: MEMORIES & SCRAPBOOK --- */}
            {activeTab === 'memory' && (
              <form onSubmit={handleSaveMemory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <BookHeart className="w-3.5 h-3.5 text-zinc-400" />
                    Memory Journal Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Write a sweet reflection about this date, how you felt, and funny moments..."
                    value={memoryNotes}
                    onChange={(e) => setMemoryNotes(e.target.value)}
                    className="w-full bg-black border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-zinc-400" />
                      Favorite Food
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Tagliatelle al Tartufo"
                      value={favoriteDish}
                      onChange={(e) => setFavoriteDish(e.target.value)}
                      className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5 text-zinc-400" />
                      Funniest Moment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., The fort collapsed!"
                      value={funniestMoment}
                      onChange={(e) => setFunniestMoment(e.target.value)}
                      className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-zinc-400" />
                      Soundtrack Song
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., La Vie En Rose"
                      value={favoriteSong}
                      onChange={(e) => setFavoriteSong(e.target.value)}
                      className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-zinc-400">₱</span>
                      Amount Spent (₱ PHP)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 2500"
                      value={actualCost !== undefined ? actualCost : ''}
                      onChange={(e) => setActualCost(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* Photo Gallery & Upload Section */}
                {/* Photo Gallery & Upload Section */}
                <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-zinc-400" />
                        Scrapbook Photo Gallery ({selectedDate.memoriesPhotos?.length || 0})
                      </label>
                      <p className="text-[11px] text-zinc-500 font-light mt-0.5">
                        Drag photos or use the ◀ ▶ buttons to arrange. The <span className="text-white font-medium">#1 photo</span> is featured in your Polaroid Scrapbook!
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => memoryFileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black text-xs font-medium border border-white/15 transition-all shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingMemoryPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                      </button>
                      <input
                        ref={memoryFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMemoryFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Photo Arranger Grid */}
                  {selectedDate.memoriesPhotos && selectedDate.memoriesPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                      {selectedDate.memoriesPhotos.map((photo, idx, arr) => {
                        const isFirst = idx === 0;
                        const isLast = idx === arr.length - 1;
                        const isDragging = draggedPhotoIdx === idx;
                        const isDragOver = dragOverPhotoIdx === idx;

                        return (
                          <div
                            key={`${photo}-${idx}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, idx)}
                            className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 cursor-grab active:cursor-grabbing bg-zinc-950 flex flex-col ${
                              isDragOver
                                ? 'border-rose-400 ring-2 ring-rose-400/50 scale-[1.03]'
                                : isDragging
                                ? 'opacity-40 border-dashed border-white/40'
                                : isFirst
                                ? 'border-white/40 ring-1 ring-white/20'
                                : 'border-white/[0.12] hover:border-white/30'
                            }`}
                          >
                            {/* Photo Aspect Frame */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                              <img
                                src={photo}
                                alt={`Memory photo ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />

                              {/* Order Badge */}
                              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
                                {isFirst ? (
                                  <span className="px-2 py-0.5 rounded-md bg-white text-black font-bold text-[9px] uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                                    <Star className="w-2.5 h-2.5 fill-black" />
                                    <span>#1 Featured</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-zinc-300 font-mono text-[10px] font-bold border border-white/10 shadow">
                                    #{idx + 1}
                                  </span>
                                )}
                              </div>

                              {/* Drag Handle & Preview Icon */}
                              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewPhotoUrl(photo);
                                  }}
                                  className="p-1 rounded-md bg-black/80 hover:bg-white text-zinc-300 hover:text-black border border-white/10 transition-all"
                                  title="Enlarge preview"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <div 
                                  className="p-1 rounded-md bg-black/80 text-zinc-400 border border-white/10"
                                  title="Drag to rearrange"
                                >
                                  <GripVertical className="w-3 h-3" />
                                </div>
                              </div>

                              {/* Hover Quick Actions Overlay */}
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-20">
                                <div className="flex items-center gap-1">
                                  {!isFirst && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetFeaturedPhoto(idx);
                                      }}
                                      className="px-2 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-[10px] font-bold flex items-center gap-1 shadow"
                                      title="Set as #1 Scrapbook Hero"
                                    >
                                      <Star className="w-3 h-3 fill-black" />
                                      <span>Make #1</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateDateCoverImage(selectedDate.id, photo);
                                      showSavedFeedback('Set as main cover image ✓');
                                    }}
                                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-semibold border border-white/20 shadow"
                                    title="Set as date cover banner"
                                  >
                                    Cover
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMemoryPhoto(idx);
                                  }}
                                  className="px-2.5 py-0.5 rounded-md bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors mt-0.5"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>

                            {/* Position Controls Bar (Tactile Left/Right Arrows for Mobile & Touch) */}
                            <div className="px-2 py-1.5 bg-black/90 border-t border-white/[0.08] flex items-center justify-between gap-1">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReorderPhoto(idx, idx - 1);
                                }}
                                className="p-1 rounded-md bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all text-[10px] flex items-center justify-center flex-1"
                                title="Move left"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>

                              <span className="text-[10px] font-mono text-zinc-500 font-semibold px-1">
                                {idx + 1}/{arr.length}
                              </span>

                              <button
                                type="button"
                                disabled={isLast}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReorderPhoto(idx, idx + 1);
                                }}
                                className="p-1 rounded-md bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all text-[10px] flex items-center justify-center flex-1"
                                title="Move right"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center border border-dashed border-white/10 rounded-xl bg-zinc-950/50 space-y-1.5">
                      <Camera className="w-5 h-5 text-zinc-500 mx-auto" />
                      <p className="text-xs text-zinc-400 font-medium">No scrapbook photos added yet</p>
                      <p className="text-[11px] text-zinc-600">Upload photos above or select from Google Drive below.</p>
                    </div>
                  )}

                  {/* Google Drive Folder Gallery */}
                  <div className="pt-1">
                    <GoogleDrivePicker 
                      onSelectPhoto={(url) => {
                        const photos = selectedDate.memoriesPhotos ? [...selectedDate.memoriesPhotos] : [];
                        if (!photos.includes(url)) {
                          photos.push(url);
                          saveMemory(
                            selectedDate.id,
                            memoryNotes,
                            { favoriteDish, funniestMoment, favoriteSong, photoCaption },
                            photos,
                            actualCost
                          );
                          showSavedFeedback('Photo added from Google Drive ✓');
                        }
                      }} 
                    />
                  </div>

                  {/* Caption & URL input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                    <input
                      type="text"
                      placeholder="Polaroid Caption / Quote (e.g. Lost in laughter)"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="url"
                      placeholder="Or paste photo URL..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all shadow-md"
                >
                  Save Memories & Update Scrapbook
                </button>
              </form>
            )}

          </div>

          {/* Modal Footer Actions */}
          <div className="bg-black p-3.5 sm:p-4 px-4 sm:px-6 border-t border-white/[0.08] flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                if (confirm(`Delete "${selectedDate.title}"?`)) {
                  deleteDate(selectedDate.id);
                }
              }}
              className="text-xs text-zinc-600 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Date</span>
            </button>

            <button
              onClick={() => setSelectedDate(null)}
              className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold transition-colors hover:bg-zinc-200 shadow-md"
            >
              Done
            </button>
          </div>

        </motion.div>
      </div>

      {/* Photo Enlarge Lightbox Modal */}
      <AnimatePresence>
        {previewPhotoUrl && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setPreviewPhotoUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 bg-black shadow-2xl flex flex-col"
            >
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(null)}
                  className="p-2 rounded-full bg-black/80 hover:bg-white text-white hover:text-black border border-white/20 transition-all shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img
                src={previewPhotoUrl}
                alt="Enlarged memory"
                className="max-h-[80vh] w-auto object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
