import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload, Info, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, HelpCircle, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import VideoWall from "@/components/video-wall";
import VideoModal from "@/components/video-modal";
import type { Video as VideoType } from "@shared/schema";
import logoUrl from "@assets/logo-repacoes@2x_1752339173739.png";

// Gerador de vídeos de demonstração para o scroll infinito
const generateDummyVideos = (count: number): VideoType[] => {
  const colors = [
    "6B46C1", "EC4899", "10B981", "F59E0B", "EF4444", "8B5CF6",
    "06B6D4", "84CC16", "F97316", "DC2626", "7C3AED", "059669",
    "0891B2", "65A30D", "EA580C", "B91C1C", "9333EA", "047857",
    "0284C7", "4D7C0F", "C2410C", "991B1B", "7C2D12", "064E3B"
  ];
  
  const racismTypes = [
    "Discriminação no trabalho", "Abordagem policial", "Racismo estrutural", 
    "Recusa de atendimento", "Discriminação habitacional", "Injúria racial",
    "Racismo institucional", "Microagressões", "Discriminação escolar",
    "Racismo no transporte", "Negação de acesso", "Comentários preconceituosos"
  ];
  
  const locations = [
    "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Brasília", "Fortaleza",
    "Curitiba", "Recife", "Porto Alegre", "Manaus", "Belém", "Goiânia",
    "Guarulhos", "Campinas", "São Luís", "São Gonçalo", "Maceió", "Duque de Caxias"
  ];
  
  const ages = ["18-25", "25-35", "35-45", "45-55", "55+"];
  const genders = ["Homem", "Mulher", "Não-binário"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Testemunho ${i + 1}`,
    description: `Experiência de ${racismTypes[i % racismTypes.length]}`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: `https://picsum.photos/300/400?random=${i + 1}`,
    chapterId: 1,
    submitterName: "Anônimo",
    submitterAge: ages[i % ages.length],
    submitterGender: genders[i % genders.length],
    submitterLocation: locations[i % locations.length],
    racismType: racismTypes[i % racismTypes.length],
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    moderatorId: null,
    moderatorComments: null
  }));
};

// Gerar 80 vídeos para testar o scroll infinito
const dummyVideos = generateDummyVideos(80);

export default function Home() {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const { user } = useAuth();

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

        {user?.isAdmin && (
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

      {/* Container do mur de vidéos */}
      <div className="w-full p-2">
        <VideoWall 
          videos={dummyVideos} 
          onVideoSelect={handleVideoSelect} 
        />
      </div>

      {/* Modal pour les vidéos */}
      <VideoModal 
        video={selectedVideo} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}