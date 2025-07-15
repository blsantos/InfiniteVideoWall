import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink, Upload, List } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  privacy: string;
  itemCount: number;
  thumbnails?: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
}

interface Video {
  id: number;
  youtubeId: string;
  title: string;
  status: string;
}

export default function YouTubePlaylistManager() {
  const [newPlaylist, setNewPlaylist] = useState({
    title: "",
    description: "",
    privacy: "public" as "public" | "unlisted" | "private"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar playlists existentes
  const { data: playlists = [], isLoading: playlistsLoading } = useQuery({
    queryKey: ["/api/youtube/playlists"],
    retry: false
  });

  // Buscar vídeos aprovados
  const { data: videos = [] } = useQuery({
    queryKey: ["/api/videos"],
    select: (data: Video[]) => data.filter(video => video.status === "approved" && video.youtubeId)
  });

  // Mutation para criar playlist
  const createPlaylistMutation = useMutation({
    mutationFn: async (playlistData: typeof newPlaylist) => {
      return await apiRequest(`/api/youtube/playlists`, {
        method: "POST",
        body: JSON.stringify(playlistData),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Playlist criada",
        description: "Nova playlist criada com sucesso no YouTube"
      });
      setNewPlaylist({ title: "", description: "", privacy: "public" });
      queryClient.invalidateQueries({ queryKey: ["/api/youtube/playlists"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar playlist",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para adicionar vídeo à playlist
  const addToPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
      return await apiRequest(`/api/youtube/playlists/${playlistId}/videos`, {
        method: "POST",
        body: JSON.stringify({ videoId }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Vídeo adicionado",
        description: "Vídeo adicionado à playlist com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/youtube/playlists"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar playlist
  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      return await apiRequest(`/api/youtube/playlists/${playlistId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Playlist deletada",
        description: "Playlist removida do YouTube com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/youtube/playlists"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar playlist",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylist.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Digite um título para a playlist",
        variant: "destructive"
      });
      return;
    }
    createPlaylistMutation.mutate(newPlaylist);
  };

  const handleAddToPlaylist = (playlistId: string, videoId: string) => {
    addToPlaylistMutation.mutate({ playlistId, videoId });
  };

  const handleDeletePlaylist = (playlistId: string, title: string) => {
    if (confirm(`Tem certeza que deseja deletar a playlist "${title}"?`)) {
      deletePlaylistMutation.mutate(playlistId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Playlists YouTube</h2>
        <p className="text-gray-600">Crie e gerencie playlists no canal @ReparacoesHistoricasBrasil</p>
      </div>

      {/* Criar Nova Playlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Playlist
          </CardTitle>
          <CardDescription>
            Crie uma nova playlist no YouTube para organizar os vídeos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título da Playlist</Label>
              <Input
                id="title"
                value={newPlaylist.title}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Testemunhos São Paulo"
                maxLength={150}
              />
            </div>
            <div>
              <Label htmlFor="privacy">Privacidade</Label>
              <Select 
                value={newPlaylist.privacy} 
                onValueChange={(value: "public" | "unlisted" | "private") => 
                  setNewPlaylist(prev => ({ ...prev, privacy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="unlisted">Não listado</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={newPlaylist.description}
              onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da playlist..."
              maxLength={5000}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleCreatePlaylist}
            disabled={createPlaylistMutation.isPending}
            className="w-full"
          >
            {createPlaylistMutation.isPending ? "Criando..." : "Criar Playlist"}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Playlists Existentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Playlists Existentes
          </CardTitle>
          <CardDescription>
            {playlistsLoading ? "Carregando..." : `${playlists.length} playlists encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {playlistsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <List className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma playlist encontrada</p>
              <p className="text-sm">Crie sua primeira playlist acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {playlists.map((playlist: YouTubePlaylist) => (
                <div key={playlist.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{playlist.title}</h3>
                        <Badge variant="outline">{playlist.privacy}</Badge>
                        <Badge variant="secondary">{playlist.itemCount} vídeos</Badge>
                      </div>
                      {playlist.description && (
                        <p className="text-sm text-gray-600 mb-3">{playlist.description}</p>
                      )}
                      
                      {/* Adicionar Vídeos */}
                      <div className="flex flex-wrap gap-2">
                        {videos.slice(0, 3).map((video: Video) => (
                          <Button
                            key={video.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToPlaylist(playlist.id, video.youtubeId)}
                            disabled={addToPlaylistMutation.isPending}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            {video.title.substring(0, 20)}...
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={`https://www.youtube.com/playlist?list=${playlist.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePlaylist(playlist.id, playlist.title)}
                        disabled={deletePlaylistMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}