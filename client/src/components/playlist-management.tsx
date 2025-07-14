import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Youtube, Plus, ExternalLink, RefreshCw, List, Video } from "lucide-react";

const CATEGORIES = [
  "Discriminação no trabalho",
  "Abordagem policial", 
  "Racismo em estabelecimentos",
  "Discriminação educacional",
  "Racismo na área da saúde",
  "Preconceito em transportes",
  "Discriminação habitacional",
  "Racismo religioso",
  "Outro"
];

export default function PlaylistManagement() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");

  // Buscar playlists existentes
  const { data: playlists, isLoading: loadingPlaylists } = useQuery({
    queryKey: ['/api/youtube/playlists'],
    retry: false,
  });

  // Buscar capítulos
  const { data: chapters } = useQuery({
    queryKey: ['/api/chapters'],
    retry: false,
  });

  // Criar nova playlist
  const createPlaylistMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: string }) => {
      return await apiRequest('/api/youtube/playlists', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Playlist criada",
        description: "Playlist criada com sucesso no YouTube",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/youtube/playlists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chapters'] });
      setPlaylistTitle("");
      setPlaylistDescription("");
      setSelectedCategory("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Gerar título automático baseado na categoria
  useEffect(() => {
    if (selectedCategory) {
      setPlaylistTitle(`Reparações Históricas - ${selectedCategory}`);
      setPlaylistDescription(`Depoimentos sobre ${selectedCategory.toLowerCase()} - Projeto Reparações Históricas`);
    }
  }, [selectedCategory]);

  const handleCreatePlaylist = () => {
    if (!selectedCategory || !playlistTitle) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma categoria e digite um título",
        variant: "destructive",
      });
      return;
    }

    createPlaylistMutation.mutate({
      title: playlistTitle,
      description: playlistDescription,
      category: selectedCategory,
    });
  };

  // Organizar playlists por categoria
  const playlistsByCategory = CATEGORIES.map(category => {
    const categoryChapters = chapters?.filter((c: any) => c.category === category) || [];
    const categoryPlaylists = categoryChapters.filter((c: any) => c.youtubePlaylistId);
    
    return {
      category,
      chapters: categoryChapters,
      playlists: categoryPlaylists,
      hasPlaylist: categoryPlaylists.length > 0
    };
  });

  if (loadingPlaylists) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando playlists...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Criar Nova Playlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Nova Playlist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Título da Playlist</label>
            <Input
              value={playlistTitle}
              onChange={(e) => setPlaylistTitle(e.target.value)}
              placeholder="Ex: Reparações Históricas - Discriminação no trabalho"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <Textarea
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              placeholder="Descrição da playlist..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleCreatePlaylist}
            disabled={createPlaylistMutation.isPending || !selectedCategory}
            className="bg-red-600 hover:bg-red-700"
          >
            {createPlaylistMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Youtube className="h-4 w-4 mr-2" />
                Criar Playlist
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Playlists por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Playlists por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {playlistsByCategory.map(({ category, chapters, playlists, hasPlaylist }) => (
              <div 
                key={category}
                className={`p-4 rounded-lg border ${
                  hasPlaylist ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{category}</h4>
                    {hasPlaylist ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Youtube className="h-3 w-3 mr-1" />
                        Playlist Criada
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Sem Playlist
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Video className="h-4 w-4" />
                    {chapters.length} capítulo(s)
                  </div>
                </div>

                {hasPlaylist && (
                  <div className="space-y-2">
                    {playlists.map((chapter: any) => (
                      <div key={chapter.id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                          <p className="font-medium">{chapter.title}</p>
                          <p className="text-sm text-gray-600">Playlist ID: {chapter.youtubePlaylistId}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={chapter.youtubePlaylistUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Ver no YouTube
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!hasPlaylist && (
                  <div className="text-sm text-gray-600 bg-white p-3 rounded border border-dashed">
                    <p>Nenhuma playlist criada para esta categoria.</p>
                    <p>Use o formulário acima para criar uma playlist e organizar os vídeos.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
              <p><strong>Criar Playlist:</strong> Selecione uma categoria e crie uma playlist no YouTube</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">2</div>
              <p><strong>Organização:</strong> Vídeos são automaticamente organizados por categoria</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">3</div>
              <p><strong>QR Codes:</strong> Cada QR code mostra apenas vídeos da sua categoria específica</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">4</div>
              <p><strong>YouTube:</strong> Playlists públicas no canal @ReparacoesHistoricasBrasil</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}