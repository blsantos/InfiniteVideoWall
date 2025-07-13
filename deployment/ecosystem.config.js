module.exports = {
  apps: [{
    name: 'muro-infinito-videos',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Configurações de log
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    
    // Configurações de restart
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // Configurações de monitoramento
    monitoring: false,
    pmx: false,
    
    // Configurações de cron para restart automático
    cron_restart: '0 2 * * *', // Restart todo dia às 2h da manhã
    
    // Configurações de environment
    source_map_support: true,
    instance_var: 'INSTANCE_ID',
    
    // Configurações de merge logs
    merge_logs: true,
    
    // Configurações de cluster
    listen_timeout: 8000,
    kill_timeout: 5000,
    
    // Variáveis de ambiente
    env_file: '.env'
  }]
};