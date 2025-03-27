# Script de Sincronização Automática com GitHub
# Autor: IQOS-TABLET
# Data: Data atual
# Descrição: Este script automatiza a sincronização com o GitHub, incluindo commits organizados por tipo de alteração

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

# Função para verificar se existem mudanças no repositório
function Test-GitChanges {
    $changes = git status --porcelain
    return ![string]::IsNullOrEmpty($changes)
}

# Função para categorizar as alterações por tipo de arquivo
function Get-ChangeCategories {
    $changes = git status --porcelain
    $categories = @{
        "Componentes" = @()
        "Páginas" = @()
        "Estilos" = @()
        "APIs" = @()
        "Configurações" = @()
        "Documentação" = @()
        "Outros" = @()
    }
    
    foreach ($change in $changes) {
        $file = ($change -replace '^\s*\S+\s+', '').Trim()
        
        if ($file -match "src/components/.*\.(tsx|ts|js|jsx)$") {
            $categories["Componentes"] += $file
        }
        elseif ($file -match "src/app/.*/page\.(tsx|ts|js|jsx)$" -or $file -match "src/app/page\.(tsx|ts|js|jsx)$") {
            $categories["Páginas"] += $file
        }
        elseif ($file -match "\.(css|scss)$" -or $file -match "tailwind") {
            $categories["Estilos"] += $file
        }
        elseif ($file -match "src/app/api/") {
            $categories["APIs"] += $file
        }
        elseif ($file -match "(package\.json|next\.config\.|tsconfig\.|\.env|firebase)") {
            $categories["Configurações"] += $file
        }
        elseif ($file -match "(README\.md|\.md$)") {
            $categories["Documentação"] += $file
        }
        else {
            $categories["Outros"] += $file
        }
    }
    
    # Remover categorias vazias
    foreach ($key in @($categories.Keys)) {
        if ($categories[$key].Count -eq 0) {
            $categories.Remove($key)
        }
    }
    
    return $categories
}

# Função para criar mensagem de commit baseada nas categorias
function Get-CommitMessage {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Categories
    )
    
    $message = "Atualização: "
    $details = ""
    
    foreach ($category in $Categories.Keys) {
        $count = $Categories[$category].Count
        $message += "$category ($count), "
        
        $details += "`n`n## $category`n"
        foreach ($file in $Categories[$category]) {
            $details += "- $file`n"
        }
    }
    
    # Remover a última vírgula e espaço
    $message = $message.TrimEnd(', ')
    
    return "$message$details"
}

# Principal
try {
    Write-ColorOutput "Verificando atualizações no repositório remoto..." -ForegroundColor Cyan
    git fetch
    
    $localCommit = git rev-parse HEAD
    $remoteCommit = git rev-parse origin/main
    
    if ($localCommit -ne $remoteCommit) {
        Write-ColorOutput "Existem atualizações no repositório remoto. A fazer pull..." -ForegroundColor Yellow
        git pull origin main
        Write-ColorOutput "Atualizações aplicadas com sucesso!" -ForegroundColor Green
    } else {
        Write-ColorOutput "Repositório local já está atualizado." -ForegroundColor Green
    }
    
    if (Test-GitChanges) {
        # Adicionar todas as alterações ao stage
        Write-ColorOutput "A preparar alterações locais..." -ForegroundColor Cyan
        git add .
        
        # Categorizar alterações
        $categories = Get-ChangeCategories
        $commitMessage = Get-CommitMessage -Categories $categories
        
        # Fazer commit
        Write-ColorOutput "A criar commit com as alterações..." -ForegroundColor Cyan
        git commit -m $commitMessage
        
        # Push para o GitHub
        Write-ColorOutput "A enviar alterações para o GitHub..." -ForegroundColor Cyan
        git push origin main
        
        Write-ColorOutput "Sincronização concluída com sucesso!" -ForegroundColor Green
    } else {
        Write-ColorOutput "Nenhuma alteração local para sincronizar." -ForegroundColor Yellow
    }
    
    Write-ColorOutput "Processo de sincronização finalizado." -ForegroundColor Green
} catch {
    Write-ColorOutput "Erro durante a sincronização: $_" -ForegroundColor Red
    exit 1
} 