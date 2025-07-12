import { Play } from "lucide-react";
import type { Video } from "@shared/schema";

interface VideoWallProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

export default function VideoWall({ videos, onVideoSelect }: VideoWallProps) {
  return (
    <div className="w-full">
      {/* Grid infinito com muitas colunas para scroll horizontal */}
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-1 min-w-max">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            {/* Container da imagem/video */}
            <div className="aspect-[9/16] w-40 bg-gray-900 rounded-lg overflow-hidden relative">
              {/* Imagem de placeholder ou thumbnail */}
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay com botão de play */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-5 h-5 text-black ml-0.5" />
                </div>
              </div>
              
              {/* Informações básicas overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="text-white text-xs">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-300 text-[10px] truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Duplicar videos para efeito infinito */}
        {videos.map((video) => (
          <div
            key={`duplicate-${video.id}`}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            <div className="aspect-[9/16] w-40 bg-gray-900 rounded-lg overflow-hidden relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-5 h-5 text-black ml-0.5" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="text-white text-xs">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-300 text-[10px] truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Grid de linhas adicionais para scroll vertical */}
      <div className="mt-1 grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-1 min-w-max">
        {videos.slice().reverse().map((video) => (
          <div
            key={`row2-${video.id}`}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            <div className="aspect-[9/16] w-40 bg-gray-900 rounded-lg overflow-hidden relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-5 h-5 text-black ml-0.5" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="text-white text-xs">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-300 text-[10px] truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mais linhas para um efeito realmente infinito */}
      <div className="mt-1 grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-1 min-w-max">
        {videos.slice(0, 40).map((video) => (
          <div
            key={`row3-${video.id}`}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            <div className="aspect-[9/16] w-40 bg-gray-900 rounded-lg overflow-hidden relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-5 h-5 text-black ml-0.5" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="text-white text-xs">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-300 text-[10px] truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-1 min-w-max">
        {videos.slice(20, 60).map((video) => (
          <div
            key={`row4-${video.id}`}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            <div className="aspect-[9/16] w-40 bg-gray-900 rounded-lg overflow-hidden relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-5 h-5 text-black ml-0.5" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="text-white text-xs">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-300 text-[10px] truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}