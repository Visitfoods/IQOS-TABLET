# Script de Configuração Inicial do Git
# Autor: IQOS-TABLET
# Descrição: Este script configura o Git no projeto e faz a primeira sincronização com o GitHub

$ErrorActionPreference = "Stop"

# Função para exibir mensagens coloridas
function Write-ColorOutput {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ConsoleColor]$ForegroundColor = [ConsoleColor]::White
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Configuração principal
try {
    # Configurar informações do utilizador (opcional)
    $name = Read-Host "Digite o seu nome para configuração do Git (deixe em branco para manter a configuração atual)"
    $email = Read-Host "Digite o seu email para configuração do Git (deixe em branco para manter a configuração atual)"
    
    if ($name) {
        git config --local user.name $name
        Write-ColorOutput "Nome configurado: $name" -ForegroundColor Green
    }
    
    if ($email) {
        git config --local user.email $email
        Write-ColorOutput "Email configurado: $email" -ForegroundColor Green
    }
    
    # Verificar se já existe um repositório Git inicializado
    if (-not (Test-Path -Path ".git")) {
        Write-ColorOutput "Inicializando repositório Git..." -ForegroundColor Cyan
        git init
        Write-ColorOutput "Repositório Git inicializado!" -ForegroundColor Green
    } else {
        Write-ColorOutput "Repositório Git já inicializado." -ForegroundColor Green
    }
    
    # Verificar e configurar o remote
    $remote = git remote -v
    if ($remote -match "Visitfoods/IQOS-TABLET") {
        Write-ColorOutput "Remote já configurado corretamente." -ForegroundColor Green
    } else {
        # Remover remote origin se existir
        if ($remote -match "origin") {
            Write-ColorOutput "Removendo configuração de remote existente..." -ForegroundColor Cyan
            git remote remove origin
        }
        
        # Adicionar remote correto
        Write-ColorOutput "Configurando remote para o repositório Visitfoods/IQOS-TABLET..." -ForegroundColor Cyan
        git remote add origin https://github.com/Visitfoods/IQOS-TABLET.git
        Write-ColorOutput "Remote configurado com sucesso!" -ForegroundColor Green
    }
    
    # Criar arquivo .gitignore se não existir
    if (-not (Test-Path -Path ".gitignore")) {
        Write-ColorOutput "Criando arquivo .gitignore..." -ForegroundColor Cyan
        @"
# Dependências
/node_modules
/.pnp
.pnp.js

# Testes
/coverage

# Next.js
/.next/
/out/

# Produção
/build

# Variáveis de ambiente
.env*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Sistema operacional
.DS_Store
*.pem
Thumbs.db
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
        Write-ColorOutput "Arquivo .gitignore criado com sucesso!" -ForegroundColor Green
    } else {
        Write-ColorOutput "Arquivo .gitignore já existe." -ForegroundColor Green
    }
    
    # Verificar a branch atual
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "main") {
        Write-ColorOutput "Criando e mudando para a branch main..." -ForegroundColor Cyan
        git checkout -b main
    }
    
    # Perguntar se deseja realizar o commit inicial
    $initialCommit = Read-Host "Deseja realizar o commit inicial de todos os arquivos? (S/N)"
    if ($initialCommit -eq "S" -or $initialCommit -eq "s") {
        Write-ColorOutput "Adicionando todos os arquivos ao stage..." -ForegroundColor Cyan
        git add .
        
        $commitMessage = Read-Host "Digite a mensagem para o commit inicial (padrão: 'Configuração inicial do projeto')"
        if (-not $commitMessage) {
            $commitMessage = "Configuração inicial do projeto"
        }
        
        Write-ColorOutput "Realizando commit inicial..." -ForegroundColor Cyan
        git commit -m $commitMessage
        
        # Perguntar se deseja fazer push
        $doPush = Read-Host "Deseja enviar as alterações para o GitHub? (S/N)"
        if ($doPush -eq "S" -or $doPush -eq "s") {
            Write-ColorOutput "Enviando alterações para o GitHub..." -ForegroundColor Cyan
            git push -u origin main
            Write-ColorOutput "Alterações enviadas com sucesso!" -ForegroundColor Green
        }
    }
    
    Write-ColorOutput "Configuração do Git concluída com sucesso!" -ForegroundColor Green
    Write-ColorOutput "Utilize o script 'sync-github.ps1' para sincronizar automaticamente seu projeto com o GitHub." -ForegroundColor Yellow
} catch {
    Write-ColorOutput "Erro durante a configuração: $_" -ForegroundColor Red
    exit 1
} 