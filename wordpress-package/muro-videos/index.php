<?php
/**
 * Plugin Name: Muro Infinito de Vídeos
 * Description: Sistema de muro infinito de vídeos do canal @ReparacoesHistoricas
 * Version: 2.0.0
 * Author: Reparações Históricas
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class MuroVideosWordPress {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_shortcode('muro_videos', array($this, 'shortcode_muro_videos'));
        add_shortcode('youtube_video_wall', array($this, 'shortcode_muro_videos'));
        add_shortcode('muro_videos_chapter', array($this, 'shortcode_chapter'));
    }
    
    public function init() {
        // Plugin inicializado
    }
    
    /**
     * Shortcode principal: [muro_videos]
     */
    public function shortcode_muro_videos($atts) {
        $atts = shortcode_atts(array(
            'width' => '100%',
            'height' => '600px',
            'chapter' => ''
        ), $atts);
        
        // URL da aplicação (ajustar para seu domínio)
        $app_url = home_url();
        if (!empty($atts['chapter'])) {
            $app_url .= '/chapter/' . urlencode($atts['chapter']);
        }
        
        return sprintf(
            '<div class="muro-videos-container" style="width: %s; height: %s; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <iframe 
                    src="%s" 
                    width="100%%" 
                    height="100%%" 
                    frameborder="0" 
                    allowfullscreen
                    title="Muro Infinito de Vídeos - Reparações Históricas">
                </iframe>
            </div>',
            esc_attr($atts['width']),
            esc_attr($atts['height']),
            esc_url($app_url)
        );
    }
    
    /**
     * Shortcode para capítulo: [muro_videos_chapter id="1"]
     */
    public function shortcode_chapter($atts) {
        $atts = shortcode_atts(array(
            'id' => '1',
            'title' => 'Capítulo',
            'width' => '100%',
            'height' => '600px'
        ), $atts);
        
        $chapter_url = home_url('/chapter/' . urlencode($atts['id']));
        
        return sprintf(
            '<div class="muro-videos-chapter">
                <h3>%s</h3>
                <div class="muro-videos-container" style="width: %s; height: %s; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <iframe 
                        src="%s" 
                        width="100%%" 
                        height="100%%" 
                        frameborder="0" 
                        allowfullscreen
                        title="Capítulo: %s">
                    </iframe>
                </div>
            </div>',
            esc_html($atts['title']),
            esc_attr($atts['width']),
            esc_attr($atts['height']),
            esc_url($chapter_url),
            esc_attr($atts['title'])
        );
    }
}

// Inicializar o plugin
new MuroVideosWordPress();
?>