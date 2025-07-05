import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VideoWall from "@/components/video-wall";
import VideoModal from "@/components/video-modal";
import type { Chapter, Video } from "@shared/schema";

export default function Chapter() {
  const [, params] = useRoute("/chapter/:id");
  const chapterId = parseInt(params?.id || "1");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: chapter, isLoading: chapterLoading } = useQuery<Chapter>({
    queryKey: [`/api/chapters/${chapterId}`],
  });

  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: [`/api/videos`, chapterId],
    queryFn: async () => {
      const response = await fetch(`/api/videos?chapterId=${chapterId}&status=approved`);
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80">
                Reparações Históricas
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/upload">
                  <i className="fas fa-plus mr-2"></i>
                  Compartilhar relato
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Chapter Header */}
      <div className="pt-16">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                {chapterLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {chapter?.title || `Capítulo ${chapterId}`}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {chapter?.description || "Experiências e relatos reais"}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  <i className="fas fa-video mr-1"></i>
                  {videosLoading ? (
                    <Skeleton className="inline-block h-4 w-8" />
                  ) : (
                    <span>{videos?.length || 0} vídeos</span>
                  )}
                </span>
                <Button asChild>
                  <Link href="/upload">
                    <i className="fas fa-share-alt mr-2"></i>
                    Compartilhar seu relato
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Wall */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {videosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[9/16] w-full" />
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : videos && videos.length > 0 ? (
            <VideoWall
              videos={videos}
              onVideoSelect={setSelectedVideo}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-video text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum vídeo ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Seja o primeiro a compartilhar sua experiência neste capítulo
              </p>
              <Button asChild>
                <Link href="/upload">
                  <i className="fas fa-plus mr-2"></i>
                  Adicionar relato
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}
