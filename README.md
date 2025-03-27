# Aplicação de Notas de Voz

Uma aplicação web para gravar, transcrever e armazenar notas de voz utilizando o Next.js, Firebase e a API Deepgram para transcrição em tempo real.

## Funcionalidades

- Autenticação com Google utilizando Firebase
- Gravação de voz com o microfone do dispositivo
- Transcrição em tempo real com a API Deepgram
- Armazenamento das notas no Firebase Firestore
- Interface responsiva e moderna com Tailwind CSS

## Requisitos

- Node.js 18.17 ou superior
- Conta Firebase (Firestore, Authentication)
- Conta na Deepgram para API de transcrição
- Git LFS instalado (para trabalhar com os modelos 3D)

## Configuração

1. Clone o repositório com Git LFS para obter os modelos 3D:
```bash
git lfs clone https://github.com/Visitfoods/IQOS-TABLET.git
cd IQOS-TABLET
```

2. Se clonou sem o Git LFS, obtenha os modelos 3D:
```bash
git lfs pull
```

3. Instale as dependências:
```bash
npm install
```

4. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione as seguintes variáveis:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=seu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id

# Deepgram
DEEPGRAM_API_KEY=sua-api-key
```

5. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative a autenticação com Google
   - Crie uma base de dados Firestore

## Execução

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## Sincronização com GitHub

Este projeto inclui scripts para automação da sincronização com o GitHub.

### Scripts Disponíveis

1. **setup-git.ps1**: Configura o repositório Git e o remote para o GitHub
2. **sync-github.ps1**: Sincroniza manualmente os arquivos com o GitHub
3. **setup-auto-sync.ps1**: Configura uma tarefa agendada para sincronização automática

### Como usar a sincronização automática

1. Execute o script de configuração inicial:
   ```powershell
   .\setup-git.ps1
   ```

2. Configure a sincronização automática:
   ```powershell
   .\setup-auto-sync.ps1
   ```

3. Para sincronizar manualmente a qualquer momento:
   ```powershell
   .\sync-github.ps1
   ```

Mais detalhes sobre a sincronização podem ser encontrados no arquivo `GITHUB-SYNC.md`.

## Modelos 3D

Os modelos 3D utilizados pelo projeto estão localizados na pasta `public/3DMODELS/`. Estes arquivos são gerenciados com Git LFS (Large File Storage) devido ao seu tamanho.

### Trabalhando com modelos 3D

Para adicionar ou atualizar modelos 3D:

1. Certifique-se de que o Git LFS está instalado:
   ```bash
   git lfs install
   ```

2. Os arquivos .glb já estão configurados para serem rastreados pelo Git LFS. Para adicionar um novo modelo:
   ```bash
   git add public/3DMODELS/seu-novo-modelo.glb
   git commit -m "Adicionar novo modelo 3D"
   git push origin main
   ```

Para mais detalhes, consulte o arquivo `public/3DMODELS/README.md`.

## Build para Produção

```bash
npm run build
npm start
```

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Firebase (Auth, Firestore)
- Deepgram API para transcrição de voz
- Tailwind CSS para estilização
- Framer Motion para animações
- Git LFS para gerenciamento de arquivos grandes
