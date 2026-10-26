import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
  isAppReady?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDisplayTime = 10000,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  const handleFinish = (force = false) => {
    const elapsed = Date.now() - startTimeRef.current;
    if (!force && elapsed < minDisplayTime) {
      return; // Do not dismiss before 10 seconds
    }
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 600);
  };

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Universal autoplay playback
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }

    // Timer guaranteeing splash displays for at least 10 seconds (minDisplayTime)
    const timer = setTimeout(() => {
      handleFinish(true);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  const handleVideoEnded = () => {
    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed >= minDisplayTime) {
      handleFinish(true);
    } else {
      // Loop video smoothly if shorter than minDisplayTime
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="vahlay-video-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] flex items-center justify-center bg-[#f0f4f8] overflow-hidden select-none"
        >
          {/* Fullscreen Edge-to-Edge Splash Video with Zero Overlay UI */}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
          >
            <source src="/splash-video.mp4" type="video/mp4" />
            <source
              src="/VAHLAYDigital_logo_animation_dat%E2%80%A6_1080p_20261018235847.mp4"
              type="video/mp4"
            />
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
