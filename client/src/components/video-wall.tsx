import { Play } from "lucide-react";
import type { Video } from "@shared/schema";

interface VideoWallProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

// Componente para renderizar um card de vídeo
function VideoCard({ video, onVideoSelect }: { video: Video; onVideoSelect: (video: Video) => void }) {
  return (
    <div
      className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
      onClick={() => onVideoSelect(video)}
    >
      <div className="aspect-[9/16] w-80 bg-gray-100 rounded-lg overflow-hidden relative shadow-md">
        {/* Thumbnail do YouTube */}
        <img
          src={video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback para thumbnail padrão se YouTube falhar
            e.currentTarget.src = video.thumbnailUrl || `https://picsum.photos/300/400?random=${video.id}`;
          }}
        />
        
        {/* Overlay com botão de play */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
        
        {/* Informações básicas overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="text-white text-sm">
            <div className="font-medium truncate">{video.city || video.submitterLocation || "Local não informado"}</div>
            <div className="text-gray-200 text-xs truncate">{video.racismType}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoWall({ videos, onVideoSelect }: VideoWallProps) {
  // Criar múltiplas cópias para efeito infinito
  const extendedVideos = [
    ...videos,
    ...videos.map(v => ({ ...v, id: `dup-${v.id}` })),
    ...videos.map(v => ({ ...v, id: `dup2-${v.id}` }))
  ];

  return (
    <div className="w-full">
      {/* Grid infinito com menos colunas para thumbnails maiores */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 min-w-max">
        {extendedVideos.map((video) => (
          <VideoCard 
            key={video.id}
            video={video} 
            onVideoSelect={onVideoSelect} 
          />
        ))}
      </div>
      
      {/* Grid adicional para scroll vertical */}
      <div className="mt-1 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 min-w-max">
        {extendedVideos.slice().reverse().map((video) => (
          <VideoCard 
            key={`row2-${video.id}`}
            video={video} 
            onVideoSelect={onVideoSelect} 
          />
        ))}
      </div>
    </div>
  );
}