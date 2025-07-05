import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Video } from "@shared/schema";

interface VideoWallProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

export default function VideoWall({ videos, onVideoSelect }: VideoWallProps) {
  const [visibleVideos, setVisibleVideos] = useState(20);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMoreVideos = () => {
    if (loading || visibleVideos >= videos.length) return;
    
    setLoading(true);
    setTimeout(() => {
      setVisibleVideos(prev => Math.min(prev + 20, videos.length));
      setLoading(false);
    }, 500);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage > 0.8) {
      loadMoreVideos();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [visibleVideos, videos.length]);

  const getRacismTypeColor = (type: string) => {
    const colors = {
      'institucional': 'bg-blue-100 text-blue-800',
      'estrutural': 'bg-purple-100 text-purple-800',
      'escolar': 'bg-green-100 text-green-800',
      'mercado_trabalho': 'bg-orange-100 text-orange-800',
      'religioso': 'bg-red-100 text-red-800',
      'linguístico': 'bg-yellow-100 text-yellow-800',
      'outro': 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatRacismType = (type: string) => {
    const types = {
      'institucional': 'Institucional',
      'estrutural': 'Estrutural',
      'escolar': 'Escolar',
      'mercado_trabalho': 'Mercado de trabalho',
      'religioso': 'Religioso',
      'linguístico': 'Linguístico',
      'outro': 'Outro',
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div ref={containerRef} className="max-h-screen overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.slice(0, visibleVideos).map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onVideoSelect(video)}
          >
            <div className="aspect-[9/16] bg-gray-900 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 bg-white bg-opacity-80 rounded-full group-hover:bg-opacity-100 transition-all"
                >
                  <i className="fas fa-play text-gray-800 ml-1"></i>
                </Button>
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{video.city}, {video.state}</span>
                <span>{video.ageRange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-block text-xs px-2 py-1 rounded-full ${getRacismTypeColor(video.racismType)}`}>
                  {formatRacismType(video.racismType)}
                </span>
                {video.authorName && (
                  <span className="text-xs text-gray-500">
                    {video.authorName}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {visibleVideos < videos.length && (
        <div className="text-center mt-8">
          <Button
            onClick={loadMoreVideos}
            disabled={loading}
            variant="outline"
            className="px-6 py-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Carregando...
              </>
            ) : (
              <>
                <i className="fas fa-chevron-down mr-2"></i>
                Carregar mais vídeos
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
