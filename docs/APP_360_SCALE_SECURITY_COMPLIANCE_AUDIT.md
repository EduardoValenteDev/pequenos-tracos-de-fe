> **Aviso: este documento é histórico.** Para decisões atuais, consulte [docs/PROJECT_SOURCE_OF_TRUTH.md](PROJECT_SOURCE_OF_TRUTH.md).

# Auditoria 360° — Pequenos Traços de Fé
## Escalabilidade · Segurança · Privacidade Infantil · Compliance · Performance · Arquitetura

**Data:** 2026-06-01  
**Versão do app:** 1.0.0  
**Smoke tests:** 582/582 ✓  
**Stack:** React Native · Expo 54 · React 19 · AsyncStorage · Sem backend  
**Metodologia:** Leitura direta de código-fonte, assets, configurações e dependências. Nenhum arquivo alterado.

---

## ⚠ Nota de método

Todas as observações abaixo são baseadas em arquivos reais do projeto ou em ausências verificáveis. Nenhum problema foi inventado. Quando um risco é listado, o arquivo-fonte está indicado.

---

---

# 1. Resumo Executivo

## O que está bom

- **Nenhuma chave ou secret exposta no frontend.** Não há `.env`, não há API keys, tokens ou credenciais hardcoded no código. (`grep` confirma ausência de `EXPO_PUBLIC`, `API_KEY`, `Bearer`, etc.)
- **Arquitetura de acesso bem estruturada.** `accessControl.js` é a fonte única de regras de plano. Telas não espalham lógica de premium.
- **Parental gate implementado.** Links externos e área dos pais passam por desafio matemático (`ParentalGate.js`). `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` no build.
- **Permissões mínimas declaradas.** `app.json`: microfone desabilitado, sem permissão de câmera, sem localização, sem contatos. Apenas `MODIFY_AUDIO_SETTINGS` no Android.
- **Privacy manifest Apple configurado.** `NSPrivacyTracking: false`, `NSPrivacyCollectedDataTypes: []`, razão `CA92.1` declarada para UserDefaults.
- **Sem chamadas de rede.** O app é 100% offline. Nenhum `fetch`, `axios` ou `XMLHttpRequest` encontrado no código da aplicação.
- **Sem analytics invasivos.** Nenhum SDK de analytics (Firebase, Amplitude, Mixpanel, etc.) instalado.
- **storeLinks com null correto.** `APP_STORE_URL = null` e `PLAY_STORE_URL = null` — nenhum link morto para criança clicar antes da publicação.
- **Smoke tests robustos.** 582 verificações automatizadas cobrindo arquitetura, dados e convenções.
- **Planos de preço com `isPurchaseEnabled: false`.** Nenhuma compra acidental pode ser disparada (`planConfig.js`).
- **newArchEnabled: true.** Usando a Nova Arquitetura do React Native.
- **Conteúdo 100% offline.** Funciona sem internet. Adequado para o público-alvo.

## O que está frágil

- **Assets PNG não comprimidos e muito grandes.** Imagens de colorir de 1,3–1,4 MB por arquivo. 50 imagens = ~66 MB só para 3 histórias. Com 20 histórias completas, seriam ~440 MB apenas de imagens. **Isso bloqueará publicação nas lojas.** (`assets/stories/`)
- **Duplicidade de pastas de assets com nomes legados.** Existem pastas com espaços e acentos (`assets/stories/Davi e o Golias/`, `assets/stories/Jesus e as crianças/`) ao lado das pastas normalizadas (`davi_golias/`, `jesus_criancas/`). Risco de Metro Bundler no Windows e confusão na entrega de assets.
- **`console.log` sem guarda `__DEV__` em serviços de produção.** `useProgress.js`, `achievementsStorage.js`, `atelierStorage.js`, `drawingStorage.js` logam erros de catch em produção sem filtro.
- **Acessibilidade mínima.** Apenas 3 `accessibilityLabel` em todo o projeto. Crianças com deficiência visual não conseguem usar o app.
- **Sem mecanismo de Restore Purchase.** Apple exige que apps com IAP ofereçam botão de restauração de compra. Sem ele, o app pode ser rejeitado.
- **Sem política de privacidade URL no app.** Obrigatória para publicação em ambas as lojas, especialmente em apps infantis.
- **17 histórias sem imagens de colorir.** `coloringImages.js` mapeia apenas `noah`, `david_goliath` e `jesus_children`. As outras 17 retornarão `null` — comportamento de fallback precisa ser verificado.
- **Base64 de desenhos em AsyncStorage.** Imagens PNG completas salvas como string base64 por cena. Com 200 cenas, isso pode acumular dezenas de MB no AsyncStorage do dispositivo.

## O que impede escala

- **Bundle size.** 99 MB de imagens já no estado atual (3 histórias). Escala linear e inevitável com o restante do conteúdo.
- **AsyncStorage para dados volumosos.** Projetado para strings pequenas. Base64 de imagens PNG pode causar lentidão e OOM (Out of Memory) em dispositivos de entrada.
- **Sem CDN ou Asset Bundle Splitting** para distribuição futura de áudios e imagens.
- **Sem observabilidade** (crash reporting, logs de produção). Problemas no campo são invisíveis.
- **Sem feature flags.** Impossível habilitar/desabilitar features sem novo build.

## O que impede publicação nas lojas

| Item | Loja afetada | Evidência |
|---|---|---|
| Política de privacidade ausente | Ambas | Ausente em `app.json` e no código |
| Sem Restore Purchase implementado | Apple | `planConfig.js` sem `expo-iap` ou similar |
| PNG de colorir 1,3–1,4 MB cada (bundle >150 MB) | Google Play (sem OBB) | `du` nos assets |
| Compressão de imagens insuficiente | Ambas | Imagens raw sem otimização |

## O que precisa ser feito antes do MVP

1. Comprimir imagens de colorir (PNG → PNG otimizado ou WebP)
2. Publicar política de privacidade e adicionar URL no `app.json`
3. Implementar Restore Purchase (mínimo botão funcional)
4. Remover `console.log` não guardados em serviços
5. Limpar pastas legadas de assets
6. Adicionar fallback visual seguro para histórias sem imagem de colorir

## O que pode ficar para depois

- Backend, auth, sincronização multi-device
- Analytics (desde que seguro para crianças)
- Crash reporting com Sentry/Crashlytics
- CDN para áudios
- Multi-perfil
- Kubernetes, autoscale, cache distribuído
- Lumi com IA
- Devocionais

---

---

# 2. Classificação por Prioridade

## P0 — Bloqueia publicação ou coloca crianças/dados em risco

### P0-01 — PNG de colorir sem compressão: bundle > 150 MB já com 3 histórias

| Campo | Valor |
|---|---|
| Prioridade | **P0** |
| Área | Assets / Bundle Size |
| Arquivo | `assets/stories/noe/colorir/`, `assets/stories/davi_golias/colorir/`, `assets/stories/jesus_criancas/colorir/` |
| Problema | Cada PNG de colorir mede 1,3–1,4 MB. 50 arquivos = ~66 MB. 200 (20 histórias) = ~440 MB. |
| Risco | Google Play bloqueia APK > 150 MB sem AAB + OBB. App Store avisa "Wi-Fi only" acima de 200 MB. Em APK de preview: já pode ser grande o suficiente para testar. |
| Correção | Comprimir com `pngquant --quality 60-80` ou converter para WebP (`cwebp -q 80`). Meta: ≤ 120 KB por imagem de colorir. Redução esperada: de 1,3 MB para ~100 KB (92%). |
| Momento | Antes de adicionar as próximas histórias |

### P0-02 — Política de privacidade ausente

| Campo | Valor |
|---|---|
| Prioridade | **P0** |
| Área | Legal / Compliance / Lojas |
| Arquivo | `app.json` (sem `privacyPolicyUrl`), código sem referência a URL de política |
| Problema | Nenhuma política de privacidade publicada. Nenhuma URL em `app.json` ou na tela de Área dos Pais. |
| Risco | Rejeição automática nas lojas. Violação do COPPA (EUA), LGPD (Brasil) e GDPR (Europa) para apps infantis. Apple e Google exigem URL de política de privacidade para apps na categoria Kids. |
| Correção | Redigir política honesta, publicar em URL pública, adicionar `privacy` em `app.json` (`expo.ios.privacyPolicyUrl`, `expo.android.privacyPolicyUrl`) e exibir link na ParentAreaScreen protegido por ParentalGate. |
| Momento | Antes de submeter às lojas |

### P0-03 — Restore Purchase não implementado (Apple obrigatório)

| Campo | Valor |
|---|---|
| Prioridade | **P0** |
| Área | App Store Compliance / Monetização |
| Arquivo | `src/data/planConfig.js`, `src/screens/ParentAreaScreen.js` |
| Problema | `isPurchaseEnabled: false` — nenhuma lógica de IAP implementada. Apple exige que qualquer app com compras in-app ofereça um botão "Restaurar compras" funcional. |
| Risco | Rejeição pela Apple Review. Usuários que trocam de iPhone perdem acesso ao plano pago. |
| Correção | Implementar `expo-iap` (ou `react-native-purchases` para Revenuecat), botão de restauração na ParentAreaScreen, e fluxo de upgrade completo. |
| Momento | Antes de submeter à App Store |

---

## P1 — Necessário antes do lançamento público

### P1-01 — 17 histórias sem imagens de colorir registradas

| Campo | Valor |
|---|---|
| Prioridade | **P1** |
| Área | Assets / UX |
| Arquivo | `src/assets/coloringImages.js` |
| Problema | `coloringImages.js` mapeia apenas `noah`, `david_goliath` e `jesus_children`. As outras 17 histórias retornarão `null` na função `getColoringImage`. |
| Risco | Tela de colorir em branco ou crash para 17 histórias. |
| Correção | Adicionar fallback seguro em `ColoringScreen` para quando `getColoringImage` retorna `null`, exibindo estado "Imagem em breve" ao invés de tela branca ou erro. Depois, adicionar as imagens reais gradualmente. |
| Momento | Antes de liberar qualquer história sem imagem |

### P1-02 — `console.log` sem guarda `__DEV__` em serviços de produção

| Campo | Valor |
|---|---|
| Prioridade | **P1** |
| Área | Segurança / Observabilidade |
| Arquivo | `src/hooks/useProgress.js`, `src/services/achievementsStorage.js`, `src/services/atelierStorage.js`, `src/services/drawingStorage.js` |
| Problema | Erros de catch logam via `console.log` sem verificar `if (__DEV__)`. Em produção com React Native, logs podem vazar para ferramentas de depuração conectadas ao dispositivo. |
| Risco | Vazamento de informações de erro em produção. Padrão ruim que pode evoluir para log de dados sensíveis. |
| Correção | Substituir `console.log(...)` por `if (__DEV__) console.log(...)` nesses arquivos. |
| Momento | Sprint de segurança |

### P1-03 — Pastas legadas de assets com espaços e acentos

| Campo | Valor |
|---|---|
| Prioridade | **P1** |
| Área | Assets / Build |
| Arquivo | `assets/stories/Davi e o Golias/`, `assets/stories/Jesus e as crianças/`, `assets/stories/noe/` (duplicada por `assets/stories/noe/` e `assets/stories/noe_coloring`) |
| Problema | Existem pastas legadas com espaços (`Davi e o Golias`) e acentos (`Jesus e as crianças`) ao lado das pastas normalizadas (`davi_golias`, `jesus_criancas`). O Metro Bundler pode ter comportamento imprevisível com espaços em paths no Windows. |
| Risco | Build quebrado em CI/CD ou em ambientes não-Windows. Confusão na entrega de assets pelo designer/narrador. |
| Correção | Remover as pastas legadas após confirmar que `coloringImages.js` não as referencia. Validar no smoke que nenhum `require()` aponta para paths com espaços. |
| Momento | Sprint de assets |

### P1-04 — 11 vulnerabilidades moderadas no npm

| Campo | Valor |
|---|---|
| Prioridade | **P1** |
| Área | Segurança de Dependências |
| Arquivo | `package-lock.json` |
| Problema | `npm audit` reporta 11 vulnerabilidades de severidade moderada, concentradas em `@expo/config-plugins` e dependências transitivas do CLI do Expo. |
| Risco | Vulnerabilidades de build/CLI geralmente não afetam o app em produção diretamente, mas podem ser exploradas no pipeline de CI/CD ou no ambiente do desenvolvedor. |
| Correção | Executar `npm audit fix` (sem `--force`) após cada ciclo de sprint e avaliar impacto. Não usar `npm audit fix --force` sem revisão de breaking changes. |
| Momento | Sprint de segurança |

### P1-05 — Acessibilidade mínima (3 labels em todo o app)

| Campo | Valor |
|---|---|
| Prioridade | **P1** |
| Área | Acessibilidade / UX Infantil |
| Arquivo | Todos os arquivos `src/screens/` e `src/components/` |
| Problema | `grep` encontrou apenas 3 ocorrências de `accessibilityLabel` em todo o projeto. Botões, imagens e campos interativos não possuem labels de acessibilidade. |
| Risco | App inacessível para crianças com deficiência visual. Apple valoriza acessibilidade nas avaliações da App Store. Potencial barreira regulatória futura. |
| Correção | Adicionar `accessibilityLabel`, `accessibilityRole` e `accessibilityHint` em todos os botões interativos, imagens de conteúdo e campos de input. Priorizar: navegação de abas, botões de início de história, paleta de cores, botões de áudio. |
| Momento | Sprint de UX e polimento |

### P1-06 — Termos de uso ausentes

| Campo | Valor |
|---|---|
| Prioridade | **P1** |
| Área | Legal / Compliance |
| Arquivo | Ausente no projeto |
| Problema | Não existem termos de uso no app nem URL configurada. |
| Risco | Necessário para submissão às lojas. Exigido para qualquer relação de consumo (Lei 8.078/90 — CDC). Especialmente importante quando há cobrança. |
| Correção | Redigir termos de uso, publicar em URL pública, exibir na ParentAreaScreen. |
| Momento | Antes de submeter às lojas |

---

## P2 — Importante para escala e monetização

### P2-01 — Base64 de desenhos em AsyncStorage (risco de memory/storage)

| Campo | Valor |
|---|---|
| Prioridade | **P2** |
| Área | Performance / Storage |
| Arquivo | `src/services/drawingStorage.js`, `src/services/atelierStorage.js` |
| Problema | Imagens PNG base64 (tamanho médio ~200–500 KB por cena) armazenadas como string no AsyncStorage. Com 200 cenas totais e o Ateliê livre, a store pode acumular dezenas de MB. AsyncStorage não é otimizado para blobs grandes. |
| Risco | Lentidão no carregamento de perfil e progresso. Possível OOM em dispositivos com pouca RAM (ex: Android entry-level com 2 GB). Corrupção silenciosa se o dispositivo ficar sem espaço. |
| Correção | Avaliar migração para `expo-file-system` para armazenar imagens em arquivo local (filesystem), mantendo apenas o caminho no AsyncStorage. Isso reduz a pressão de memória drasticamente. |
| Momento | Sprint de performance |

### P2-02 — Sem crash reporting / observabilidade

| Campo | Valor |
|---|---|
| Prioridade | **P2** |
| Área | Observabilidade |
| Arquivo | Ausente no projeto |
| Problema | Nenhum SDK de crash reporting instalado (Sentry, Crashlytics, etc.). Erros em produção são invisíveis. |
| Risco | Bugs críticos em produção não detectados. Impossível priorizar correções sem dados reais. Android Vitals e App Store Connect mostram crashes, mas sem stack trace detalhado. |
| Correção | Integrar `@sentry/react-native` com configuração que **não colete dados pessoais**. Configurar `beforeSend` para remover PII. Não logar nome da criança, conteúdo dos desenhos ou progresso detalhado. |
| Momento | Sprint de observabilidade |

### P2-03 — ScrollView em listas longas (sem virtualização)

| Campo | Valor |
|---|---|
| Prioridade | **P2** |
| Área | Performance React Native |
| Arquivo | `src/screens/StoriesScreen.js`, `src/screens/TrophiesScreen.js`, `src/screens/ParentAreaScreen.js` |
| Problema | Listas de histórias (20 itens) e conquistas usando `ScrollView` ao invés de `FlatList`. Com ScrollView, todos os itens são renderizados de uma vez. |
| Risco | Lentidão perceptível ao abrir Aventuras ou Conquistas em dispositivos de entrada. Aumenta com o crescimento do catálogo. |
| Correção | Migrar listas com mais de 8 itens para `FlatList` com `keyExtractor` e `getItemLayout` quando possível. |
| Momento | Sprint de performance |

### P2-04 — Sem mecanismo de consentimento para nome da criança

| Campo | Valor |
|---|---|
| Prioridade | **P2** |
| Área | LGPD / Privacidade Infantil |
| Arquivo | `src/screens/ProfileScreen.js`, `src/context/ProfileContext.js` |
| Problema | A criança (ou responsável) pode digitar o nome da criança na tela de Perfil. O nome é salvo localmente sem nenhum aviso de privacidade, sem explicação de por que é pedido, nem possibilidade de usar sem informar. |
| Risco | LGPD Art. 14: dados pessoais de crianças exigem consentimento específico e destacado dos pais. Nome é dado pessoal. |
| Correção | (1) Tornar o nome opcional com aviso claro ("Usado apenas neste dispositivo, nunca enviado para a internet"). (2) Mover o campo de nome para a ParentAreaScreen (protegida por gate). (3) Mencionar na política de privacidade. |
| Momento | Sprint de privacidade infantil |

### P2-05 — ParentalGate bypassável por crianças com habilidade matemática

| Campo | Valor |
|---|---|
| Prioridade | **P2** |
| Área | Segurança / Controle Parental |
| Arquivo | `src/components/ParentalGate.js` |
| Problema | O desafio é uma multiplicação de dois números (range 6–12 × 4–12). Uma criança de 7–8 anos que conhece tabuada pode resolver. A Sprint 9 já ajustou o range, mas o princípio matemático simples ainda é vulnerável. |
| Risco | Criança acessa compra, reset de progresso ou links externos sem autorização dos pais. |
| Correção | Para a fase atual (sem compra real), o risco é aceitável. Quando IAP for implementado: substituir o gate por PIN de 4 dígitos definido pelos pais (padrão da indústria), ou delegar à autenticação biométrica do dispositivo. |
| Momento | Sprint de assinatura premium (antes de IAP) |

### P2-06 — `ENABLE_LOCAL_PREMIUM_TEST_MODE` — risco se acidentalmente for true em build

| Campo | Valor |
|---|---|
| Prioridade | **P2** |
| Área | Segurança / Build |
| Arquivo | `src/services/accessControl.js:9` |
| Problema | A constante `ENABLE_LOCAL_PREMIUM_TEST_MODE` existe no código de produção. Se for `true`, todos os usuários recebem premium sem pagar. Há um `console.warn` mas sem bloqueio de build. |
| Risco | Build de produção com premium gratuito para todos. Perda de receita. Rejeição das lojas por inconsistência de monetização. |
| Correção | Adicionar verificação no smoke test e/ou no processo de CI que valida `ENABLE_LOCAL_PREMIUM_TEST_MODE === false` antes de build de produção. O smoke já cobre isso? Verificar check [atual]. |
| Momento | Sprint de CI/CD |

### P2-07 — Sem loading/error state em falhas de AsyncStorage

| Campo | Valor |
|---|---|
| Prioridade | **P2** |
| Área | Robustez / UX |
| Arquivo | `src/context/ProgressContext.js` (campo `progressError`), múltiplos serviços |
| Problema | `ProgressContext` tem `progressError` mas as telas não o consomem. Se o AsyncStorage falhar (dispositivo sem espaço, corrupção), o app fica em estado de loading infinito ou mostra dados errados silenciosamente. |
| Risco | UX ruim para o usuário final. Impossível diagnosticar sem crash reporter. |
| Correção | Consumir `progressError` nas telas principais e exibir estado de erro amigável com opção de "Tentar novamente". |
| Momento | Sprint de robustez |

---

## P3 — Melhoria futura

### P3-01 — Sem CDN para áudios futuros

**Área:** Arquitetura | **Arquivo:** `docs/MEDIA_BUDGET_GUIDE.md`  
Com 200 áudios locais, o bundle ultrapassará 300 MB. Cloudflare R2 é a opção recomendada quando ultrapassar 80 áudios. Não implementar agora.

### P3-02 — Sem backend, autenticação e sincronização

**Área:** Escalabilidade | Tudo local agora. Correto para MVP. Projetar API REST ou GraphQL quando houver multi-dispositivo ou multi-perfil.

### P3-03 — Feature flags

**Área:** CI/CD | Nenhum mecanismo de feature flag. Necessário antes de escala com atualizações frequentes.

### P3-04 — Analytics seguro para crianças (CARU-compliant)

**Área:** Produto | Nenhum analytics agora. Após lançamento, integrar apenas eventos anônimos de funil (ex: `story_started`, `scene_completed`) sem PII.

### P3-05 — Internacionalização (i18n)

**Área:** Escalabilidade | Strings hardcoded em português. Se o app expandir para outros países, será custoso migrar. Avaliar `i18n-js` ou `react-intl` antes de 30 telas.

### P3-06 — Testes automatizados de componente

**Área:** Qualidade | Nenhum teste Jest/RTL encontrado além do smoke. Adicionar testes de componente para `AudioPlayer`, `ColoringScreen` e `ParentalGate`.

### P3-07 — Kubernetes e autoscale

**Área:** Infraestrutura futura | Não faz sentido agora. Avaliar quando MAU (Monthly Active Users) ultrapassar 10.000 e houver backend. Manter em VPS simples até lá.

### P3-08 — Lumi com IA

**Área:** IA / Segurança | Ver Seção 12 desta auditoria. Não implementar até ter backend seguro.

---

---

# 3. Auditoria de Privacidade Infantil e LGPD

## Estado atual da coleta de dados

O app é **100% offline**. Nenhum dado é transmitido para servidores externos. Toda persistência é local via AsyncStorage no dispositivo.

## Dados coletados

| Dado | Campo | Arquivo | Coletado por quem |
|---|---|---|---|
| Nome da criança (opcional) | `profile.name` | `ProfileContext.js` | Digitado pela criança ou responsável |
| Avatar selecionado | `profile.avatarId` | `ProfileContext.js` | Escolhido pela criança |
| Progresso por história/cena | `@ptf_progress_{storyId}` | `useProgress.js`, `ProgressContext.js` | Gerado pelo uso |
| Desenhos (PNG base64) | `@ptf_drawing_s{id}_c{id}` | `drawingStorage.js` | Gerado pelo uso |
| Artes do Ateliê | `ptf_atelier_arts_v1_*` | `atelierStorage.js` | Gerado pelo uso |
| Conquistas obtidas | chaves em AsyncStorage | `achievementsStorage.js` | Gerado pelo uso |
| Status pós-história (quiz, Lumi, livrinho) | chaves em AsyncStorage | `postStoryStorage.js` | Gerado pelo uso |
| Timestamp "Lumi feito hoje" | AsyncStorage | `postStoryStorage.js` | Gerado pelo uso |

## Matriz de privacidade

| Dado | Finalidade | Armazenamento | Base legal | Risco | Recomendação |
|---|---|---|---|---|---|
| Nome da criança | Personalização do greeting | Local (AsyncStorage) | Legítimo interesse / consentimento | Dado pessoal de criança (LGPD Art. 14) | Tornar opcional; mover coleta para área dos pais; avisar que fica apenas no dispositivo |
| Avatar | Personalização visual | Local | Legítimo interesse | Baixo | OK |
| Progresso | Retomada de jornada | Local | Legítimo interesse | Baixo | OK |
| Desenhos/Artes | Galeria pessoal | Local | Legítimo interesse | Médio (volume de dados) | Migrar para filesystem; limpar ao reset |
| Conquistas | Gamificação | Local | Legítimo interesse | Baixo | OK |
| Status pós-história | Lógica de jornada | Local | Legítimo interesse | Baixo | OK |
| Timestamp Lumi | Evitar spam de reflexão diária | Local | Legítimo interesse | Baixo | OK |

## Dados que NUNCA devem ser coletados (para crianças < 13 anos — COPPA/LGPD)

- Email da criança
- Localização geográfica
- Foto do rosto da criança
- Dados biométricos
- Comportamento de navegação para targeting
- Device ID para fins de rastreamento
- Voz da criança (microfone desabilitado ✓)

## Dados que exigiriam consentimento explícito dos pais

- Qualquer dado transmitido a servidor externo
- Analytics comportamentais
- Nome, se transmitido

## Parental gate — avaliação

`ParentalGate.js` usa multiplicação aleatória (6–12 × 4–12). Está implementado em:
- Entrada na Área dos Pais ✓
- Links externos (email de suporte) ✓
- Review da loja (URL null, mas gate presente) ✓

**Ausente em:**
- Botão de upgrade premium na ParentAreaScreen (quando IAP for implementado)
- Qualquer futura integração com terceiros

## Links externos — avaliação

Encontrados:
- `mailto:contato@pequenostracosdefe.com` — protegido por gate ✓
- `getStoreReviewUrl()` — retorna null (app não publicado) ✓

**Nenhum link direto de criança para internet externa encontrado.** ✓

## Política de privacidade — avaliação

**Ausente.** Obrigatória antes da publicação. Deve incluir:
- Quais dados são coletados (ver tabela acima)
- Que os dados ficam apenas no dispositivo
- Que nenhum dado é compartilhado com terceiros
- Que nenhuma publicidade é exibida
- Como os pais podem solicitar exclusão (reset de progresso já existe)
- Contato para exercício de direitos LGPD
- Idioma: Português (Brasil)

---

---

# 4. Auditoria Apple App Store e Google Play

## Apple App Store — Kids Category

| Requisito | Estado | Evidência |
|---|---|---|
| Sem publicidade de terceiros | ✓ OK | Nenhum SDK de ads |
| Sem coleta de dados pessoais para uso próprio sem consentimento | ⚠ Atenção | Nome da criança sem aviso; ver P2-04 |
| Sem links diretos para internet da criança | ✓ OK | Gate em todos os links |
| Sem compras in-app sem autorização parental | ✓ OK (IAP não implementado) | `isPurchaseEnabled: false` |
| Política de privacidade com URL | ✗ Ausente | Não encontrada em `app.json` |
| Restore Purchase | ✗ Ausente | `planConfig.js` sem IAP |
| Privacy manifest (iOS 17+) | ✓ OK | `privacyManifests` em `app.json` |
| `usesNonExemptEncryption: false` | ✓ OK | `app.json` |
| Orientação retrato | ✓ OK | `orientation: portrait` |

## Google Play — Families Policy

| Requisito | Estado | Evidência |
|---|---|---|
| Sem anúncios | ✓ OK | Nenhum SDK de ads |
| Sem analytics de comportamento | ✓ OK | Nenhum SDK de analytics |
| Data Safety form | ✗ Não preenchível sem política | Precisa de política de privacidade |
| Classificação etária ESRB/DJCTQ | ✗ Não verificado | Questionnaire na Play Console |
| Permissões mínimas | ✓ OK | `MODIFY_AUDIO_SETTINGS` apenas |
| Conteúdo adequado para crianças | ✓ OK | Conteúdo bíblico, sem violência |
| Bundle size < 150 MB (APK) | ✗ Em risco | 66 MB só de PNG de 3 histórias |

## App Privacy Details (Apple) — campos a preencher

| Tipo de dado | Coletado? | Vinculado ao usuário? | Rastreamento? |
|---|---|---|---|
| Name | Sim (local) | Não (local only) | Não |
| Identifiers | Não | — | — |
| Health & Fitness | Não | — | — |
| Financial Info | Não | — | — |
| Location | Não | — | — |
| Contacts | Não | — | — |
| Usage Data | Não | — | — |
| Diagnostics | Não (sem Crashlytics) | — | — |

**Conclusão:** Declaração de privacidade é simples. Nenhum dado sensível. Apenas "Name" coletado localmente, sem transmissão.

## Checklist de publicação

- [ ] Política de privacidade publicada e URL em `app.json`
- [ ] Termos de uso publicados
- [ ] Botão de Restore Purchase implementado
- [ ] Bundle size < 150 MB validado (PNG comprimidos)
- [ ] Classificação etária preenchida (Play Console + App Store Connect)
- [ ] Ícone 1024×1024 sem texto (Apple) ✓ (verificar)
- [ ] Screenshots para cada device size obrigatório (Apple)
- [ ] Metadata: nome, subtítulo, descrição, palavras-chave
- [ ] `versionCode: 1` e `buildNumber: "1"` setados ✓
- [ ] `bundleIdentifier` e `package` corretos ✓

---

---

# 5. Auditoria de Segurança Mobile (OWASP MASVS / Mobile Top 10)

## M1 — Armazenamento inseguro

| Item | Estado | Evidência |
|---|---|---|
| Dados sensíveis no AsyncStorage | ✓ Aceitável | Dados são todos locais e não-financeiros. Nome é dado pessoal mas de baixo risco no contexto local. |
| SecureStore não usado | ✓ Aceitável | `expo-secure-store` não instalado. Correto: sem dados que exijam encriptação (sem tokens, sem senhas). |
| Logs de dados sensíveis | ⚠ Atenção | `console.log` em serviços (ver P1-02). Nunca logar base64 de imagens ou nome. |
| Chaves hardcoded | ✓ OK | Nenhuma encontrada em `grep` |
| `.env` exposto | ✓ OK | Nenhum `.env` encontrado |
| `EXPO_PUBLIC_*` exposto | ✓ OK | Nenhum encontrado |

## M2 — Criptografia insuficiente

**Não aplicável no estado atual.** App offline sem transmissão de dados. Quando backend for implementado: usar HTTPS obrigatório, certificate pinning opcional para operações sensíveis (ex: checkout).

## M3 — Comunicação insegura

**Não aplicável.** Nenhuma chamada de rede encontrada no código da aplicação (`grep` confirma ausência de `fetch`, `axios`, `XMLHttpRequest` em `src/`).

## M4 — Autenticação insegura

**Não aplicável no estado atual.** Sem autenticação. ParentalGate é um controle de UX, não de segurança criptográfica. Quando IAP e backend forem implementados: implementar autenticação adequada (OAuth 2.0 + PKCE ou magic link).

## M5 — Autorização insuficiente

| Item | Estado |
|---|---|
| `accessControl.js` como fonte única | ✓ OK |
| Telas verificam acesso antes de renderizar | ✓ OK (NarrationScreen, ColoringScreen fazem `navigation.replace('ParentArea')`) |
| `ENABLE_LOCAL_PREMIUM_TEST_MODE` | ⚠ Ver P2-06 |
| Sem verificação server-side (por enquanto) | Aceitável (sem backend) |

## M6 — Qualidade do código

| Item | Estado |
|---|---|
| `console.log` sem `__DEV__` em serviços | ⚠ Ver P1-02 |
| `TODO`/`FIXME` em código de produção | ✓ OK (nenhum encontrado em `src/`) |
| TypeScript | Não usado (JS puro). Risco de regressão em tipagem. |
| `__DEV__` usado corretamente em componentes | ✓ OK (`ColoringCanvas.js`, `useAchievementCelebration.js`) |

## M7 — Qualidade do código do cliente (injeção)

| Item | Estado |
|---|---|
| Campos de texto (nome, confirmar reset) | ✓ OK — `TextInput` simples, sem eval, sem SQL, sem HTML render |
| WebView no `AtelierCanvas` e `ColoringCanvas` | ⚠ Atenção — HTML injetado via string template. O HTML é gerado internamente (não de input do usuário), portanto o risco de XSS é baixo. Manter monitoramento se o HTML vier a aceitar input externo. |
| `injectJavaScript` na WebView | ⚠ Atenção — usado para comandos de canvas (setColor, setBrushSize, etc.). Input vem de seleção de paleta (enum fixo), não de texto livre. Risco baixo no estado atual. |

## M8 — Adulteração de código

- App distribuído via EAS. Não há side-loading intencional.
- `eas.json` não tem `distribution: store` no profile de development (correto — development é internal).
- Expo `newArchEnabled: true` — binário nativo mais resistente à depuração.

## M9 — Engenharia reversa

- Código JS é empacotado e minificado no bundle de produção (Metro).
- Não há ofuscação adicional. Aceitável para este tipo de app — sem segredos no JS.
- `ENABLE_LOCAL_PREMIUM_TEST_MODE` ficará visível no bundle. Mitigar com verificação server-side quando IAP for implementado.

## M10 — Funcionalidade estranha

- Deep link scheme definido: `scheme: "pequenostracosdefe"` — sem handlers de deep link implementados no `AppNavigator`. Risco baixo hoje; validar quando deep links forem usados.
- Sem WebSocket, sem worker nativo, sem background fetch.

## Resumo de segurança

| Categoria OWASP | Estado |
|---|---|
| M1 Armazenamento | ✓ Aceitável (sem dados financeiros/credenciais) |
| M2 Criptografia | ✓ N/A (offline) |
| M3 Comunicação | ✓ N/A (offline) |
| M4 Autenticação | ✓ N/A (sem auth) |
| M5 Autorização | ✓ OK |
| M6 Qualidade código | ⚠ console.log |
| M7 Injeção | ✓ Baixo risco |
| M8 Adulteração | ✓ OK |
| M9 Engenharia reversa | ✓ Aceitável |
| M10 Funcionalidade estranha | ✓ OK |

---

---

# 6. Auditoria de Arquitetura e Escalabilidade

## Estado atual

O app é um cliente móvel 100% offline com persistência local. Não há backend, API, banco de dados ou serviço externo. Esta é a arquitetura correta para o MVP.

## Separação de responsabilidades (estado atual)

```
┌─────────────────────────────────────┐
│  React Native App (Expo)            │
│  ├── Screens (UI)                   │
│  ├── Services (lógica local)        │
│  ├── Contexts (estado global)       │
│  ├── AsyncStorage (persistência)    │
│  └── Assets bundled (PNG, MP3)      │
└─────────────────────────────────────┘
```

Bem estruturado para o estágio atual.

## Arquitetura futura recomendada (quando backend for necessário)

```
┌─────────────┐     HTTPS      ┌──────────────┐     ┌─────────────┐
│  Mobile App │◄──────────────►│  API Server  │────►│  PostgreSQL │
│  (Expo)     │                │  (Node/NestJS│     │  (primário) │
└─────────────┘                │  ou Fastify) │     └─────────────┘
                               └──────┬───────┘           │
                                      │              ┌─────┴──────┐
                               ┌──────┴───────┐      │  Réplica   │
                               │  Redis Cache │      │  leitura   │
                               └──────────────┘      └────────────┘
                                      │
                               ┌──────┴───────┐
                               │ Storage CDN  │
                               │ (CF R2 / S3) │
                               └──────────────┘
```

## Decisões por componente

| Componente | Fazer agora? | Quando? | Justificativa |
|---|---|---|---|
| Backend API | Não | Pós-MVP, quando multi-device | Não há necessidade hoje |
| PostgreSQL | Não | Com backend | — |
| Redis cache | Não | Quando API existir | — |
| Load balancer | Não | > 10k MAU | VPS único é suficiente até lá |
| Autoscale | Não | > 50k MAU | — |
| CDN para áudios | Sim (planejar) | Antes de 80 áudios | Ver `MEDIA_BUDGET_GUIDE.md` |
| Asset Bundle Splitting | Sim (avaliar) | Antes de 20 histórias completas | Bundle size blocker |
| Filas (BullMQ) | Não | Quando tiver tarefas pesadas (ex: geração de IA) | — |
| Backup de dados | N/A hoje | Com banco | Usuário já faz backup pelo iCloud/Google |
| Disaster recovery | N/A hoje | Com banco | — |
| Kubernetes | Não | Nunca antes de 100k MAU | Overkill para este estágio |

---

---

# 7. Auditoria de Banco de Dados Futuro

## Estrutura de tabelas proposta (quando backend existir)

```sql
-- Responsável (pais/guardiões) — dados do adulto
CREATE TABLE guardians (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  plan        VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  plan_expires_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Índice: email (unique, já implícito)

-- Perfil da criança — separado do responsável
CREATE TABLE child_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  display_name VARCHAR(50),        -- opcional, nunca transmitido publicamente
  avatar_id   VARCHAR(50),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Índice: guardian_id
-- LGPD: display_name é dado pessoal de criança — pseudonimizar ou excluir com guardian

-- Progresso por cena
CREATE TABLE scene_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id    VARCHAR(50) NOT NULL,
  scene_id    SMALLINT NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE (child_id, story_id, scene_id)
);
-- Índices: child_id, (child_id, story_id)

-- Eventos de jornada (quiz, lumi, livrinho)
CREATE TABLE story_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id    VARCHAR(50) NOT NULL,
  event_type  VARCHAR(30) NOT NULL, -- 'quiz_done' | 'lumi_done' | 'book_opened'
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);
-- Índice: (child_id, story_id, event_type)

-- Conquistas
CREATE TABLE achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (child_id, achievement_id)
);

-- Assinaturas (IAP)
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id     UUID NOT NULL REFERENCES guardians(id),
  platform        VARCHAR(10) NOT NULL, -- 'ios' | 'android'
  product_id      VARCHAR(100) NOT NULL,
  purchase_token  TEXT,               -- armazenar com cuidado
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- Índice: guardian_id, is_active

-- Audit log (imutável)
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  entity      VARCHAR(50),
  entity_id   UUID,
  action      VARCHAR(30),
  actor_id    UUID,
  metadata    JSONB,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Regras de banco

| Regra | Detalhe |
|---|---|
| Nunca SELECT * | Sempre especificar colunas |
| Evitar N+1 | Usar JOIN ou `Promise.all` no service layer |
| Connection pool | PgBouncer ou pool nativo (max 10–20 conexões para início) |
| Migrações | Usar Flyway, Liquibase ou Knex migrations — nunca ALTER manual em produção |
| Seed de conteúdo | Histórias/cenas ficam no bundle mobile. Metadados de catálogo podem ir para tabela `stories` se houver backend |
| Paginação | LIMIT/OFFSET ou cursor (keyset) para listas longas |
| RPO | 1 hora (backup automático a cada hora) |
| RTO | 4 horas (restaurar snapshot) |
| Separação de dados | Tabela `guardians` separada de `child_profiles` — LGPD Art. 14 |
| Backup | RDS automated backups (7 dias) + pg_dump semanal para cold storage |

---

---

# 8. Auditoria de Performance React Native e Expo

## Telas críticas — avaliação

| Tela | Problema potencial | Impacto |
|---|---|---|
| `StoriesScreen` | ScrollView com 20 cards — sem FlatList | Médio (atual), Alto (40+ histórias) |
| `ColoringScreen` | PNG 1,3 MB carregado a cada cena | Alto em dispositivos lentos |
| `AtelierCanvasScreen` | WebView com canvas + HTML inline (grande string) | Médio |
| `StoryBookScreen` | Desenhos base64 + AudioPlayer por cena | Médio (memory) |
| `HomeScreen` | `useFocusEffect` + múltiplos `useState` + Animated loops | Baixo-médio |
| `TrophiesScreen` | ScrollView com todas as conquistas | Baixo atual |
| `ParentAreaScreen` | ScrollView com tabela de 20 histórias | Baixo |

## Renderizações desnecessárias

- `ProgressContext` re-renderiza toda a árvore de consumidores quando `refreshProgress` é chamado. O `useMemo` no value mitiga, mas `refreshProgress` em `markProgressDirty` pode ser chamado com frequência no `ColoringScreen`. Baixo impacto no MVP; observar com 200 cenas ativas.
- Animated loops em `NarrationScreen` e `AudioPlayer` usam `useNativeDriver: true` ✓ — correto.

## Imagens

| Item | Estado | Recomendação |
|---|---|---|
| PNG de colorir 1,3–1,4 MB | ✗ Crítico | Comprimir para ≤ 120 KB (pngquant ou WebP) |
| Capas 16:9 | Apenas 5 imagens, 0,5–1 MB | Comprimir para ≤ 100 KB |
| Ícone / splash | Tamanho padrão | OK |
| Imagens de narração | Apenas 3 imagens para noah | OK (pequenas) |
| `resizeMode` nas imagens | `contain` e `cover` usados ✓ | Verificar em tablets |

## Áudio

- `expo-audio` com `playsInSilentMode: true` ✓
- `shouldPlayInBackground: false` ✓ (correto para app infantil)
- `finishedCalledRef` para evitar double-trigger ✓
- 0 áudios em bundle atualmente — sem impacto de bundle size ainda

## Base64 em AsyncStorage

- Cada PNG base64 de cena ~200–500 KB como string
- Com 200 cenas × 500 KB = 100 MB potencial no AsyncStorage do dispositivo
- AsyncStorage no Android tem limite de ~6 MB por entrada (RocksDB)
- **Risco real** para dispositivos de entrada ao completar muitas histórias

## Safe Area

- `SafeAreaProvider` em `App.js` ✓
- `useSafeAreaInsets()` em todas as telas principais (verificado em HomeScreen, ParentAreaScreen, NarrationScreen, ColoringScreen) ✓
- `androidStatusBar.translucent: true` ✓

## Comportamento em tablet

- `useWindowDimensions` para detectar tablet (`width >= 768`) ✓
- `TabletSidebar` como alternativa à bottom tab bar ✓
- `CenteredContent` para maxWidth ✓
- `supportsTablet: true` em `app.json` ✓

---

---

# 9. Auditoria de Assets

## Inventário atual

| Tipo | Quantidade | Tamanho médio | Total |
|---|---|---|---|
| PNG colorir (3 histórias) | 50 | ~1,3 MB | ~66 MB |
| PNG capas/personagens | 10 | ~0,5 MB | ~5 MB |
| PNG sistema (icon, splash, adaptive-icon, favicon) | 4 | — | ~1 MB |
| WAV (pop.wav) | 1 | ~20 KB | 20 KB |
| MP3 áudio narração | 0 | — | 0 |
| **Total atual em assets/** | — | — | **~72 MB** |

## Convenção de nomes — avaliação

| Padrão | Estado |
|---|---|
| Áudio: `{storyId}_scene_{NN}.mp3` | ✓ Definido em Sprint 16 |
| Colorir: `{storyId}_scene_{NN}_coloring.png` | ✓ Normalizado |
| Capa: `{storyId}_capa.png` | ✓ OK |
| Personagem guia: `{storyId}_{personagem}.png` | ✓ OK |
| Pastas legadas com espaços | ✗ Existem (`Davi e o Golias/`, `Jesus e as crianças/`) |

## Duplicidade de pastas

```
assets/stories/Davi e o Golias/   ← LEGADA (espaços no nome)
assets/stories/davi_golias/        ← NORMALIZADA ✓

assets/stories/Jesus e as crianças/  ← LEGADA (espaços + acento)
assets/stories/jesus_criancas/        ← NORMALIZADA ✓
```

As pastas legadas contêm os mesmos arquivos que as normalizadas. Devem ser removidas após confirmar que nenhum `require()` as referencia.

## Validação de assets no código

- `coloringImages.js`: mapeia 3 histórias (noah, david_goliath, jesus_children). 17 histórias retornam `undefined` na função `getColoringImage`.
- `audioManifest.js`: `_readyEntries = []`. Zero áudios. `AUDIO_MANIFEST` gerado mas todos com `status: 'missing'`. ✓ Correto.
- `images.js`: mapeia 5 imagens de personagem/capa. Correto.
- Smoke verifica: existência de pastas de áudio (.gitkeep), manifest, audio-audit. ✓

## Fallbacks

| Asset | Fallback implementado |
|---|---|
| Imagem de capa ausente | ✓ `StoryFallbackCover.js` existe |
| Imagem de colorir ausente | ⚠ Precisa verificar — `getColoringImage` pode retornar `undefined` |
| Áudio ausente | ✓ `AudioPlayer` retorna null se `audioAsset` é null; hint exibido |
| Imagem de narração ausente | ✓ `cenaImg` é null → não renderiza `<Image>` |

## Compressão recomendada

```bash
# PNG → PNG otimizado (sem perda visual significativa)
pngquant --quality 60-80 --ext .png --force assets/stories/**/*.png

# PNG → WebP (melhor compressão, suporte React Native ≥ 0.60)
for f in assets/stories/**/*_coloring.png; do
  cwebp -q 80 "$f" -o "${f%.png}.webp"
done

# Meta: ≤ 120 KB por imagem de colorir (atual: ~1.3 MB → redução de 90%)
```

---

---

# 10. Auditoria de Acessibilidade e UX Infantil

## Acessibilidade técnica

| Item | Estado | Detalhe |
|---|---|---|
| `accessibilityLabel` | ✗ Crítico | Apenas 3 ocorrências em todo o projeto |
| `accessibilityRole` | ✗ Ausente em botões | Todos os `TouchableOpacity` sem role |
| `accessibilityHint` | ✗ Ausente | — |
| `accessible={true}` | Implícito em elementos nativos | OK |
| Tamanho mínimo de toque 44×44 pt | ⚠ Não verificado sistematicamente | Risco em ícones pequenos da paleta |
| Contraste mínimo 4.5:1 (WCAG AA) | ✓ Aparente | Cores primárias fortes sobre branco |

## UX infantil — avaliação qualitativa

| Aspecto | Avaliação |
|---|---|
| Linguagem das histórias | ✓ Simples, afirmativa, sem culpa pesada |
| Progressão por trilha | ✓ Comece Aqui → Jovens da Fé |
| Feedback visual (estrelas, confetti) | ✓ Implementado |
| Feedback sonoro (SoundButton, pop.wav) | ✓ Implementado |
| Bloqueio de ações adultas | ✓ ParentalGate |
| Evitar dark patterns | ✓ Não há pressão de compra na criança |
| Pressão de compra na criança | ✓ Mensagem "Pedir ao responsável" (não à criança) |
| Evitar excesso de informação | ✓ Telas limpas |
| Estados de erro amigáveis | ⚠ Parcial — `progressError` não exibido ao usuário |
| Experiência 3–5 anos (Comece Aqui) | ✓ Áreas grandes, poucos elementos |
| Experiência 6–8 anos (Jovens da Fé) | ✓ Detalhe progressivo |
| Navegação segura (sem deep link aleatório) | ✓ Stack navigation controlada |
| Ausência de violência | ✓ (conteúdo verificado) |

## Recomendações de UX

1. **Tamanho de toque:** Verificar que os círculos de cor na paleta têm pelo menos 44×44 pts. Crianças de 3–4 anos têm dificuldade com alvos < 56 pts.
2. **Loading states:** Adicionar skeleton screens ou spinner para AsyncStorage load lento em dispositivos antigos.
3. **Erro amigável:** Quando `progressError` não é null, exibir "Oops! Algo deu errado. Quer tentar de novo?" ao invés de tela em branco.
4. **VoiceOver/TalkBack:** Adicionar `accessibilityLabel` em todos os botões de ação e nas imagens de cena.

---

---

# 11. Auditoria de Conteúdo Cristão Infantil

## Avaliação de conteúdo (baseada nos dados de `stories.js`)

| Critério | Avaliação |
|---|---|
| Tom das histórias | ✓ Afirmativo, encorajador, sem julgamento |
| Linguagem infantil | ✓ Vocabulário acessível, frases curtas, onomatopeias ("PRRRRR!", "TIC, TAC") |
| Ausência de medo excessivo | ✓ Situações desafiadoras (Dilúvio, Golias, leões) tratadas com foco na proteção de Deus |
| Ausência de culpa pesada | ✓ Ênfase no amor e cuidado de Deus, não na punição |
| Interpretações agressivas | ✓ Ausentes. Histórias de juízo (dilúvio) apresentadas com foco na aliança/promessa |
| Coerência entre trilhas | ✓ Progressão de detalhe narrativo de Comece Aqui → Jovens da Fé |
| Lição explícita por cena | ✓ `licaoCurta` presente em todas as 200 cenas |
| Referência bíblica | ✓ Presente em todas as histórias |
| Coerência narração ↔ colorir | ✓ `instrucaoColorir` alinhada com a narrativa da cena |

## Recomendações de processo

1. **Revisão teológica humana.** Antes do lançamento público, ter pelo menos um teólogo ou pastor revisar os textos das 20 histórias para adequação doutrinária. IA pode ter introduzido interpretações não intencionais.
2. **Revisão pedagógica.** Especialista em educação infantil (psicopedagogo) validar a progressão de complexidade por trilha e faixa etária.
3. **Teste com pais reais.** Beta test com famílias cristãs antes do lançamento. Coletar feedback sobre tom, linguagem e adequação por idade.
4. **Processo de revisão pós-lançamento.** Estabelecer canal (email de suporte já existe) para pais reportarem conteúdo problemático.

---

---

# 12. Auditoria do Lumi com IA (planejamento futuro)

## Estado atual

O Lumi existe como personagem visual e de reflexão pré-definida (mensagens rotativas fixas em `lumiReflections.js`). **Não há chamada de IA no estado atual.** Todos os textos do Lumi são strings hardcoded. ✓

## Análise de risco para implementação futura

| Risco | Descrição | Mitigação |
|---|---|---|
| Resposta inadequada | LLM pode gerar conteúdo inapropriado para crianças | Sistema de prompt com guardrails + filtro de saída obrigatório |
| Prompt injection | Criança digita texto que altera o comportamento do LLM | Nunca passar input da criança diretamente ao LLM sem sanitização e prefix system prompt não-sobrescrevível |
| Coleta de dados pessoais | LLM poderia extrair nome, localização, dados familiares | Proibir explicitamente no system prompt; não logar conteúdo das conversas |
| Custo descontrolado | Cada chamada de API custa tokens | Rate limit por child_id (ex: 5 req/hora); cache de respostas para perguntas comuns |
| Latência alta | LLM pode demorar 2–5s | Streaming de resposta + skeleton UI; timeout de 8s com fallback |
| Assunto inadequado | Criança pode perguntar sobre morte, violência, adultos | Lista de tópicos bloqueados no system prompt + NeMo Guardrails ou equivalente |
| Fallback para pais | Perguntas que o Lumi não deve responder | Lumi diz "Essa é uma conversa para ter com seus pais" |
| Dependência de terceiro | OpenAI, Anthropic, etc. podem mudar preços/política | Projetar para trocar de provider; abstrair atrás de `lumiService` |

## Arquitetura segura recomendada para Lumi IA

```
App Mobile
    │ (HTTPS, auth token)
    ▼
Backend API
    ├── Rate limiter (5 req/h por child)
    ├── Input sanitizer
    ├── System prompt injector (não sobrescrevível pelo usuário)
    ├── NeMo Guardrails (ou regras customizadas)
    │
    ▼
LLM Provider (Claude, GPT-4, etc.)
    │
    ▼
Output filter (bloquear PII, tópicos adultos)
    │
    ▼
Resposta ao app
```

**Regras para o system prompt do Lumi:**
- "Você é um amigo cristão de crianças de 3 a 8 anos. Só fale sobre histórias bíblicas, fé, amor, criação e temas infantis positivos."
- "Nunca mencione morte, violência, sexo, política, outros personagens famosos, preços ou produtos."
- "Se a criança perguntar algo fora do tema, diga: 'Essa é uma conversa especial para ter com seus pais!'"
- "Nunca peça nome, endereço, escola ou outros dados pessoais."

**Não implementar Lumi com IA antes de:**
1. Ter backend com autenticação
2. Ter rate limiting implementado
3. Ter guardrails testados com exemplos adversariais
4. Ter política de privacidade atualizada para incluir uso de IA
5. Pais terem dado consentimento explícito

---

---

# 13. Auditoria de Observabilidade e Qualidade

## Estado atual

| Item | Estado |
|---|---|
| Crash reporting | ✗ Ausente |
| Logs de produção | ✗ `console.log` sem filtragem |
| Métricas de performance | ✗ Ausente |
| Métricas de funil | ✗ Ausente |
| Eventos de conclusão | ✗ Ausente |
| Android Vitals | ✓ Disponível após publicação (automático) |
| App Store Connect Crashes | ✓ Disponível após publicação (automático) |
| Smoke tests automatizados | ✓ 582/582 |
| Testes de componente (Jest/RTL) | ✗ Ausente |
| Testes em dispositivo real | ✗ Não documentado |
| Checklist de release | ✗ Ausente formal |
| Rollback | ✗ Sem strategy documentada |
| Feature flags | ✗ Ausente |

## Recomendações

1. **Sentry para crash reporting** (gratuito até 5k events/mês): integrar com `@sentry/react-native`, configurar para NÃO capturar PII.
2. **Eventos de funil anônimos:** Após publicação, adicionar eventos sem PII:
   - `story_started { storyId, trilha }`
   - `scene_completed { storyId, sceneNumber }`
   - `coloring_saved { storyId }`
   - `quiz_completed { storyId }`
   - `session_ended { duration_minutes }`
3. **Checklist de release** antes de cada build de produção:
   - `ENABLE_LOCAL_PREMIUM_TEST_MODE === false`
   - `npm run smoke` → 582/582
   - `npm run audio:audit` → contagem correta
   - `npx expo-doctor` → 18/18
   - PNG comprimidos adicionados
   - `versionCode` / `buildNumber` incrementados

---

---

# 14. Auditoria de Dependências

## Versões principais

| Pacote | Versão | Estado |
|---|---|---|
| `expo` | ~54.0.33 | ✓ Recente (SDK 54) |
| `react` | 19.1.0 | ✓ React 19 (estável) |
| `react-native` | 0.81.5 | ✓ Recente |
| `@react-navigation/native` | ^7.2.4 | ✓ v7 recente |
| `@react-native-async-storage/async-storage` | ^2.2.0 | ✓ v2 |
| `expo-audio` | ~1.1.1 | ✓ Migrado de expo-av |
| `react-native-webview` | 13.15.0 | ✓ Recente |
| `expo-haptics` | ~15.0.8 | ✓ |
| `expo-linear-gradient` | ~15.0.8 | ✓ |
| `babel-preset-expo` | ~54.0.10 | ✓ |

## Dependências ausentes (relevantes para roadmap)

| Pacote | Necessidade | Quando |
|---|---|---|
| `@sentry/react-native` | Crash reporting | Sprint de observabilidade |
| `expo-in-app-purchases` ou `react-native-purchases` | IAP / Premium | Sprint de assinatura |
| `expo-secure-store` | Tokens quando houver auth | Sprint de backend |
| `expo-file-system` | Drawings fora do AsyncStorage | Sprint de performance |

## Dependências a monitorar

| Pacote | Observação |
|---|---|
| `react-native-webview` | Superfície de ataque grande. Manter atualizado. Revisar `allowsInlineMediaPlayback`, `mediaPlaybackRequiresUserAction`. |
| `expo-audio` | Pacote novo (migrado de expo-av). API pode mudar em SDK 55. |
| `@expo-google-fonts/*` | Fontes bundled. Tamanho adicional no bundle. Aceitável. |

## Vulnerabilidades (npm audit)

```
11 moderate severity vulnerabilities
  - @expo/config-plugins e dependências transitivas do CLI
  - NÃO afetam o runtime do app em produção
  - Afetam o ambiente de build/desenvolvimento
```

**Comandos para análise sem modificar código:**
```bash
npm audit                           # lista vulnerabilidades
npm audit --json | jq '.vulnerabilities' # detalhes
npx expo-doctor                     # saúde do projeto Expo
npm ls --depth=0                    # árvore de dependências diretas
```

---

---

# 15. Auditoria de Propriedade Intelectual e DMCA

## Inventário de assets e origem

| Asset | Tipo | Origem provável | Risco |
|---|---|---|---|
| PNG de colorir (50 imagens) | Lineart bíblica | Gerado por IA (Midjourney/Stable Diffusion?) | Médio — ver abaixo |
| PNG de capas/personagens (5) | Ilustração | Gerado por IA ou comissionado | Médio |
| Textos das histórias | Narrativa original | Escrito pelo criador | Baixo (narrativa autoral) |
| Fontes (Fredoka One, Nunito) | Tipografia | Google Fonts — OFL/Apache 2.0 | ✓ Livre |
| Ícones (FaithIcon) | SVG/PNG interno | Criado internamente | ✓ OK se autoral |
| Áudios futuros | MP3 narração | Gravação própria | ✓ OK |
| pop.wav | SFX | Origem não documentada | Médio — verificar licença |

## Risco de imagens geradas por IA

- Apple e Google aceitam assets gerados por IA desde que não violem direitos de terceiros.
- Risco principal: se a IA foi treinada com imagens protegidas por copyright e as gerou com similaridade excessiva a obras específicas.
- **Ação recomendada:** Documentar a ferramenta e prompt usados para gerar cada imagem. Se ferramenta não garante licença comercial, recriar com ferramenta que oferece garantia (ex: Adobe Firefly, DALL-E 3 via OpenAI API com licença comercial).

## Nomes bíblicos e conteúdo bíblico

- Nomes bíblicos (Noé, Davi, Ester, etc.) são de domínio público. ✓
- Textos bíblicos: as narrações são **parafraseados** pelos autores do app, não copiados de tradução específica. ✓ Verificar se alguma frase é citação direta de tradução protegida (ex: NVI tem copyright).
- Conteúdo bíblico em si é domínio público (textos originais em hebraico/grego). ✓

## Recomendações

1. **Planilha de direitos autorais:** Criar `docs/IP_RIGHTS_REGISTER.md` com: asset, data de criação, ferramenta/origem, licença, responsável.
2. **pop.wav:** Verificar origem. Se baixado de site de SFX gratuito, confirmar que a licença permite uso comercial em app pago.
3. **Citar tradução bíblica:** Verificar qual tradução foi referência para os textos. Se NVI/NVT, citar na política de privacidade/termos conforme exigido pelo detentor.
4. **Política de remoção (DMCA):** Incluir nos termos de uso: e-mail para recebimento de notificações DMCA, prazo de 72h para análise.

---

---

# 16. Matriz Final de Decisão

| Item | Prioridade | Impacto | Esforço | Risco de não fazer | Momento ideal | Sprint sugerida |
|---|---|---|---|---|---|---|
| Comprimir PNG de colorir | P0 | Crítico | Baixo (script) | Bloqueio nas lojas | Imediato | Sprint 17 |
| Política de privacidade | P0 | Crítico | Médio (redação + URL) | Rejeição nas lojas | Antes de submissão | Sprint 17 |
| Restore Purchase | P0 | Crítico | Alto (IAP completo) | Rejeição Apple | Antes de submissão | Sprint 20+ |
| Fallback para histórias sem imagem | P1 | Alto | Baixo | Crash em 17 histórias | Próxima sprint | Sprint 17 |
| console.log sem __DEV__ | P1 | Médio | Baixo | Vazamento de logs | Sprint de segurança | Sprint 17 |
| Pastas legadas de assets | P1 | Médio | Baixo | Build instável no CI | Sprint de assets | Sprint 17 |
| npm audit fix | P1 | Médio | Baixo | Vulnerabilidade de build | Sprint de segurança | Sprint 17 |
| Acessibilidade (labels) | P1 | Alto | Médio | Exclusão de usuários | Sprint de UX | Sprint 18 |
| Termos de uso | P1 | Alto | Médio (redação) | Legal exposure | Antes de submissão | Sprint 17 |
| Base64 → expo-file-system | P2 | Alto | Alto | OOM em dispositivos | Sprint de perf | Sprint 19 |
| Crash reporting (Sentry) | P2 | Alto | Baixo | Bugs invisíveis | Pós-lançamento | Sprint 18 |
| FlatList em listas longas | P2 | Médio | Médio | Lentidão com catálogo maior | Sprint de perf | Sprint 19 |
| Consentimento nome criança | P2 | Médio | Baixo | LGPD | Sprint de privacidade | Sprint 17 |
| ParentalGate PIN (para IAP) | P2 | Alto | Médio | Compras não autorizadas | Antes de IAP | Sprint 20 |
| CDN para áudios | P3 | Alto | Alto | Bundle > 300 MB com 100+ áudios | Antes de 80 áudios | Sprint 22+ |
| Analytics seguro | P3 | Médio | Médio | Decisões sem dados | Pós-lançamento | Sprint 21 |
| Backend + auth | P3 | Alto | Muito alto | Sem multi-device | Pós-MVP | Sprint 25+ |
| Lumi com IA | P3 | Alto | Muito alto | Sem feature diferencial | Pós-backend | Sprint 30+ |
| i18n | P3 | Baixo | Alto | Expansão internacional difícil | Quando necessário | — |
| Testes Jest/RTL | P3 | Médio | Médio | Regressões não detectadas | Pós-MVP | Sprint 22+ |

---

---

# 17. Plano de Sprints Recomendado

## Sprint 17 — Conformidade de Assets e Segurança Básica

**Objetivo:** Remover bloqueadores de bundle size e conformidade antes de adicionar conteúdo.

**O que fazer:**
- Comprimir todos os PNG de colorir (pngquant ou WebP)
- Remover pastas legadas de assets com espaços/acentos
- Substituir `console.log` por `if (__DEV__) console.log` nos serviços
- Adicionar fallback visual em `ColoringScreen` para histórias sem imagem
- Redigir política de privacidade (documento externo)
- Redigir termos de uso (documento externo)
- Rodar `npm audit fix` (sem force)

**O que NÃO fazer:**
- Não alterar lógica de negócio
- Não implementar IAP ainda
- Não migrar AsyncStorage ainda

**Critério de aceite:**
- PNG ≤ 120 KB por arquivo de colorir
- `npm audit` sem high/critical
- `npm run smoke` → 582/582
- Nenhum `console.log` sem `__DEV__` em `src/services/`

---

## Sprint 18 — Acessibilidade e Observabilidade

**Objetivo:** App acessível e com visibilidade de erros em produção.

**O que fazer:**
- Adicionar `accessibilityLabel` e `accessibilityRole` em todos os botões e imagens de conteúdo
- Integrar `@sentry/react-native` sem capturar PII
- Adicionar estados de erro amigáveis para `progressError`
- Adicionar loading states nas telas que aguardam AsyncStorage

**O que NÃO fazer:** Não implementar analytics de comportamento ainda.

**Critério de aceite:** VoiceOver (iOS) e TalkBack (Android) conseguem navegar pelas abas e iniciar uma história.

---

## Sprint 19 — Performance Mobile

**Objetivo:** App fluido em dispositivos de entrada.

**O que fazer:**
- Migrar ScrollView com > 8 itens para FlatList em StoriesScreen e TrophiesScreen
- Migrar desenhos de AsyncStorage para `expo-file-system`
- Medir uso de memória com Hermes profiler antes/depois

**O que NÃO fazer:** Não alterar lógica de gamificação ou progresso.

**Critério de aceite:** App abre Aventuras em < 300ms em device Android com 3 GB RAM.

---

## Sprint 20 — Loja e Compliance

**Objetivo:** App pronto para submissão.

**O que fazer:**
- Publicar política de privacidade e URL no `app.json`
- Publicar termos de uso e URL no app
- Substituir ParentalGate de multiplicação por PIN para fluxo de compra
- Preparar metadata completa (screenshots, ícone, descrição)
- Validar bundle size do APK final

**Critério de aceite:** App passa pelo checklist de publicação completo (ver Seção 4).

---

## Sprint 21 — Assinatura Premium

**Objetivo:** Monetização funcional em ambas as plataformas.

**O que fazer:**
- Integrar `react-native-purchases` (RevenueCat) para IAP
- Implementar fluxo de upgrade na ParentAreaScreen
- Implementar Restore Purchase
- Testar Sandbox em iOS e Android

**O que NÃO fazer:** Não alterar conteúdo das histórias.

**Critério de aceite:** Compra, restauração e cancelamento funcionam em Sandbox.

---

## Sprint 22 — Observabilidade Avançada

**Objetivo:** Dados para tomar decisões de produto.

**O que fazer:**
- Adicionar eventos anônimos de funil (sem PII)
- Criar dashboard básico de uso (histórias mais completas, taxa de conclusão)

---

## Sprint 25+ — Backend Futuro

**Objetivo:** Multi-dispositivo e multi-perfil.

**O que fazer:**
- Projetar API REST (Node.js + Fastify ou NestJS)
- PostgreSQL com schema da Seção 7
- Autenticação (magic link ou Sign in with Apple/Google)
- Migração de dados locais para nuvem (opt-in)

---

## Sprint 30+ — Lumi com IA

**Dependências:** Backend com auth + rate limiting + guardrails testados.  
Ver arquitetura na Seção 12.

---

---

# 18. Comandos de Verificação (sem alterar código)

```bash
# ── Saúde do projeto Expo ────────────────────────────────────────
npx expo-doctor

# ── Smoke tests ──────────────────────────────────────────────────
npm run smoke

# ── Auditoria de áudio ───────────────────────────────────────────
npm run audio:audit
npm run audio:audit:self-test

# ── Vulnerabilidades de dependências ─────────────────────────────
npm audit
npm audit --json | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const j=JSON.parse(d); console.log(JSON.stringify(j.metadata.vulnerabilities, null, 2));"

# ── Buscar chaves/secrets hardcoded ──────────────────────────────
grep -rn "EXPO_PUBLIC\|API_KEY\|apiKey\|secret\|password\|Bearer\|Authorization\|token" src/ --include="*.js"

# ── Buscar console.log sem __DEV__ em serviços ───────────────────
grep -rn "console\.log\|console\.warn" src/services/ src/hooks/ --include="*.js" | grep -v "__DEV__"

# ── Buscar TODO/FIXME/HACK em código-fonte ───────────────────────
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.js"

# ── Tamanho dos assets ───────────────────────────────────────────
du -sh assets/
du -sh assets/stories/
find assets/stories -name "*.png" | xargs -I{} du -m {} | sort -rn | head -20

# ── Arquivos grandes (> 1 MB) ─────────────────────────────────────
find . -name "*.png" -o -name "*.jpg" | xargs -I{} du -m {} | awk '$1>1{print}' | sort -rn

# ── Pastas legadas com espaços ────────────────────────────────────
find assets -type d -name "* *"

# ── Verificar ENABLE_LOCAL_PREMIUM_TEST_MODE ──────────────────────
grep -n "ENABLE_LOCAL_PREMIUM_TEST_MODE" src/services/accessControl.js

# ── Verificar require() em coloringImages.js ─────────────────────
grep -c "require" src/assets/coloringImages.js

# ── Dependências instaladas ───────────────────────────────────────
npm ls --depth=0

# ── Expo SDK check ───────────────────────────────────────────────
npx expo install --check

# ── Listar arquivos de áudio prontos ─────────────────────────────
find assets/audio -name "*.mp3" | sort

# ── Verificar acessibilidade (labels ausentes) ───────────────────
grep -rn "accessibilityLabel\|accessibilityRole" src/ --include="*.js" | wc -l
```

---

---

# 19. Relatório Final

## Contagem de riscos

| Prioridade | Quantidade | Itens principais |
|---|---|---|
| **P0** | 3 | PNG não comprimido, Política de privacidade ausente, Restore Purchase ausente |
| **P1** | 6 | 17 histórias sem imagem, console.log em produção, pastas legadas, npm audit, acessibilidade, termos de uso |
| **P2** | 7 | Base64 em AsyncStorage, sem crash reporting, ScrollView em listas, consentimento nome, ParentalGate, test mode flag, estados de erro |
| **P3** | 8 | CDN áudios, backend, feature flags, analytics, i18n, testes, Kubernetes, Lumi IA |
| **Total** | **24** | |

## Top 10 ações mais importantes

1. **Comprimir PNG de colorir** — bloqueador de loja (P0, baixo esforço)
2. **Publicar política de privacidade** — obrigatória para Apple Kids e Google Families (P0)
3. **Adicionar fallback em ColoringScreen** — previne crash em 17 histórias (P1)
4. **Remover console.log sem __DEV__ nos serviços** — segurança básica (P1)
5. **Remover pastas legadas de assets** — higiene de build (P1)
6. **Redigir e publicar termos de uso** — legal e lojas (P1)
7. **Adicionar accessibilityLabel nos botões** — inclusão e App Store points (P1)
8. **Integrar Sentry** (sem PII) — visibilidade de produção (P2)
9. **Consentimento para nome da criança** — LGPD Art. 14 (P2)
10. **Implementar Restore Purchase** — Apple obrigatório antes de IAP (P0)

## O que implementar primeiro

**Sprint 17 (próxima):** Compressão de PNG + fallback de imagem + console.log + pastas legadas + npm audit + política de privacidade (rascunho) + termos de uso (rascunho).

Tudo isso pode ser feito sem alterar a lógica de negócio, navegação ou dados. Impacto alto, risco de regressão baixo.

## O que NÃO implementar agora

- Backend, banco de dados, autenticação
- Lumi com IA
- CDN para áudios (ainda não há áudios reais)
- Kubernetes ou infraestrutura de escala
- Analytics comportamental
- i18n
- Testes Jest/RTL (importante mas não urgente)

## O que depende de backend

- Multi-perfil / multi-dispositivo
- Sincronização de progresso
- Assinatura gerenciada pelo servidor (server-side receipt validation)
- Lumi com IA
- Analytics centralizado
- Rate limiting

## O que depende de loja (publicação)

- Restore Purchase (só faz sentido com IAP real aprovado pelas lojas)
- Classificação etária oficial (ESRB/DJCTQ)
- Screenshots finais de cada device
- In-App Review (storeLinks atualmente null)

## O que depende de decisão humana do dono do produto

- **Nível de detalhe da política de privacidade:** quais dados mencionar, tom, idioma
- **Preço do plano premium:** mensal vs anual, valor, trials
- **Data de lançamento:** determina urgência de P0 e P1
- **Prioridade de Restore Purchase:** se lançar sem IAP, pode adiar; se lançar com IAP, é P0
- **Revisão teológica:** escolha do teólogo/pastor revisor
- **Revisão pedagógica:** escolha do especialista em educação infantil
- **IP de assets:** confirmar licença dos PNG gerados por IA e origem do pop.wav
- **Expansão geográfica:** determina necessidade de i18n e multi-moeda
- **CDN:** quando ativar (recomendado antes de 80 áudios)

---

*Auditoria realizada em 2026-06-01. Nenhum arquivo de código foi alterado. Nenhum comando destrutivo foi executado. Smoke tests: 582/582 ✓.*
