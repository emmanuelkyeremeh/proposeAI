import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - ProposeAI` : 'ProposeAI';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
