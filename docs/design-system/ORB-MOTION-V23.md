# NexaPag V2.3 · Orbs com motion original (5 novembro 2026)

## Fonte e fidelidade
O movimento visual é derivado do arquivo enviado pelo usuário, `NexaPag_Orb_UltraSmooth_60fps_Transparent_HD.webm`, com 768×768 pixels, 60fps, VP9 e transparência. Os pixels são do vídeo original; não há simulação artificial da deformação do líquido.

## Distribuição
- `public/assets/nexapag-orb-ultrasmooth-60fps-alpha-224.webm`: derivação 224×224 a 60fps com alpha VP9 preservado e CRF 27. Cerca de 316 KB.
- `public/assets/nexapag-orb-poster-224.png`: frame estático com transparência para fallback, ~84 KB.
- `v2.html`: orbs de três métricas, cinco dias preenchidos, duas conquistas e categorias. Todos referenciam o mesmo WebM cacheável.
- Dois dias não preenchidos são círculos pontilhados sem vídeo.
- Cada orb recebe uma fase determinística diferente e um filtro de cor vinculado ao seu uso: laranja, lilás, verde ou vermelho. A integridade do movimento geométrico original permanece.

## Comportamento
`IntersectionObserver` pausa decodificações fora da área de rolagem; abas recriam o DOM com atualização explícita dos observadores. `visibilitychange` pausa o vídeo ao ocultar a página. `prefers-reduced-motion: reduce` mostra exclusivamente o poster transparente. Em falhas de codec ou reprodução, o poster permanece visível.

## QA
A verificação automatizada garante que os recursos estão no build, mantém os sete slots e dois dias vazios, preserva as cinco abas e valida o estado de movimento reduzido. Além disso, conferir visualmente o gradiente e a seleção no navegador real.
