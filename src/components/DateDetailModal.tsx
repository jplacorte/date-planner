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
  Image as ImageIcon
} from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { DateStatus, ItineraryStep } from '../types/date';
import { normalizeGoogleDriveImageUrl } from '../utils/image';
import { uploadImageFile } from '../utils/upload';
import GoogleDrivePicker from './GoogleDrivePicker';

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
    saveMemory,
    deleteDate 
  } = useDateContext();

  const [activeTab, setActiveTab] = useState<'checklist' | 'itinerary' | 'details' | 'memory'>('checklist');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<'prep' | 'outfit' | 'booking' | 'custom'>('custom');

  // Cover photo change state
  const [isChangingCover, setIsChangingCover] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Itinerary state
  const [newStepTime, setNewStepTime] = useState('18:00');
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

  // Scheduled date/time picker state
  const [scheduledDate, setScheduledDate] = useState(selectedDate?.scheduledDate || '');
  const [scheduledTime, setScheduledTime] = useState(selectedDate?.scheduledTime || '');

  if (!selectedDate) return null;

  const completedChecklist = (selectedDate.checklist || []).filter((i) => i.completed).length;
  const totalChecklist = (selectedDate.checklist || []).length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const itineraryList = selectedDate.itinerary || [];
  const completedItineraryCount = itineraryList.filter((s) => s.completed).length;

  // Cover photo upload handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const res = await uploadImageFile(file);
      updateDateCoverImage(selectedDate.id, res.url);
      setIsChangingCover(false);
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
  };

  // Itinerary handlers
  const handleAddItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepActivity.trim()) return;
    addItineraryStep(selectedDate.id, {
      time: newStepTime.trim() || '18:00',
      activity: newStepActivity.trim(),
      location: newStepLocation.trim() || undefined,
      notes: newStepNotes.trim() || undefined,
    });
    setNewStepActivity('');
    setNewStepLocation('');
    setNewStepNotes('');
  };

  const startEditStep = (step: ItineraryStep) => {
    setEditingStepId(step.id);
    setEditStepData({
      time: step.time,
      activity: step.activity,
      location: step.location || '',
      notes: step.notes || '',
    });
  };

  const handleSaveStepEdit = (stepId: string) => {
    if (!editStepData.activity.trim()) return;
    updateItineraryStep(selectedDate.id, stepId, {
      time: editStepData.time.trim() || '18:00',
      activity: editStepData.activity.trim(),
      location: editStepData.location.trim() || undefined,
      notes: editStepData.notes.trim() || undefined,
    });
    setEditingStepId(null);
  };

  const insertStarterTimeline = () => {
    const defaultSteps = [
      { time: '17:30', activity: 'Meet up & Pick matching outfits', location: 'Home / Meeting Point' },
      { time: '18:30', activity: `Arrive at ${selectedDate.locationName}`, location: selectedDate.locationName },
      { time: '19:00', activity: 'Main Experience & Candlelight moments', notes: 'Take romantic Polaroid photos' },
      { time: '21:00', activity: 'Sweet Dessert & Evening Stroll', notes: 'Play soundtrack & talk' },
    ];
    defaultSteps.forEach((s) => addItineraryStep(selectedDate.id, s));
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
    alert('Memory and scrapbook journal saved.');
  };

  const handleScheduleChange = (status: DateStatus, dateVal: string, timeVal: string) => {
    setScheduledDate(dateVal);
    setScheduledTime(timeVal);
    updateDateStatus(selectedDate.id, status, dateVal, timeVal);
  };

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    selectedDate.locationAddress || selectedDate.locationName
  )}`;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-lg overscroll-contain"
        data-lenis-prevent
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-2xl my-auto flex flex-col max-h-[88vh]"
          data-lenis-prevent
        >
          {/* Header Cover Banner */}
          <div className="relative h-60 sm:h-64 w-full shrink-0">
            <img
              src={selectedDate.coverImage}
              alt={selectedDate.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-black/40" />

            {/* Top Close, Favorite & Cover Change Actions */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <button
                onClick={() => toggleFavorite(selectedDate.id)}
                className="p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-white hover:text-zinc-300 transition-colors"
                title="Favorite Date"
              >
                <Heart
                  className={`w-4 h-4 ${
                    selectedDate.isFavorite ? 'text-white fill-white' : 'text-white'
                  }`}
                />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangingCover(!isChangingCover)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.15] text-white text-xs font-medium hover:bg-white hover:text-black transition-all shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>

                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
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
                  className="absolute top-14 right-4 z-30 w-80 rounded-2xl bg-zinc-950/95 border border-white/20 p-4 backdrop-blur-2xl shadow-2xl space-y-3"
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
                          className="relative h-10 rounded-lg overflow-hidden border border-white/15 hover:border-white transition-all hover:scale-105"
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
                      placeholder="Paste image or Google Drive link..."
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
            <div className="absolute bottom-4 left-6 right-6 z-10 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white text-black text-[10px] font-bold uppercase tracking-wider">
                  {selectedDate.category}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/80 border border-white/[0.1] text-white font-mono text-xs font-bold">
                  {selectedDate.estimatedCost}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/80 border border-white/[0.1] text-zinc-300 text-xs">
                  {selectedDate.duration}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white leading-snug">
                {selectedDate.title}
              </h2>
              <p className="text-xs text-zinc-400 font-light line-clamp-1">
                {selectedDate.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Status & Schedule Bar */}
          <div className="bg-black px-6 py-3.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">Status:</span>
              <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-white/[0.06]">
                {(['wishlist', 'planned', 'booked', 'completed'] as DateStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleScheduleChange(st, scheduledDate, scheduledTime)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
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

            {/* Date & Time Picker */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-xl border border-white/[0.06]">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => handleScheduleChange(selectedDate.status, e.target.value, scheduledTime)}
                  className="bg-transparent text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-xl border border-white/[0.06]">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => handleScheduleChange(selectedDate.status, scheduledDate, e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-white/[0.08] bg-zinc-950 px-6">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
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
              className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
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
              className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
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
              className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
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
          <div className="p-6 overflow-y-auto space-y-5 flex-1 overscroll-contain" data-lenis-prevent>
            
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
                      {['17:00', '18:30', '20:00', '21:30'].map((presetTime) => (
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
                    <div className="sm:col-span-3">
                      <input
                        type="time"
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
                                  type="time"
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
                                    {step.time}
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
                <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-zinc-400" />
                      Scrapbook Photo Gallery ({selectedDate.memoriesPhotos?.length || 0})
                    </label>

                    <button
                      type="button"
                      onClick={() => memoryFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 transition-all"
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

                  {/* Photo Thumbnails */}
                  {selectedDate.memoriesPhotos && selectedDate.memoriesPhotos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                      {selectedDate.memoriesPhotos.map((photo, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/15">
                          <img src={photo} alt={`Memory ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            <button
                              type="button"
                              onClick={() => updateDateCoverImage(selectedDate.id, photo)}
                              className="px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold shadow"
                            >
                              Set Cover
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newPhotos = selectedDate.memoriesPhotos?.filter((_, i) => i !== idx);
                                saveMemory(
                                  selectedDate.id,
                                  memoryNotes,
                                  { favoriteDish, funniestMoment, favoriteSong, photoCaption },
                                  newPhotos,
                                  actualCost
                                );
                              }}
                              className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
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
          <div className="bg-black p-3.5 px-6 border-t border-white/[0.08] flex items-center justify-between">
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
    </AnimatePresence>
  );
}
