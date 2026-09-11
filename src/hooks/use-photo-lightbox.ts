'use client';

import { useCallback, useState } from 'react';

interface LightboxState {
  isOpen: boolean;
  photos: string[];
  index: number;
  title: string;
  caption?: string;
}

const CLOSED: LightboxState = {
  isOpen: false,
  photos: [],
  index: 0,
  title: '',
  caption: undefined,
};

/** Full-screen photo viewer state, shared by the cover banner and memory tab. */
export function usePhotoLightbox(defaultTitle: string, defaultCaption?: string) {
  const [state, setState] = useState<LightboxState>(CLOSED);

  const open = useCallback(
    (photos: string[], startIndex = 0, title?: string, caption?: string) => {
      setState({
        isOpen: true,
        photos,
        index: startIndex,
        title: title || defaultTitle,
        caption: caption || defaultCaption,
      });
    },
    [defaultTitle, defaultCaption]
  );

  const close = useCallback(() => {
    setState((previous) => ({ ...previous, isOpen: false }));
  }, []);

  /** Moves the viewer back to the first photo, after a reorder. */
  const resetIndex = useCallback(() => {
    setState((previous) => ({ ...previous, index: 0 }));
  }, []);

  return { ...state, open, close, resetIndex };
}
