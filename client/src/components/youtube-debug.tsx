import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Youtube, ExternalLink, Trash2 } from "lucide-react";

export default function YouTubeDebug() {
  const { toast } = useToast();

  // Buscar vídeos do banco
  const { data: videos, isLoading: loadingVideos, refetch: refetchVideos } = useQuery({
    queryKey: ['/api/admin/videos'],
    retry: false,
  });

  // Limpar vídeos com problemas
  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/youtube/cleanup-invalid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Erro ao limpar vídeos');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Limpeza concluída",
        description: `${data.deletedCount} vídeos inválidos removidos`,
      });
      refetchVideos();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na limpeza",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sincronizar vídeos
  const syncMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/youtube/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Sincronização completa",
        description: data.message,
      });
      refetchVideos();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validVideos = videos?.filter((video: any) => 
    video.youtubeId && 
    typeof video.youtubeId === 'string' && 
    !video.youtubeId.includes('kind') &&
    video.youtubeUrl && 
    !video.youtubeUrl.includes('[object Object]')
  ) || [];

  const invalidVideos = videos?.filter((video: any) => 
    !video.youtubeId || 
    typeof video.youtubeId !== 'string' || 
    video.youtubeId.includes('kind') ||
    !video.youtubeUrl || 
    video.youtubeUrl.includes('[object Object]')
  ) || [];

  if (loadingVideos) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando vídeos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            Status dos Vídeos do YouTube
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{validVideos.length}</div>
              <div className="text-sm text-green-700">Vídeos Válidos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{invalidVideos.length}</div>
              <div className="text-sm text-red-700">Vídeos com Problema</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{videos?.length || 0}</div>
              <div className="text-sm text-blue-700">Total de Vídeos</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Novamente
                </>
              )}
            </Button>

            {invalidVideos.length > 0 && (
              <Button 
                onClick={() => cleanupMutation.mutate()}
                disabled={cleanupMutation.isPending}
                variant="destructive"
              >
                {cleanupMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Vídeos Inválidos
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vídeos Válidos */}
      {validVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Vídeos Válidos ({validVideos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validVideos.map((video: any) => (
                <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex-1">
                    <h4 className="font-medium">{video.title}</h4>
                    <p className="text-sm text-gray-600">ID: {video.youtubeId}</p>
                    <p className="text-sm text-gray-600">Status: {video.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Válido
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a 
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vídeos com Problema */}
      {invalidVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Vídeos com Problema ({invalidVideos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invalidVideos.map((video: any) => (
                <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                  <div className="flex-1">
                    <h4 className="font-medium">{video.title}</h4>
                    <p className="text-sm text-red-600">ID: {JSON.stringify(video.youtubeId)}</p>
                    <p className="text-sm text-red-600">URL: {video.youtubeUrl}</p>
                  </div>
                  <Badge variant="destructive">
                    Inválido
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}