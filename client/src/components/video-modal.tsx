import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Video } from "@shared/schema";

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (video) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [video]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (video) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [video, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!video) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-sm h-full max-h-[80vh] bg-black rounded-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white w-10 h-10 bg-black bg-opacity-50 rounded-full z-10 hover:bg-opacity-70"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </Button>
        
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full aspect-[9/16] bg-gray-900 flex items-center justify-center">
            {video.youtubeId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1`}
                title="Video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            ) : (
              <div className="text-center text-white">
                <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>Vídeo não disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
          <div className="text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span>{video.city}, {video.state}</span>
              <span>{video.ageRange}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                {video.racismType}
              </span>
              {video.authorName && (
                <span className="text-xs">
                  {video.authorName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
