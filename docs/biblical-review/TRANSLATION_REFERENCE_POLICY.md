# Política de Referência Bíblica e Uso de Traduções

**Versão:** 1.0  
**Data:** 2026-06-01  
**Público:** Redatores, revisores bíblicos, equipe jurídica

---

## Propósito

Este documento define como o app Pequenos Traços de Fé usa textos bíblicos e referências a traduções, garantindo:

1. Fidelidade ao conteúdo das Escrituras.
2. Conformidade com direitos autorais das traduções modernas.
3. Independência de vocabulário de uma única tradução quando há divergência significativa de termos.
4. Acessibilidade infantil.

---

## Regra principal: paráfrase fiel, não transcrição

O app **não transcreve longos trechos de traduções bíblicas modernas** como conteúdo de narração, quiz ou lição. O motivo é duplo:

- **Direito autoral:** traduções como NVI, NTLH, NVT e outras modernas possuem direitos autorais ativos. Transcrição extensiva sem licença pode constituir infração.
- **Adequação etária:** nenhuma tradução moderna foi produzida especificamente para crianças de 4 a 8 anos. O vocabulário e a estrutura de frase precisam ser adaptados de qualquer forma.

### O que é permitido

| Uso | Permitido? | Observação |
|---|---|---|
| Paráfrase da história com referência à passagem | ✓ Sim | Forma padrão do app |
| Citação isolada de versículo curto (1–2 linhas) | ✓ Sim, com moderação | Indicar tradução usada. Preferir traduções de domínio público quando possível. |
| Menção a passagem bíblica (ex: "Gênesis 6–9") | ✓ Sim, sempre | Obrigatório nos metadados da história |
| Transcrição de parágrafo inteiro de tradução moderna | ✗ Não | Requer licença expressa |
| Uso de tradução como única referência sem indicação | ✗ Não | Sempre indicar a fonte |

---

## Traduções de referência para o processo de revisão

O revisor bíblico deve consultar pelo menos duas traduções ao revisar o conteúdo, para garantir que a paráfrase do app não dependa de vocabulário específico de uma única versão.

### Traduções recomendadas para consulta (não para transcrição)

| Sigla | Nome | Observação |
|---|---|---|
| ARA | Almeida Revista e Atualizada | Amplamente usada no Brasil evangélico |
| ARC | Almeida Revista e Corrigida | Base histórica do protestantismo brasileiro |
| NTLH | Nova Tradução na Linguagem de Hoje | Linguagem mais acessível; boa para verificação de compreensão |
| NVI | Nova Versão Internacional | Amplamente usada; copyright ativo |
| NVT | Nova Versão Transformadora | Linguagem contemporânea |
| NAA | Nova Almeida Atualizada | Revisão recente da Almeida |

### Traduções de domínio público (para citações diretas quando necessário)

| Sigla | Nome | Observação |
|---|---|---|
| ARC (edições antigas) | Almeida Século XVI–XVII | Verificar data da edição específica |
| KJV (inglês) | King James Version | Domínio público; útil para referência técnica |

---

## Como referenciar passagens no conteúdo

### No conteúdo visível ao usuário

A referência bíblica **não precisa aparecer na narração infantil**, mas pode aparecer:

- Na área dos pais (obrigatório).
- No relatório de revisão bíblica (obrigatório).
- Em texto de apoio opcional após a história.

Formato recomendado para a área dos pais:

> Esta história é baseada em **Gênesis 6–9**, onde a Bíblia conta como Noé obedeceu a Deus e construiu a arca.

### Nos metadados da história (código)

Cada história deve ter o campo `passagemBiblica` ou `referenciaBiblica` preenchido no arquivo de dados. Exemplo:

```js
{
  id: 'noe',
  referenciaBiblica: 'Gênesis 6–9',
  livro: 'Gênesis',
  capitulos: '6–9',
}
```

---

## Regra de independência de tradução

Quando há **divergência significativa de vocabulário entre traduções**, o app deve usar linguagem própria (paráfrase) e não se vincular ao termo de uma única versão.

### Exemplos de termos com divergência entre traduções

| Conceito | ARA | NTLH | NVI | Termo adotado no app |
|---|---|---|---|---|
| Arca de Noé | "arca" | "barco" / "arca" | "arca" | "arca" (mais reconhecível) |
| "Assim falou o Senhor" | "Disse o Senhor" | "O Senhor disse" | "O Senhor disse" | paráfrase própria |
| Golias / Golias | "Golias" | "Golias" | "Golias" | "Golias" (unânime) |
| Sheol / Hades / sepultura | varia | "mundo dos mortos" | varia | **evitar com crianças** |

### Critério para escolha de vocabulário próprio

1. **Clareza para criança de 4–8 anos** — sempre prioritário.
2. **Reconhecimento amplo** — preferir o termo que a maioria das famílias cristãs brasileiras reconheceria.
3. **Fidelidade ao sentido** — o termo não pode distorcer o significado do original.
4. **Registro no relatório de revisão** — quando o app usa um termo que diverge de alguma tradução importante, documentar a justificativa.

---

## Versículos-chave por história (política de uso)

Cada história pode ter um **versículo-chave** exibido na área dos pais ou como destaque. Para esses versículos:

- Usar versículo curto (preferencialmente uma frase).
- Indicar a tradução usada (ex: "ARA", "NTLH").
- Preferir versículos sem grande divergência de vocabulário entre as principais traduções.
- Não usar mais de 2–3 versículos integrais por história.

---

## Responsabilidade

| Papel | Responsabilidade |
|---|---|
| Redator | Escrever paráfrase fiel sem transcrever traduções protegidas |
| Revisor bíblico | Verificar fidelidade consultando ao menos 2 traduções |
| Responsável jurídico | Verificar qualquer citação direta antes de publicar |
| Dono do produto | Aprovar política de versículo-chave por história |
