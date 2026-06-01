# Auditoria de Dependências — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**  
Comandos executados: `npm audit`, `npx expo-doctor`, `npm ls --depth=0`

---

## npm audit — resultado

```
11 moderate severity vulnerabilities
```

Todas as vulnerabilidades estão em dependências do CLI/build do Expo (`@expo/config-plugins` e transitivas).  
**Não afetam o runtime do app em produção.**  
Afetam o ambiente de build e desenvolvimento.

**Ação recomendada:** Executar `npm audit fix` (sem `--force`) na Sprint 18 após verificar se não há breaking changes.  
**Não executar `npm audit fix --force`** sem revisão manual — pode atualizar versões incompatíveis com o Expo SDK 54.

---

## expo-doctor — resultado

```
1 check failed: 2 packages out of date
- expo-font
- (1 outro pacote)
```

Recomendação do Expo: `npx expo install --check` para revisar e atualizar dependências fora do alinhamento do SDK.

**Ação recomendada:** Executar `npx expo install --check` para identificar as 2 dependências. Atualizar na Sprint 18 se não houver breaking changes.

---

## Dependências diretas — estado atual

| Pacote | Versão | Estado | Observação |
|---|---|---|---|
| `expo` | ~54.0.33 | ✓ Recente | SDK 54 |
| `react` | 19.1.0 | ✓ React 19 | |
| `react-native` | 0.81.5 | ✓ Recente | |
| `@react-navigation/native` | ^7.2.4 | ✓ v7 | |
| `@react-navigation/bottom-tabs` | ^7.16.1 | ✓ | |
| `@react-navigation/stack` | ^7.9.2 | ✓ | |
| `@react-native-async-storage/async-storage` | ^2.2.0 | ✓ v2 | |
| `expo-audio` | ~1.1.1 | ✓ | API pode mudar no SDK 55 |
| `expo-asset` | ~12.0.13 | ✓ | |
| `expo-font` | ~14.0.11 | ⚠ Out of date | 1 das 2 flagged pelo expo-doctor |
| `expo-haptics` | ~15.0.8 | ✓ | |
| `expo-linear-gradient` | ~15.0.8 | ✓ | |
| `expo-status-bar` | ~3.0.9 | ✓ | |
| `react-native-gesture-handler` | ~2.28.0 | ✓ | |
| `react-native-safe-area-context` | ~5.6.0 | ✓ | |
| `react-native-screens` | ~4.16.0 | ✓ | |
| `react-native-webview` | 13.15.0 | ✓ | Manter atualizado — superfície de ataque |
| `@expo-google-fonts/fredoka-one` | ^0.2.3 | ✓ | Bundled localmente |
| `@expo-google-fonts/nunito` | ^0.4.2 | ✓ | Bundled localmente |
| `@expo/vector-icons` | ^15.1.1 | ✓ | |
| `babel-preset-expo` | ~54.0.10 | ✓ | |

---

## Dependências ausentes (necessárias para roadmap)

| Pacote | Finalidade | Sprint |
|---|---|---|
| `@sentry/react-native` | Crash reporting sem PII | Sprint 18 |
| `react-native-purchases` (RevenueCat) | IAP e Restore Purchase | Sprint 21 |
| `expo-file-system` | Migração de desenhos do AsyncStorage | Sprint 19 |
| `expo-secure-store` | Tokens quando houver autenticação | Sprint 25+ |

---

## Vulnerabilidades — detalhe

**Severidade:** 11 moderate (zero high / zero critical)  
**Localização:** Dependências de build do CLI Expo — não afetam o app em produção

**Recomendação:**
```bash
# Verificar o que seria atualizado (sem aplicar)
npm audit fix --dry-run

# Aplicar apenas fixes sem breaking changes (sprint 18, com revisão)
npm audit fix

# NÃO executar sem autorização:
# npm audit fix --force
```

---

## Checklist de dependências antes de cada release

- [ ] `npm audit` → zero high/critical
- [ ] `npx expo-doctor` → zero checks failed
- [ ] `npx expo install --check` → zero out of date
- [ ] `react-native-webview` na versão mais recente estável
- [ ] `expo-audio` compatível com SDK atual
- [ ] Nenhuma dependência descontinuada (`deprecated`) no `npm ls`
