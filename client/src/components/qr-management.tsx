import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download, QrCode, Eye, Plus } from "lucide-react";

interface Chapter {
  id: number;
  title: string;
  description: string;
  qrCode: string;
  category: string;
  youtubePlaylistId?: string;
  youtubePlaylistUrl?: string;
}

export default function QRManagement() {
  const [newChapter, setNewChapter] = useState({
    title: "",
    description: "",
    category: ""
  });
  const [showPreview, setShowPreview] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters"],
  });

  const createChapterMutation = useMutation({
    mutationFn: async (chapterData: { title: string; description: string; category: string }) => {
      return apiRequest(`/api/chapters`, {
        method: "POST",
        body: JSON.stringify(chapterData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setNewChapter({ title: "", description: "", category: "" });
      toast({
        title: "Sucesso",
        description: "Capítulo e QR Code criados com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar capítulo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.title.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive",
      });
      return;
    }
    createChapterMutation.mutate(newChapter);
  };

  const downloadQRCode = (chapter: Chapter) => {
    const link = document.createElement('a');
    link.href = chapter.qrCode;
    link.download = `qr-code-${chapter.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: `QR Code do ${chapter.title} baixado com sucesso!`,
    });
  };

  const getQRCodeUrl = (chapter: Chapter) => {
    return `${window.location.origin}/chapter/${encodeURIComponent(chapter.title)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestão de QR Codes</h2>
        <p className="text-gray-600">
          Crie e gerencie QR codes para capítulos do livro. Cada QR code leva diretamente à página do capítulo com vídeos relacionados.
        </p>
      </div>

      {/* Formulário para criar novo capítulo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Capítulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título do Capítulo*</Label>
                <Input
                  id="title"
                  value={newChapter.title}
                  onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Capítulo 4: Racismo na Educação"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={newChapter.category}
                  onChange={(e) => setNewChapter(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Educação, Trabalho, Saúde"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newChapter.description}
                onChange={(e) => setNewChapter(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição do conteúdo do capítulo..."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              disabled={createChapterMutation.isPending}
              className="w-full md:w-auto"
            >
              {createChapterMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Criar Capítulo e QR Code
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de capítulos existentes */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Capítulos Existentes ({chapters.length})
        </h3>
        
        {chapters.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <QrCode className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Nenhum capítulo criado ainda.<br />
                Crie o primeiro capítulo acima para gerar QR codes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{chapter.title}</CardTitle>
                  {chapter.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full w-fit">
                      {chapter.category}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {chapter.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {chapter.description}
                    </p>
                  )}
                  
                  {/* QR Code Preview */}
                  {showPreview === chapter.id && (
                    <div className="bg-white border rounded-lg p-4 text-center">
                      <img 
                        src={chapter.qrCode} 
                        alt={`QR Code para ${chapter.title}`}
                        className="mx-auto mb-2 max-w-[150px]"
                      />
                      <p className="text-xs text-gray-500 break-all">
                        {getQRCodeUrl(chapter)}
                      </p>
                    </div>
                  )}

                  {/* YouTube Playlist Info */}
                  {chapter.youtubePlaylistId && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-700">
                        📺 Vinculado à playlist: {chapter.youtubePlaylistId.substring(0, 8)}...
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(showPreview === chapter.id ? null : chapter.id)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {showPreview === chapter.id ? 'Ocultar' : 'Ver QR'}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => downloadQRCode(chapter)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}