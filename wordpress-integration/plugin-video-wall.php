<?php
/**
 * Plugin Name: Muro Infinito de Vídeos
 * Description: Integração do sistema de vídeos para reparacoeshistoricas.org
 * Version: 1.0.0
 * Author: Reparações Históricas
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class VideoWallPlugin {
    
    private $base_url = 'https://seu-repl.replit.app'; // SUBSTITUA PELA SUA URL
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('video_wall', array($this, 'video_wall_shortcode'));
        add_shortcode('video_chapter', array($this, 'video_chapter_shortcode'));
        add_filter('wp_kses_allowed_html', array($this, 'allow_iframe_tags'));
    }
    
    public function init() {
        // Registrar tipos de post customizados se necessário
        $this->register_post_types();
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style(
            'video-wall-style',
            plugin_dir_url(__FILE__) . 'assets/video-wall.css',
            array(),
            '1.0.0'
        );
        
        wp_enqueue_script(
            'video-wall-script',
            plugin_dir_url(__FILE__) . 'assets/video-wall.js',
            array('jquery'),
            '1.0.0',
            true
        );
        
        // Passar configurações para JavaScript
        wp_localize_script('video-wall-script', 'videoWallConfig', array(
            'baseUrl' => $this->base_url,
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('video_wall_nonce')
        ));
    }
    
    public function allow_iframe_tags($tags) {
        $tags['iframe'] = array(
            'src' => true,
            'height' => true,
            'width' => true,
            'style' => true,
            'title' => true,
            'frameborder' => true,
            'class' => true,
            'id' => true,
            'loading' => true
        );
        return $tags;
    }
    
    /**
     * Shortcode para muro geral de vídeos
     * Uso: [video_wall height="600px" class="custom-class"]
     */
    public function video_wall_shortcode($atts) {
        $atts = shortcode_atts(array(
            'height' => '70vh',
            'min_height' => '500px',
            'class' => '',
            'title' => 'Muro Infinito de Vídeos'
        ), $atts);
        
        return $this->render_iframe($this->base_url, $atts);
    }
    
    /**
     * Shortcode para capítulo específico
     * Uso: [video_chapter id="1" height="600px"]
     */
    public function video_chapter_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => '1',
            'height' => '70vh',
            'min_height' => '500px',
            'class' => '',
            'title' => 'Vídeos do Capítulo'
        ), $atts);
        
        $url = $this->base_url . '/chapter/' . intval($atts['id']);
        return $this->render_iframe($url, $atts);
    }
    
    private function render_iframe($src, $atts) {
        $container_style = sprintf(
            'position: relative; width: 100%%; height: %s; min-height: %s;',
            esc_attr($atts['height']),
            esc_attr($atts['min_height'])
        );
        
        $iframe_style = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;';
        
        $html = sprintf(
            '<div class="video-wall-container %s" style="%s">
                <iframe 
                    src="%s" 
                    style="%s"
                    title="%s"
                    loading="lazy">
                </iframe>
            </div>',
            esc_attr($atts['class']),
            $container_style,
            esc_url($src),
            $iframe_style,
            esc_attr($atts['title'])
        );
        
        return $html;
    }
    
    private function register_post_types() {
        // Registrar tipo de post para capítulos (opcional)
        register_post_type('video_chapter', array(
            'labels' => array(
                'name' => 'Capítulos de Vídeo',
                'singular_name' => 'Capítulo de Vídeo'
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'thumbnail'),
            'menu_icon' => 'dashicons-video-alt3'
        ));
    }
}

// Widget para sidebar
class VideoWallWidget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'video_wall_widget',
            'Muro de Vídeos',
            array('description' => 'Exibe o muro infinito de vídeos')
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        $height = !empty($instance['height']) ? $instance['height'] : '400px';
        echo do_shortcode('[video_wall height="' . esc_attr($height) . '"]');
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Vídeos';
        $height = !empty($instance['height']) ? $instance['height'] : '400px';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">Título:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" 
                   name="<?php echo $this->get_field_name('title'); ?>" type="text" 
                   value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('height'); ?>">Altura:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('height'); ?>" 
                   name="<?php echo $this->get_field_name('height'); ?>" type="text" 
                   value="<?php echo esc_attr($height); ?>">
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        $instance['height'] = (!empty($new_instance['height'])) ? strip_tags($new_instance['height']) : '';
        return $instance;
    }
}

// Inicializar plugin
new VideoWallPlugin();

// Registrar widget
add_action('widgets_init', function() {
    register_widget('VideoWallWidget');
});

// AJAX para comunicação com a API (opcional)
add_action('wp_ajax_get_video_stats', 'handle_get_video_stats');
add_action('wp_ajax_nopriv_get_video_stats', 'handle_get_video_stats');

function handle_get_video_stats() {
    check_ajax_referer('video_wall_nonce', 'nonce');
    
    $base_url = 'https://seu-repl.replit.app'; // SUBSTITUA PELA SUA URL
    $response = wp_remote_get($base_url . '/api/admin/stats/overview');
    
    if (is_wp_error($response)) {
        wp_die('Erro ao conectar com a API');
    }
    
    $body = wp_remote_retrieve_body($response);
    wp_send_json(json_decode($body, true));
}

// Hook de ativação
register_activation_hook(__FILE__, function() {
    // Criar páginas necessárias ou configurações iniciais
    flush_rewrite_rules();
});

// Hook de desativação
register_deactivation_hook(__FILE__, function() {
    flush_rewrite_rules();
});