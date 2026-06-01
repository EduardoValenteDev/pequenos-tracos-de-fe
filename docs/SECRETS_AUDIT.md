# Auditoria de Segredos e Credenciais — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**  
Auditoria baseada em grep do código-fonte. Nenhum segredo é exposto neste documento.

---

## Metodologia

Comandos executados (somente leitura):
```bash
grep -rn "EXPO_PUBLIC|API_KEY|apiKey|secret|password|Bearer|Authorization|token" src/ --include="*.js"
grep -rn "http|https|fetch|axios" src/ --include="*.js"
cat .env* 2>/dev/null
cat app.json | grep -i "key\|secret\|token\|credential"
cat eas.json
```

---

## Resultado da auditoria

### Arquivos .env

**Resultado:** Nenhum arquivo `.env` encontrado no projeto. ✓

### Variáveis EXPO_PUBLIC

**Resultado:** Nenhuma variável `EXPO_PUBLIC_*` encontrada no código-fonte. ✓

### API Keys, tokens, senhas hardcoded

**Resultado:** Nenhuma encontrada em `src/`. ✓

Padrões verificados: `API_KEY`, `apiKey`, `secret`, `password`, `Bearer`, `Authorization`, `token` (como valor string).

### URLs sensíveis

**Resultado:** Apenas URLs públicas encontradas:
- `mailto:contato@pequenostracosdefe.com` — e-mail de suporte público, dentro de ParentalGate. ✓
- Nenhuma URL de API, webhook ou serviço externo. ✓

### Chamadas de rede

**Resultado:** Nenhum `fetch`, `axios`, `XMLHttpRequest` ou `WebSocket` encontrado em `src/`. O app é 100% offline. ✓

### app.json

| Campo | Valor | Sensível? | Observação |
|---|---|---|---|
| `expo.extra.eas.projectId` | `ccf727af-...` (mascarado) | Médio | EAS project ID é semi-público. Não é segredo crítico, mas não deve ser hardcoded para apps com backend. OK para app local. |
| `expo.owner` | `eduardocriacao` | Público | Username EAS. Não é segredo. |
| Outros campos | Configurações padrão | Não | — |

### eas.json

Contém apenas configurações de build (perfis, tipos de distribuição, resource class). **Nenhum segredo.** ✓

### Flag de teste

| Flag | Arquivo | Valor atual | Risco |
|---|---|---|---|
| `ENABLE_LOCAL_PREMIUM_TEST_MODE` | `src/services/accessControl.js` | `false` ✓ | Se `true` em produção: premium grátis para todos |

---

## Status geral

| Categoria | Status |
|---|---|
| Arquivos .env | ✓ Ausentes (correto) |
| EXPO_PUBLIC | ✓ Nenhum |
| API keys hardcoded | ✓ Nenhuma |
| Tokens de autenticação | ✓ Nenhum (sem auth) |
| URLs de backend | ✓ Nenhuma (offline) |
| Credenciais de terceiros | ✓ Nenhuma |
| Flag de teste em produção | ✓ `false` |
| **Segredos P0** | **✓ NENHUM ENCONTRADO** |

---

## Regras para o futuro

Quando backend, analytics ou IAP forem implementados:

1. **Nunca** armazenar chaves de API, tokens ou secrets no código-fonte do app
2. **Nunca** usar `EXPO_PUBLIC_` para secrets (é visível no bundle)
3. **Secrets de backend** devem ficar apenas no servidor (variáveis de ambiente do processo Node.js)
4. **Chaves de IAP** (Apple shared secret, Google service account) ficam no backend para validação server-side
5. **DSN do Sentry** pode ser `EXPO_PUBLIC` (não é segredo crítico, mas limita o abuso)
6. Se houver `.env` no futuro: adicionar ao `.gitignore` imediatamente
7. Usar `eas secret` para variáveis de build confidenciais, nunca em código

---

## Próxima auditoria recomendada

Realizar nova auditoria de secrets antes de cada sprint que introduza:
- Integração com serviço externo
- Sistema de pagamento (IAP)
- Analytics
- Backend / API
- Autenticação
