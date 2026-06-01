# Sprint 17.0 — Production Foundation Report

**Data:** 2026-06-01  
**Smoke:** 600/600 ✓ (era 582/582 antes desta sprint)  
**Novos checks adicionados:** 18 (checks [583–600])  
**Código alterado:** Sim — apenas melhorias de segurança, acessibilidade e robustez  
**Conteúdo de histórias alterado:** Não  
**Dependências instaladas:** Nenhuma  

---

## Resumo executivo

Esta sprint estabeleceu a base de produção do app sem alterar conteúdo, navegação ou regras de negócio. Os objetivos foram:

1. **Segurança de logs:** Logger centralizado com guarda `__DEV__` — logs de erro não vazam em produção
2. **Restore Purchase:** Botão interativo e honesto implementado na Área dos Pais com estados (idle/loading/unavailable)
3. **Acessibilidade:** Labels de VoiceOver/TalkBack em abas de navegação, AudioPlayer e Restore Purchase
4. **Documentação legal:** Rascunhos de Política de Privacidade, Termos de Uso, Matriz de Dados Infantis e Checklist de Loja
5. **Auditoria completa:** 8 documentos de auditoria cobrindo segredos, assets, performance, storage, acessibilidade, legados, dependências e estados de erro

---

## Reclassificação de riscos (conforme as regras solicitadas)

| Item | Classificação anterior | Nova classificação | Justificativa |
|---|---|---|---|
| Política de privacidade | P0 | **P0** | Mantido — obrigatório para lojas com app infantil |
| Termos de uso | P1 | **P0** | Há paywall planejado — exige termos antes de IAP |
| Restore Purchase | P0 | **P0** | Apple obrigatório quando IAP ativo; placeholder implementado |
| ParentalGate para compra/links | P2 | **P0** | Toda ação adulta já protegida pelo gate ✓ |
| Consentimento LGPD (nome criança) | P2 | **P1** | App infantil — nunca pode ser P2 |
| PNG não comprimido | P0 | **P1** | Não está quebrando build ou travando tela; telas têm fallback ✓ |
| Base64 em AsyncStorage | P2 | **P1** | Risco real de crescimento com 200 cenas pintadas |
| Estados de erro/fallback | P2 | **P1** | Fallback de imagem já implementado; progressError pendente |
| Kubernetes | P3 | **P3** | Mantido |
| Backend | P3 | **P3** | Mantido; arquitetura documentada |

---

## Arquivos criados nesta sprint

### Código
| Arquivo | Descrição |
|---|---|
| `src/utils/logger.js` | Logger centralizado com guarda `__DEV__` para todos os ambientes |

### Documentos legais
| Arquivo | Descrição |
|---|---|
| `docs/legal/PRIVACY_POLICY_DRAFT.md` | Rascunho da Política de Privacidade (revisão jurídica necessária) |
| `docs/legal/TERMS_OF_USE_DRAFT.md` | Rascunho dos Termos de Uso (revisão jurídica necessária) |
| `docs/legal/CHILD_DATA_MATRIX.md` | Matriz LGPD de dados infantis |
| `docs/legal/STORE_COMPLIANCE_CHECKLIST.md` | Checklist de compliance para Apple e Google |

### Documentos técnicos
| Arquivo | Descrição |
|---|---|
| `docs/PRODUCTION_FLAGS_CHECKLIST.md` | Checklist de flags de produção antes de cada build |
| `docs/SECRETS_AUDIT.md` | Auditoria de segredos — resultado: nenhum encontrado |
| `docs/ASSET_SIZE_AUDIT.md` | Auditoria de tamanho de assets com recomendações de compressão |
| `docs/PERFORMANCE_MOBILE_AUDIT.md` | Auditoria de performance por tela |
| `docs/DRAWING_STORAGE_AUDIT.md` | Auditoria do storage de desenhos em base64 |
| `docs/ACCESSIBILITY_CHILD_UX_AUDIT.md` | Auditoria de acessibilidade e UX infantil |
| `docs/LEGACY_FILES_AUDIT.md` | Inventário de arquivos legados |
| `docs/DEPENDENCY_AUDIT.md` | Auditoria de dependências |
| `docs/ERROR_STATE_AUDIT.md` | Mapeamento de estados de erro por tela |
| `docs/SPRINT_17_PRODUCTION_FOUNDATION_REPORT.md` | Este relatório |

---

## Arquivos alterados nesta sprint

| Arquivo | O que mudou |
|---|---|
| `src/utils/logger.js` | **Criado** — logger centralizado |
| `src/hooks/useProgress.js` | `console.log` → `log()` do logger (3 ocorrências) |
| `src/services/achievementsStorage.js` | `console.log` → `log()` do logger (2 ocorrências) |
| `src/services/drawingStorage.js` | `console.log` → `log()` do logger (3 ocorrências) |
| `src/services/atelierStorage.js` | `console.log` → `log()` do logger (1 ocorrência) |
| `src/context/ProfileContext.js` | `console.log` → `log()` do logger (2 ocorrências) |
| `src/context/ProgressContext.js` | `console.warn` → `warn()` do logger (2 ocorrências) |
| `src/screens/ParentAreaScreen.js` | Restore Purchase: de texto estático para botão interativo com estados; import `useCallback`; estilos `restoreBtn`, `restoreBtnLoading`, `restoreBtnText` |
| `src/navigation/AppNavigator.js` | `tabBarAccessibilityLabel` em todas as 5 abas |
| `src/components/AudioPlayer.js` | `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` no botão play/pause e replay |
| `scripts/smoke.js` | 18 novos checks Sprint 17 [583–600] |

---

## Riscos P0 resolvidos

| Risco | Resolução |
|---|---|
| Política de privacidade ausente | ✅ Rascunho criado em `docs/legal/PRIVACY_POLICY_DRAFT.md` — aguarda publicação em URL |
| Termos de uso ausentes | ✅ Rascunho criado em `docs/legal/TERMS_OF_USE_DRAFT.md` — aguarda publicação |
| Restore Purchase ausente | ✅ Placeholder honesto implementado na ParentAreaScreen com estados loading/unavailable |
| Parental gate para ações adultas | ✅ Todas as ações adultas já protegidas pelo gate (verificado na auditoria) |

## Riscos P0 restantes

| Risco | Motivo de não resolver nesta sprint | Próxima ação |
|---|---|---|
| PNG não comprimido (bundle > 150 MB) | Compressão de imagens requer ferramenta externa (pngquant/cwebp) e validação visual | Aplicar manualmente via pngquant antes da 4ª história |
| Política de privacidade em URL pública | Requer publicação em servidor — decisão humana | Publicar URL antes de submeter às lojas |
| Termos de uso em URL pública | Idem | Publicar URL antes de submeter às lojas |
| Restore Purchase integrado com IAP real | IAP não implementado intencionalmente nesta sprint | Sprint 21 |

---

## Riscos P1 resolvidos

| Risco | Resolução |
|---|---|
| `console.log` sem `__DEV__` em 9 pontos | ✅ Logger centralizado aplicado em todos os serviços e contextos |
| Acessibilidade mínima (3 labels em todo o app) | ✅ Labels adicionados em abas, AudioPlayer e Restore Purchase. De 3 para 8 labels |
| Documentação legal ausente | ✅ 4 documentos criados em `docs/legal/` |
| Flags de produção não documentadas | ✅ `PRODUCTION_FLAGS_CHECKLIST.md` criado |

## Riscos P1 restantes

| Risco | Motivo | Sprint |
|---|---|---|
| Consentimento LGPD (nome da criança) | Requer mudança de UX na tela de Perfil — não feito nesta sprint por risco de impacto | Sprint 18 |
| Acessibilidade em botões de história, paleta, quiz | Muitos elementos; feitos os mais críticos nesta sprint | Sprint 18 |
| Pastas legadas removidas | Aguarda confirmação de grep zero-referências | Sprint 18 |
| npm audit fix | Aguarda análise de breaking changes | Sprint 18 |
| expo-doctor 2 packages out of date | Aguarda análise | Sprint 18 |

---

## Riscos P2 resolvidos

| Risco | Resolução |
|---|---|
| `ENABLE_LOCAL_PREMIUM_TEST_MODE` sem proteção de CI | Documentado em `PRODUCTION_FLAGS_CHECKLIST.md`; já coberto pelo smoke |
| Sem documentação de secrets | ✅ `SECRETS_AUDIT.md` criado — resultado: nenhum segredo encontrado |

## Riscos P2 restantes

| Risco | Sprint |
|---|---|
| Base64 em AsyncStorage → migrar para FileSystem | Sprint 19 |
| Sem Crash Reporting | Sprint 18 |
| ScrollView em listas longas | Sprint 19 |
| `progressError` não consumido visualmente | Sprint 18 |
| ParentalGate PIN para IAP (quando implementado) | Sprint 21 |

---

## Riscos P3 — apenas documentados

- CDN para áudios: documentado em `MEDIA_BUDGET_GUIDE.md`
- Backend, autenticação, sincronização: documentado em `APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md`
- Feature flags: documentado em `PRODUCTION_FLAGS_CHECKLIST.md`
- Analytics seguro: documentado para Sprint 22+
- Kubernetes: P3, não antes de 100k MAU

---

## Comandos executados nesta sprint

```bash
node scripts/smoke.js         → 582/582 (antes) → 600/600 (depois)
npm audit                     → 11 moderate (não executado fix)
npx expo-doctor               → 1 check failed (2 packages out of date)
grep -rn "console\."          → auditoria de logs
grep -rn "EXPO_PUBLIC|API_KEY" → auditoria de segredos
find assets -name "*.png"     → auditoria de assets
du -sh assets/                → tamanho total de assets
```

**Nenhum `npm audit fix` executado.**  
**Nenhuma dependência instalada ou atualizada.**

---

## O que foi propositalmente NÃO implementado

| Item | Motivo |
|---|---|
| Compressão de PNG | Requer ferramenta externa e validação visual manual |
| Integração IAP real | Não autorizado nesta sprint |
| Backend | P3 — fora do escopo |
| CDN | P3 — sem áudios reais ainda |
| Lumi com IA | P3 — sem backend |
| Remoção de pastas legadas | Aguarda confirmação de zero referências no grep |
| `npm audit fix` | Aguarda análise de breaking changes com SDK 54 |
| Migração AsyncStorage → FileSystem | Sprint 19 |
| Analytics | Sprint 22+ |

---

## O que exige decisão humana

1. **Publicar Política de Privacidade:** Escolher plataforma de hospedagem (GitHub Pages, Notion, site próprio), adicionar URL em `app.json` (`expo.ios.privacyPolicyUrl`, `expo.android.privacyPolicyUrl`)
2. **Publicar Termos de Uso:** Idem
3. **Revisão jurídica:** Contratar advogado especializado em LGPD/COPPA para revisar os rascunhos antes da publicação
4. **Compressão de PNG:** Executar manualmente `pngquant --quality 70-90 --ext .png --force assets/stories/**/*_coloring.png` e validar visualmente
5. **Preenchimento de CNPJ/CPF nos docs legais:** Dados do titular do negócio
6. **Classificação etária nas lojas:** Responder ao questionário de classificação no App Store Connect e Play Console
7. **Metadata das lojas:** Título, descrição, palavras-chave, screenshots

---

## O que exige backend futuro

- Restore Purchase real (validação server-side de receipt)
- Consentimento dos pais em nuvem
- Sincronização de progresso multi-dispositivo
- Rate limiting para Lumi IA
- Analytics centralizados

---

## O que exige configuração nas lojas

- URL da política de privacidade (App Store Connect + Play Console)
- Formulário Data Safety (Google)
- Privacy Nutrition Labels (Apple)
- Produtos IAP criados (App Store + Play Console)
- Conta de desenvolvedor ativa em ambas as lojas

---

## Resultado final

| Métrica | Antes | Depois |
|---|---|---|
| Smoke tests | 582/582 | **600/600** |
| Checks de segurança de logs | 0 | 9 novos |
| Documentos legais | 0 | 4 criados |
| Documentos técnicos de auditoria | 1 (360) | +8 específicos |
| `console.log` sem `__DEV__` em serviços | 9 | **0** |
| Restore Purchase interativo | Não | **Sim (placeholder honesto)** |
| Labels de acessibilidade | 3 | **8+** |
| Segredos expostos | 0 | **0 ✓** |

---

## Próxima sprint recomendada: Sprint 17.1 ou Sprint 18

**Objetivo:** Fechar os P1 restantes antes de submeter às lojas.

**Ações prioritárias:**
1. Comprimir PNG de colorir (pngquant) — manual, não requer sprint de código
2. Publicar política de privacidade e adicionar URL em `app.json`
3. Publicar termos de uso
4. Corrigir 2 packages out of date (`npx expo install --check`)
5. Adicionar aviso LGPD no campo de nome (ProfileScreen)
6. Consumir `progressError` visualmente nas telas principais
7. Adicionar labels de acessibilidade nos botões de história e paleta de cores
