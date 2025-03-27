# Modelos 3D para o Projeto IQOS TABLET

Este diretório contém os modelos 3D utilizados no projeto IQOS TABLET.

## Modelos Disponíveis

- `IQOS_ILUMA_I_BREEZE.glb`
- `IQOS_ILUMA_I_ONE_BREEZE.glb`
- `IQOS_ILUMA_I_PRIME_BREEZE.glb`

## Gerenciamento de Modelos 3D

Os arquivos de modelos 3D são grandes e podem causar problemas de desempenho nos repositórios Git. Para gerir estes arquivos, considere as seguintes opções:

### Opção 1: Git LFS (atualmente configurado)

O projeto está configurado para usar o Git LFS (Large File Storage). Esse método armazena os arquivos grandes em um servidor separado, mantendo apenas referências no repositório Git principal.

Para clonar o repositório com os modelos:

```bash
# Certifique-se de ter o Git LFS instalado
git lfs install

# Clone o repositório
git clone https://github.com/Visitfoods/IQOS-TABLET.git

# Puxe os arquivos LFS
git lfs pull
```

### Opção 2: Firebase Storage (recomendado para produção)

Para ambientes de produção, recomendamos utilizar o Firebase Storage para armazenar os modelos 3D:

1. Faça upload dos modelos para o Firebase Storage
2. Utilize URLs assinadas para aceder aos modelos
3. Implemente um sistema de cache para melhorar o desempenho

Exemplo de código para aceder aos modelos:

```javascript
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const modelRef = ref(storage, 'models/IQOS_ILUMA_I_BREEZE.glb');

getDownloadURL(modelRef)
  .then((url) => {
    // Use a URL para carregar o modelo
    const modelViewer = document.querySelector('model-viewer');
    modelViewer.src = url;
  })
  .catch((error) => {
    console.error("Erro ao carregar modelo:", error);
  });
```

### Opção 3: CDN Dedicado

Para aplicações em larga escala, considere usar um CDN (Content Delivery Network) dedicado para servir os modelos 3D. Isto proporciona melhor desempenho e controlo de acesso.

## Resolução de Problemas

Se encontrar problemas com o Git LFS:

1. Verifique se o Git LFS está instalado corretamente: `git lfs install`
2. Garanta que está a rastrear os tipos de ficheiros corretos: `git lfs track "*.glb"`
3. Verifique o estatuto dos objetos LFS: `git lfs status`

Para problemas persistentes, considere utilizar a Opção 2 ou 3 acima.

## Otimização de Modelos

Para melhorar o desempenho da aplicação:

1. Comprima os modelos 3D para reduzir o tamanho do ficheiro
2. Utilize LOD (Level of Detail) para modelos complexos
3. Considere formatos alternativos como USDZ ou compressed GLB

## Notas

Lembre-se de que o Firebase oferece um limite de armazenamento gratuito de 5GB, o que é mais do que suficiente para estes modelos. Para projetos maiores, considere um plano pago ou um serviço de armazenamento alternativo.
