import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book, Heart, Users } from "lucide-react";
import { Link } from "wouter";

export default function Info() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au mur de vidéos
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Book className="h-16 w-16 text-purple-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                Muro Infinito de Vídeos
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Plateforme de témoignages sur les expériences de racisme
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-center text-gray-700 dark:text-gray-300">
                Cette plateforme permet aux personnes de partager leurs expériences personnelles 
                du racisme à travers des vidéos courtes et authentiques.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-red-500 mr-3" />
                  <CardTitle className="text-xl">Notre Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Créer un espace sûr où les personnes peuvent partager leurs expériences 
                  de racisme pour sensibiliser, éduquer et créer de l'empathie.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <CardTitle className="text-xl">Comment Participer</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Partagez votre témoignage en vidéo (max 60 secondes) pour contribuer 
                  à cette collection de voix importantes contre le racisme.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">À Propos du Projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Le "Muro Infinito de Vídeos" fait partie du projet reparacoeshistoricas.org, 
                  une initiative visant à documenter et partager les expériences de racisme 
                  pour promouvoir la compréhension et la justice sociale.
                </p>
                <p>
                  Chaque témoignage contribue à créer un mur infini de voix qui appellent 
                  à la réflexion, à l'action et au changement positif dans notre société.
                </p>
                <p>
                  <strong>Confidentialité :</strong> Tous les témoignages sont modérés avec 
                  respect et confidentialité. Votre participation contribue à une cause 
                  importante tout en protégeant votre vie privée.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}