import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'stacks-reading-list';
export const ReadingListContext = createContext(null);

function loadReadingList() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((book) => book && typeof book._id === 'string') : [];
  } catch {
    return [];
  }
}

export function ReadingListProvider({ children }) {
  const [readingList, setReadingList] = useState(loadReadingList);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readingList));
    } catch (error) {
      console.warn('Could not persist the reading list in this browser.', error);
    }
  }, [readingList]);

  const addBook = useCallback((book) => {
    if (!book?._id) return;
    setReadingList((current) => (
      current.some((item) => item._id === book._id) ? current : [...current, book]
    ));
  }, []);

  const removeBook = useCallback((bookId) => {
    setReadingList((current) => current.filter((book) => book._id !== bookId));
  }, []);

  const clearList = useCallback(() => setReadingList([]), []);
  const value = useMemo(() => ({ readingList, addBook, removeBook, clearList }), [readingList, addBook, removeBook, clearList]);

  return <ReadingListContext.Provider value={value}>{children}</ReadingListContext.Provider>;
}
