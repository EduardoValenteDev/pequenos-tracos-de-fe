# R7 · Attempt 03 · STOP_PRODUCT_DEFECT C60 e Mini-SDD do asset release

## 1. Estado histórico preservado

- `R7_ATTEMPT_03 = STOP_PRODUCT_DEFECT`.
- `T090 = NÃO ADJUDICADO` e `P139 = NÃO ADJUDICADO`.
- O fundador abriu `Haja luz` e parou na UI `Erro ao abrir o desenho`, sem
  tocar em tentar novamente, voltar, canvas, paleta ou salvar.
- O processo permaneceu vivo, em foreground, na mesma Activity. Não houve
  healing, restauração, limpeza ou nova gravação.

## 2. Lacre e limite de observação do storage

- APK: build `f6c2c54d-fdeb-4923-aadd-a39076a7a252`, SHA-256
  `47258F7568EFF3B98E7D9F9AB88F17CFFA5D8AAB7EBB6A1916D0ECE3FCD1EEB1`.
- HEAD executável do build: `d3703805240d235ede606c2db5f90f70693bc0d7`.
- Logcat integral: `t090-p139-attempt-03-logcat.txt`, 5.533.909 bytes,
  SHA-256 `EBAF9F0BC62068EC86653F1ABAE8C6540C5FA37C23089B05265E3C0360B1A4AB`.
- Package instalado: `com.valentedev.pequenostracosdefe`, `1.0.0 (1)`,
  `ceDataInode=137433`, sem troca desde o PRE.
- O APK preview é corretamente não-debuggable. As duas aferições `run-as`
  foram recusadas pelo Android com `package not debuggable`; portanto não é
  tecnicamente possível reler RKStorage, pointer ou blobs diretamente sem uma
  ação destrutiva ou troca de binário. A ausência de mutação é sustentada pela
  causalidade do caminho (falha anterior ao reader) e pelo inode estável, não
  por uma alegação fabricada de igualdade byte a byte.

## 3. Diagnóstico comprovado

`ColoringCanvas` é o dono da UI de erro. Seu efeito chama
`convertLineartToDataUrl(imageSource)` antes de montar a WebView e antes de
aplicar qualquer pintura persistida.

No Development Build, `Asset.fromModule()` resolve a fonte por Metro e
`downloadAsync()` entrega um `file://` legível. No preview standalone Android,
o resolvedor do React Native entrega um identificador de drawable sem esquema,
`assets_stories_creation_coloring_scene_02`; por compatibilidade com `<Image>`,
`expo-asset` preenche `localUri` com esse mesmo identificador e marca o asset
como `downloaded=true`. O código atual então cai no ramo remoto e executa
`fetch()` sobre o identificador, que não é URL.

O APK contém o binário correto. A tabela AAPT liga
`drawable/assets_stories_creation_coloring_scene_02` a `res/OZ.png`; o recurso
decodifica como PNG `1122×1402` e representa visualmente a lineart de `Haja
luz`. Os outros dois recursos C60 também estão presentes e preservam seus
hashes fonte (`res/Iw.png` e `res/zy.png`). A ausência do SHA fonte para
`Haja luz` dentro do ZIP é efeito normal do processamento lossless do AAPT,
não ausência do recurso.

Classificação causal: `RELEASE_ASSET_RESOLUTION_DEFECT`, já existente no
caminho standalone e apenas exposto quando `31ae293` tornou C60 alcançável no
preview. D1 e a cerca C60 não alteraram o loader.

## 4. Spec curta

Quando uma fonte Metro local virar identificador Android sem esquema, o loader
deve usar a capacidade nativa já existente do `expo-asset` para copiar o
drawable empacotado para o cache e só então entregá-lo ao `expo-file-system`.
Fontes `file://`, `http(s)://` e `{ uri }` permanecem inalteradas. A correção:

1. não muda schema, pointer, blobs, assets, dependências nem feature flags;
2. não escreve storage de produto; escreve apenas cache transitório do asset;
3. não toca no leitor/writer C60 nem na compatibilidade do Caso 13;
4. mantém produção C60 OFF e preview C60 ON;
5. falha visivelmente se a cópia nativa falhar, sem healing.

## 5. Plano e tasks

1. Isolar a obtenção de URI legível em `ColoringCanvas.js`.
2. Para o caso estrito `require()` + URI sem esquema, recriar a referência por
   `Asset.fromURI()` e chamar `downloadAsync()`; o módulo nativo abre o drawable
   pelo identificador e devolve um `file://` de cache.
3. Manter todos os demais caminhos sem alteração.
4. Criar harness focado que execute as funções reais extraídas do fonte e prove
   release, development, file, HTTP, falha e ausência de segunda cópia.
5. Criar mutantes que removam/burlem a ponte e exigir que todos morram.
6. Rodar focused, mutation, `verify:runtime`, smoke, bundle Android,
   `expo-doctor` e inspeção de assets do APK do Attempt 04.

## 6. Checklist e portões

- Causa única e reproduzível contra código + SDK + resource table: PASS.
- Correção mínima sem decisão de produto/storage: PASS.
- Plano preserva dual pointer, rollback, Q8, TK-A-075 e D1: PASS.
- Teste de regressão falha no comportamento do Attempt 03: obrigatório.
- Inspeção release comprova lineart e referências dos três C60: obrigatória.

A autorização do fundador para o fluxo automático diagnóstico → Mini-SDD →
implementação → gates → Attempt 04 constitui os três portões humanos deste
bloco isolado. Implementação autorizada somente no escopo acima.
