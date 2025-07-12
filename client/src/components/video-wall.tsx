import { Play } from "lucide-react";
import type { Video } from "@shared/schema";

interface VideoWallProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

export default function VideoWall({ videos, onVideoSelect }: VideoWallProps) {
  return (
    <div className="w-full">
      {/* Grid infinito com menos colunas para thumbnails maiores */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 min-w-max">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            {/* Container da imagem/video - tamanho dobrado */}
            <div className="aspect-[9/16] w-80 bg-gray-100 rounded-lg overflow-hidden relative shadow-md">
              {/* Imagem de placeholder ou thumbnail */}
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
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
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-200 text-xs truncate">{video.racismType}</div>
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
            <div className="aspect-[9/16] w-80 bg-gray-100 rounded-lg overflow-hidden relative shadow-md">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="text-white text-sm">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-200 text-xs truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Grid de linhas adicionais para scroll vertical */}
      <div className="mt-1 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 min-w-max">
        {videos.slice().reverse().map((video) => (
          <div
            key={`row2-${video.id}`}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            <div className="aspect-[9/16] w-80 bg-gray-100 rounded-lg overflow-hidden relative shadow-md">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="text-white text-sm">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-200 text-xs truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mais linhas para um efeito realmente infinito */}
      <div className="mt-1 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 min-w-max">
        {videos.slice(0, 40).map((video) => (
          <div
            key={`row3-${video.id}`}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            <div className="aspect-[9/16] w-80 bg-gray-100 rounded-lg overflow-hidden relative shadow-md">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="text-white text-sm">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-200 text-xs truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 min-w-max">
        {videos.slice(20, 60).map((video) => (
          <div
            key={`row4-${video.id}`}
            className="relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-10"
            onClick={() => onVideoSelect(video)}
          >
            <div className="aspect-[9/16] w-80 bg-gray-100 rounded-lg overflow-hidden relative shadow-md">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="text-white text-sm">
                  <div className="font-medium truncate">{video.submitterLocation}</div>
                  <div className="text-gray-200 text-xs truncate">{video.racismType}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}