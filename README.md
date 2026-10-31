# NexaPag UX/UI Live Design Lab 9.03

Prévia interativa independente do aplicativo Android. Preserva o Dark Matte Forest, glassmorphism, pigmentos, heatmap e LiquidOrb com física amortecida.

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
