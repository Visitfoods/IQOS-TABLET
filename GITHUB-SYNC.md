# Sincronização com GitHub

Este documento explica como configurar e usar os scripts de sincronização automática com o GitHub.

## Scripts Disponíveis

### 1. `setup-git.ps1`

Script para configuração inicial do Git no projeto.

**Funcionalidades:**
- Configura o nome e email do utilizador para os commits
- Inicializa o repositório Git se necessário
- Configura o remote para o repositório GitHub correto
- Cria um `.gitignore` adequado se não existir
- Oferece opção para realizar o commit inicial e push

**Como usar:**
```powershell
.\setup-git.ps1
```

### 2. `sync-github.ps1`

Script para sincronização manual do projeto com o GitHub.

**Funcionalidades:**
- Verifica e baixa atualizações do repositório remoto
- Categoriza automaticamente as alterações por tipo (componentes, páginas, APIs, etc.)
- Cria commit com mensagem organizada e detalhada
- Envia as alterações para o GitHub

**Como usar:**
```powershell
.\sync-github.ps1
```

### 3. `setup-auto-sync.ps1`

Script para configurar a sincronização automática através do Agendador de Tarefas do Windows.

**Funcionalidades:**
- Configura uma tarefa agendada no Windows para executar a sincronização automaticamente
- Permite escolher a frequência de sincronização (15min, 30min, 1h, diária ou personalizada)
- Executa com permissões elevadas para garantir o funcionamento adequado

**Como usar:**
```powershell
.\setup-auto-sync.ps1
```

## Fluxo de Trabalho Recomendado

1. **Configuração inicial:**
   ```powershell
   .\setup-git.ps1
   ```

2. **Configurar sincronização automática:**
   ```powershell
   .\setup-auto-sync.ps1
   ```
   Selecione a frequência desejada para a sincronização automática.

3. **Desenvolvimento normal:**
   Trabalhe normalmente nos arquivos do projeto. A sincronização automática irá:
   - Verificar atualizações do repositório e fazer pull
   - Criar commits organizados das suas alterações
   - Enviar os commits para o GitHub

4. **Sincronização manual (se necessário):**
   Se precisar sincronizar antes do horário agendado:
   ```powershell
   .\sync-github.ps1
   ```

## Mensagens de Commit

O script de sincronização cria mensagens de commit organizadas no seguinte formato:

```
Atualização: Componentes (2), Páginas (1), Configurações (1)

## Componentes
- src/components/VoiceRecorder.tsx
- src/components/Button.tsx

## Páginas
- src/app/page.tsx

## Configurações
- next.config.mjs
```

Isto facilita a revisão das alterações e mantém um histórico organizado no repositório.

## Resolução de Problemas

### Se a sincronização automática não estiver funcionando:

1. Verifique se a tarefa está ativa no Agendador de Tarefas do Windows
2. Execute o script de sincronização manualmente para ver mensagens de erro
3. Verifique se o PowerShell está configurado para permitir a execução de scripts:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass
   ```

### Se ocorrerem conflitos no Git:

1. Execute `git status` para ver os arquivos em conflito
2. Resolva os conflitos manualmente
3. Execute o script de sincronização novamente

## Requerimentos

- Windows com PowerShell 5.1 ou superior
- Git instalado e adicionado ao PATH
- Permissões para criar tarefas agendadas no Windows (para a sincronização automática) 