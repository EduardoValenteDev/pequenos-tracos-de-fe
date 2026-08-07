# Política de Privacidade — Pequenos Traços de Fé

**Status:** RASCUNHO PARA REVISÃO HUMANA — Não publicar sem revisão jurídica.  
**Versão:** Sprint 17.0 · 2026-06-01  
**Idioma oficial:** Português (Brasil)

> ⚠ Campos marcados com `[PLACEHOLDER]` precisam ser preenchidos pelo responsável legal antes da publicação.

---

## 1. Identificação do Responsável pelo Tratamento

| Campo | Valor |
|---|---|
| Nome do desenvolvedor / empresa | [PLACEHOLDER — Nome completo do titular ou razão social] |
| CNPJ ou CPF | [PLACEHOLDER — Se pessoa jurídica: CNPJ. Se pessoa física: CPF] |
| Endereço | [PLACEHOLDER — Endereço completo para fins legais] |
| E-mail de contato de privacidade | contato@pequenostracosdefe.com |
| Site institucional | [PLACEHOLDER — URL do site, se houver] |

---

## 2. Sobre o Aplicativo

O **Pequenos Traços de Fé** é um aplicativo cristão infantil destinado a crianças de **4 a 8 anos**, com foco em histórias bíblicas interativas, colorir, quizzes e conquistas.

O aplicativo foi projetado para ser utilizado com **supervisão dos responsáveis** nas primeiras sessões e é seguro para uso independente pela criança a partir das configurações descritas nesta política.

---

## 3. Dados que Coletamos

### 3.1 Dados coletados localmente no dispositivo

**Nenhum dado pessoal da criança é enviado para servidores externos.** Nome, avatar, progresso, desenhos, pinturas e criações ficam armazenados **exclusivamente no dispositivo**.

O aplicativo realiza tráfego de rede em duas situações, **nenhuma delas envolvendo dados pessoais da criança** — descritas em detalhe na seção 6.1: a **validação da assinatura** junto ao provedor de pagamento e o **download opcional de histórias** para uso offline.

| Dado | Finalidade | Base legal (LGPD) | Obrigatório? |
|---|---|---|---|
| Nome da criança (digitado pelo responsável ou pela criança) | Personalização do cumprimento na tela de perfil | Legítimo interesse / consentimento do responsável | Não — campo opcional |
| Avatar selecionado | Personalização visual | Legítimo interesse | Não |
| Progresso nas histórias (cenas concluídas) | Retomada da jornada educacional; cálculo de estrelas | Legítimo interesse | Sim (gerado automaticamente pelo uso) |
| Desenhos e colorações de cenas | Exibição na galeria pessoal da criança | Legítimo interesse | Sim (gerado pelo uso) |
| Artes criadas no Ateliê | Galeria de arte pessoal | Legítimo interesse | Não |
| Conquistas e estrelas obtidas | Gamificação educacional | Legítimo interesse | Sim (gerado pelo uso) |
| Status de atividades pós-história (quiz, Lumi, Livrinho) | Lógica de jornada e recompensas | Legítimo interesse | Sim (gerado pelo uso) |

### 3.2 Dados que NÃO coletamos

- ✗ E-mail da criança
- ✗ Localização geográfica
- ✗ Fotografia da criança
- ✗ Dados biométricos
- ✗ Número de telefone
- ✗ Dados bancários ou de pagamento
- ✗ Identificador de dispositivo para rastreamento
- ✗ Áudio ou voz da criança (microfone desabilitado)
- ✗ Histórico de navegação externa
- ✗ Comportamento para fins de publicidade

---

## 4. Como os Dados São Armazenados

Os dados são armazenados **localmente no dispositivo**, de duas formas: no mecanismo de armazenamento local do sistema operacional (AsyncStorage), para textos e registros de progresso; e no **diretório privado do aplicativo**, para os arquivos de imagem dos desenhos e das criações. Os dados:

- **Nunca são transmitidos para servidores externos** — nenhum dado pessoal da criança sai do aparelho
- **Ficam no dispositivo** até que o responsável utilize uma das funções de exclusão da Área dos Pais
- **Podem ser apagados** a qualquer momento pelo responsável através da Área dos Pais, protegida por verificação de adulto
- **São removidos automaticamente** quando o aplicativo é desinstalado
- **Não têm prazo de expiração automática:** o aplicativo não apaga dados sozinho com o passar do tempo. A remoção depende de ação do responsável ou da desinstalação

Os arquivos de imagem dos desenhos recebem nomes derivados de identificadores internos do aplicativo — **nunca do nome da criança**.

---

## 5. Crianças e Proteção Especial (LGPD Art. 14 · COPPA)

Este aplicativo é destinado a crianças menores de 13 anos. Por isso, adotamos as seguintes proteções específicas:

1. **A Área dos Pais** concentra todas as ações adultas (configurações, suporte, informações sobre plano, links externos). É protegida por desafio matemático que requer interação de um adulto.
2. **Nenhum dado pessoal da criança é compartilhado com terceiros.**
3. **Nenhuma publicidade comportamental** é exibida para crianças.
4. **Nenhum chat aberto**, comunicação entre usuários ou conteúdo gerado por terceiros é exibido.
5. **O nome da criança** é opcional, fica apenas no dispositivo e não é transmitido.
6. **Links externos** (e-mail de suporte, loja de avaliação) são acessíveis apenas por adultos através da Área dos Pais.

Se você é responsável por uma criança e deseja exercer direitos sobre os dados (acesso, correção, exclusão), utilize a função "Limpar progresso" na Área dos Pais ou entre em contato pelo e-mail: **contato@pequenostracosdefe.com**.

---

## 6. Compartilhamento de Dados

**Não compartilhamos dados pessoais da criança com terceiros.**

Não utilizamos:
- SDKs de analytics comportamental
- Plataformas de publicidade
- Serviços de rastreamento ou identificadores de publicidade (IDFA / GAID)
- Plataformas de redes sociais integradas
- Serviços de relatório de falhas (crash reporting)
- Notificações push

### 6.1 Conexões de rede que o aplicativo realiza

Para que a informação seja completa e verificável, estas são **todas** as situações em que o aplicativo acessa a internet:

| Quando | Para quê | O que trafega | Envolve dado da criança? |
|---|---|---|---|
| Ao retornar ao aplicativo | Verificar se a assinatura do Plano Família está ativa, junto ao provedor de processamento de assinaturas | Identificadores técnicos de dispositivo e de compra, gerados pelo próprio provedor | **Não.** Nenhum nome, desenho ou progresso |
| Ao tocar em "Baixar história (usar offline)" | Baixar o conteúdo da história escolhida | Apenas o download do conteúdo, do servidor para o aparelho | **Não.** Nada é enviado do aparelho |
| Ao tocar em "Falar com a gente" | Abrir o aplicativo de e-mail do aparelho | O que o responsável escrever | apenas o que o adulto decidir escrever |
| Ao tocar em "Compartilhar orientação" (Modo Igreja) | Abrir o menu de compartilhamento do sistema | O texto de orientação da turma | pode conter os nomes de turma e de líder digitados pelo responsável |

Nenhuma dessas conexões envia nome, avatar, progresso, desenhos ou criações da criança.

**Exceção futura:** Caso funcionalidades de sincronização em nuvem ou autenticação sejam implementadas em versões futuras, esta política será atualizada e o consentimento dos responsáveis será solicitado novamente.

---

## 7. Assinatura Premium e Compras

O aplicativo oferece um plano premium denominado **"Especial da Família"**. As compras:

- São realizadas exclusivamente **através das plataformas Apple App Store ou Google Play**, sujeitas às políticas de privacidade da Apple e da Google.
- São acessíveis apenas pela **Área dos Pais**, protegida por verificação de adulto.
- Não processamos diretamente dados bancários ou de cartão de crédito.
- [PLACEHOLDER — Detalhar quando IAP for implementado: quais dados são compartilhados com Apple/Google para fins de processamento de pagamento]

---

## 8. Direitos dos Titulares (LGPD Art. 18)

Como responsável pela criança, você tem os seguintes direitos:

| Direito | Como exercer |
|---|---|
| Confirmar a existência de tratamento | Leia esta política ou entre em contato |
| Acessar os dados | Os dados estão no dispositivo, acessíveis pelo uso normal do app |
| Corrigir dados incompletos ou incorretos | Edite o nome/avatar na tela de Perfil |
| Anonimizar, bloquear ou eliminar dados | Use, na Área dos Pais: **"Reiniciar progresso"**, **"Apagar pinturas do Colorir com o Beni"** ou **"Apagar criações do Criar Livre"**. Para apagar **tudo, incluindo nome e avatar**, desinstale o aplicativo — a exclusão total dentro do app está em preparação |
| Portabilidade | Os dados são locais; o aplicativo **não possui função de exportação** na versão atual |
| Revogar consentimento | Desinstale o aplicativo |
| Reclamação à ANPD | Acesse www.gov.br/anpd |

**Prazo de conservação:** os dados permanecem no aparelho **enquanto o aplicativo estiver instalado**, sem expiração automática, até que o responsável utilize uma das funções de exclusão acima.

Para exercer seus direitos ou esclarecer dúvidas: **contato@pequenostracosdefe.com**

---

## 9. Uso por Plataformas de Terceiros

O aplicativo é distribuído por:

- **Apple App Store** — sujeito às políticas de privacidade da Apple (apple.com/legal/privacy)
- **Google Play** — sujeito às políticas de privacidade do Google (policies.google.com/privacy)

O aplicativo utiliza:

- **Google Fonts** (Fraunces, Fredoka One, Nunito) — carregadas localmente no bundle, **sem requisição de rede**
- **Expo** (plataforma de build) — dados de build tratados pela Expo Inc. conforme expo.dev/privacy
- **RevenueCat** (`react-native-purchases`) — serviço de verificação de assinatura. Recebe identificadores técnicos de dispositivo e de compra para confirmar se o Plano Família está ativo. **Não recebe nome, avatar, progresso, desenhos ou qualquer dado pessoal da criança.** [PLACEHOLDER — confirmar com o provedor o país de hospedagem, o prazo de retenção e o acordo de tratamento de dados antes da publicação]
- **Cloudflare R2** — hospedagem pública do conteúdo das histórias disponíveis para download offline. O aparelho apenas **baixa** arquivos; nada é enviado
- [PLACEHOLDER — Listar qualquer SDK de terceiro adicionado no futuro]

Este aplicativo **não** utiliza SDKs de analytics, publicidade, rastreamento ou relatório de falhas.

---

## 10. Segurança

Adotamos as seguintes medidas de segurança:

- Armazenamento local sem transmissão de dados pessoais
- Área dos Pais protegida por verificação de adulto
- Sem credenciais hardcoded no código do aplicativo
- Sem tokens de autenticação no dispositivo (sem login)
- Permissões mínimas solicitadas ao sistema operacional

---

## 11. Alterações nesta Política

Esta política pode ser atualizada quando:
- Novas funcionalidades forem adicionadas
- Integração com backend ou nuvem for implementada
- Mudanças legais exigirem adaptações

Em caso de mudanças que afetem dados de crianças, notificaremos os responsáveis através de mensagem na abertura do aplicativo.

---

## 12. Contato e DPO

| Item | Valor |
|---|---|
| E-mail | contato@pequenostracosdefe.com |
| DPO (Encarregado de Dados) | [PLACEHOLDER — Nome e contato do DPO, se aplicável] |
| Prazo de resposta | 15 dias úteis |

---

**Data de entrada em vigor:** [PLACEHOLDER — data de publicação nas lojas]  
**Última atualização:** 2026-06-01 (rascunho Sprint 17)

---

> **Nota legal:** Este documento é um rascunho para fins de desenvolvimento. Deve ser revisado por advogado especialista em LGPD e privacidade infantil (COPPA/GDPR Kids) antes de ser publicado e submetido às lojas de aplicativos.
