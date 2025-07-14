import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChapterSchema } from "@shared/schema";
import type { Chapter } from "@shared/schema";
import { z } from "zod";

type ChapterFormData = z.infer<typeof insertChapterSchema>;

export default function QRManagement() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<ChapterFormData>({
    resolver: zodResolver(insertChapterSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  const categories = [
    "Discriminação no trabalho",
    "Abordagem policial", 
    "Racismo em estabelecimentos",
    "Discriminação em educação",
    "Racismo estrutural",
    "Racismo no transporte público",
    "Discriminação em serviços de saúde",
    "Racismo digital/redes sociais",
    "Outro"
  ];

  const { data: chapters, isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const createChapterMutation = useMutation({
    mutationFn: async (data: ChapterFormData) => {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chapter');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Capítulo criado",
        description: "O capítulo foi criado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chapters'] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar capítulo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateQRMutation = useMutation({
    mutationFn: async (chapterId: number) => {
      const response = await fetch(`/api/chapters/${chapterId}/qr-code`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "QR Code gerado",
        description: "O QR code foi gerado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chapters'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar QR code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadQRCode = (chapter: Chapter) => {
    if (!chapter.qrCode) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-capitulo-${chapter.id}.png`;
    link.href = chapter.qrCode;
    link.click();
  };

  const onSubmit = (data: ChapterFormData) => {
    createChapterMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="w-32 h-32 bg-gray-100 mx-auto mb-4 rounded-lg animate-pulse" />
              <div className="h-4 bg-gray-100 rounded mb-2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary">Gerenciamento de QR Codes</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Novo Capítulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo capítulo</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Capítulo 1 - Racismo Institucional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Breve descrição do capítulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createChapterMutation.isPending}>
                    {createChapterMutation.isPending ? 'Criando...' : 'Criar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chapters?.map((chapter) => (
          <Card key={chapter.id}>
            <CardContent className="p-6 text-center">
              <div className="w-32 h-32 bg-gray-100 mx-auto mb-4 rounded-lg flex items-center justify-center">
                {chapter.qrCode ? (
                  <img 
                    src={chapter.qrCode} 
                    alt={`QR Code para ${chapter.title}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <i className="fas fa-qrcode text-4xl text-gray-400"></i>
                )}
              </div>
              
              <h4 className="font-medium text-primary mb-2">{chapter.title}</h4>
              <p className="text-sm text-gray-600 mb-1">{chapter.description}</p>
              {chapter.category && (
                <p className="text-xs text-orange-600 font-medium mb-3">
                  📂 {chapter.category}
                </p>
              )}
              
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => generateQRMutation.mutate(chapter.id)}
                  disabled={generateQRMutation.isPending}
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  {chapter.qrCode ? 'Regenerar' : 'Gerar'} QR Code
                </Button>
                
                {chapter.qrCode && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => downloadQRCode(chapter)}
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download PNG
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
