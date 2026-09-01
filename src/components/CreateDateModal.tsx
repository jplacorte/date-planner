'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Upload, Clock, Plus, Trash2 } from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { DateIdea, DateCategory, CostLevel, DateSetting, TimeOfDay, ItineraryStep } from '../types/date';
import { normalizeGoogleDriveImageUrl } from '../utils/image';
import { formatTimeString } from '../utils/date';
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

export default function CreateDateModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, addDate } = useDateContext();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DateCategory>('dining');
  const [estimatedCost, setEstimatedCost] = useState<CostLevel>('₱₱');
  const [setting, setSetting] = useState<DateSetting>('outdoor');
  const [bestTimeOfDay, setBestTimeOfDay] = useState<TimeOfDay>('sunset');
  const [duration, setDuration] = useState('3 Hours');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [coverImage, setCoverImage] = useState(presetImages[0]);
  const [tagsInput, setTagsInput] = useState('Romantic, Sunset, Aesthetic');
  const [dressCode, setDressCode] = useState('Smart Casual');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Checklist items builder
  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Confirm timing / reservations',
    'Pick matching outfits',
    'Prepare sweet surprise / note',
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Itinerary steps builder
  const [itinerarySteps, setItinerarySteps] = useState<Omit<ItineraryStep, 'id' | 'completed'>[]>([
    { time: '6:00 PM', activity: 'Meet & Welcome', location: '' },
    { time: '7:00 PM', activity: 'Main Date Experience', location: '' },
  ]);
  const [newStepTime, setNewStepTime] = useState('8:30 PM');
  const [newStepActivity, setNewStepActivity] = useState('');
  const [newStepLocation, setNewStepLocation] = useState('');

  if (!isCreateModalOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadImageFile(file);
      setCoverImage(res.url);
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('Could not upload photo. Please try a different image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklistItems([...checklistItems, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleAddItineraryStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepActivity.trim()) return;
    setItinerarySteps([
      ...itinerarySteps,
      {
        time: formatTimeString(newStepTime) || '7:00 PM',
        activity: newStepActivity.trim(),
        location: newStepLocation.trim() || undefined,
      },
    ]);
    setNewStepActivity('');
    setNewStepLocation('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim()) {
      alert('Please enter a Title and Location.');
      return;
    }

    const newDate: DateIdea = {
      id: `custom-date-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || 'A bespoke date idea created with love',
      description: description.trim() || 'A personalized romantic experience.',
      category,
      status: 'wishlist',
      coverImage: coverImage || presetImages[0],
      locationName: locationName.trim(),
      locationAddress: locationAddress.trim() || undefined,
      estimatedCost,
      duration: duration.trim() || '2-3 Hours',
      vibeTags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      isFavorite: true,
      bestTimeOfDay,
      setting,
      dressCode: dressCode.trim() || undefined,
      checklist: checklistItems.map((text, idx) => ({
        id: `check-${Date.now()}-${idx}`,
        text,
        completed: false,
        category: 'custom',
      })),
      itinerary: itinerarySteps.map((step, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        time: step.time,
        activity: step.activity,
        location: step.location,
        completed: false,
      })),
      isCustom: true,
    };

    addDate(newDate);
    setIsCreateModalOpen(false);
  };

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
          className="relative w-full max-w-2xl rounded-t-[28px] sm:rounded-3xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 max-h-[92vh] sm:max-h-[88vh] overflow-y-auto overscroll-contain touch-scroll my-0 sm:my-auto"
          data-lenis-prevent
        >
          {/* Mobile Sheet Drag Indicator Bar */}
          <div className="sm:hidden flex justify-center pb-1">
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-xl bg-white text-black shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                  Add Custom Date Experience
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Create a personalized date with custom cover, checklist, and itinerary.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            
            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Date Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Ice Skating & Fondue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Tagline / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Warm sweaters, hot cocoa & laughter"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Date Description</label>
              <textarea
                rows={2}
                placeholder="What makes this date special? Outline the atmosphere and highlights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>

            {/* Category & Budget */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DateCategory)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="dining">Fine Dining</option>
                  <option value="outdoor">Outdoor Scenic</option>
                  <option value="creative">Art & Craft</option>
                  <option value="nightlife">Nightlife</option>
                  <option value="cozy">Cozy At Home</option>
                  <option value="adventure">Adventure</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Budget</label>
                <select
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value as CostLevel)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="₱">₱ (Budget)</option>
                  <option value="₱₱">₱₱ (Moderate)</option>
                  <option value="₱₱₱">₱₱₱ (Upscale)</option>
                  <option value="₱₱₱₱">₱₱₱₱ (Luxury)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Setting</label>
                <select
                  value={setting}
                  onChange={(e) => setSetting(e.target.value as DateSetting)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="outdoor">Outdoor</option>
                  <option value="indoor">Indoor</option>
                  <option value="home">At Home</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Time of Day</label>
                <select
                  value={bestTimeOfDay}
                  onChange={(e) => setBestTimeOfDay(e.target.value as TimeOfDay)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="sunset">Sunset</option>
                  <option value="night">Night</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="morning">Morning</option>
                </select>
              </div>
            </div>

            {/* Location & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Venue / Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Observatory Deck"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Address / City</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Grand Ave, Downtown"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Duration, Dress Code, Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 2-3 Hours"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Dress Code</label>
                <input
                  type="text"
                  placeholder="e.g. Smart Casual / Cozy"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Vibe Tags</label>
                <input
                  type="text"
                  placeholder="Comma-separated tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Photo Uploader & Presets */}
            <div className="space-y-2 bg-black p-4 rounded-2xl border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Cover Photo</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Cover Preview */}
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-white/10">
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-3 text-[11px] text-zinc-300 font-mono">
                  Preview Cover
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Or pick a preset
                </span>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {presetImages.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCoverImage(img)}
                      className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        coverImage === img ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Drive Folder Picker */}
              <GoogleDrivePicker onSelectPhoto={(url) => setCoverImage(url)} />

              <input
                type="url"
                placeholder="Or paste image or Google Drive URL..."
                value={coverImage.startsWith('data:') ? '' : coverImage}
                onChange={(e) => setCoverImage(normalizeGoogleDriveImageUrl(e.target.value))}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
              />
            </div>

            {/* Initial Checklist Items Builder */}
            <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-2.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Pre-Date Checklist Steps ({checklistItems.length})
              </label>

              <div className="space-y-1">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-zinc-300 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                    <span>• {item}</span>
                    <button
                      type="button"
                      onClick={() => setChecklistItems(checklistItems.filter((_, i) => i !== idx))}
                      className="text-zinc-600 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add checklist step..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200"
                >
                  Add Step
                </button>
              </div>
            </div>

            {/* Initial Itinerary Timeline Builder */}
            <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-2.5">
              <label className="text-xs font-semibold text-zinc-300 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Date Timeline / Itinerary ({itinerarySteps.length} Steps)
              </label>

              <div className="space-y-1.5">
                {itinerarySteps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-zinc-300 bg-zinc-900 px-3 py-2 rounded-xl border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/[0.08]">
                        {formatTimeString(step.time)}
                      </span>
                      <span className="text-zinc-200 font-medium">{step.activity}</span>
                      {step.location && (
                        <span className="text-zinc-500 text-[11px]">({step.location})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setItinerarySteps(itinerarySteps.filter((_, i) => i !== idx))}
                      className="text-zinc-600 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Time (e.g. 8:30 PM)"
                  value={newStepTime}
                  onChange={(e) => setNewStepTime(e.target.value)}
                  className="sm:col-span-4 bg-zinc-900 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                />
                <input
                  type="text"
                  placeholder="Activity (e.g. Candlelight Dinner)"
                  value={newStepActivity}
                  onChange={(e) => setNewStepActivity(e.target.value)}
                  className="sm:col-span-5 bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddItineraryStep}
                  className="sm:col-span-3 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Step</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Save & Add Date Idea
            </button>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
