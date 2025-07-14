import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export default function YouTubeSync() {
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');
  const [channelInfo, setChannelInfo] = useState<any>(null);

  // Verificar status ao carregar
  useEffect(() => {
    checkAuthMutation.mutate();
    
    // Verificar se retornou do OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('youtube_success')) {
      toast({
        title: "YouTube conectado!",
        description: "Autorização realizada com sucesso",
      });
      // Limpar parâmetro da URL
      window.history.replaceState({}, '', '/admin');
      // Verificar novamente o status
      setTimeout(() => checkAuthMutation.mutate(), 1000);
    }
    if (urlParams.get('youtube_error')) {
      toast({
        title: "Erro na autorização",
        description: urlParams.get('youtube_error') || "Erro desconhecido",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/admin');
    }
  }, []);

  // Verificar status de autorização
  const checkAuthMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/youtube/channel-info');
      if (!response.ok) {
        const data = await response.json();
        if (data.needsAuth) {
          setAuthStatus('unauthorized');
          return null;
        }
        throw new Error(data.message);
      }
      const data = await response.json();
      setChannelInfo(data);
      setAuthStatus('authorized');
      return data;
    },
    onError: (error: any) => {
      setAuthStatus('unauthorized');
      console.log("Não autorizado, precisa conectar ao YouTube");
    },
  });

  // Autorizar YouTube
  const authorizeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/youtube/auth');
      const data = await response.json();
      window.location.href = data.authUrl;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Erro na autorização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sincronizar vídeos
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/youtube/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sincronização concluída",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Sincronização YouTube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Status de Autorização */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {authStatus === 'authorized' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : authStatus === 'unauthorized' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
              )}
              
              <div>
                <p className="font-medium">
                  Status da Autorização YouTube
                </p>
                <p className="text-sm text-gray-600">
                  {authStatus === 'authorized' 
                    ? 'Conectado ao canal @ReparacoesHistoricasBrasil'
                    : authStatus === 'unauthorized'
                    ? 'Autorização necessária para acessar o canal'
                    : 'Verificando status...'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => checkAuthMutation.mutate()}
                disabled={checkAuthMutation.isPending}
              >
                {checkAuthMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Verificar
              </Button>
              
              {authStatus === 'unauthorized' && (
                <Button 
                  onClick={() => authorizeMutation.mutate()}
                  disabled={authorizeMutation.isPending}
                  size="sm"
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Autorizar
                </Button>
              )}
            </div>
          </div>

          {/* Informações do Canal */}
          {channelInfo && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Canal Conectado</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Nome:</strong> {channelInfo.snippet?.title}</p>
                <p><strong>Vídeos:</strong> {channelInfo.statistics?.videoCount || 'N/A'}</p>
                <p><strong>Inscritos:</strong> {channelInfo.statistics?.subscriberCount || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Ação de Sincronização */}
          <div className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div>
              <h4 className="font-medium text-orange-800">
                Sincronizar Vídeos do Canal
              </h4>
              <p className="text-sm text-orange-700 mt-1">
                Importa vídeos existentes do canal YouTube para o sistema
              </p>
            </div>
            
            <Button 
              onClick={() => syncMutation.mutate()}
              disabled={authStatus !== 'authorized' || syncMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>

          {/* Instruções */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Como funciona</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Autorizar:</strong> Conecta com sua conta Google/YouTube</li>
              <li>• <strong>Sincronizar:</strong> Importa vídeos existentes do canal</li>
              <li>• <strong>Automático:</strong> Novos uploads vão direto para o canal</li>
              <li>• <strong>Moderação:</strong> Vídeos sincronizados aparecem como "aprovados"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}