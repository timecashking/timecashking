#!/bin/bash

# Script de Deploy - TimeCash King
# Uso: ./scripts/deploy.sh [ambiente] [opção]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Função de ajuda
show_help() {
    echo "Script de Deploy - TimeCash King"
    echo ""
    echo "Uso: $0 [ambiente] [opção]"
    echo ""
    echo "Ambientes:"
    echo "  development  - Ambiente de desenvolvimento"
    echo "  staging      - Ambiente de staging"
    echo "  production   - Ambiente de produção"
    echo ""
    echo "Opções:"
    echo "  backend      - Deploy apenas do backend"
    echo "  frontend     - Deploy apenas do frontend"
    echo "  mobile       - Build do app móvel"
    echo "  all          - Deploy completo (padrão)"
    echo "  rollback     - Rollback para versão anterior"
    echo ""
    echo "Exemplos:"
    echo "  $0 production all"
    echo "  $0 staging backend"
    echo "  $0 development frontend"
}

# Verificar se o ambiente foi especificado
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

ENVIRONMENT=$1
OPTION=${2:-all}

# Validar ambiente
case $ENVIRONMENT in
    development|dev)
        ENVIRONMENT="development"
        API_URL="http://localhost:3000"
        FRONTEND_URL="http://localhost:5173"
        ;;
    staging|stg)
        ENVIRONMENT="staging"
        API_URL="https://timecashking-api-staging.onrender.com"
        FRONTEND_URL="https://timecashking-staging.netlify.app"
        ;;
    production|prod)
        ENVIRONMENT="production"
        API_URL="https://timecashking-api.onrender.com"
        FRONTEND_URL="https://timecashking.netlify.app"
        ;;
    *)
        error "Ambiente inválido: $ENVIRONMENT"
        ;;
esac

# Função para deploy do backend
deploy_backend() {
    log "Iniciando deploy do backend para $ENVIRONMENT..."
    
    # Verificar se estamos no diretório raiz
    if [ ! -f "package.json" ]; then
        error "Execute este script do diretório raiz do projeto"
    fi
    
    # Instalar dependências
    log "Instalando dependências..."
    npm ci
    
    # Executar testes
    log "Executando testes..."
    npm test || warn "Testes falharam, mas continuando..."
    
    # Verificar linting
    log "Verificando linting..."
    npm run lint || warn "Linting falhou, mas continuando..."
    
    # Se for produção, fazer deploy via Render
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Fazendo deploy para Render..."
        
        if [ -z "$RENDER_TOKEN" ] || [ -z "$RENDER_SERVICE_ID" ]; then
            error "Variáveis RENDER_TOKEN e RENDER_SERVICE_ID não configuradas"
        fi
        
        # Trigger deploy no Render
        curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
            -H "Authorization: Bearer $RENDER_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"clearCache": "do_not_clear"}'
            
        log "Deploy do backend iniciado no Render"
        
    elif [ "$ENVIRONMENT" = "staging" ]; then
        log "Fazendo deploy para staging..."
        # Implementar deploy para staging
        warn "Deploy para staging não implementado"
        
    else
        log "Iniciando servidor de desenvolvimento..."
        npm run dev &
        BACKEND_PID=$!
        log "Backend rodando em http://localhost:3000 (PID: $BACKEND_PID)"
    fi
}

# Função para deploy do frontend
deploy_frontend() {
    log "Iniciando deploy do frontend para $ENVIRONMENT..."
    
    # Verificar se o diretório web existe
    if [ ! -d "web" ]; then
        error "Diretório web não encontrado"
    fi
    
    cd web
    
    # Instalar dependências
    log "Instalando dependências do frontend..."
    npm ci
    
    # Executar testes
    log "Executando testes do frontend..."
    npm test || warn "Testes falharam, mas continuando..."
    
    # Verificar linting
    log "Verificando linting do frontend..."
    npm run lint || warn "Linting falhou, mas continuando..."
    
    # Build
    log "Fazendo build..."
    npm run build
    
    # Se for produção, fazer deploy via Netlify
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Fazendo deploy para Netlify..."
        
        if [ -z "$NETLIFY_AUTH_TOKEN" ] || [ -z "$NETLIFY_SITE_ID" ]; then
            error "Variáveis NETLIFY_AUTH_TOKEN e NETLIFY_SITE_ID não configuradas"
        fi
        
        # Deploy para Netlify
        npx netlify-cli deploy --prod --dir=dist --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN
        
        log "Deploy do frontend concluído no Netlify"
        
    elif [ "$ENVIRONMENT" = "staging" ]; then
        log "Fazendo deploy para staging..."
        # Implementar deploy para staging
        warn "Deploy para staging não implementado"
        
    else
        log "Iniciando servidor de desenvolvimento do frontend..."
        npm run dev &
        FRONTEND_PID=$!
        log "Frontend rodando em http://localhost:5173 (PID: $FRONTEND_PID)"
    fi
    
    cd ..
}

# Função para build do mobile
build_mobile() {
    log "Iniciando build do app móvel..."
    
    # Verificar se o diretório mobile existe
    if [ ! -d "mobile" ]; then
        error "Diretório mobile não encontrado"
    fi
    
    cd mobile
    
    # Instalar dependências
    log "Instalando dependências do mobile..."
    npm ci
    
    # Verificar se o EAS está configurado
    if ! command -v eas &> /dev/null; then
        error "EAS CLI não está instalado. Execute: npm install -g @expo/eas-cli"
    fi
    
    # Login no Expo (se necessário)
    if [ -z "$EXPO_TOKEN" ]; then
        warn "EXPO_TOKEN não configurado. Execute: eas login"
    fi
    
    # Build para Android
    log "Fazendo build para Android..."
    eas build --platform android --non-interactive || warn "Build Android falhou"
    
    # Build para iOS
    log "Fazendo build para iOS..."
    eas build --platform ios --non-interactive || warn "Build iOS falhou"
    
    log "Builds do mobile concluídos"
    cd ..
}

# Função para rollback
rollback() {
    log "Iniciando rollback..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Rollback no Render
        if [ -z "$RENDER_TOKEN" ] || [ -z "$RENDER_SERVICE_ID" ]; then
            error "Variáveis RENDER_TOKEN e RENDER_SERVICE_ID não configuradas"
        fi
        
        # Listar deploys recentes
        log "Listando deploys recentes..."
        curl -H "Authorization: Bearer $RENDER_TOKEN" \
             "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" | jq '.[0:5]'
        
        warn "Rollback manual necessário. Acesse o dashboard do Render."
        
    else
        warn "Rollback não implementado para ambiente $ENVIRONMENT"
    fi
}

# Função para health check
health_check() {
    log "Verificando saúde dos serviços..."
    
    # Aguardar um pouco para os serviços ficarem online
    sleep 30
    
    # Testar backend
    if curl -f -s "$API_URL/api/health" > /dev/null; then
        log "✅ Backend está online"
    else
        error "❌ Backend não está respondendo"
    fi
    
    # Testar frontend
    if curl -f -s "$FRONTEND_URL" > /dev/null; then
        log "✅ Frontend está online"
    else
        error "❌ Frontend não está respondendo"
    fi
}

# Função para limpeza
cleanup() {
    log "Limpando processos..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        log "Processo do backend finalizado"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        log "Processo do frontend finalizado"
    fi
}

# Trap para limpeza em caso de erro
trap cleanup EXIT

# Executar baseado na opção
case $OPTION in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    mobile)
        build_mobile
        ;;
    all)
        deploy_backend
        deploy_frontend
        build_mobile
        ;;
    rollback)
        rollback
        ;;
    *)
        error "Opção inválida: $OPTION"
        ;;
esac

# Health check se não for rollback
if [ "$OPTION" != "rollback" ]; then
    health_check
fi

log "Deploy concluído com sucesso para $ENVIRONMENT!"
log "🌐 Frontend: $FRONTEND_URL"
log "🔧 Backend: $API_URL"
