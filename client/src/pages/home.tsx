import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Reparações Históricas</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user?.isAdmin && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/admin">
                      <i className="fas fa-chart-bar mr-2"></i>
                      Admin
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/statistics">
                      <i className="fas fa-chart-line mr-2"></i>
                      Estatísticas
                    </Link>
                  </Button>
                </>
              )}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Bem-vindo, {user?.firstName || 'Usuario'}!
            </h2>
            <p className="text-xl text-gray-600">
              Explore os capítulos e contribua com seus relatos
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <i className="fas fa-video mr-3 text-secondary"></i>
                  Compartilhar Relato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Contribua com sua experiência pessoal de racismo
                </p>
                <Button asChild className="w-full">
                  <Link href="/upload">Enviar Vídeo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <i className="fas fa-book mr-3 text-secondary"></i>
                  Explorar Capítulos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Navegue pelos diferentes tipos de racismo
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/chapter/1">Ver Relatos</Link>
                </Button>
              </CardContent>
            </Card>

            {user?.isAdmin && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <i className="fas fa-cog mr-3 text-secondary"></i>
                    Painel Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Modere vídeos e gerencie conteúdo
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/admin">Administrar</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Featured Chapters */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-primary mb-6">
              Capítulos Disponíveis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 1, title: "Racismo Institucional", description: "Experiências em instituições públicas e privadas" },
                { id: 2, title: "Racismo Estrutural", description: "Manifestações sistemáticas na sociedade" },
                { id: 3, title: "Racismo no Trabalho", description: "Discriminação no ambiente profissional" },
                { id: 4, title: "Racismo Escolar", description: "Preconceito no ambiente educacional" },
                { id: 5, title: "Racismo Religioso", description: "Intolerância religiosa e preconceito" },
                { id: 6, title: "Racismo Linguístico", description: "Discriminação pela forma de falar" },
              ].map((chapter) => (
                <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">
                      {chapter.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {chapter.description}
                    </p>
                    <Button size="sm" asChild>
                      <Link href={`/chapter/${chapter.id}`}>
                        Ver Relatos
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
