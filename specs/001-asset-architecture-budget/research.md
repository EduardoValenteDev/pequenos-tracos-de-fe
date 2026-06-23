# Research — Fundação de Arquitetura e Orçamento de Assets (Fase 0)

> Formato por decisão: **Decision / Rationale / Alternatives**. Nenhum `NEEDS CLARIFICATION` em aberto (resolvidos na spec). Preços/valores externos são **características estruturais**, não cotações — **verificar valores atuais antes de contratar** (marcado com ⚠️).

## §Arquitetura híbrida (D1, D2)

**Decision**: Três camadas de conteúdo:
- **`starter`** — empacotado no binário, **grátis**, offline desde a instalação. Conteúdo: **A Criação** e **Noé** (vitrine do Roteiro), incluindo cenas, páginas de colorir e narração.
- **`remote`** — packs **baixáveis sob demanda** (premium e novos), servidos por object storage, instalados no cache local; offline após download; removíveis pelo responsável.
- **`coming_soon`** — apenas no catálogo (metadado), **sem** bytes no bundle nem baixáveis ainda.

Cache de pack em `documentDirectory/packs/<packId>@<version>/`; índice em AsyncStorage `@ptf_packs_v1` (status, versão, bytes, instalado em). Um **resolvedor central** decide a fonte da mídia: starter (`require`) → pack instalado (`file://`) → fallback seguro.

**Rationale**: Alinha com o Roteiro Mestre ("shell + grátis no binário; premium sob demanda") e com a Constituição (local-first, separação UI/dados). Mantém o app pequeno e o offline garantido para o grátis. Versão no diretório (`@version`) permite atualização sem colisão.

**Alternatives**: (a) Tudo no binário — rejeitado (estoura 150 MB, viola Roteiro). (b) Tudo remoto — rejeitado (quebra offline do grátis, ruim em rede fraca BR). (c) EAS Update para conteúdo — rejeitado como entrega de assets pesados (EAS Update é para JS/bundle, não substitui storage de mídia; ver §Storage).

## §Orçamento (D3)

**Decision**: Teto de **download/instalação inicial ≤ ~150 MB**. Starter otimizado por WebP deve caber nesse teto; **20 histórias + ≥25% (≈5 packs)** dimensionam orçamento e arquitetura, mas **a folga NÃO entra no bundle** (vai para remoto). Medições-base (verificadas): `assets/` working ≈**791 MiB**; categorias tracked cenas **160**, colorir **90**, áudio **61**, capas **20**; `.git` ≈952 MiB.

**Impacto estimado por categoria** (a refinar com medição real no MVP):
- **Imagens de cena** (maior peso, ~502 MB de PNG referenciado hoje): maior alvo de redução — WebP lossy tende a **−60% a −80%** vs PNG ⚠️ (validar por amostra).
- **Páginas de colorir**: WebP lossless/PNG otimizado — redução menor (precisa linhas limpas p/ flood-fill).
- **Áudio**: mp3 já comprimido; redução marginal — narração viaja no pack da história.
- **Avatares**: 10 PNGs pequenos (starter local) — impacto desprezível no teto.
- **Mapas/UI**: estáveis; otimização pontual.

**Rationale**: O público BR de baixo custo torna o tamanho uma restrição de produto. Só o grátis precisa estar no binário; o resto é sob demanda.

**Alternatives**: Teto maior (300–500 MB) — rejeitado (Q1: postura enxuta). Sem teto — rejeitado (risco de adoção).

## §Storage remoto (D4)

**Decision**: **Cloudflare R2** como recomendação primária para os packs remotos. **MVP**: bucket **público-não-listado** (paths ofuscados/aleatórios) para conteúdo grátis/baixo-risco. **Fase 2**: **URLs assinadas** (R2 presigned, geradas por **Cloudflare Worker/Edge**) para premium.

**Comparação** (características estruturais; ⚠️ confirmar valores):

| Critério | **Cloudflare R2** | **Supabase Storage** | **AWS S3 + CloudFront** |
|---|---|---|---|
| **Egress** | **Zero** (sem taxa de saída) ⚠️ | Cobrado por GB ⚠️ | Cobrado (mitiga com CDN) ⚠️ |
| **CDN** | Integrado (rede Cloudflare) | Via CDN do Supabase | CloudFront (config extra) |
| **S3-compat** | Sim (SDK S3) | API própria + S3-compat parcial | Nativo |
| **URLs públicas/não-listadas** | Sim (bucket público + path ofuscado) | Sim | Sim |
| **URLs assinadas** | Sim (presigned / Worker) | Sim (built-in, simples) | Sim (presigned) |
| **Entitlement/Auth integrada** | Não (precisa Worker/RevenueCat) | **Sim** (Auth + RLS) | Não (precisa IAM/Lambda) |
| **Simplicidade p/ app local-first** | Alta (sem backend; Worker só p/ assinar) | Média (puxa p/ stack Supabase) | Baixa (mais peças) |
| **Custo a escala (mídia, muitos downloads)** | **Melhor** (egress zero) | Pior em egress | Médio |

**Recomendação por fase (autorização):**
- **MVP → R2 público-não-listado SOMENTE se não houver risco comercial relevante** (conteúdo grátis/piloto). Se houver valor pago em jogo, **não** usar público-não-listado.
- **Fase 2 → entitlement via RevenueCat + mecanismo mínimo de autorização** (URL **temporária/assinada** para premium); o app só baixa premium se o entitlement confirmar.
- **Fase 3 → endurecimento**: **Edge Function/Worker** assinando, **expiração**, **rotação** de credenciais/chaves e **observabilidade** (logs/alertas de acesso anômalo).

**Rationale**: O caso de uso é **distribuição de mídia para muitos dispositivos** → **egress domina o custo**; R2 (egress zero) é estruturalmente superior. Supabase brilharia se já houvesse backend/Auth Supabase — não é o caso (local-first). 

**Alternatives**: Supabase Storage (melhor se adotarmos Supabase Auth no futuro — reconsiderar em Fase 3); S3+CloudFront (mais peças, egress); GitHub Releases/CDN público (frágil, sem controle); **manter no binário** (rejeitado, orçamento).

## §Monetização e acesso (D5)

**Decision — regra de gating (inequívoca):**
- **Se o MVP NÃO libera venda/download premium real** (só grátis/piloto/conteúdo controlado): **RevenueCat pode ficar na Fase 2.**
- **Se QUALQUER pack premium real for liberado para usuário pagante**: **RevenueCat (entitlement) DEVE estar em vigor ANTES** de esse download premium ser habilitado — não se libera compra/baixa premium sem a camada de entitlement.
- **URL pública não-listada NÃO é proteção robusta**: aceitável **apenas** como **piloto, conteúdo gratuito ou fase controlada**. Conteúdo premium pago **exige** autorização (URL temporária/assinada + entitlement).

Camadas de proteção, do mínimo ao robusto:
- **Proteção aceitável (MVP, só grátis/piloto)**: path não-listado/ofuscado — **sem** garantia forte.
- **Proteção robusta (premium)**: **URLs assinadas com expiração** + verificação de **entitlement (RevenueCat)** + (Fase 3) **Edge Function/Worker** validando token antes de assinar, com rotação e observabilidade.

Backend mínimo/Edge Functions só entram **quando** premium remoto exigir assinatura — **e** RevenueCat é pré-requisito de qualquer venda real.

**Rationale**: Evita backend complexo no MVP (Constituição/Roteiro). RevenueCat é o padrão do Roteiro (Fase 5) para compras/entitlements gerenciados.

**Alternatives**: Backend próprio desde já — rejeitado (Roteiro: sem servidor antes de tração). Compra nativa sem RevenueCat — mais trabalho de reconciliação. Sem proteção — aceitável só para grátis.

## §Manifesto de pack (esquema)

**Decision**: Cada pack tem um **manifesto JSON versionado** (`schemaVersion` + `version` do pack). Campos: `id`, `version`, `schemaVersion`, `type` (story/coloring/audio/bundle), `minAppVersion`, `files[]` (`path`, `bytes`, `sha256`, `width`, `height`, `ratio`), `totalBytes`, `status`, `metadata` (título, storyId, idioma). Schema formal em [contracts/pack-manifest.schema.json](./contracts/pack-manifest.schema.json); entidades em [data-model.md](./data-model.md).

**Rationale**: Permite download verificável, checagem de compatibilidade (`minAppVersion`), integridade (`sha256`/`bytes`) e regras visuais (`ratio`/dimensões) antes de marcar "pronto".

**Alternatives**: Sem manifesto (lista hardcoded) — rejeitado (sem integridade/versão). Manifesto não-versionado — rejeitado (quebra evolução).

## §Integridade e download (D6)

**Decision**: Fluxo **atômico**:
1. Baixar manifesto; checar `schemaVersion` + `minAppVersion`.
2. Baixar arquivos para `…/packs/.tmp/<id>@<version>/` (download **resumable** — `expo-file-system` `createDownloadResumable`).
3. Validar **bytes** e **sha256** de cada arquivo + agregado do pack.
4. Em sucesso: **mover atômico** `.tmp` → diretório final; gravar índice `@ptf_packs_v1` com `status: ready`.
5. Em falha (rede/hash): **manter estado anterior**, expor **retry**; retomar de onde parou quando possível.
- **Cache persistente** até **remoção explícita** pelo responsável (Área dos Pais) ou **limpeza LRU** quando o armazenamento apertar.

**Rationale**: Garante que conteúdo só fica "ativo" se íntegro (SC-010); resiliente a rede fraca (BR).

**Alternatives**: Download direto no diretório final — rejeitado (estado corrompido se falhar no meio). Sem hash — rejeitado (FR-019).

## §Imagens (D7)

**Decision**:
- **Cenas coloridas** → **WebP lossy** (qualidade alvo a calibrar por amostra ⚠️).
- **Páginas de colorir** → **WebP lossless** ou **PNG otimizado** (linhas limpas), **nunca** lossy que borre contornos.
- **Preservar 4:5**; imagens fora do padrão **não** são esticadas/cortadas automaticamente — exigem **aprovação visual** (FR-008).
- **Flood-fill**: critério técnico = **contornos fechados preservados** + **sem vazamento de preenchimento**. Limiar operacional de detecção de borda alinhado ao já usado no app (**threshold de luminância 210** no BFS de preenchimento). **Validação obrigatória**: teste de flood-fill em cada página convertida (comparar regiões preenchidas antes/depois; falha = rejeita a conversão).

**Rationale**: WebP reduz peso drasticamente; colorir é sensível a artefato (anti-aliasing pode vazar fill) → lossless/PNG + teste. Mantém o contrato visual 4:5.

**Alternatives**: Tudo PNG — rejeitado (peso). Tudo WebP lossy — rejeitado (quebra flood-fill). AVIF — adiado (suporte/decode em RN menos maduro ⚠️).

## §Áudio (D8)

**Decision**: **Não migrar áudio nesta feature.** **Confirmado por comando (2026-06-22):** `npm ls` → `expo-audio@1.1.1`; `package.json` lista **expo-audio** e **NÃO** lista `expo-av`; `rg "expo-av" src` → **0 ocorrências** (nenhum import/menção). Portanto **não há dívida de `expo-av` a saldar** — a premissa de "expo-av como dívida" **não se aplica** ao estado real. A narração de cada história **viaja dentro do pack** correspondente (offline após download). Qualquer evolução de áudio é **feature separada**, fora deste escopo (não misturar com packs).

**Rationale**: A premissa de "expo-av como dívida" não se aplica ao estado real (migração já feita em sprint anterior). Evita risco de misturar migração com packs.

**Alternatives**: Forçar uma "migração" inexistente — rejeitado (não há o que migrar). Áudio fora do pack (download separado) — rejeitado (fragmenta integridade/UX).

## §Git e versionamento (D9)

**Decision**:
- **Starter** (grátis, otimizado/pequeno) → **Git comum** (versionado no binário).
- **Packs remotos** → **fora do Git** (vivem no R2).
- **`assets/stories/*` untracked** (incl. `josiah_young_king`) → **permanecem fora do Git** até passarem pelo **pipeline de auditoria**.
- **Git LFS** → **não adotado** (compatibilidade/atrito com **EAS Build**, custo de banda, e binário continua grande no checkout).

**Pipeline obrigatório antes de subir Rute, José, Ester, Moisés, Samuel e Josias**:
1. **Auditar** (inventário, hash, dimensões, formato real, sequência completa).
2. **Padronizar** nomes/dirs (`scene/` vs `scenes/`, `scene_NN` vs `<story>_scene_NN`).
3. **Otimizar** (WebP + **teste de flood-fill** para colorir).
4. **Decidir camada** por orçamento: starter (binário) **vs** pack remoto (R2).
5. **Versionar seletivamente** (só grátis/starter no Git) **ou** publicar no R2 com manifesto.

**Rationale**: Mantém o repositório/binário enxutos e auditáveis (Constituição); evita inflar o Git com mídia pesada.

**Alternatives**: Git LFS (rejeitado — EAS/custo); tudo no Git comum (rejeitado — binário gigante); subir sem auditoria (rejeitado — governança).

## §Compliance e infantil (D10)

**Decision**:
- **LGPD** + **local-first**: sem backend de dados pessoais; **zero telemetria**; **sem coleta infantil** desnecessária (mantém `NSPrivacyTracking:false`, `NSPrivacyCollectedDataTypes:[]`).
- **Downloads sob controle do responsável**: iniciados/autorizados via **Área dos Pais** (gate existente); **Wi-Fi por padrão** com aviso antes de usar dados móveis (cautela BR).
- **"Modo Igreja"**: **pré-download em Wi-Fi** de um conjunto de packs para uso offline em eventos.
- Remoção de conteúdo baixado **gerenciada pelo responsável**.

**Rationale**: Público infantil + Brasil-first exige rigor de privacidade e cuidado com franquia de dados.

**Alternatives**: Download automático em qualquer rede — rejeitado (custo de dados ao responsável). Telemetria de uso — rejeitado (LGPD/infantil).

## Itens explicitamente deixados para o Plano executável / Tasks

- Calibração numérica final do **WebP lossy** (qualidade) e do **limiar de anti-aliasing** por amostra real.
- Valores atuais de **preço/egress** de R2/Supabase ⚠️ (cotar antes de contratar).
- Forçar estrutura única vs apenas sinalizar desvios no padrão canônico (decidir no pipeline).
- Momento exato de ligar RevenueCat/URLs assinadas (Fase 2, feature própria com SDD).
