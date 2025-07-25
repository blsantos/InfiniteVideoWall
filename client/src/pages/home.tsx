import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload, Info, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, HelpCircle, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import VideoWall from "@/components/video-wall";
import VideoModal from "@/components/video-modal";
import type { Video as VideoType } from "@shared/schema";
import logoUrl from "@assets/logo-repacoes@2x_1752339173739.png";

export default function Home() {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const { user } = useAuth();

  // Buscar vídeos reais do YouTube via API
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"],
    select: (data: VideoType[]) => data.filter(video => video.status === "approved")
  });

  const handleVideoSelect = (video: VideoType) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  const scrollToDirection = (direction: 'up' | 'down' | 'left' | 'right') => {
    const scrollAmount = 400;
    const container = document.documentElement;
    
    switch (direction) {
      case 'up':
        container.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        break;
      case 'down':
        container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        break;
      case 'left':
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        break;
      case 'right':
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-auto overflow-y-auto">
      {/* Logo flutuante no canto superior esquerdo */}
      <div className="floating-logo">
        <img 
          src={logoUrl} 
          alt="Reparações Históricas" 
          onError={(e) => {
            console.log('Logo não carregou');
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.style.backgroundColor = 'hsl(16, 85%, 55%)';
            e.currentTarget.parentElement.innerHTML = '<div style="color: white; font-size: 18px; font-weight: bold; text-align: center; line-height: 44px;">RH</div>';
          }}
        />
      </div>
      
      {/* Botões de navegação direcional discretos */}
      <div className="fixed inset-0 pointer-events-none z-30">
        {/* Botão Cima */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto bg-white/70 hover:bg-white/90 text-gray-700 border-gray-300 rounded-full w-10 h-10 p-0 transition-all duration-300 shadow-md"
          onClick={() => scrollToDirection('up')}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>

        {/* Botão Baixo */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto bg-white/70 hover:bg-white/90 text-gray-700 border-gray-300 rounded-full w-10 h-10 p-0 transition-all duration-300 shadow-md"
          onClick={() => scrollToDirection('down')}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* Botão Esquerda */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 left-4 transform -translate-y-1/2 pointer-events-auto bg-white/70 hover:bg-white/90 text-gray-700 border-gray-300 rounded-full w-10 h-10 p-0 transition-all duration-300 shadow-md"
          onClick={() => scrollToDirection('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Botão Direita */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-auto bg-white/70 hover:bg-white/90 text-gray-700 border-gray-300 rounded-full w-10 h-10 p-0 transition-all duration-300 shadow-md"
          onClick={() => scrollToDirection('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Botões flutuantes principais no canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Link href="/upload">
          <Button 
            size="lg"
            className="rounded-full w-14 h-14 bg-primary hover:bg-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 p-0"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
        
        <Link href="/info">
          <Button 
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14 bg-white/90 hover:bg-primary/10 text-gray-700 border-primary/50 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 p-0"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </Link>

        {/* Botão Login/Admin */}
        {!user ? (
          <Button 
            onClick={() => window.location.href = '/api/login'}
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
          >
            <Settings className="h-6 w-6" />
          </Button>
        ) : (
          <Link href="/admin">
            <Button 
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </Link>
        )}
      </div>

      {/* Container do muro de vídeos */}
      <div className="w-full p-2">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando vídeos do YouTube...</p>
            </div>
          </div>
        ) : videos.length > 0 ? (
          <VideoWall 
            videos={videos} 
            onVideoSelect={handleVideoSelect} 
          />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-6xl mb-4">📹</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Nenhum vídeo disponível</h2>
              <p className="text-gray-500 mb-4">Os vídeos do canal @ReparacoesHistoricasBrasil serão exibidos aqui</p>
              {user?.isAdmin && (
                <Link href="/admin">
                  <Button>Gerenciar Vídeos</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal pour les vidéos */}
      <VideoModal 
        video={selectedVideo} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}