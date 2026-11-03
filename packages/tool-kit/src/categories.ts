import type { CategoryId } from './types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: string; // Lucide icon name
  description: string;
  seoBlurb: string;
  tokens: {
    fillVar: string;
    textVar: string;
    tintVar: string;
  };
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  audio: {
    id: 'audio',
    label: 'Audio',
    icon: 'Volume2',
    description: 'Clean noise, trim pauses, and enhance voice recordings.',
    seoBlurb: 'Free browser-based audio tools for creators, podcasters, and editors. Clean background noise, remove silence, and polish voice recordings on your own device.',
    tokens: {
      fillVar: '--cat-audio-fill',
      textVar: '--cat-audio-text',
      tintVar: '--cat-audio-tint',
    },
  },
  video: {
    id: 'video',
    label: 'Video',
    icon: 'Video',
    description: 'Cut jump-cuts, optimize clips, and process videos locally.',
    seoBlurb: 'Fast, secure video utilities running inside your browser. Jump-cut silences, convert formats, and edit creator video with zero uploads.',
    tokens: {
      fillVar: '--cat-video-fill',
      textVar: '--cat-video-text',
      tintVar: '--cat-video-tint',
    },
  },
  image: {
    id: 'image',
    label: 'Image',
    icon: 'Image',
    description: 'Convert, compress, resize, and edit photos and assets.',
    seoBlurb: 'Private client-side image editing tools. Compress photos, strip metadata, convert formats, and prepare images for the web.',
    tokens: {
      fillVar: '--cat-image-fill',
      textVar: '--cat-image-text',
      tintVar: '--cat-image-tint',
    },
  },
  text: {
    id: 'text',
    label: 'Documents & Text',
    icon: 'FileText',
    description: 'Format, inspect, convert PDFs, markdown, and text.',
    seoBlurb: 'Safe browser-first tools for documents, PDFs, and text manipulation without sharing sensitive document contents online.',
    tokens: {
      fillVar: '--cat-text-fill',
      textVar: '--cat-text-text',
      tintVar: '--cat-text-tint',
    },
  },
  dev: {
    id: 'dev',
    label: 'Developer',
    icon: 'Code2',
    description: 'JSON formatters, regex analyzers, encoder/decoder utils.',
    seoBlurb: 'Everyday developer utilities running entirely in your browser with no telemetry or external network calls.',
    tokens: {
      fillVar: '--cat-dev-fill',
      textVar: '--cat-dev-text',
      tintVar: '--cat-dev-tint',
    },
  },
  util: {
    id: 'util',
    label: 'Utilities',
    icon: 'Wrench',
    description: 'Everyday file helpers, hashers, checksums, and tools.',
    seoBlurb: 'Everyday file utilities that make small tasks easy, instant, and completely private.',
    tokens: {
      fillVar: '--cat-util-fill',
      textVar: '--cat-util-text',
      tintVar: '--cat-util-tint',
    },
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
