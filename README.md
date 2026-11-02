# NexaPag UX/UI Live Design Lab 9.22

Prévia interativa independente do aplicativo Android. Preserva o Dark Matte Forest, glassmorphism, pigmentos, heatmap e LiquidOrb com física amortecida.

## Design system e Graphify

- **Visualize 9.22:** [Forest Acrylic, tabs editoriais e expressões financeiras](docs/design-system/FOREST-ACRYLIC-922.md). Shader atrás de acrílico matte e sinal vermelho/verde/âmbar no hero ligado a dados demonstrativos.
- **Motion 9.21:** [contrato de direção de arte e movimento](docs/design-system/MOTION-ART-DIRECTION-921.md). Workbench conserva os controles; a coreografia de entrada usa até 6 superfícies por no máximo 500ms.
- **Graphify:** [guia de autorização e indexação](docs/graphify/README.md). O conector não possui workspace selecionado nesta sessão; não há monitoramento Graphify ativo.
- **Mapa local sempre no CI:** `npm run check:impact` gera `test-results/design-impact.json`, com origem declarada, imports e contratos de mudança, sem fingir que é um grafo indexado no Graphify.
- **Ramos:** `main` segue como fonte do Visualize; alterações de motion/estética passam pelo CI e QA antes de merge ou deploy.

## Fluxo
1. `npm install`
2. `npm run dev` (Vite)
3. `npm run build` (deploy `dist/` em Vercel)
4. Acesse `UX/UI LAB` na prévia.

## Stack
- JavaScript ES Modules, Canvas 2D, CSS `backdrop-filter` e Vite
- GSAP para transições refinadas do inspetor na versão compilada
- Culori para visualização de gradientes em OKLCH na versão compilada
- HTML único (fallback, sem dependências externas) em `NexaPag_UXUI_Live_Interactive.html`

## Laboratório
- Material: blur, densidade, reflexos, luz de fundo, toggles de shader/óptica/movimento
- Pigmentos: cores editáveis, força/difusão/mesclagem
- Física: inspeção da bolha, refração, interfaces, resposta e toque
- Dados: gasto e limite semanal editáveis, participação das categorias
- Comparação: snapshots A/B e exportação de parâmetros para JSON
- Validação: estados e componentes presentes

Todos os dados são demonstrativos, nunca acessam SMS, Room, banco ou cartões. Nenhuma implementação Android é alterada.

## Status de validação
- `node --check`: app.js/workbench.js
- Chromium local via Playwright: 320/390/1440px; cinco abas e interações; 0 erros JS e 0 overflow horizontal.
- Build Vite/npm ainda não executado no container (sem acesso ao registry). Verificar CI/deployment antes de liberar o Preview.

## CI/CD oficial · GitHub Actions + GitHub Pages

A fonte de verdade para o Visualize é a branch `main` deste repositório público. O workflow [`quality-pages.yml`](.github/workflows/quality-pages.yml) executa em cada push, pull request e manualmente:

1. Instala Node.js 22 e dependências com `npm install --no-audit --no-fund`.
2. Valida sintaxe JavaScript, testes existentes de design, geometria e material.
3. Gera o Vite de produção e testa **Chromium real** em 1920×1080, 1366×768, 390 px e 320 px.
4. Verifica o Workbench ao lado do celular, os sliders de Glass nos **cards reais**, tokens geométricos fracionários, navegação e acesso mobile.
5. Guarda screenshots, vídeos e traces (inclusive em falhas) nos artefatos da aba **Actions**, por 14 dias.
6. Publica em **GitHub Pages apenas se todos os testes passarem na `main`**. Pull requests executam QA, mas nunca publicam.

### Ativar a publicação uma vez

No GitHub, entre em **Settings → Pages → Build and deployment → Source → GitHub Actions**. A configuração inicial exige essa opção habilitada pelo responsável do repositório. A publicação será em `https://marcelol090.github.io/NexaPagUXUI/` **depois de um workflow de deploy bem-sucedido**. Se a configuração não estiver habilitada, o deploy permanece pendente, mesmo quando os testes passam.

O projeto usa `base: './'` no Vite e links relativos para que o mesmo código funcione tanto em GitHub Pages (subdiretório) quanto em Vercel (raiz do domínio). A Vercel deixa de ser necessária para os builds frequentes.

### Execução local

```bash
npm install
npm run check:syntax
npm run test:design
npm run build
npx playwright install chromium
npm run test:e2e
```

**Controle de qualidade da main:** em **Settings → Rules → Rulesets**, crie uma regra para `main` exigindo o status **Validate design, build and browser** antes de aceitar PRs. Sem essa proteção, GitHub Actions notifica falhas, mas não impede merges manualmente.

**Reprodutibilidade:** o repositório ainda não possui `package-lock.json` versionado; por isso o CI usa `npm install`. Assim que o lockfile for gerado e revisado, altere para `npm ci` com cache de dependências para builds reproduzíveis.

Isso verifica somente o protótipo HTML/CSS/JS. O aplicativo Android/Kotlin possui pipeline separado e não é implantado via Pages.
