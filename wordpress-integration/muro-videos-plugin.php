<?php
/**
 * Plugin Name: Muro Infinito de Vídeos - Reparações Históricas
 * Plugin URI: https://reparacoeshistoricas.org
 * Description: Sistema de muro infinito de vídeos para testemunhos sobre racismo, integrado com canal YouTube @ReparacoesHistoricas
 * Version: 2.0.0
 * Author: Reparações Históricas
 * Author URI: https://reparacoeshistoricas.org
 * License: GPL v2 or later
 * Text Domain: muro-videos
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Definir constantes do plugin
define('MURO_VIDEOS_VERSION', '2.0.0');
define('MURO_VIDEOS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MURO_VIDEOS_PLUGIN_PATH', plugin_dir_path(__FILE__));

class MuroVideosPlugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('muro_videos', array($this, 'shortcode_muro_videos'));
        add_shortcode('muro_videos_chapter', array($this, 'shortcode_muro_videos_chapter'));
        add_shortcode('youtube_video_wall', array($this, 'shortcode_youtube_video_wall'));
    }
    
    public function init() {
        // Registrar scripts e estilos
        wp_register_script(
            'muro-videos-app',
            MURO_VIDEOS_PLUGIN_URL . 'assets/app.js',
            array(),
            MURO_VIDEOS_VERSION,
            true
        );
        
        wp_register_style(
            'muro-videos-style',
            MURO_VIDEOS_PLUGIN_URL . 'assets/style.css',
            array(),
            MURO_VIDEOS_VERSION
        );
    }
    
    public function enqueue_scripts() {
        if (is_singular() && has_shortcode(get_post()->post_content, 'muro_videos')) {
            wp_enqueue_script('muro-videos-app');
            wp_enqueue_style('muro-videos-style');
            
            // Passar dados para o JavaScript
            wp_localize_script('muro-videos-app', 'muroVideosConfig', array(
                'apiUrl' => 'https://reparacoeshistoricas.org/api',
                'channelId' => 'UCRMRvNncp4fFy-27JD4Ph2w',
                'channelName' => '@ReparacoesHistoricas'
            ));
        }
    }
    
    /**
     * Shortcode principal para o muro de vídeos
     * Uso: [muro_videos width="100%" height="600px"]
     */
    public function shortcode_muro_videos($atts) {
        $atts = shortcode_atts(array(
            'width' => '100%',
            'height' => '600px',
            'chapter' => '',
            'theme' => 'light'
        ), $atts);
        
        $iframe_url = 'https://reparacoeshistoricas.org/';
        if (!empty($atts['chapter'])) {
            $iframe_url .= 'chapter/' . urlencode($atts['chapter']);
        }
        
        return sprintf(
            '<div class="muro-videos-container" style="width: %s; height: %s;">
                <iframe 
                    src="%s" 
                    width="100%%" 
                    height="100%%" 
                    frameborder="0" 
                    allowfullscreen
                    style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                    title="Muro Infinito de Vídeos - Reparações Históricas">
                </iframe>
            </div>',
            esc_attr($atts['width']),
            esc_attr($atts['height']),
            esc_url($iframe_url)
        );
    }
    
    /**
     * Shortcode para capítulo específico
     * Uso: [muro_videos_chapter id="1" title="Racismo no Mercado de Trabalho"]
     */
    public function shortcode_muro_videos_chapter($atts) {
        $atts = shortcode_atts(array(
            'id' => '1',
            'title' => 'Capítulo',
            'width' => '100%',
            'height' => '600px'
        ), $atts);
        
        $iframe_url = 'https://reparacoeshistoricas.org/chapter/' . urlencode($atts['id']);
        
        return sprintf(
            '<div class="muro-videos-chapter">
                <h3>%s</h3>
                <div class="muro-videos-container" style="width: %s; height: %s;">
                    <iframe 
                        src="%s" 
                        width="100%%" 
                        height="100%%" 
                        frameborder="0" 
                        allowfullscreen
                        style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                        title="Capítulo: %s">
                    </iframe>
                </div>
            </div>',
            esc_html($atts['title']),
            esc_attr($atts['width']),
            esc_attr($atts['height']),
            esc_url($iframe_url),
            esc_attr($atts['title'])
        );
    }
    
    /**
     * Shortcode compatível com requisito original
     * Uso: [youtube_video_wall]
     */
    public function shortcode_youtube_video_wall($atts) {
        return $this->shortcode_muro_videos($atts);
    }
}

// Inicializar o plugin
new MuroVideosPlugin();

// Hook de ativação
register_activation_hook(__FILE__, 'muro_videos_activate');
function muro_videos_activate() {
    // Criar tabelas se necessário (atualmente não precisamos)
    // flush_rewrite_rules();
}

// Hook de desativação
register_deactivation_hook(__FILE__, 'muro_videos_deactivate');
function muro_videos_deactivate() {
    // Limpeza se necessário
    // flush_rewrite_rules();
}