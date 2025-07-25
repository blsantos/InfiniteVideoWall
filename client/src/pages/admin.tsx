import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDashboard from "@/components/admin-dashboard";
import YouTubeSync from "@/components/youtube-sync";
import PlaylistManagement from "@/components/playlist-management";
import VideoModeration from "@/components/video-moderation";
import QRManagement from "@/components/qr-management";
import AdminStats from "@/components/admin-stats";
import YouTubeDebug from "@/components/youtube-debug";
import ChannelSwitcher from "@/components/channel-switcher";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para acessar o painel administrativo",
        variant: "destructive",
      });
      window.location.href = "/api/login";
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                <Link href="/statistics">
                  <i className="fas fa-chart-bar mr-2"></i>
                  Estatísticas
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/api/logout">Sair</a>
              </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-400"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-2">Gerencie vídeos, estatísticas e configurações do sistema</p>
          </div>
          
          <Tabs defaultValue="moderation" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="moderation">Moderação</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="channel">🔧 Canal</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="moderation" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <VideoModeration />
              </div>
            </TabsContent>



            <TabsContent value="playlists" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <PlaylistManagement />
              </div>
            </TabsContent>

            <TabsContent value="youtube" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <YouTubeSync />
              </div>
            </TabsContent>

            <TabsContent value="channel" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurar Novo Canal</h2>
                  <p className="text-gray-600">Após excluir o canal anterior, configure o novo canal YouTube aqui.</p>
                </div>
                <ChannelSwitcher />
              </div>
            </TabsContent>

            <TabsContent value="debug" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <YouTubeDebug />
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <AdminStats />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
