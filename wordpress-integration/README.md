# YouTube Video Wall - Integração WordPress

## Implementação Completa no Site WordPress

### 1. Instalação do Plugin

**Passo 1: Fazer upload dos arquivos**
```bash
# Estrutura de pastas no seu WordPress:
wp-content/plugins/youtube-video-wall/
├── youtube-video-wall.php
├── assets/
│   ├── video-wall.js
│   └── video-wall.css
└── README.md
```

**Passo 2: Ativar o plugin**
1. Acesse o painel admin do WordPress
2. Vá em "Plugins" > "Plugins instalados"
3. Encontre "YouTube Video Wall - Reparações Históricas"
4. Clique em "Ativar"

### 2. Configuração Básica

**URL da API:**
- Atual: `https://883149f1-1c75-46d3-8a00-b3d17d4dda1d-00-zh6zir2txvr9.worf.replit.dev`
- Produção: `https://reparacoeshistoricas.org`

**Canal YouTube:**
- Nome: @ReparacoesHistoricas
- Channel ID: UCRMRvNncp4fFy-27JD4Ph2w

### 3. Usando os Shortcodes

#### Muro Completo de Vídeos
```php
[youtube_video_wall]
```

#### Vídeos de Capítulo Específico
```php
[youtube_chapter_videos chapter="1"]
```

#### Com Parâmetros Personalizados
```php
[youtube_video_wall chapter="1" limit="6" responsive="true"]
```

### 4. Criação de Páginas

#### Página Principal de Vídeos
```php
<?php
/*
Template Name: Muro de Vídeos
*/

get_header(); ?>

<div class="container">
    <h1>Testemunhos sobre Racismo</h1>
    <p>Vídeos reais do canal @ReparacoesHistoricas</p>
    
    <?php echo do_shortcode('[youtube_video_wall limit="12" responsive="true"]'); ?>
</div>

<?php get_footer(); ?>
```

#### Página de Capítulo
```php
<?php
/*
Template Name: Vídeos do Capítulo
*/

get_header(); 

$chapter_id = isset($_GET['chapter']) ? $_GET['chapter'] : '1';
?>

<div class="container">
    <h1>Capítulo <?php echo esc_html($chapter_id); ?></h1>
    
    <?php echo do_shortcode('[youtube_chapter_videos chapter="' . $chapter_id . '" limit="10"]'); ?>
    
    <div class="chapter-navigation">
        <a href="<?php echo home_url('/videos'); ?>" class="btn btn-primary">
            Ver Todos os Vídeos
        </a>
    </div>
</div>

<?php get_footer(); ?>
```

### 5. Configuração de URLs e QR Codes

#### URLs para QR Codes
```
https://seusite.com/capitulo/1  → Redireciona para vídeos do capítulo 1
https://seusite.com/capitulo/2  → Redireciona para vídeos do capítulo 2
```

#### Configuração do .htaccess
```apache
# Adicionar ao .htaccess do WordPress
RewriteRule ^capitulo/([0-9]+)/?$ /videos-capitulo/?chapter=$1 [L,QSA]
```

### 6. Personalização do Tema

#### Adicionar ao functions.php
```php
// Suporte para vídeos nas páginas
function add_youtube_video_support() {
    add_theme_support('youtube-video-wall');
}
add_action('after_setup_theme', 'add_youtube_video_support');

// Registrar menu para navegação de vídeos
function register_video_menus() {
    register_nav_menus(array(
        'video-chapters' => 'Menu de Capítulos de Vídeos'
    ));
}
add_action('init', 'register_video_menus');
```

### 7. Integração com Menu Principal

#### Adicionar ao menu do WordPress
```php
// No painel admin, vá em Aparência > Menus
// Adicione links personalizados:

- "Todos os Vídeos" → https://seusite.com/videos
- "Capítulo 1" → https://seusite.com/capitulo/1
- "Capítulo 2" → https://seusite.com/capitulo/2
```

### 8. Exemplo de Implementação Completa

#### Página index.php ou home.php
```php
<?php get_header(); ?>

<main class="main-content">
    <!-- Seção Hero -->
    <section class="hero-section">
        <div class="container">
            <h1>Reparações Históricas</h1>
            <p>Testemunhos reais sobre experiências de racismo no Brasil</p>
            <a href="#videos" class="btn btn-primary">Ver Vídeos</a>
        </div>
    </section>
    
    <!-- Seção de Vídeos -->
    <section id="videos" class="videos-section">
        <div class="container">
            <h2>Últimos Testemunhos</h2>
            
            <?php echo do_shortcode('[youtube_video_wall limit="8" responsive="true"]'); ?>
            
            <div class="text-center">
                <a href="<?php echo home_url('/videos'); ?>" class="btn btn-secondary">
                    Ver Todos os Vídeos
                </a>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
```

### 9. CSS Adicional no Tema

#### Adicionar ao style.css do tema
```css
/* Integração com o tema */
.youtube-video-wall {
    margin: 40px 0;
}

/* Botões personalizados */
.btn {
    display: inline-block;
    padding: 12px 24px;
    background: #ff6b35;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.btn:hover {
    background: #e55a2b;
    transform: translateY(-2px);
}

/* Seção hero */
.hero-section {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    color: white;
    padding: 80px 0;
    text-align: center;
}

.hero-section h1 {
    font-size: 48px;
    margin-bottom: 20px;
}
```

### 10. Verificação da Instalação

#### Checklist de Implementação
- [ ] Plugin instalado e ativado
- [ ] Shortcodes funcionando
- [ ] Modal de vídeos abrindo
- [ ] Vídeos carregando do canal @ReparacoesHistoricasBrasil
- [ ] URLs de capítulos redirecionando
- [ ] QR codes funcionando
- [ ] Layout responsivo
- [ ] Integração com tema

### 11. Troubleshooting

#### Problemas Comuns
1. **Vídeos não carregam**: Verificar URL da API
2. **Shortcode não funciona**: Verificar ativação do plugin
3. **Modal não abre**: Verificar inclusão do JavaScript
4. **QR codes não funcionam**: Verificar configuração do .htaccess

#### Logs e Debug
```php
// Ativar debug no wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Verificar logs em: wp-content/debug.log
```

### 12. Próximos Passos

1. **Configurar OAuth**: Para funcionalidades avançadas
2. **Adicionar analytics**: Tracking de visualizações
3. **Implementar cache**: Para melhor performance
4. **Adicionar SEO**: Meta tags para vídeos
5. **Criar sitemap**: Para indexação dos vídeos

---

## Suporte Técnico

**Sistema desenvolvido por:** B2Santos  
**Canal integrado:** @ReparacoesHistoricasBrasil  
**Tecnologia:** React + YouTube API + WordPress  

**Para suporte:** Contate através do sistema administrativo do Replit.