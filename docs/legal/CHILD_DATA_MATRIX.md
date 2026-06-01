# Matriz de Dados Infantis — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**  
Fonte de verdade para decisões de privacidade. Revisar a cada nova funcionalidade que colete dados.

---

## Regra fundamental

> Dados de crianças menores de 13 anos exigem consentimento específico, destacado e em linguagem simples dos responsáveis legais (LGPD Art. 14; COPPA USA; GDPR-K EU).
> O app deve aplicar o princípio da minimização: coletar apenas o estritamente necessário.

---

## Matriz completa

| Dado | Tipo | Coletado por | Armazenamento | Transmitido? | Base legal | Sensível? | Ação obrigatória |
|---|---|---|---|---|---|---|---|
| Nome da criança | Pessoal | Digitado pelo responsável ou criança | Local (AsyncStorage `@ptf_profile`) | Não | Consentimento implícito / Legítimo interesse | Sim — dado pessoal de criança | Tornar explicitamente opcional; avisar que fica apenas no dispositivo |
| Avatar selecionado | Preferência | Escolhido pela criança | Local (AsyncStorage `@ptf_profile`) | Não | Legítimo interesse | Não | OK no estado atual |
| Progresso por cena | Comportamental | Gerado pelo uso | Local (AsyncStorage `@ptf_progress_*`) | Não | Legítimo interesse | Não | OK no estado atual |
| Desenhos de cenas (PNG base64) | Arte pessoal | Gerado pelo uso | Local (AsyncStorage `@ptf_drawing_*`) | Não | Legítimo interesse | Não | Monitorar volume; migrar para FileSystem no futuro |
| Artes do Ateliê (base64 + metadados) | Arte pessoal | Gerado pelo uso | Local (AsyncStorage `ptf_atelier_arts_v1_*`) | Não | Legítimo interesse | Não | Monitorar volume |
| Conquistas obtidas | Comportamental | Gerado pelo uso | Local (AsyncStorage `@ptf_achievements_*`) | Não | Legítimo interesse | Não | OK |
| Status de atividades (quiz, lumi, livrinho) | Comportamental | Gerado pelo uso | Local (AsyncStorage `@ptf_post_story_*`) | Não | Legítimo interesse | Não | OK |
| Timestamp do Momento com Lumi | Técnico | Gerado pelo uso | Local (AsyncStorage) | Não | Legítimo interesse | Não | OK |

---

## Dados que NUNCA devem ser coletados (crianças)

| Categoria | Exemplos | Motivo |
|---|---|---|
| Dados de contato | E-mail, telefone, WhatsApp da criança | COPPA/LGPD proíbem sem consentimento parental explícito |
| Localização | GPS, cidade, CEP | Dado sensível; não necessário para funcionalidade |
| Biometria | Face ID, impressão digital | Dado sensível extremamente protegido |
| Imagem real | Foto da câmera, selfie | Não necessário; risco alto |
| Voz | Microfone, gravações | Microfone desabilitado em `app.json` ✓ |
| Identificadores de rastreamento | IDFA, GAID, fingerprint | Google Play Families Policy e Apple Kids proíbem |
| Histórico de navegação | Sites visitados fora do app | Não coletado ✓ |

---

## Quando sincronização em nuvem for implementada

Se dados do usuário passarem a ser transmitidos para servidores:

1. **Consentimento explícito** dos responsáveis deve ser obtido ANTES da primeira sincronização
2. **Política de privacidade** deve ser atualizada com detalhes do servidor, país de hospedagem e período de retenção
3. **Dados de crianças e responsáveis devem estar em tabelas separadas** (ver arquitetura DB na auditoria)
4. **Criptografia em trânsito** (HTTPS TLS 1.2+) obrigatória
5. **Criptografia em repouso** para dados pessoais
6. **Direito de exclusão** deve ser implementado com UI na Área dos Pais

---

## Consentimento — estado atual vs. necessário

| Item | Estado atual | O que falta |
|---|---|---|
| Nome da criança | Coletado sem aviso explícito | Adicionar texto claro: "Este nome fica apenas neste dispositivo e não é enviado para a internet." |
| Progresso e desenhos | Coletados silenciosamente (comportamento esperado) | OK para dados locais; mencionar na política |
| Dados transmitidos | Nenhum | — |
| Consentimento para cloud (futuro) | Não existe | Implementar antes de qualquer sincronização |

---

## Processo de exclusão de dados

| Mecanismo | Como funciona | Abrange |
|---|---|---|
| "Limpar progresso" na Área dos Pais | Remove progresso, pós-história, conquistas e status Lumi | Tudo exceto nome/avatar e artes do Ateliê |
| Desinstalação do app | Remove todo o AsyncStorage | Todos os dados locais |
| [FUTURO] Botão "Excluir minha conta" | A implementar quando houver backend | Dados no servidor |

---

## Responsável por este documento

[PLACEHOLDER — Nome do DPO ou responsável legal do projeto]  
Revisão recomendada: a cada 6 meses ou quando nova funcionalidade de dados for adicionada.
