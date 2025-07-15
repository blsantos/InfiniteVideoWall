<?php
/**
 * Plugin Name: YouTube Video Wall - Reparações Históricas
 * Description: Integração completa com o sistema de vídeos do canal @ReparacoesHistoricasBrasil
 * Version: 1.0
 * Author: B2Santos
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class YouTubeVideoWall {
    
    private $api_base_url = 'https://883149f1-1c75-46d3-8a00-b3d17d4dda1d-00-zh6zir2txvr9.worf.replit.dev';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_shortcode('youtube_video_wall', array($this, 'render_video_wall'));
        add_shortcode('youtube_chapter_videos', array($this, 'render_chapter_videos'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function init() {
        // Adicionar rewrite rules para QR codes
        add_rewrite_rule('^capitulo/([0-9]+)/?', 'index.php?capitulo_id=$matches[1]', 'top');
        add_filter('query_vars', array($this, 'add_query_vars'));
        add_action('template_redirect', array($this, 'handle_chapter_redirect'));
    }
    
    public function add_query_vars($vars) {
        $vars[] = 'capitulo_id';
        return $vars;
    }
    
    public function handle_chapter_redirect() {
        $capitulo_id = get_query_var('capitulo_id');
        if ($capitulo_id) {
            // Redirecionar para página com vídeos do capítulo
            wp_redirect(home_url('/videos-capitulo/?chapter=' . $capitulo_id));
            exit;
        }
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('youtube-video-wall-js', plugin_dir_url(__FILE__) . 'assets/video-wall.js', array('jquery'), '1.0', true);
        wp_enqueue_style('youtube-video-wall-css', plugin_dir_url(__FILE__) . 'assets/video-wall.css', array(), '1.0');
        
        // Passar dados para JavaScript
        wp_localize_script('youtube-video-wall-js', 'youtubeVideoWall', array(
            'apiUrl' => $this->api_base_url,
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('youtube_video_wall_nonce')
        ));
    }
    
    /**
     * Shortcode para muro completo de vídeos
     * Uso: [youtube_video_wall]
     */
    public function render_video_wall($atts) {
        $atts = shortcode_atts(array(
            'chapter' => '',
            'limit' => 20,
            'category' => '',
            'responsive' => 'true'
        ), $atts, 'youtube_video_wall');
        
        $videos = $this->get_videos($atts);
        
        if (!$videos) {
            return '<div class="youtube-video-wall-error">Erro ao carregar vídeos. Verifique a conexão com o servidor.</div>';
        }
        
        return $this->render_video_grid($videos, $atts);
    }
    
    /**
     * Shortcode para vídeos de capítulo específico
     * Uso: [youtube_chapter_videos chapter="1"]
     */
    public function render_chapter_videos($atts) {
        $atts = shortcode_atts(array(
            'chapter' => '1',
            'limit' => 10,
            'title' => 'Vídeos do Capítulo'
        ), $atts, 'youtube_chapter_videos');
        
        $videos = $this->get_videos(array('chapter' => $atts['chapter'], 'limit' => $atts['limit']));
        
        if (!$videos) {
            return '<div class="youtube-chapter-error">Nenhum vídeo encontrado para este capítulo.</div>';
        }
        
        $output = '<div class="youtube-chapter-videos">';
        $output .= '<h3>' . esc_html($atts['title']) . '</h3>';
        $output .= $this->render_video_grid($videos, $atts);
        $output .= '</div>';
        
        return $output;
    }
    
    private function get_videos($params = array()) {
        $api_url = $this->api_base_url . '/api/videos';
        
        // Construir query parameters
        $query_params = array();
        if (!empty($params['chapter'])) {
            $query_params['chapterId'] = $params['chapter'];
        }
        if (!empty($params['limit'])) {
            $query_params['limit'] = $params['limit'];
        }
        if (!empty($params['category'])) {
            $query_params['category'] = $params['category'];
        }
        
        if (!empty($query_params)) {
            $api_url .= '?' . http_build_query($query_params);
        }
        
        $response = wp_remote_get($api_url, array(
            'timeout' => 15,
            'headers' => array(
                'Accept' => 'application/json'
            )
        ));
        
        if (is_wp_error($response)) {
            error_log('Erro ao buscar vídeos: ' . $response->get_error_message());
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $videos = json_decode($body, true);
        
        if (!is_array($videos)) {
            error_log('Resposta da API inválida: ' . $body);
            return false;
        }
        
        return $videos;
    }
    
    private function render_video_grid($videos, $atts) {
        $responsive_class = $atts['responsive'] === 'true' ? 'responsive' : '';
        
        $output = '<div class="youtube-video-wall ' . $responsive_class . '">';
        $output .= '<div class="video-grid">';
        
        foreach ($videos as $video) {
            $output .= $this->render_video_card($video);
        }
        
        $output .= '</div>';
        $output .= '</div>';
        
        // Adicionar modal para vídeos
        $output .= $this->render_video_modal();
        
        return $output;
    }
    
    private function render_video_card($video) {
        $youtube_id = $video['youtubeId'];
        $thumbnail = "https://img.youtube.com/vi/{$youtube_id}/hqdefault.jpg";
        $title = esc_html($video['title']);
        $youtube_url = "https://www.youtube.com/watch?v={$youtube_id}";
        
        $output = '<div class="video-card" data-youtube-id="' . esc_attr($youtube_id) . '">';
        $output .= '<div class="video-thumbnail">';
        $output .= '<img src="' . esc_url($thumbnail) . '" alt="' . $title . '" loading="lazy">';
        $output .= '<div class="play-button">▶</div>';
        $output .= '</div>';
        $output .= '<div class="video-info">';
        $output .= '<h4>' . $title . '</h4>';
        $output .= '<div class="video-actions">';
        $output .= '<a href="' . esc_url($youtube_url) . '" target="_blank" class="youtube-link">Ver no YouTube</a>';
        $output .= '</div>';
        $output .= '</div>';
        $output .= '</div>';
        
        return $output;
    }
    
    private function render_video_modal() {
        return '
        <div id="youtube-video-modal" class="youtube-modal" style="display: none;">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-video">
                    <iframe id="youtube-iframe" width="100%" height="400" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>';
    }
}

// Inicializar plugin
new YouTubeVideoWall();

// Adicionar página de configuração no admin
add_action('admin_menu', 'youtube_video_wall_admin_menu');

function youtube_video_wall_admin_menu() {
    add_options_page(
        'YouTube Video Wall',
        'YouTube Video Wall',
        'manage_options',
        'youtube-video-wall',
        'youtube_video_wall_admin_page'
    );
}

function youtube_video_wall_admin_page() {
    ?>
    <div class="wrap">
        <h1>YouTube Video Wall - Reparações Históricas</h1>
        
        <h2>Como Usar</h2>
        <p>Use os seguintes shortcodes para incorporar vídeos em suas páginas:</p>
        
        <h3>Shortcodes Disponíveis:</h3>
        <ul>
            <li><code>[youtube_video_wall]</code> - Muro completo de vídeos</li>
            <li><code>[youtube_chapter_videos chapter="1"]</code> - Vídeos de capítulo específico</li>
        </ul>
        
        <h3>Parâmetros Opcionais:</h3>
        <ul>
            <li><code>chapter</code> - ID do capítulo (ex: chapter="1")</li>
            <li><code>limit</code> - Número máximo de vídeos (ex: limit="10")</li>
            <li><code>category</code> - Categoria de vídeos</li>
            <li><code>responsive</code> - Layout responsivo (true/false)</li>
        </ul>
        
        <h3>Exemplo de Uso:</h3>
        <pre><code>[youtube_video_wall chapter="1" limit="6" responsive="true"]</code></pre>
        
        <h3>Status da Integração:</h3>
        <p>Canal: <strong>@ReparacoesHistoricasBrasil</strong></p>
        <p>Channel ID: <strong>UCzpIDynWSNfGx4djJS_DFiQ</strong></p>
        <p>API URL: <strong>https://883149f1-1c75-46d3-8a00-b3d17d4dda1d-00-zh6zir2txvr9.worf.replit.dev</strong></p>
        
        <h3>QR Codes para Capítulos:</h3>
        <p>Os QR codes direcionam para: <code>seusitewordpress.com/capitulo/[ID]</code></p>
        <p>Exemplo: <code>seusitewordpress.com/capitulo/1</code> redireciona para os vídeos do capítulo 1</p>
    </div>
    <?php
}
?>