/**
 * JavaScript para YouTube Video Wall
 * Reparações Históricas - B2Santos
 */

(function($) {
    'use strict';

    class YouTubeVideoWall {
        constructor() {
            this.modal = null;
            this.iframe = null;
            this.init();
        }

        init() {
            this.setupModal();
            this.bindEvents();
            this.makeResponsive();
        }

        setupModal() {
            this.modal = document.getElementById('youtube-video-modal');
            this.iframe = document.getElementById('youtube-iframe');
            
            if (!this.modal || !this.iframe) {
                console.error('Modal ou iframe não encontrados');
                return;
            }
        }

        bindEvents() {
            // Clique nos cards de vídeo
            $(document).on('click', '.video-card', (e) => {
                e.preventDefault();
                const youtubeId = $(e.currentTarget).data('youtube-id');
                if (youtubeId) {
                    this.openVideo(youtubeId);
                }
            });

            // Fechar modal
            $(document).on('click', '.close-modal', () => {
                this.closeModal();
            });

            // Fechar modal clicando fora
            $(document).on('click', '.youtube-modal', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });

            // Fechar modal com ESC
            $(document).on('keydown', (e) => {
                if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
                    this.closeModal();
                }
            });

            // Lazy loading para thumbnails
            this.setupLazyLoading();
        }

        openVideo(youtubeId) {
            if (!this.modal || !this.iframe) return;

            const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&showinfo=0`;
            this.iframe.src = embedUrl;
            this.modal.style.display = 'flex';
            
            // Prevenir scroll do body
            document.body.style.overflow = 'hidden';
        }

        closeModal() {
            if (!this.modal || !this.iframe) return;

            this.modal.style.display = 'none';
            this.iframe.src = '';
            
            // Restaurar scroll do body
            document.body.style.overflow = 'auto';
        }

        makeResponsive() {
            // Ajustar grid baseado no tamanho da tela
            const updateGrid = () => {
                const containers = document.querySelectorAll('.video-grid');
                containers.forEach(container => {
                    const width = container.offsetWidth;
                    let columns = 1;
                    
                    if (width >= 1200) columns = 4;
                    else if (width >= 900) columns = 3;
                    else if (width >= 600) columns = 2;
                    
                    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                });
            };

            // Atualizar no carregamento e redimensionamento
            updateGrid();
            window.addEventListener('resize', updateGrid);
        }

        setupLazyLoading() {
            // Implementar lazy loading para thumbnails
            const images = document.querySelectorAll('.video-thumbnail img');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => {
                    img.classList.add('lazy');
                    imageObserver.observe(img);
                });
            }
        }

        // Método para carregar mais vídeos (infinite scroll)
        loadMoreVideos(offset = 0) {
            const apiUrl = youtubeVideoWall.apiUrl + '/api/videos';
            
            $.ajax({
                url: apiUrl,
                method: 'GET',
                data: {
                    offset: offset,
                    limit: 10
                },
                success: (videos) => {
                    this.appendVideos(videos);
                },
                error: (error) => {
                    console.error('Erro ao carregar mais vídeos:', error);
                }
            });
        }

        appendVideos(videos) {
            const grid = document.querySelector('.video-grid');
            if (!grid) return;

            videos.forEach(video => {
                const videoCard = this.createVideoCard(video);
                grid.appendChild(videoCard);
            });
        }

        createVideoCard(video) {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.dataset.youtubeId = video.youtubeId;
            
            card.innerHTML = `
                <div class="video-thumbnail">
                    <img src="https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg" 
                         alt="${video.title}" loading="lazy">
                    <div class="play-button">▶</div>
                </div>
                <div class="video-info">
                    <h4>${video.title}</h4>
                    <div class="video-actions">
                        <a href="https://www.youtube.com/watch?v=${video.youtubeId}" 
                           target="_blank" class="youtube-link">Ver no YouTube</a>
                    </div>
                </div>
            `;
            
            return card;
        }
    }

    // Inicializar quando o DOM estiver pronto
    $(document).ready(() => {
        new YouTubeVideoWall();
    });

})(jQuery);