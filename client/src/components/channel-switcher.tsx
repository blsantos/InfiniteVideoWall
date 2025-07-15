import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Youtube, RefreshCw } from "lucide-react";

export default function ChannelSwitcher() {
  const [channelInput, setChannelInput] = useState("");
  const [channelName, setChannelName] = useState("");
  const queryClient = useQueryClient();

  const changeChannelMutation = useMutation({
    mutationFn: async (data: { channelInput: string; channelName?: string }) => {
      return await apiRequest("/api/youtube/change-channel", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: (result) => {
      console.log("Canal alterado com sucesso:", result);
      // Invalidar cache para recarregar vídeos
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/youtube"] });
      setChannelInput("");
      setChannelName("");
    },
    onError: (error) => {
      console.error("Erro ao alterar canal:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelInput.trim()) return;
    
    changeChannelMutation.mutate({
      channelInput: channelInput.trim(),
      channelName: channelName.trim() || undefined
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-600" />
          Trocar Canal YouTube
        </CardTitle>
        <CardDescription>
          Configure um novo canal YouTube para o sistema de vídeos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações de Uso */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Formatos aceitos:</strong><br/>
            • Channel ID: UCzpIDynWSNfGx4djJS_DFiQ<br/>
            • URL do canal: https://youtube.com/channel/UCxxxxx<br/>
            • Username: @NomeDoCanal
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channelInput">Canal YouTube *</Label>
            <Input
              id="channelInput"
              type="text"
              placeholder="UCzpIDynWSNfGx4djJS_DFiQ ou https://youtube.com/@canal ou @username"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              required
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channelName">Nome do Canal (opcional)</Label>
            <Input
              id="channelName"
              type="text"
              placeholder="@ReparacoesHistoricas"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            disabled={changeChannelMutation.isPending || !channelInput.trim()}
            className="w-full"
          >
            {changeChannelMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando Canal...
              </>
            ) : (
              <>
                <Youtube className="h-4 w-4 mr-2" />
                Atualizar Canal
              </>
            )}
          </Button>
        </form>

        {/* Resultado da Operação */}
        {changeChannelMutation.isSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✅ Canal atualizado com sucesso!</strong><br/>
              {changeChannelMutation.data?.channel?.name && (
                <>Canal: {changeChannelMutation.data.channel.name}<br/></>
              )}
              {changeChannelMutation.data?.sync && (
                <>
                  Vídeos sincronizados: {changeChannelMutation.data.sync.syncedVideos}<br/>
                  Total de vídeos: {changeChannelMutation.data.sync.totalVideos}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {changeChannelMutation.isError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>❌ Erro:</strong><br/>
              {changeChannelMutation.error instanceof Error 
                ? changeChannelMutation.error.message 
                : "Erro desconhecido"}
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções */}
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Como obter as informações do canal:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Acesse o canal no YouTube</li>
            <li>Copie a URL completa ou apenas o @username</li>
            <li>Para Channel ID: clique com botão direito → "Ver código da página" → procure por "channelId"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}