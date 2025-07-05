import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import QRManagement from "./qr-management";
import type { Video } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'videos' | 'qr'>('videos');
  const [filters, setFilters] = useState({
    status: '',
    racismType: '',
    location: '',
    date: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/statistics/overview'],
  });

  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      const response = await fetch(`/api/videos?${params}`);
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      const response = await fetch(`/api/videos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update video status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status do vídeo foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics/overview'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: number) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: number) => {
    updateStatusMutation.mutate({ id, status: 'rejected', rejectionReason });
    setRejectionReason('');
  };

  const exportData = () => {
    // Create CSV data
    const csvData = videos?.map(video => ({
      id: video.id,
      cidade: video.city,
      estado: video.state,
      idade: video.ageRange,
      genero: video.gender,
      tom_pele: video.skinTone,
      tipo_racismo: video.racismType,
      status: video.status,
      data_criacao: video.createdAt,
    })) || [];

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatos_racismo_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Painel Administrativo</h2>
        <p className="text-gray-600">Gerencie vídeos, QR codes e visualize estatísticas</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'videos'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gerenciamento de Vídeos
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'qr'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              QR Codes
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'videos' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total de vídeos</p>
                        <p className="text-2xl font-bold text-primary">{stats?.totalVideos || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-video text-blue-600"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pendentes</p>
                        <p className="text-2xl font-bold text-secondary">{stats?.pendingVideos || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-clock text-yellow-600"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Aprovados</p>
                        <p className="text-2xl font-bold text-success">{stats?.approvedVideos || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-check text-green-600"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Rejeitados</p>
                        <p className="text-2xl font-bold text-accent">{stats?.rejectedVideos || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-times text-red-600"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Filters and Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros e Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.racismType} onValueChange={(value) => setFilters(prev => ({ ...prev, racismType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="institucional">Institucional</SelectItem>
                    <SelectItem value="religioso">Religioso</SelectItem>
                    <SelectItem value="linguístico">Linguístico</SelectItem>
                    <SelectItem value="estrutural">Estrutural</SelectItem>
                    <SelectItem value="escolar">Escolar</SelectItem>
                    <SelectItem value="mercado_trabalho">Mercado de trabalho</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                />

                <Input
                  placeholder="Buscar por localização"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={exportData}>
                  <i className="fas fa-download mr-2"></i>
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Videos Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vídeos para revisão</CardTitle>
            </CardHeader>
            <CardContent>
              {videosLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-28" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vídeo</TableHead>
                      <TableHead>Dados</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos?.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-28 bg-gray-900 rounded-lg flex items-center justify-center">
                              <i className="fas fa-play text-white"></i>
                            </div>
                            <div>
                              <div className="font-medium">VID-{video.id}</div>
                              <div className="text-sm text-gray-500">
                                {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{video.city}, {video.state}</div>
                            <div className="text-gray-500">{video.ageRange}, {video.gender}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{video.racismType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(video.status)}>
                            {getStatusText(video.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            
                            {video.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleApprove(video.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <i className="fas fa-check"></i>
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <i className="fas fa-times"></i>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Rejeitar vídeo</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Por favor, forneça um motivo para a rejeição deste vídeo.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <Textarea
                                      placeholder="Motivo da rejeição..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleReject(video.id)}>
                                        Rejeitar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <QRManagement />
      )}
    </div>
  );
}
