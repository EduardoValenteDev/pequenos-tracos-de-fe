# C60 · Diagnóstico da demora da Coleção (PARTE A · ETAPA A0)

> Documento de causa-raiz do bloco **"C60 — Retorno instantâneo à coleção"**.
> Escopo: só a lentidão do caminho quente da tela `Coloring60CollectionScreen`.
> Não declara aprovação visual; a validação de fluidez segue no aparelho (Parte 12).

## 1. Evidência física (fundador, iPhone)

Ao concluir uma pintura e tocar **"Ver minha coleção"**, a tela permanece por muito tempo em
**"Montando sua coleção…"** com **3 esqueletos vazios**, mesmo havendo 3 obras válidas em disco.
Intermitente. Sem crash. A coleção acaba aparecendo.

## 2. Os 15 subsistemas do caminho quente (mapa)

1. `useFocusEffect(hydrate)` — dispara a CADA foco (inclusive retorno quente).
2. `hydrate` (callback) — reinicializa o estado ANTES de qualquer leitura.
3. `hydrationIdRef` — geração de leitura (descarta resultado obsoleto).
4. `revealAnim.setValue(0)` — zera a opacidade da galeria.
5. `setShowPlaceholders(true)` — remonta os 3 esqueletos.
6. `setStatus(LOADING)` — acende "Montando sua coleção…".
7. `loadColoring60Slots(storyId)` — leitura única da jornada.
8. `loadColoring60JourneyRecord` — 1 `multiGet` de metadados (leve).
9. `reconcileSlot` ×3 dentro de **`Promise.all` (BARREIRA)**.
10. `getColoring60SavedDrawing` → `resolvePointer60` → **`readBlobAsDataUrl`** (lê o arquivo blob
    base64 INTEIRO do disco para a memória) — 3×, uma por parte.
11. `snapshotHasMeaningfulColor` — lê números do payload (leve).
12. `resolveColoring60Lineart` — resolve o contorno oficial (require estático, leve).
13. `collectionCache` (módulo) — guarda **só** `{ storyId, signature, revealed }`, **nenhuma arte**.
14. `CollectionSlot` ×3 — cada um decodifica a `data:` URL da tinta + carrega o contorno.
15. `handleSettled` / `settledRef` — **portão GLOBAL**: só revela quando as 3 vagas terminaram
    (tinta E contorno das 3); senão o `setTimeout(reveal, 7000)` revela no estouro.

## 3. Causa-raiz (com evidência de tempo)

A demora **não** é "cache de imagem". É um **defeito de gestão de estado no caminho quente**: a tela
**descarta um resultado totalmente válido e o re-deriva do disco a cada foco, atrás de uma barreira
global**. Três custos se somam, em série, sem que nenhum resultado anterior seja reaproveitado:

- **(a) Reset síncrono ao esqueleto em todo foco** (passos 4–6): mesmo no retorno quente com 3 obras
  válidas, a tela volta para "Montando sua coleção…" + 3 esqueletos antes de ler qualquer coisa.
- **(b) 3 leituras de blob base64 do disco em `Promise.all`** (passos 9–10): barreira — a mais lenta
  das 3 leituras represa as outras duas. `readBlobAsDataUrl` abre o arquivo inteiro; o custo varia
  com I/O do aparelho e pressão de GC sobre strings base64 grandes → **é daí que vem a intermitência**.
- **(c) Portão global de revelação** (passo 15): mesmo depois de ler, as 3 vagas só aparecem quando
  TODAS decodificaram tinta+contorno. Uma decodificação lenta segura as três; no pior caso, o teto
  de **7000 ms** revela tudo de uma vez — é o "eventualmente aparece".

**Por que o cache atual não ajuda:** `collectionCache` (passo 13) guarda apenas a assinatura e
"já revelada nesta sessão". A checagem `warm` só é calculada **depois** que `loadColoring60Slots`
resolve — ou seja, **a espera dos passos 9–10 sempre acontece**. O cache no máximo pula o crossfade;
nunca torna o retorno quente instantâneo, e nunca guarda a arte para exibir de imediato.

### Instrumentação (DEV, medição real)

A instrumentação de tempo vive no próprio caminho quente, sob `__DEV__`, carimbada pela geração de
leitura (`gen`): `hydrate:start` → `slots:loaded (Δ multiGet+3 blobs)` → `slot:settled` por parte →
`reveal (Δ total)`. Ela mede exatamente (a)→(b)→(c) e prova a barreira: `slots:loaded` marca o fim
das 3 leituras de blob; a distância até `reveal` marca o custo de decodificação sob o portão global.

## 4. Correção (resumo — detalhes nas ETAPAS A1–A6)

- **A1 · estado por vaga**: cada vaga tem a sua máquina de estado; some o portão global `settledRef`.
  Uma vaga lenta/erro **não** bloqueia as outras duas.
- **A2 · stale-while-revalidate + retrato em memória por `storyId`**: no retorno quente a tela NÃO
  limpa as vagas nem volta a esqueleto — mostra o último retrato válido e reconcilia em segundo plano,
  trocando **só** a vaga que mudou, **atomicamente** (tinta E contorno prontos), preservando a anterior
  se a nova revisão falhar. O retrato é **só memória** (sem nova persistência, sem duplicar blob); o
  disco reconciliado continua a autoridade.
- **A3 · prime pós-conclusão**: terminada a transação de conclusão, dispara
  `primeColoring60Collection(storyId)` **sem** bloquear a celebração; ao tocar "Ver minha coleção" o
  retrato já está pronto.
- **A4 · sem prefetch remoto para `file://`**: não usar `Image.prefetch`/`Image.getSize` como
  pré-carregamento; sem dependência nova.
- **A5 · key por vaga estável**: muda só quando a obra muda de verdade (`storyId`, `activityId`,
  `snapshotStatus`, revisão, ponteiro promovido, assinatura do payload) — nunca `activityId` sozinho,
  nunca `Date.now`/aleatório.
- **A6 · timeout por vaga**: "Montando sua coleção…" global só na **primeira** carga real (nenhuma
  vaga com conteúdo útil); no retorno quente ele não domina.

## 5. PORTÃO A→B — FECHADO

Critérios de passagem da PARTE A para a PARTE B, todos satisfeitos:

1. **Causa-raiz registrada** — seção 3 acima (defeito de gestão de estado no caminho quente:
   reset ao esqueleto + 3 blobs em barreira + portão global de revelação), com instrumentação de
   tempo (seção 3.1) provando (a)→(b)→(c).
2. **Correção coberta por provas determinísticas** — bloco `C60-A` no `scripts/smoke.js`: **18
   provas** (A1–A6) + **8 controles negativos** que reproduzem por mutação inline cada modo de falha
   e exigem que o código real NÃO o tenha (key só por `activityId` colide; key por tempo instável;
   merge ingênua pisca vazio; `>=` reaplica; preservação grudenta nunca solta; key ignora contorno;
   frescor sem guarda de tipo; integridade sem "concluída agora").
3. **Prova de comportamento — 10 ciclos sem loader global no retorno quente** — a prova
   `C60-A [GATE A→B · 10 ciclos]` **instancia o serviço REAL** (`coloring60CollectionPortrait`) via
   `new Function`, injetando um leitor de disco controlável e a **merge/frescor reais** do módulo
   puro. Prova, na mesma execução: (i) o frio genuíno (sem retrato) **mostraria** o loader — logo ele
   não foi só removido; (ii) após o aquecimento (`prime`), **dez focos seguidos** com revalidação SWR
   a cada um **nunca** acendem "Montando sua coleção…"; (iii) uma revalidação que **falha** (disco
   intermitente) mantém o retorno **quente** (o `catch` preserva o último retrato bom).
4. **`npm run smoke` verde** — **3569/3569**, 0 falhas (≥ 3542; nenhuma prova anterior removida,
   nenhum controle enfraquecido).
5. **Parse verde** — `node --check` OK em `smoke.js`, `coloring60CollectionPortrait.js`,
   `coloring60PortraitMerge.js`, `coloring60CollectionReader.js`.
6. **Sem regressão** — suíte completa verde; os 15 estados físicos aprovados permanecem cobertos.

> A fluidez percebida no aparelho (Parte 12) continua pendente de validação física do fundador — este
> portão prova a **correção determinística**, não substitui a validação visual em dispositivo.
