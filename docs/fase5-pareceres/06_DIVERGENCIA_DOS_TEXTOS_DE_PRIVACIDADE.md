# Fase 5 · Bloco 6 — Divergência factual dos textos de privacidade da Área dos Pais

**Criado em 2026-08-07 · documento de registro · nenhuma linha de runtime alterada**

> **ESCOPO AUTORIZADO PELO FUNDADOR (2026-08-07, §6 da decisão do Bloco 5):** registrar (a) a
> divergência factual dos textos de privacidade; (b) a redação futura recomendada; (c) o risco
> correspondente existente; (d) a Fase 7 como proprietária da implementação; (e) a necessidade de
> validação visual futura. Determinação literal: **"Não alterar `ParentAreaScreen.js`."** ·
> **"Nenhuma alteração de runtime."**
>
> **`ParentAreaScreen.js` não foi alterado.** Nenhum arquivo de `src/` foi alterado. Este bloco é
> inteiramente documental.

---

## 0. O que este bloco é, e o que ele não é

| | |
|---|---|
| **É** | o registro auditável de que seis textos exibidos ao responsável na Área dos Pais afirmam algo que o runtime não sustenta, com a redação substituta recomendada e o dono da correção |
| **Não é** | a correção. A correção é da **Fase 7**, é código, e código não se toca na Fase 5 |
| **Não é** | a criação de um risco novo. O risco já existe: **`P-149`**, criado no Bloco 0 desta mesma fase, com prova de deduplicação já registrada |
| **Não é** | validação visual. Nenhuma tela foi aberta. A validação visual é futura e obrigatória (§6) |

---

## 1. O risco proprietário já existe: `P-149`

O fundador determinou registrar *"o risco correspondente existente **ou** `P-149` se a deduplicação já
tiver demonstrado necessidade"*. A condição está satisfeita e o resultado é o primeiro ramo: **não se
cria código novo, porque `P-149` já existe.**

| Campo | Valor registrado na matriz |
|---|---|
| Código | **`P-149`** — `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` linha 682 |
| Criado em | **Fase 5, Bloco 0** (§29.1 da matriz) |
| Natureza | **PRIVACIDADE** |
| Seção | UI E RESPONSIVIDADE |
| Status | **ABERTO** |
| Severidade | **ALTO** |
| Fase de implementação | **7** |
| Relação | `P-92` |
| Validação | `VFP` · `TEL` |
| Product Lock | **INFORMA O PRODUCT LOCK** |
| Lançamento | **PODE BLOQUEAR LANÇAMENTO** |

**Prova de deduplicação, já registrada em §29.1 da matriz** (não repetida aqui, apenas referenciada):
os candidatos `P-92`, `P-64`, `P-65`, `P-144`, `P-145`, `P-85`, `P-120` a `P-134`, `P-137` e `P-138`
foram examinados e **rejeitados** como capa deste risco antes de `P-149` ser criado.

**Consequência para este bloco:** nenhum código de risco é criado. Este documento **detalha e amplia
a base factual de `P-149`** — que citava quatro linhas — para as **seis** linhas efetivamente
medidas, e acrescenta a redação substituta recomendada.

---

## 2. A divergência factual — os seis textos, verbatim

Todos lidos **somente leitura** em `src/screens/ParentAreaScreen.js` no commit `2066950`.

| # | Linha | Texto exibido ao responsável (literal) |
|---:|---:|---|
| 1 | `:890` | *"Este app salva apenas dados locais neste aparelho. **Nada é enviado automaticamente para a internet.**"* |
| 2 | `:896` | *"Este app salva apenas dados locais. Os dados ficam neste aparelho e **nada é enviado automaticamente para a internet**. O app funciona sem login e o responsável pode apagar o progresso quando quiser."* |
| 3 | `:911` | *"🔒 O app não pede e não armazena email, telefone, idade, localização ou senha da criança. Todos os dados ficam apenas neste aparelho. **Nenhuma informação é transmitida para servidores externos.**"* |
| 4 | `:952` | *"Quando houver recursos de compartilhamento ou envio externo, o responsável será avisado antes. **Por enquanto, tudo funciona só com dados locais neste aparelho.**"* |
| 5 | `:1104` | *"Sem login, sem cadastro e sem coleta de dados pessoais da criança. **Tudo fica apenas neste aparelho.** Para dúvidas sobre privacidade, fale com a gente:"* |
| 6 | `:1280` | *"Recurso em preparação para turmas, professores e encontros infantis… Tudo fica salvo apenas neste aparelho — **sem internet obrigatória**, sem login."* |

**Ampliação em relação a `P-149`:** a linha original de `P-149` cita `:890`, `:896`, `:911` e `:1104`.
Os textos **`:952`** e **`:1280`** são acréscimo medido neste bloco. `:1280` é o menos grave dos seis
— *"sem internet obrigatória"* é **verdadeiro**, porque o download é opcional — e está listado por
completude, não por erro.

### 2.1 A distinção obrigatória, transcrita de `P-149`

> *"**Não enviar dados pessoais da criança é verdadeiro e verificável; não realizar tráfego de rede é
> falso.** A requisição é um GET sem corpo e sem identificador de usuário na carga de saída."*

Esta distinção é o eixo de todo o bloco. **A promessa de privacidade do produto é verdadeira. A
descrição técnica que a acompanha é falsa.** Corrigir a descrição **não enfraquece** a promessa — a
torna sustentável sob auditoria.

---

## 3. O que o runtime realmente faz — as superfícies de rede medidas

Todas verificadas somente leitura no commit `2066950`.

| # | Superfície | Arquivo e linha | Natureza | Estado hoje |
|---:|---|---|---|---|
| 1 | **Manifesto global de conteúdo** | `globalManifestService.js:211` — `await fetch(trimmed, { signal })`, tempo limite de 10 s por `AbortController` | **GET, sem corpo, sem identificador de usuário na carga de saída** | ativo quando `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` existir |
| 2 | **Download de pacote de história** | `packDownloadService.js:520` e `:611` — `FileSystem.createDownloadResumable(...)` | GET de manifesto e de arquivos de cena | mesmo gatilho da superfície 1 |
| 3 | **Laboratório de packs (QA)** | `packSandboxDevService.js:172`, `:193` | GET, sandbox `david_goliath` | **interno**, atrás do portão de ferramentas internas |
| 4 | **RevenueCat** | `entitlementSource.js:51` `configureRevenueCat()` · `:99-100` | SDK de assinatura, superfície **adulta** | **inerte**: *"Sem chave pública → NÃO configura"*; `:99` retorna `null` (free) sem chave |
| 5 | **Assets empacotados** | `Asset.fromModule(...).downloadAsync()` — **8 ocorrências** — mais `asset.downloadAsync()` em `ColoringCanvas.js:719` e `packSandboxDevService.js:77` · `Image.prefetch` em `ColoringScreen.js:759` | aquecimento de assets do próprio bundle | em build autônomo os assets são **embarcados**; em Expo Go / dev vêm do servidor de desenvolvimento |

**`ColoringCanvas.js:732` (`await fetch(localUri)`) NÃO é rede** — lê um arquivo local do aparelho.

### 3.1 O fato que muda a redação recomendada: o download é iniciado pela família

Verificado neste bloco, e **não** registrado em `P-149`:

- `useStoryPackDownload.js:144` — `const download = useCallback(async () => { ... })`; a função
  **retorna antes de tocar a rede** quando `!GLOBAL_MANIFEST_URL` (`:150-165`), gravando
  `failureStage: 'config'` e `networkState: 'nao_consultada'`.
- `StoryDetailScreen.js:166` — `const packDownload = useStoryPackDownload(story.id);`
- `StoryDetailScreen.js:475` — `onPress={packDownload.uiState === 'error' ? packDownload.retry : packDownload.download}`,
  rótulo **"Baixar história (usar offline)"**, rótulo de acessibilidade *"Baixar história para usar
  offline"*.
- **`grep -n "download()" src/screens/StoryDetailScreen.js` não retorna nada.** Não existe
  `useEffect` que dispare o download sozinho.

**Consequência normativa:** o tráfego é **iniciado pela pessoa**, atrás de um botão rotulado, e não é
automático. Isso significa que a frase honesta **não precisa ser assustadora**. O texto substituto
pode continuar amigável e continuar verdadeiro.

### 3.2 O que permanece rigorosamente verdadeiro nos seis textos

Nada aqui precisa ser desfeito, e a redação futura **tem de preservar**:

1. não há login nem cadastro;
2. o app não pede nem armazena email, telefone, idade, localização ou senha da criança;
3. progresso, desenhos e galeria ficam no aparelho (AsyncStorage + `expo-file-system`);
4. **nenhum dado pessoal da criança sai do aparelho** — verificável: as requisições são GET sem corpo
   e sem identificador de usuário na carga de saída;
5. não existe analytics, não existe crash reporting, não existe envio de evento (estado medido na
   Fase 4E §8.1 e reconfirmado no Bloco 5);
6. o responsável pode apagar o progresso quando quiser.

### 3.3 O que é falso, e por quê

| Afirmação | Por que é falsa |
|---|---|
| *"Nada é enviado automaticamente para a internet"* (`:890`, `:896`) | ambígua no melhor caso. Uma requisição HTTP **sai** do aparelho — cabeçalhos, endereço IP e horário chegam ao servidor de conteúdo. A palavra *"automaticamente"* salva parcialmente a frase (o download é iniciado pela família), mas *"nada é enviado"* não se sustenta |
| *"Nenhuma informação é transmitida para servidores externos"* (`:911`) | **a mais grave das seis.** É categórica, não tem a ressalva de *"automaticamente"*, e é diretamente contrariada por `globalManifestService.js:211` |
| *"Por enquanto, tudo funciona só com dados locais neste aparelho"* (`:952`) | falsa para o conteúdo: histórias podem ser baixadas de um endereço remoto declarado em três perfis do `eas.json` |
| *"Tudo fica apenas neste aparelho"* (`:1104`) | verdadeira quanto aos **dados da criança**; falsa como descrição do funcionamento do app, que busca conteúdo remoto |

### 3.4 O endereço remoto está em três perfis, não em um

`eas.json` — verificado somente leitura, **não alterado**:

| Perfil | Linha | `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` |
|---|---:|---|
| `preview` | 24 | `https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json` |
| `preview-criador` | 43 | idem |
| **`production`** | 48 | idem |

Os cinco perfis do arquivo são `development`, `preview`, `preview-criador`, `production` e
`screenshot`. **`P-149` citava apenas o perfil `production`; os outros dois são acréscimo deste
bloco.** O `.env` local (linha 29) também define a variável e **não é versionado**
(`git ls-files .env` vazio) — o que significa que **em desenvolvimento o comportamento depende de um
arquivo que não está no repositório**, e portanto não pode ser inferido do histórico.

---

## 4. Redação futura recomendada

**Isto é uma recomendação documental. Nada foi escrito em `ParentAreaScreen.js`.** A Fase 7 decide a
redação final; o que este bloco fixa é o **conteúdo obrigatório** que a redação tem de conter.

### 4.1 Os cinco requisitos que qualquer redação substituta tem de cumprir

| # | Requisito |
|---:|---|
| 1 | **preservar a distinção de `P-149`**: dizer com clareza que os dados da criança não saem do aparelho, sem afirmar que o app não usa a internet |
| 2 | **dizer o que sai**: uma requisição para buscar conteúdo, sem nome, sem login, sem identificador da criança |
| 3 | **dizer quando sai**: apenas quando alguém tocar em "Baixar história", nunca sozinho |
| 4 | **não assustar e não prometer demais**: linguagem de responsável, sem jargão jurídico e sem categórico que a auditoria derrube |
| 5 | **ser verificável**: cada frase tem de ter uma linha de código que a sustente |

### 4.2 Redação recomendada, texto a texto

| # | Linha atual | Recomendação de conteúdo |
|---:|---:|---|
| 1 | `:890` (dica da seção) | *"Os dados da criança ficam neste aparelho. O app só usa a internet quando alguém pede para baixar uma história."* |
| 2 | `:896` | *"O progresso, os desenhos e a galeria ficam guardados neste aparelho. O app funciona sem login e o responsável pode apagar o progresso quando quiser. A internet é usada apenas para baixar histórias, quando alguém toca em 'Baixar história' — e mesmo aí nenhum dado da criança é enviado."* |
| 3 | `:911` (a mais grave) | *"🔒 O app não pede e não armazena email, telefone, idade, localização ou senha da criança. Nada do que a criança faz, cria ou escreve sai deste aparelho. Ao baixar uma história, o app pede o arquivo ao servidor de conteúdo — um pedido sem nome, sem login e sem identificador da criança."* |
| 4 | `:952` | *"Hoje não existe compartilhamento nem envio de dados da criança. Se um recurso desses passar a existir, o responsável será avisado antes."* — remover *"tudo funciona só com dados locais"* |
| 5 | `:1104` | *"Sem login, sem cadastro e sem coleta de dados pessoais da criança. Para dúvidas sobre privacidade, fale com a gente:"* — remover *"Tudo fica apenas neste aparelho"*, que já é dito corretamente acima |
| 6 | `:1280` | **manter** — *"sem internet obrigatória"* é verdadeiro |

### 4.3 Três frases que a redação futura **não** pode conter

1. *"Nenhuma informação é transmitida para servidores externos"* — categórica e falsa.
2. *"O app não usa a internet"* — falsa.
3. *"Seus dados são anônimos"* — vocabulário proibido pela Fase 4E e pelo Bloco 5 §0.4; a designação
   correta é *"telemetria minimizada e não identificada na origem, agregada e anonimizada no
   processamento"*, e nem essa se aplica aqui, porque **nenhuma telemetria existe**.

### 4.4 Coerência obrigatória com outros documentos

A redação da Fase 7 **não pode** ser escrita isoladamente. Tem de ser coerente com:

- a **política de privacidade pública** do app (mesma afirmação, mesmo grau de precisão);
- o **Data Safety** (Google) e o **App Privacy** (Apple) — `E5.58`, **Fase 20**;
- o **contrato de consentimento adulto por finalidade** — `E5.55`, Fase 7 (superfície) e Fase 19
  (motor);
- o **Plano de Medição** (Bloco 5), que fixa que **nenhuma categoria envia dado no lançamento**.

**Divergir entre esses quatro lugares é o mesmo defeito de `P-149` replicado em escala maior.**

---

## 5. Fase proprietária

| Item | Dono |
|---|---|
| Reescrita dos textos em `ParentAreaScreen.js` | **Fase 7** — Onboarding, Home e Área dos Pais (`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` §3) |
| Coerência com política de privacidade pública | **Fase 7**, com revisão na **Fase 20** |
| Data Safety e App Privacy | **Fase 20** (`E5.58`) |
| Consentimento por finalidade que os textos referenciam | **Fase 7** (superfície) · **Fase 19** (motor) — `E5.55` |
| Prova de que ferramentas internas não alcançam produção | **Fase 19** (`P-92`) |

**A Fase 5 não implementa nenhum destes itens.** `P-149` permanece **`ABERTO`**, severidade **ALTO**,
**risco técnico NÃO corrigido**, **PODE BLOQUEAR LANÇAMENTO**.

---

## 6. Validação visual futura — obrigatória

Determinação do fundador: registrar *"a necessidade de validação visual futura"*. Registrada:

| # | O que precisa ser validado | Como | Quando |
|---:|---|---|---|
| 1 | os seis textos substitutos **cabem** nos componentes sem truncar, em fonte grande e em tela pequena | print da Área dos Pais em aparelho real | **Fase 7** |
| 2 | o responsável **entende** a distinção — dados da criança ficam; conteúdo é baixado | leitura por adulto que não participou da escrita | **Fase 7** |
| 3 | o botão "Baixar história" e o texto da Área dos Pais **contam a mesma história** | print das duas telas lado a lado | **Fase 7** |
| 4 | o texto exibido no build de **produção** é o texto corrigido | verificação no candidato de lançamento | **Fase 21** |

`P-149` já exige `VFP` (validação física) e `TEL` (validação em tela). **Nada disso foi feito nesta
fase, e nada disso pode ser presumido.** Ver §8.

---

## 7. Textos verificados e considerados **não** divergentes

Registrado para que a auditoria futura saiba o que foi olhado e aprovado, e não apenas o que foi
reprovado.

| Linha | Texto | Veredicto |
|---:|---|---|
| `:923` | *"Registre seu consentimento… Fica salvo apenas neste aparelho."* | **verdadeiro** — `parentSettingsService.js:77` grava em `AsyncStorage`, nada sai. *(A insuficiência do consentimento booleano único é outro assunto: `E5.55`.)* |
| `:1121` | *"Apenas para desenvolvimento e testes neste aparelho. Não aparece em produção."* | **sustentado pelo código** — a seção inteira está atrás de `SHOW_TEST_TOOLS = isInternalToolsEnabled()` (`ParentAreaScreen.js:66`), documentado como *"Produção/screenshot → false"*. **A prova executável em build real permanece com `P-92`, Fase 19.** Este bloco constata coerência de código, não prova de build. |
| `:1280` | *"sem internet obrigatória, sem login"* | **verdadeiro** — o download é opcional e iniciado pela pessoa (§3.1) |

---

## 8. O que este bloco NÃO fez

- **Não alterou `ParentAreaScreen.js`.**
- Não alterou nenhum arquivo de `src/`, `scripts/`, `assets/`, `App.js`, `app.json`, `eas.json`,
  `package.json`, `package-lock.json` ou `plugins/`.
- Não criou código de risco novo — `P-149` já existia.
- Não corrigiu `P-149`, `P-92` nem nenhum outro risco.
- Não escreveu a política de privacidade pública.
- Não abriu nenhuma tela, não gerou print, não fez validação visual, não fez validação física.
- Não gerou build, não abriu Metro, não instalou app.
- Não fez push, não fez merge.
- **Não transformou ausência de evidência em prova de ausência:** o comportamento de rede em build de
  produção **não foi observado em execução**; o que está afirmado aqui vem de leitura de código e de
  configuração, e está declarado como tal.

---

## 9. Encaminhamentos do Bloco 6 — `E5.67` a `E5.70`

Os quatro estados obrigatórios: **RESOLVIDO NESTA FASE** · **ENCAMINHADO À FASE PROPRIETÁRIA** ·
**DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** · **DEPENDENTE DE TERCEIRO EXTERNO**.

| Código | Assunto | Estado | Destino |
|---|---|---|---|
| **E5.67** | Reescrever os cinco textos divergentes da Área dos Pais conforme os cinco requisitos de §4.1 e o conteúdo de §4.2, preservando a distinção obrigatória de `P-149` | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 7** |
| **E5.68** | Validação visual dos quatro itens de §6, em aparelho real | DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA | **Fase 7** · item 4 na **Fase 21** |
| **E5.69** | Coerência entre Área dos Pais, política de privacidade pública, Data Safety e App Privacy — quatro lugares, uma afirmação | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 7** (texto no app) · **Fase 20** (lojas) |
| **E5.70** | Base factual de `P-149` ampliada de quatro para seis textos e de um para três perfis do `eas.json`; acrescentado o fato de que o download é iniciado pela pessoa | **RESOLVIDO NESTA FASE** (este documento) | — |

---

## 10. Parecer do Bloco 6

1. **A divergência é real, está medida e tem dono.** Seis textos, cinco divergentes, um correto. O
   dono é a **Fase 7**.

2. **A promessa de privacidade do produto não está errada — a descrição técnica está.** Nenhum dado
   pessoal da criança sai do aparelho, e isso é verificável. O que não se sustenta é *"nenhuma
   informação é transmitida para servidores externos"*.

3. **O texto substituto pode continuar amigável.** O tráfego é iniciado pela família atrás de um
   botão rotulado "Baixar história" — descoberta deste bloco, ausente de `P-149`. Honestidade aqui
   não custa tranquilidade.

4. **Nenhum risco foi criado e nenhum foi corrigido.** `P-149` já existia com deduplicação provada;
   este bloco ampliou sua base factual. Ele permanece **`ABERTO`**, **ALTO**, **PODE BLOQUEAR
   LANÇAMENTO**.

5. **A validação visual está pendente e não pode ser presumida.** Quatro itens, nenhum executado.

6. **Nenhuma linha de runtime foi alterada.** A determinação *"Não alterar `ParentAreaScreen.js`"* foi
   cumprida integralmente.

---

Documento anterior: [`05_PLANO_DE_MEDICAO_ANONIMA.md`](05_PLANO_DE_MEDICAO_ANONIMA.md)
