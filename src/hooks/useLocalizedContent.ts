import { useContext } from 'react';
import { ContentContext } from '../context/ContentContext';

export function useLocalizedContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useLocalizedContent must be used within a ContentProvider');
  }
  return context;
}
