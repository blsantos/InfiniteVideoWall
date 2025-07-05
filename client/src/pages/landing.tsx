import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
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
              <Button variant="ghost" asChild>
                <Link href="/upload">Compartilhar Relato</Link>
              </Button>
              <Button asChild>
                <a href="/api/login">Entrar</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary mb-6">
              Muro Infinito de Vídeos
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Uma plataforma para compartilhar experiências reais de racismo. 
              Conecte-se através de QR codes nos capítulos do livro e contribua 
              com seu relato para transformar a sociedade.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" asChild>
                <Link href="/upload">Compartilhe seu relato</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/chapter/1">Ver relatos</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">QR</span>
                    </div>
                    Acesso por QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Cada capítulo do livro possui um QR code único que direciona 
                    para um mural digital específico com relatos relacionados.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-video text-white"></i>
                    </div>
                    Vídeos Verticais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Relatos em primeira pessoa de até 60 segundos em formato 
                    vertical, otimizado para dispositivos móveis.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-shield-alt text-white"></i>
                    </div>
                    Privacidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Todos os dados são confidenciais e utilizados apenas para 
                    fins estatísticos. Você escolhe se quer ser identificado.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-primary mb-4">
                Impacto Social
              </h3>
              <p className="text-gray-600">
                Juntos, estamos construindo um arquivo histórico de experiências 
                que podem ajudar a combater o racismo.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">1,000+</div>
                <div className="text-gray-600">Relatos compartilhados</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">50+</div>
                <div className="text-gray-600">Cidades participantes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">15</div>
                <div className="text-gray-600">Capítulos do livro</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
                <div className="text-gray-600">Acesso disponível</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
