import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import AdminDashboard from "@/components/admin-dashboard";
import YouTubeSync from "@/components/youtube-sync";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80">
                Reparações Históricas
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/statistics">
                  <i className="fas fa-chart-bar mr-2"></i>
                  Estatísticas
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/api/logout">Sair</a>
              </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-400"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-2">Gerencie vídeos, estatísticas e configurações do sistema</p>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
              {/* YouTube Sync Card */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <i className="fab fa-youtube text-red-600"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900">YouTube</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Sincronize vídeos do canal @ReparacoesHistoricasBrasil
                  </p>
                  <a 
                    href="#youtube" 
                    className="text-red-600 text-sm font-medium hover:text-red-700"
                  >
                    Configurar →
                  </a>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-3">
                <AdminDashboard />
              </div>
            </div>
          </div>
          
          {/* YouTube Sync Section */}
          <div id="youtube" className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sincronização YouTube</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <YouTubeSync />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
