# Script para Configurar Sincronização Automática
# Autor: IQOS-TABLET
# Descrição: Este script configura uma tarefa agendada no Windows para sincronizar o projeto com o GitHub automaticamente

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

# Obter caminho absoluto do diretório atual
$projectPath = (Get-Location).Path
$scriptPath = Join-Path $projectPath "sync-github.ps1"

# Verificar se o script sync-github.ps1 existe
if (-not (Test-Path -Path $scriptPath)) {
    Write-ColorOutput "O script sync-github.ps1 não foi encontrado no diretório atual!" -ForegroundColor Red
    exit 1
}

# Nome da tarefa
$taskName = "IQOS-TABLET-AutoSync"

# Perguntar frequência desejada
Write-ColorOutput "Configuração da sincronização automática" -ForegroundColor Cyan
Write-ColorOutput "Selecione a frequência de sincronização:" -ForegroundColor Yellow
Write-ColorOutput "1. A cada hora" -ForegroundColor White
Write-ColorOutput "2. A cada 30 minutos" -ForegroundColor White
Write-ColorOutput "3. A cada 15 minutos" -ForegroundColor White
Write-ColorOutput "4. Diariamente" -ForegroundColor White
Write-ColorOutput "5. Personalizado (intervalo em minutos)" -ForegroundColor White

$choice = Read-Host "Escolha uma opção (1-5)"
$interval = 60 # Padrão: 60 minutos

switch ($choice) {
    "1" { $interval = 60 }
    "2" { $interval = 30 }
    "3" { $interval = 15 }
    "4" { $interval = 1440 } # 24 horas
    "5" {
        $customInterval = Read-Host "Digite o intervalo desejado em minutos"
        if ($customInterval -match "^\d+$") {
            $interval = [int]$customInterval
        } else {
            Write-ColorOutput "Intervalo inválido! Usando 60 minutos como padrão." -ForegroundColor Red
        }
    }
    default {
        Write-ColorOutput "Opção inválida! Usando 60 minutos como padrão." -ForegroundColor Red
    }
}

try {
    # Remover tarefa existente com o mesmo nome, se houver
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-ColorOutput "Removendo tarefa agendada existente..." -ForegroundColor Cyan
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }
    
    # Criar a ação que será executada pelo agendador
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`"" -WorkingDirectory $projectPath
    
    # Definir o gatilho para repetição
    if ($choice -eq "4") {
        # Configuração diária
        $trigger = New-ScheduledTaskTrigger -Daily -At 9am
    } else {
        # Configuração baseada em minutos
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes $interval) -RepetitionDuration ([TimeSpan]::MaxValue)
    }
    
    # Configurações da tarefa
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable
    
    # Usuário para executar a tarefa (usuário atual)
    $principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType S4U -RunLevel Highest
    
    # Registrar a tarefa
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal
    
    Write-ColorOutput "Tarefa agendada configurada com sucesso!" -ForegroundColor Green
    Write-ColorOutput "Detalhes da configuração:" -ForegroundColor Yellow
    Write-ColorOutput "   Nome da tarefa: $taskName" -ForegroundColor White
    
    if ($choice -eq "4") {
        Write-ColorOutput "   Frequência: Diariamente às 9:00" -ForegroundColor White
    } else {
        Write-ColorOutput "   Frequência: A cada $interval minutos" -ForegroundColor White
    }
    
    Write-ColorOutput "   Diretório de trabalho: $projectPath" -ForegroundColor White
    Write-ColorOutput "   Script: $scriptPath" -ForegroundColor White
    
    Write-ColorOutput "A sincronização automática está configurada! O projeto será sincronizado com o GitHub conforme programado." -ForegroundColor Green
    Write-ColorOutput "Para executar manualmente a sincronização a qualquer momento, execute o script sync-github.ps1" -ForegroundColor Yellow
} catch {
    Write-ColorOutput "Erro durante a configuração da tarefa agendada: $_" -ForegroundColor Red
    exit 1
} 