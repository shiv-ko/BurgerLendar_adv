// hooks/useViewportHeight.ts
import { useState, useEffect } from 'react';

const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初期設定

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewportHeight;
};

export default useViewportHeight;
