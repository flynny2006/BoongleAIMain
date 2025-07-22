import React, { useEffect, useState } from 'react';

interface SuccessToastProps {
  message: string;
  show: boolean;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, show }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 500); // Corresponds to fadeOut animation
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-md bg-green-500 text-white font-semibold shadow-lg ${
        show ? 'animate-slide-down-fade-in' : 'animate-fade-out'
      }`}
    >
      {message}
    </div>
  );
};

export default SuccessToast;
