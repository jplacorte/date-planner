'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Trash2 } from 'lucide-react';

import { useDateContext } from '@/context/DateContext';
import { useDateDetailsEditor } from '@/hooks/use-date-details-editor';
import { useMemoryEditor } from '@/hooks/use-memory-editor';
import { usePhotoLightbox } from '@/hooks/use-photo-lightbox';
import { useSavedFeedback } from '@/hooks/use-saved-feedback';
import PhotoLightboxModal from '@/components/modals/PhotoLightboxModal';
import ChecklistTab from '@/components/modals/date-detail/ChecklistTab';
import CoverBanner from '@/components/modals/date-detail/CoverBanner';
import DetailsTab from '@/components/modals/date-detail/DetailsTab';
import ItineraryTab from '@/components/modals/date-detail/ItineraryTab';
import MemoryTab from '@/components/modals/date-detail/MemoryTab';
import ScheduleBar from '@/components/modals/date-detail/ScheduleBar';
import TabNav, { type DetailTab } from '@/components/modals/date-detail/TabNav';
import type { DateIdea } from '@/types/date';

/**
 * Full detail view for a single date.
 *
 * This component owns only what crosses tab boundaries: the active tab, the
 * save toast, the lightbox, and the memory draft that must be flushed on
 * close. Everything else lives in the tab that uses it.
 */
function DateDetailModalContent({ selectedDate }: { selectedDate: DateIdea }) {
  const { setSelectedDate, updateDateCoverImage, deleteDate } =
    useDateContext();

  const [activeTab, setActiveTab] = useState<DetailTab>('checklist');

  const feedback = useSavedFeedback();
  const editor = useDateDetailsEditor(selectedDate, feedback.notify);
  const memory = useMemoryEditor(selectedDate, feedback.notify);
  const lightbox = usePhotoLightbox(
    selectedDate.title,
    selectedDate.bestMoments?.photoCaption
  );

  const checklist = selectedDate.checklist || [];
  const completedChecklist = checklist.filter((item) => item.completed).length;

  const handleCloseModal = () => {
    // Persist anything typed into the memory tab but not explicitly saved.
    memory.flushPendingChanges();
    setSelectedDate(null);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${selectedDate.title}"?`)) {
      deleteDate(selectedDate.id);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-lg overscroll-contain pb-safe"
        data-lenis-prevent
        onClick={handleCloseModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(event) => event.stopPropagation()}
          className="relative w-full max-w-3xl rounded-t-[28px] sm:rounded-3xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-2xl my-0 sm:my-auto flex flex-col max-h-[92vh] sm:max-h-[88vh]"
          data-lenis-prevent
        >
          <AnimatePresence>
            {feedback.message && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                role="status"
                aria-live="polite"
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-sage text-white text-xs font-semibold shadow-2xl flex items-center gap-1.5 border border-sage/60 pointer-events-none"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{feedback.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <CoverBanner
            selectedDate={selectedDate}
            editor={editor}
            onClose={handleCloseModal}
            onSaved={feedback.notify}
            onOpenLightbox={lightbox.open}
          />

          <ScheduleBar selectedDate={selectedDate} onSaved={feedback.notify} />

          <TabNav
            activeTab={activeTab}
            onChange={setActiveTab}
            counts={{
              checklist: `${completedChecklist}/${checklist.length}`,
              itinerary: String((selectedDate.itinerary || []).length),
            }}
          />

          <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 touch-scroll overscroll-contain">
            {activeTab === 'checklist' && (
              <ChecklistTab
                selectedDate={selectedDate}
                onSaved={feedback.notify}
              />
            )}

            {activeTab === 'itinerary' && (
              <ItineraryTab
                selectedDate={selectedDate}
                onSaved={feedback.notify}
              />
            )}

            {activeTab === 'details' && (
              <DetailsTab selectedDate={selectedDate} editor={editor} />
            )}

            {activeTab === 'memory' && (
              <MemoryTab
                selectedDate={selectedDate}
                memory={memory}
                onSaved={feedback.notify}
                onOpenLightbox={lightbox.open}
              />
            )}
          </div>

          <div className="bg-white/[0.03] p-3.5 sm:p-4 px-4 sm:px-6 border-t border-white/[0.08] flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-zinc-600 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Date</span>
            </button>

            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2 rounded-full bg-accent hover:bg-accent-deep text-white text-xs font-semibold transition-colors shadow-md"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>

      <PhotoLightboxModal
        isOpen={lightbox.isOpen}
        onClose={lightbox.close}
        photos={lightbox.photos}
        initialIndex={lightbox.index}
        title={lightbox.title}
        caption={lightbox.caption}
        onSetFeatured={(idx) => {
          memory.handleSetFeaturedPhoto(idx);
          lightbox.resetIndex();
        }}
        onSetCover={(url) => {
          updateDateCoverImage(selectedDate.id, url);
          feedback.notify('Set as date cover image ✓');
        }}
      />
    </AnimatePresence>
  );
}

export default function DateDetailModal() {
  const { selectedDate } = useDateContext();
  if (!selectedDate) return null;

  // Keying on the id resets every draft when a different date is opened.
  return (
    <DateDetailModalContent key={selectedDate.id} selectedDate={selectedDate} />
  );
}
