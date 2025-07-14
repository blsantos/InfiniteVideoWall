import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Video } from "@shared/schema";

export default function VideoModeration() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    status: '',
    racismType: '',
    location: '',
    search: '',
  });
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Verificar erro de autorização
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Acesso não autorizado",
        description: "Você precisa fazer login como administrador. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
    }
  }, [error, toast]);

  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ['/api/admin/videos', filters],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      return await apiRequest(`/api/admin/videos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionReason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status do vídeo foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: number) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: number, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, forneça um motivo para a rejeição.",
        variant: "destructive",
      });
      return;
    }
    updateStatusMutation.mutate({ id, status: 'rejected', rejectionReason: reason });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredVideos = videos?.filter(video => {
    if (filters.status && video.status !== filters.status) return false;
    if (filters.racismType && video.racismType !== filters.racismType) return false;
    if (filters.location && !video.city.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.search && !video.title?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !video.city.toLowerCase().includes(filters.search.toLowerCase()) &&
        !video.racismType.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (videosLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-36" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar vídeos..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.racismType} onValueChange={(value) => setFilters(prev => ({ ...prev, racismType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Racismo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="Discriminação no trabalho">Discriminação no trabalho</SelectItem>
                <SelectItem value="Abordagem policial">Abordagem policial</SelectItem>
                <SelectItem value="Racismo em estabelecimentos">Racismo em estabelecimentos</SelectItem>
                <SelectItem value="Discriminação em educação">Discriminação em educação</SelectItem>
                <SelectItem value="Racismo estrutural">Racismo estrutural</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Localização"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      <div className="space-y-4">
        {filteredVideos?.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Video Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-36 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                    <img
                      src={`https://picsum.photos/144/80?random=${video.id}`}
                      alt={video.title || "Vídeo"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold truncate">
                        {video.title || `Vídeo #${video.id}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {video.city}, {video.state} • {video.racismType}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{video.ageRange}</span>
                        <span>{video.gender}</span>
                        <span>{video.skinTone}</span>
                        {video.authorName && <span>Por: {video.authorName}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Enviado em {format(new Date(video.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(video.status)}
                      
                      {video.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(video.id)}
                            disabled={updateStatusMutation.isPending}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeitar Vídeo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Por favor, forneça um motivo para a rejeição deste vídeo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Textarea
                                placeholder="Motivo da rejeição..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-20"
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRejectionReason('')}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReject(video.id, rejectionReason)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Rejeitar Vídeo
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}

                      {video.status === 'rejected' && video.rejectionReason && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded max-w-xs">
                          <strong>Motivo:</strong> {video.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVideos && filteredVideos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Nenhum vídeo encontrado com os filtros aplicados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}