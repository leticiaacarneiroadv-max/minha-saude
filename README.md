# Minha Saúde

PWA pessoal (pt-BR) de treino, dieta, compras, estratégia e bioimpedância. Os dados ficam só no aparelho (IndexedDB), sem serviços de terceiros.

## Rodar
```bash
npm install
npm run dev     # desenvolvimento
npm test        # testes de importação/exportação
npm run build   # versão de produção
```

## Publicar (GitHub Pages)
1. Crie o repositório `minha-saude` no GitHub e envie o código para a branch `main`.
2. Em **Settings → Pages**, escolha **Source: GitHub Actions**.
3. A cada push, o app é publicado em `https://SEU-USUARIO.github.io/minha-saude/`.

## Instalar no celular
- **Android (Chrome):** abra o endereço → menu ⋮ → *Instalar app*.
- **iPhone (Safari):** abra o endereço → Compartilhar → *Adicionar à Tela de Início*.

## Backup
Ajustes → *Baixar backup* e salve na pasta do Google Drive. Para restaurar: *Restaurar backup*.

## Integração com o Claude
Peça ao Claude os JSONs no formato de `docs/schemas.md` e cole em Ajustes → *Importar*. Use *Copiar resumo em texto* para levar seus dados à conversa.
