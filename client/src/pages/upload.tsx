import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UploadForm from "@/components/upload-form";

export default function Upload() {
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
                <Link href="/">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Voltar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">
                Compartilhe seu relato
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Sua experiência é importante e pode ajudar outras pessoas. 
                Todos os dados são confidenciais e usados apenas para fins estatísticos.
              </p>
            </CardHeader>
            <CardContent>
              <UploadForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
