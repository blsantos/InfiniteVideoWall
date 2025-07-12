// Script para popular o banco com dados de exemplo
import { db } from "../server/db";
import { videos, chapters } from "../shared/schema";

const sampleVideos = [
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "Relato sobre discriminação no trabalho",
    duration: 45,
    chapterId: 1,
    ageRange: "25-35",
    gender: "Mulher",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    skinTone: "Negra",
    racismType: "Discriminação no trabalho",
    authorName: "Maria Silva",
    allowPublicDisplay: true,
    allowFutureContact: true,
    status: "pending"
  },
  {
    youtubeId: "ScMzIvxBSi4",
    title: "Experiência de abordagem policial",
    duration: 67,
    chapterId: 1,
    ageRange: "18-25",
    gender: "Homem",
    city: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    skinTone: "Pardo",
    racismType: "Abordagem policial",
    authorName: "João Santos",
    allowPublicDisplay: true,
    allowFutureContact: false,
    status: "approved"
  },
  {
    youtubeId: "eBGIQ7ZuuiU",
    title: "Racismo em estabelecimento comercial",
    duration: 52,
    chapterId: 1,
    ageRange: "35-45",
    gender: "Mulher",
    city: "Belo Horizonte",
    state: "MG",
    country: "Brasil",
    skinTone: "Negra",
    racismType: "Racismo em estabelecimentos",
    authorName: "Ana Costa",
    allowPublicDisplay: true,
    allowFutureContact: true,
    status: "approved"
  },
  {
    youtubeId: "jNQXAC9IVRw",
    title: "Discriminação no ambiente escolar",
    duration: 38,
    chapterId: 2,
    ageRange: "15-18",
    gender: "Não-binário",
    city: "Salvador",
    state: "BA",
    country: "Brasil",
    skinTone: "Negra",
    racismType: "Discriminação em educação",
    allowPublicDisplay: true,
    allowFutureContact: false,
    status: "pending"
  },
  {
    youtubeId: "M7lc1UVf-VE",
    title: "Racismo estrutural no sistema de saúde",
    duration: 89,
    chapterId: 2,
    ageRange: "45-55",
    gender: "Mulher",
    city: "Brasília",
    state: "DF",
    country: "Brasil",
    skinTone: "Negra",
    racismType: "Racismo estrutural",
    authorName: "Carla Oliveira",
    allowPublicDisplay: true,
    allowFutureContact: true,
    status: "rejected",
    rejectionReason: "Conteúdo não está adequado aos padrões da plataforma"
  }
];

const sampleChapters = [
  {
    title: "Capítulo 1: Racismo no Mercado de Trabalho",
    description: "Explorando as experiências de discriminação racial no ambiente profissional"
  },
  {
    title: "Capítulo 2: Racismo Institucional",
    description: "Análise das práticas discriminatórias em instituições públicas e privadas"
  },
  {
    title: "Capítulo 3: Racismo no Cotidiano",
    description: "Relatos sobre situações de racismo no dia a dia"
  }
];

async function seedDatabase() {
  try {
    console.log("Inserindo capítulos de exemplo...");
    await db.insert(chapters).values(sampleChapters).onConflictDoNothing();
    
    console.log("Inserindo vídeos de exemplo...");
    await db.insert(videos).values(sampleVideos).onConflictDoNothing();
    
    console.log("✅ Dados de exemplo inseridos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inserir dados:", error);
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };