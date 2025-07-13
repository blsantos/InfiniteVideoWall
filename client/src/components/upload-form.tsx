import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertVideoSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Youtube } from "lucide-react";
import { z } from "zod";

const uploadFormSchema = insertVideoSchema.extend({
  videoFile: z.any().refine((file) => file instanceof File, "Vídeo é obrigatório"),
  termsAccepted: z.boolean().refine((val) => val === true, "Você deve aceitar os termos"),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

export default function UploadForm() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [youtubeAuth, setYoutubeAuth] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Verificar se YouTube foi autorizado via URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('youtube') === 'success') {
      setYoutubeAuth('success');
      toast({
        title: "YouTube Autorizado",
        description: "Agora você pode fazer upload de vídeos diretamente para o YouTube!",
      });
    } else if (urlParams.get('youtube') === 'error') {
      toast({
        title: "Erro na Autorização",
        description: "Houve um problema ao autorizar o YouTube. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      country: "Brasil",
      allowPublicDisplay: false,
      allowFutureContact: false,
      termsAccepted: false,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      const formData = new FormData();
      
      // Add video file
      formData.append('video', data.videoFile);
      
      // Add other form data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'videoFile' && key !== 'termsAccepted') {
          formData.append(key, value?.toString() || '');
        }
      });

      const response = await fetch('/api/videos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar vídeo');
      }

      return response.json();
    },
    onSuccess: (response: any) => {
      const message = response.youtubeUploaded 
        ? "Vídeo enviado com sucesso para o YouTube e nossa plataforma!"
        : "Vídeo enviado com sucesso e está aguardando moderação.";
      
      toast({
        title: "Upload Realizado!",
        description: message,
      });
      form.reset();
      setUploadProgress(0);
    },
    onError: (error: any) => {
      if (error.message.includes('Autorização do YouTube')) {
        toast({
          title: "Autorização Necessária",
          description: "Clique no botão 'Autorizar YouTube' para fazer upload direto.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar vídeo",
          description: error.message,
          variant: "destructive",
        });
      }
      setUploadProgress(0);
    },
  });

  const authorizeYoutube = async () => {
    try {
      const response = await fetch('/api/youtube/auth');
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar autorização do YouTube",
        variant: "destructive",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        form.setValue('videoFile', file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo de vídeo",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('videoFile', file);
    }
  };

  const onSubmit = (data: UploadFormData) => {
    uploadMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Video Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Vídeo</h3>
          
          {/* YouTube Authorization */}
          {!youtubeAuth && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Youtube className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">Autorização do YouTube necessária</h4>
                  <p className="text-sm text-red-700">Para fazer upload direto para o YouTube, você precisa autorizar nossa aplicação.</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={authorizeYoutube}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Autorizar YouTube
                </Button>
              </div>
            </div>
          )}
          
          {youtubeAuth === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Youtube className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">YouTube autorizado!</h4>
                  <p className="text-sm text-green-700">Seus vídeos serão enviados diretamente para o YouTube.</p>
                </div>
              </div>
            </div>
          )}
          <FormField
            control={form.control}
            name="videoFile"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? 'border-secondary bg-secondary/10' : 'border-gray-300 hover:border-secondary'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 mb-2">
                      {field.value ? field.value.name : 'Arraste seu vídeo aqui ou clique para selecionar'}
                    </p>
                    <p className="text-sm text-gray-500">Formato vertical (9:16), máximo 60 segundos</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload">
                      <Button type="button" className="mt-4" asChild>
                        <span>Selecionar vídeo</span>
                      </Button>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Demographic Data */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Dados demográficos</h3>
          <p className="text-sm text-gray-600">
            Estas informações são obrigatórias para fins estatísticos e não serão exibidas publicamente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ageRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa etária *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua faixa etária" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="18-25">18-25 anos</SelectItem>
                      <SelectItem value="26-35">26-35 anos</SelectItem>
                      <SelectItem value="36-45">36-45 anos</SelectItem>
                      <SelectItem value="46-55">46-55 anos</SelectItem>
                      <SelectItem value="56-65">56-65 anos</SelectItem>
                      <SelectItem value="65+">65+ anos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                      <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: São Paulo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: SP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skinTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tom de pele (autoidentificação) *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="muito claro">Muito claro</SelectItem>
                      <SelectItem value="claro">Claro</SelectItem>
                      <SelectItem value="moreno claro">Moreno claro</SelectItem>
                      <SelectItem value="moreno médio">Moreno médio</SelectItem>
                      <SelectItem value="moreno escuro">Moreno escuro</SelectItem>
                      <SelectItem value="negro">Negro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Racism Type */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Tipo de racismo *</h3>
          <FormField
            control={form.control}
            name="racismType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {[
                      { value: "institucional", label: "Institucional" },
                      { value: "religioso", label: "Religioso" },
                      { value: "linguístico", label: "Linguístico" },
                      { value: "estrutural", label: "Estrutural" },
                      { value: "escolar", label: "Escolar" },
                      { value: "mercado_trabalho", label: "Mercado de trabalho" },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="racismTypeOther"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Outro (especifique)</FormLabel>
                <FormControl>
                  <Input placeholder="Descreva o tipo de racismo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Optional Data */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Dados opcionais</h3>
          
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome ou pseudônimo</FormLabel>
                <FormControl>
                  <Input placeholder="Como gostaria de ser identificado (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="allowPublicDisplay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">
                    Autorizo a exibição pública do meu relato
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowFutureContact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">
                    Permito contato futuro para pesquisas relacionadas
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Terms and Submit */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm">
                  Aceito os <a href="#" className="text-secondary hover:underline">termos de uso</a> e a{' '}
                  <a href="#" className="text-secondary hover:underline">política de privacidade</a> *
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => form.reset()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-2"></i>
                  Enviar relato
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
