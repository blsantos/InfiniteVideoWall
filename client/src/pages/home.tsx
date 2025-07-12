import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload, Info, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, HelpCircle } from "lucide-react";
import VideoWall from "@/components/video-wall";
import VideoModal from "@/components/video-modal";
import type { Video as VideoType } from "@shared/schema";

// Générateur de vidéos factices pour le scroll infini
const generateDummyVideos = (count: number): VideoType[] => {
  const colors = [
    "6B46C1", "EC4899", "10B981", "F59E0B", "EF4444", "8B5CF6",
    "06B6D4", "84CC16", "F97316", "DC2626", "7C3AED", "059669",
    "0891B2", "65A30D", "EA580C", "B91C1C", "9333EA", "047857",
    "0284C7", "4D7C0F", "C2410C", "991B1B", "7C2D12", "064E3B"
  ];
  
  const racismTypes = [
    "Discrimination à l'embauche", "Contrôle au faciès", "Racisme au travail", 
    "Refus de service", "Discrimination logement", "Insultes racistes",
    "Racisme institutionnel", "Microagressions", "Discrimination scolaire",
    "Racisme dans les transports", "Refus d'accès", "Commentaires déplacés"
  ];
  
  const locations = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Bordeaux",
    "Lille", "Strasbourg", "Nantes", "Montpellier", "Rennes", "Reims",
    "Saint-Étienne", "Toulon", "Le Havre", "Grenoble", "Dijon", "Angers"
  ];
  
  const ages = ["18-25", "25-35", "35-45", "45-55", "55+"];
  const genders = ["Homme", "Femme", "Non-binaire"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Témoignage ${i + 1}`,
    description: `Expérience de ${racismTypes[i % racismTypes.length]}`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: `https://via.placeholder.com/300x400/${colors[i % colors.length]}/ffffff?text=Vidéo+${i + 1}`,
    chapterId: 1,
    submitterName: "Anonyme",
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

// Générer 80 vidéos pour tester le scroll infini
const dummyVideos = generateDummyVideos(80);

export default function Home() {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);

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
    <div className="min-h-screen bg-black relative overflow-x-auto overflow-y-auto">
      {/* Botões de navegação direcional discretos */}
      <div className="fixed inset-0 pointer-events-none z-30">
        {/* Botão Cima */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto bg-black/40 hover:bg-black/60 text-white border-gray-600 rounded-full w-10 h-10 p-0 transition-all duration-300"
          onClick={() => scrollToDirection('up')}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>

        {/* Botão Baixo */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto bg-black/40 hover:bg-black/60 text-white border-gray-600 rounded-full w-10 h-10 p-0 transition-all duration-300"
          onClick={() => scrollToDirection('down')}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* Botão Esquerda */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 left-4 transform -translate-y-1/2 pointer-events-auto bg-black/40 hover:bg-black/60 text-white border-gray-600 rounded-full w-10 h-10 p-0 transition-all duration-300"
          onClick={() => scrollToDirection('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Botão Direita */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-auto bg-black/40 hover:bg-black/60 text-white border-gray-600 rounded-full w-10 h-10 p-0 transition-all duration-300"
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
            className="rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 p-0"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
        
        <Link href="/info">
          <Button 
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14 bg-black/50 hover:bg-black/70 text-white border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </Link>
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