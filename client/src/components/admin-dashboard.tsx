import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Video, QrCode, Settings } from "lucide-react";
import AdminStats from "./admin-stats";
import VideoModeration from "./video-moderation";
import QRManagement from "./qr-management";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'qr' | 'settings'>('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-1">Gerencie vídeos, estatísticas e configurações da plataforma</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Moderação
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminStats />
        </TabsContent>

        <TabsContent value="videos">
          <VideoModeration />
        </TabsContent>

        <TabsContent value="qr">
          <QRManagement />
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações</h2>
            <p className="text-gray-600">Funcionalidades de configuração em desenvolvimento...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}