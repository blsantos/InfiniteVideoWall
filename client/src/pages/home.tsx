import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload, Info, Play } from "lucide-react";
import VideoWall from "@/components/video-wall";
import VideoModal from "@/components/video-modal";
import type { Video as VideoType } from "@shared/schema";

// Vidéos factices pour la démonstration
const dummyVideos: VideoType[] = [
  {
    id: 1,
    title: "Témoignage 1",
    description: "Expérience de discrimination à l'embauche",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://via.placeholder.com/400x600/6B46C1/ffffff?text=Vidéo+1",
    chapterId: 1,
    submitterName: "Anonyme",
    submitterAge: "25-35",
    submitterGender: "Femme",
    submitterLocation: "Paris",
    racismType: "Discrimination à l'embauche",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    moderatorId: null,
    moderatorComments: null
  },
  {
    id: 2,
    title: "Témoignage 2",
    description: "Contrôle au faciès dans le métro",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://via.placeholder.com/400x600/EC4899/ffffff?text=Vidéo+2",
    chapterId: 1,
    submitterName: "Anonyme",
    submitterAge: "18-25",
    submitterGender: "Homme",
    submitterLocation: "Lyon",
    racismType: "Contrôle au faciès",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    moderatorId: null,
    moderatorComments: null
  },
  {
    id: 3,
    title: "Témoignage 3",
    description: "Remarques déplacées au travail",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://via.placeholder.com/400x600/10B981/ffffff?text=Vidéo+3",
    chapterId: 1,
    submitterName: "Anonyme",
    submitterAge: "35-45",
    submitterGender: "Femme",
    submitterLocation: "Marseille",
    racismType: "Racisme au travail",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    moderatorId: null,
    moderatorComments: null
  },
  {
    id: 4,
    title: "Témoignage 4",
    description: "Refus de service dans un magasin",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://via.placeholder.com/400x600/F59E0B/ffffff?text=Vidéo+4",
    chapterId: 1,
    submitterName: "Anonyme",
    submitterAge: "25-35",
    submitterGender: "Homme",
    submitterLocation: "Toulouse",
    racismType: "Refus de service",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    moderatorId: null,
    moderatorComments: null
  },
  {
    id: 5,
    title: "Témoignage 5",
    description: "Discrimination dans le logement",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://via.placeholder.com/400x600/EF4444/ffffff?text=Vidéo+5",
    chapterId: 1,
    submitterName: "Anonyme",
    submitterAge: "18-25",
    submitterGender: "Femme",
    submitterLocation: "Nice",
    racismType: "Discrimination logement",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    moderatorId: null,
    moderatorComments: null
  },
  {
    id: 6,
    title: "Témoignage 6",
    description: "Insultes dans la rue",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://via.placeholder.com/400x600/8B5CF6/ffffff?text=Vidéo+6",
    chapterId: 1,
    submitterName: "Anonyme",
    submitterAge: "35-45",
    submitterGender: "Homme",
    submitterLocation: "Bordeaux",
    racismType: "Insultes racistes",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    moderatorId: null,
    moderatorComments: null
  }
];

export default function Home() {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);

  const handleVideoSelect = (video: VideoType) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec les 2 boutons */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Muro Infinito de Vídeos
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Témoignages sur les expériences de racisme
            </p>
          </div>
          
          {/* Les 2 boutons demandés */}
          <div className="flex gap-4 mb-8">
            <Link href="/upload">
              <Button className="flex items-center gap-2 px-6 py-3 text-lg">
                <Upload className="h-5 w-5" />
                Ajouter un Témoignage
              </Button>
            </Link>
            
            <Link href="/info">
              <Button variant="outline" className="flex items-center gap-2 px-6 py-3 text-lg">
                <Info className="h-5 w-5" />
                Informations
              </Button>
            </Link>
          </div>
        </div>

        {/* Compteur de vidéos */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
            <Play className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {dummyVideos.length} témoignages partagés
            </span>
          </div>
        </div>

        {/* Mur de vidéos */}
        <VideoWall 
          videos={dummyVideos} 
          onVideoSelect={handleVideoSelect} 
        />

        {/* Modal pour les vidéos */}
        <VideoModal 
          video={selectedVideo} 
          onClose={handleCloseModal} 
        />
      </div>
    </div>
  );
}