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

## Configuração

1. Clone o repositório:
```bash
git clone <url-do-repositório>
cd iqos-tablet
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
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

4. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative a autenticação com Google
   - Crie uma base de dados Firestore

## Execução

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

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