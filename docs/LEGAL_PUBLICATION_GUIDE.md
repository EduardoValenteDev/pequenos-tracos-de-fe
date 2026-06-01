# Guia de Publicação de Documentos Legais — Pequenos Traços de Fé

**Sprint 18.0 · 2026-06-01**

---

## Por que publicar?

As lojas (Apple App Store e Google Play) exigem URLs **públicas, permanentes e acessíveis** para:
- Política de Privacidade (obrigatório para apps infantis — P0)
- Termos de Uso (obrigatório se houver cobrança/IAP)

As URLs devem:
1. Funcionar 24/7 sem autenticação
2. Ser acessíveis de qualquer país (não usar VPN-only ou intranet)
3. Carregar rapidamente (sem splash screens ou login gates)
4. Ser **permanentes** — mudar a URL depois exige atualizar o app nas lojas

---

## Opções de hospedagem

### Opção A — Site oficial no domínio próprio (Recomendado)

**Exemplo:** `https://pequenostracosdefe.com/privacidade`

**Prós:**
- URL profissional e duradoura
- Total controle sobre o conteúdo
- Fácil de atualizar sem resubmeter o app

**Contras:**
- Requer domínio e hospedagem

**Como fazer:**
1. Registrar domínio (ex: `pequenostracosdefe.com.br` no Registro.br)
2. Hospedar em serviço simples (Netlify, Vercel, GitHub Pages, ou qualquer hospedagem compartilhada)
3. Criar página simples com o conteúdo da política
4. URL: `https://seudominio.com/privacidade` e `https://seudominio.com/termos`

---

### Opção B — GitHub Pages (Gratuito, Recomendado para início)

**Exemplo:** `https://seuusuario.github.io/pequenos-tracos-de-fe/privacidade`

**Prós:**
- Gratuito, sem limite de tráfego
- HTTPS incluído
- Versionado no git
- Fácil de atualizar via commit

**Como fazer:**
1. Criar repositório público no GitHub (ex: `pequenos-tracos-de-fe-legal`)
2. Habilitar GitHub Pages nas configurações
3. Criar arquivos `privacidade.html` e `termos.html` (ou `.md` com Jekyll)
4. URL: `https://[seu-usuario].github.io/[repo]/privacidade`

**Passo a passo:**
```bash
# Criar repositório e habilitar Pages
# 1. Ir em github.com → New repository → "pequenos-tracos-de-fe-legal" → Public
# 2. Criar arquivo privacidade.html com o conteúdo
# 3. Settings → Pages → Source: main branch → / (root)
# 4. URL disponível em ~1 minuto
```

---

### Opção C — Notion Público (Simples, mas com limitações)

**Exemplo:** `https://notion.so/privacidade-abcdef123...`

**Prós:** Rápido de configurar, sem conhecimento técnico

**Contras:**
- URL longa e feia
- Pode ser lenta para carregar
- Notion pode mudar URLs ou políticas
- Menos profissional

**Recomendação:** Usar apenas como opção temporária enquanto o site oficial não está pronto. Não usar para submissão final à Apple/Google se houver alternativa.

---

### Opção D — Base44 ou similar

**Prós:** Sem código, arrasto e solte
**Contras:** Dependência de terceiro, URL não é sua

**Recomendação:** Evitar para documentos legais permanentes.

---

## Checklist de publicação

### Antes de publicar
- [ ] Documentos revisados por advogado (ver `docs/legal/PRIVACY_POLICY_DRAFT.md`)
- [ ] Placeholders `[PLACEHOLDER]` preenchidos com dados reais
- [ ] Data de entrada em vigor definida
- [ ] E-mail de contato funcionando: `contato@pequenostracosdefe.com`

### Durante a publicação
- [ ] URL da política de privacidade: `[PLACEHOLDER]`
- [ ] URL dos termos de uso: `[PLACEHOLDER]`
- [ ] URLs testadas em browser sem login (modo anônimo)
- [ ] URLs testadas em mobile (iPhone + Android)
- [ ] Página carrega sem erro 404 ou redirect loop

### Após publicar — configurar no app

Editar `app.json`:
```json
{
  "expo": {
    "ios": {
      "privacyPolicyUrl": "https://SEU_DOMINIO/privacidade"
    },
    "android": {
      "privacyPolicyUrl": "https://SEU_DOMINIO/privacidade"
    }
  }
}
```

E adicionar links na `ParentAreaScreen.js`:
```js
// Em openWithGate() — chamar com a URL pública
openWithGate('https://SEU_DOMINIO/privacidade');
openWithGate('https://SEU_DOMINIO/termos');
```

### Após publicar — verificar smoke
```bash
# Se smoke tiver check para URL de política, deve passar
npm run smoke
```

---

## Registro de publicação

| Documento | URL | Data | Versão | Responsável |
|---|---|---|---|---|
| Política de Privacidade | [PLACEHOLDER] | — | 1.0 | [PLACEHOLDER] |
| Termos de Uso | [PLACEHOLDER] | — | 1.0 | [PLACEHOLDER] |
| Canais de contato | contato@pequenostracosdefe.com | — | — | [PLACEHOLDER] |
| Solicitação de exclusão de dados | E-mail acima ou formulário: [PLACEHOLDER] | — | — | — |

---

## Canal para pais

Criar seção na ParentAreaScreen com:
- Link para política de privacidade
- Link para termos de uso
- E-mail de contato para dúvidas
- Instrução: "Para solicitar exclusão de dados, envie e-mail com assunto 'Exclusão de dados'"

Todos protegidos por ParentalGate. ✓ (já implementado para e-mail)

---

## Manutenção dos documentos

Atualizar a política sempre que:
- Nova funcionalidade coletar dados
- Integração com serviço externo for adicionada
- IAP for implementado
- Sincronização em nuvem for implementada
- Backend/autenticação for implementado

Ao atualizar: alterar "Última atualização" no documento, recompilar o app com nova versão se necessário.
