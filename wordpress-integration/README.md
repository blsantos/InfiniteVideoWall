# Integração WordPress - Muro Infinito de Vídeos

## Visão Geral
Este documento explica como integrar o Sistema Muro Infinito de Vídeos no site reparacoeshistoricas.org.

## Métodos de Integração

### 1. Iframe Responsivo (Recomendado)
Incorpora o sistema diretamente nas páginas do WordPress.

### 2. API REST 
Consome os dados via API para exibição customizada.

### 3. Plugin WordPress
Plugin customizado para integração completa.

## URLs do Sistema

- **Aplicação Principal**: `https://seu-repl.replit.app/`
- **Painel Admin**: `https://seu-repl.replit.app/admin`
- **API Base**: `https://seu-repl.replit.app/api`

## Implementação por Capítulos

### QR Codes
Cada capítulo do livro terá um QR code único que direciona para:
`https://seu-repl.replit.app/chapter/{id}`

### URLs por Capítulo
- Capítulo 1: `https://seu-repl.replit.app/chapter/1`
- Capítulo 2: `https://seu-repl.replit.app/chapter/2`
- (e assim por diante...)

## Códigos de Integração

### Para Páginas do WordPress
```html
<!-- Iframe Responsivo -->
<div style="position: relative; width: 100%; height: 70vh; min-height: 500px;">
  <iframe 
    src="https://seu-repl.replit.app/" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="Muro Infinito de Vídeos">
  </iframe>
</div>
```

### Para Capítulos Específicos
```html
<!-- Capítulo 1 -->
<div style="position: relative; width: 100%; height: 70vh; min-height: 500px;">
  <iframe 
    src="https://seu-repl.replit.app/chapter/1" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="Vídeos - Capítulo 1">
  </iframe>
</div>
```

## API Endpoints Disponíveis

### Vídeos
- `GET /api/videos` - Lista todos os vídeos aprovados
- `GET /api/videos?chapterId=1` - Vídeos de um capítulo específico
- `POST /api/videos` - Upload de novo vídeo

### Capítulos
- `GET /api/chapters` - Lista todos os capítulos
- `GET /api/chapters/{id}` - Detalhes de um capítulo
- `POST /api/chapters` - Criar novo capítulo

### Estatísticas
- `GET /api/admin/stats/overview` - Estatísticas gerais
- `GET /api/admin/stats/location` - Por localização
- `GET /api/admin/stats/racism-type` - Por tipo de racismo

## Configuração no WordPress

### 1. Adicionar ao functions.php
```php
// Permitir iframes do sistema de vídeos
function allow_video_wall_iframe($tags) {
    $tags['iframe'] = array(
        'src' => array(),
        'height' => array(),
        'width' => array(),
        'style' => array(),
        'title' => array(),
        'frameborder' => array(),
    );
    return $tags;
}
add_filter('wp_kses_allowed_html', 'allow_video_wall_iframe');
```

### 2. Shortcode para Facilitar
```php
// Shortcode [video_wall]
function video_wall_shortcode($atts) {
    $atts = shortcode_atts(array(
        'chapter' => '',
        'height' => '70vh',
        'url' => 'https://seu-repl.replit.app'
    ), $atts);
    
    $src = $atts['url'];
    if (!empty($atts['chapter'])) {
        $src .= '/chapter/' . $atts['chapter'];
    }
    
    return '<div style="position: relative; width: 100%; height: ' . $atts['height'] . '; min-height: 500px;">
              <iframe src="' . $src . '" 
                      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                      title="Muro Infinito de Vídeos">
              </iframe>
            </div>';
}
add_shortcode('video_wall', 'video_wall_shortcode');
```

### 3. Uso dos Shortcodes
```
[video_wall] - Muro geral
[video_wall chapter="1"] - Capítulo específico
[video_wall chapter="1" height="80vh"] - Com altura customizada
```

## Responsividade

O sistema é totalmente responsivo e se adapta automaticamente a:
- Desktop (layout em grid)
- Tablet (grid reduzida)
- Mobile (layout em coluna única)

## SEO e Performance

### Meta Tags Incluídas
- Open Graph para compartilhamento social
- Meta descriptions em português
- Títulos otimizados por página

### Performance
- Carregamento assíncrono de vídeos
- Cache de dados via React Query
- Imagens otimizadas

## Segurança

- Autenticação via Replit Auth
- Validação de dados com Zod
- Proteção CSRF
- Sanitização de inputs

## Próximos Passos

1. **Deploy do Sistema**: Fazer deploy no Replit
2. **Configurar Domínio**: Opcional - configurar domínio customizado
3. **Integrar no WordPress**: Adicionar códigos nas páginas
4. **Gerar QR Codes**: Criar QR codes para cada capítulo
5. **Testes**: Testar integração completa

## Suporte Técnico

Para suporte técnico ou customizações:
- Documentação completa no repositório
- API REST totalmente documentada
- Sistema modular e extensível