# Visualize 9.22 · Forest Acrylic e expressão financeira

## Critérios visuais e contratuais

O shader Forest deve ficar **atrás** de um substrato Dark Matte. Não existe mini-shader em cada card. A película do material é mais densa do que na versão 9.21, reduzindo a mistura de luminosidade com o conteúdo e deixando as bordas ópticas discretas. O Workbench ainda controla a densidade de 48% a 86%, blur e pigmentos em tempo real.

### Hierarquia
1. `ambient`: um campo Forest com luz Sage, céu petrol e mist. O controle de pigmento atua na fonte de iluminação, com ganho moderado.
2. `material-engine-919.js`: α semântico de hero, métricas, boards e nav, sem perder a ligação com o slider.
3. `art-direction-922.css`: acrylic matte com blur de baixa saturação; `--tone-rgb` aparece apenas nas regiões de categoria. Botões não recebem liquid decorativo.
4. `liquid-intro`: uma transição de 1,45s contida no hero, que devolve o gráfico. Não modifica nem inventa valores.
5. `finance-expression-922.js`: uma pequena expressão vetorial (dois olhos e curva da boca) vinculada **às finanças**.

### Semântica das expressões
- **Mensal:** entradas menos (compras menos estornos). Saldo menor que zero = vermelho, maior que zero = verde, igual = neutro.
- **Semanal:** gastos maiores que o orçamento = vermelho; 80–100% do limite = âmbar; abaixo de 80% = verde; orçamento inválido = neutro.
- A “carinha” é uma assinatura discreta de 35px, com rótulo acessível. **Não implica avaliação moral do usuário** nem valor monetário adicional. Cor isolada nunca substitui texto.
- O Visualize é demonstrativo. Não lê SMS, Room, cartões ou APIs reais. Valores exibidos não são saldos bancários.

### Tabs
- Navegação inferior mantém os 5 destinos operáveis com ARIA; um único fundo Pearl neutro identifica a aba ativa. As outras têm ícones vetoriais monocromáticos, sem rótulos visuais, mas `aria-label` permanece.
- Filtros e subabas adotam superfície editorial e uma linha discreta; removidos gradientes lime brilhantes das seleções.
- Workbench mantém geometria personalizável, sem forçar novas dimensões no celular.

## Como verificar
```bash
npm install --no-audit --no-fund
npm run check:syntax
npm run test:design
npm run check:impact
npm run build
npm run test:e2e
```

Cenários de navegador: 320/390px, desktop com painel ao lado do celular; hero mensal vermelho, semanal verde, semanal > orçamento vermelho e aviso âmbar próximo ao limite; respeito a reduced-motion, fonte cromática de categorias, opacidade e blur reais.

## Graphify
O workspace Graphify não estava autorizado na sessão (zero workspaces listados). O CI local `check:impact` permanece ativo; não confundir seu JSON com um grafo Graphify indexado.
