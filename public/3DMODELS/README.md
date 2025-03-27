# Modelos 3D

Esta pasta contém modelos 3D utilizados pelo projeto.

## Arquivos grandes e Git LFS

Os arquivos .glb dos modelos 3D são gerenciados pelo Git LFS (Large File Storage) devido ao seu tamanho. O Git LFS armazena os arquivos grandes em um servidor separado e mantém apenas referências no repositório Git principal, o que torna o repositório mais eficiente.

## Modelos disponíveis

O projeto utiliza os seguintes modelos:
- `IQOS_ILUMA_I_BREEZE.glb`
- `IQOS_ILUMA_I_ONE_BREEZE.glb`
- `IQOS_ILUMA_I_PRIME_BREEZE.glb`

## Como trabalhar com modelos 3D via Git LFS

Para clonar o repositório com os modelos 3D:
```bash
git lfs clone https://github.com/Visitfoods/IQOS-TABLET.git
# ou se já clonou o repositório
git lfs pull
```

Para adicionar novos modelos 3D:
```bash
# Certifique-se de que o arquivo está sendo rastreado pelo Git LFS
git lfs track "*.glb"
# Adicione o arquivo normalmente
git add caminho/para/novo-modelo.glb
git commit -m "Adicionar novo modelo 3D"
git push origin main
```

Para atualizar um modelo existente, basta substituir o arquivo e fazer commit normalmente. O Git LFS gerenciará automaticamente o armazenamento do arquivo grande.

## Alternativa para produção

Em ambientes de produção, é recomendado hospedar estes modelos no Firebase Storage ou outro serviço de armazenamento em nuvem e carregar os modelos dinamicamente através de URLs.
