# DOCUMENTO OFICIAL FINAL DO PROJETO, Pequenos Traços de Fé

| Campo | Valor |
|---|---|
| Versão | v2.0 final de execução |
| Data | 01/07/2026 |
| Dono do produto | Eduardo |
| Executor técnico principal | Claude Code |
| Planejamento e estratégia | ChatGPT, Claude, Gemini |
| Stack | Expo SDK 54, React Native 0.81.5, React 19.1.0, JavaScript |
| Status | Ativo, fonte única de verdade para a fase final do projeto |

## 0. Regra central deste documento

Este documento passa a ser a fonte oficial do projeto Pequenos Traços de Fé para a fase final de desenvolvimento, otimização, beta e lançamento.

Sempre que houver conflito entre este documento, prompts antigos, conversas anteriores, planos paralelos ou sugestões de agentes, este documento vence. Se alguma decisão mudar, este documento deve ser atualizado primeiro, com registro no changelog.

Regras obrigatórias:

1. Um bloco por vez.
2. Um commit por bloco.
3. `git add` seletivo.
4. Nenhum push, merge, PR ou rebase sem aprovação explícita do Eduardo.
5. Nenhuma mudança de arquitetura sem atualizar este documento.
6. Nenhum lote grande de assets sem relatório de peso, dimensão, formato e impacto.
7. Nenhum backend, login, analytics, notificação, compra real, permissão nova ou SDK novo sem bloco próprio aprovado.
8. Nenhuma alteração em bundle id, package, slug, scheme, rotas principais ou chaves de storage sem plano formal de migração.
9. Todo bloco termina com `npm run audio:audit`, `npm run smoke` e `npx expo-doctor`, salvo quando o bloco for estritamente documental.
10. Toda otimização deve ter baseline, mudança feita e nova medida.
11. Validação visual do Eduardo é obrigatória para imagens, colorir, capas, Beni, Brincar e telas centrais.

## 1. Visão final do produto

Pequenos Traços de Fé é um app infantil cristão premium, guiado por Beni, onde a criança vive histórias bíblicas narradas, pinta cenas, monta seu livrinho, participa de quizzes, recebe mensagens de cuidado e brinca com jogos bíblicos educativos.

A experiência não deve parecer um conjunto solto de funções. Ela deve parecer um mundo infantil cristão com continuidade entre Início, Aventuras, Brincar, Estrelinhas, Perfil, histórias narradas, colorir, livrinho, quiz, Momento com Beni, conquistas e Plano Família.

Promessa do produto:

> Histórias bíblicas para viver, brincadeiras para lembrar, criação para expressar e estrelinhas para celebrar, com Beni guiando a jornada.

## 2. Inegociáveis de qualidade classe A+

O app só pode avançar para loja quando cumprir estes princípios:

1. Sem travamentos em Android intermediário.
2. Sem OOM em aparelhos de 2 a 3 GB de RAM.
3. Sem jank perceptível em transições principais.
4. Sem tela branca parada.
5. Sem loading técnico quando o app puder usar skeleton, progresso, pré carregamento ou revelação progressiva.
6. As duas histórias grátis funcionam 100% offline sempre.
7. Histórias premium funcionam offline depois do primeiro download completo.
8. Nenhum asset aprovado fica fora do app.
9. Nenhum conteúdo premium pesado entra no binário base por engano.
10. Nenhum texto bíblico, oração ou passagem aparece cortado de forma enganosa.
11. Nenhum tracker de anúncio ou coleta comportamental infantil entra no lançamento.
12. Beni não pode cobrir elementos importantes nem parecer improvisado.
13. Brincar precisa estar completo para o lançamento.
14. A experiência precisa ser premium, coesa, leve e confiável.

## 3. Estado atual consolidado

### 3.1 Conteúdo já fechado

O projeto possui 20 histórias. Cada história deve ter capa, 10 cenas ilustradas, 10 páginas de colorir, 10 áudios oficiais de narração, quiz com 8 questões, Momento com Beni, Livrinho e regras de acesso corretas.

Estado confirmado:

1. 200 MP3 oficiais das histórias foram integrados.
2. `audio:audit` validou 200/200.
3. `smoke` validou 1315/1315.
4. `expo-doctor` validou 18/18.
5. Branch `content-integrate-coloring-3` publicada no remoto como backup.
6. HEAD remoto confirmado em `c200e62`.
7. Working tree limpo no escopo do produto.
8. Apenas `.agents/` e `.claude/` permanecem locais como tooling.

### 3.2 Commits relevantes da branch publicada

1. `41e06ad`, colorir de `jesus_temple`, `solomon_wisdom`, `timothy_faith`.
2. `0880b4e`, normalização e completude visual.
3. `888e0a0`, registro de visuais e smoke coverage.
4. `c4f7449`, integração dos 200 áudios oficiais.
5. `3cc0676`, registro dos 200 áudios no manifesto e ajuste de `creation` cena 04.
6. `d439604`, correções finais de cenas aprovadas.
7. `c200e62`, capas finais aprovadas.

### 3.3 Bloqueador crítico confirmado

O conteúdo atual ainda entra no binário via `require()` estático, inclusive as 18 histórias premium. A auditoria indicou aproximadamente:

1. `assets/stories`: 730 MB.
2. `assets/audio`: 59 MB.
3. `assets/images`: 38 MB.
4. Total de assets: 907 MB.
5. Projeto sem `node_modules`: 3.2 GB.
6. `.git`: 2.2 GB, por histórico binário.

Mesmo com WebP, WebP sozinho não resolve. As 18 histórias premium precisam sair do binário base. A arquitetura híbrida não é opcional, é requisito para publicar com segurança e continuar evoluindo.

## 4. Decisões travadas

### D1, escopo de lançamento

Decisão final: lançar com a aba Brincar completa.

O lançamento não será sem Brincar. O produto de lançamento deve incluir:

1. 20 histórias.
2. 2 histórias grátis locais.
3. 18 histórias premium por packs remotos.
4. Narração oficial das 20 histórias.
5. Quiz.
6. Momento com Beni.
7. Livrinho.
8. Colorir.
9. Aba Brincar completa.
10. Palavrinhas do Beni.
11. Bichinhos da Bíblia.
12. Pares do Beni.
13. Criar com Beni.
14. Criar livre.
15. Minhas artes.
16. Regras de acesso Free e Plano Família.
17. Onboarding e tour do Beni revisados para a navegação final.
18. Áudios essenciais do Beni para a experiência final.

Trilha sonora e efeitos sonoros podem entrar no lançamento se estiverem leves, com direitos resolvidos, volume controlado e toggle de mudo. Se comprometerem prazo, peso ou estabilidade, entram como atualização 1.1.

### D2, loja de lançamento

Decisão recomendada: Android primeiro para validar peso, distribuição e assinatura, com iOS preparado em paralelo.

Se Eduardo decidir lançar iOS e Android juntos, o documento continua válido, mas o cronograma precisa considerar mais testes, TestFlight e App Store Connect.

### D3, Modo Igreja

Modo Igreja não entra como backend no lançamento.

Estratégia:

1. No lançamento, Modo Igreja pode existir apenas como promessa controlada, material comercial, página informativa ou canal de contato.
2. Não haverá conta de igreja, painel institucional, múltiplos aparelhos por igreja ou gestão de turmas no lançamento.
3. Códigos promocionais simples podem ser avaliados depois.
4. Conta de igreja com vários aparelhos exige backend e entra em fase futura.

### D4, backend

Não haverá backend tradicional no lançamento.

O lançamento usa Cloudflare R2 para mídia, RevenueCat para assinatura, EAS Update para correções em JS e assets pequenos, EAS Build e lojas para binário nativo, e `expo-file-system` para download e persistência local dos packs.

Backend tradicional só entra quando houver necessidade real de sincronizar progresso entre aparelhos, compartilhamento familiar real no Android entre contas diferentes, login de responsável, Modo Igreja com múltiplos aparelhos, anti pirataria server-side, gestão avançada de catálogo ou painel de suporte operacional.

## 5. Arquitetura oficial

### 5.1 Stack

1. Expo SDK 54.
2. React Native 0.81.5.
3. React 19.1.0.
4. JavaScript.
5. `expo-audio` para áudio.
6. `expo-file-system` para arquivos locais, download, persistência e leitura de packs.
7. RevenueCat para assinaturas.
8. Cloudflare R2 para packs remotos.
9. EAS Build, EAS Submit e EAS Update.
10. Android App Bundle no Google Play.
11. TestFlight e App Store Connect no iOS.

### 5.2 Modelo híbrido, starter local e packs remotos

#### Camada local no binário

Entram no app instalado:

1. Código do app.
2. UI base.
3. Navegação.
4. Beni essencial.
5. Avatares e imagens pequenas.
6. A Criação completa.
7. Noé completa.
8. Aba Brincar completa em código.
9. Assets essenciais e leves de Brincar.
10. Áudios essenciais do Beni.
11. Efeitos e trilhas somente se forem curtos, leves e aprovados.
12. Manifesto local fallback.
13. Paywall.
14. Área dos Pais.
15. Lógica de acesso.
16. Telas de download e progresso.

Meta do binário base:

1. Alvo ideal: 40 a 80 MB.
2. Limite interno de atenção: 120 MB.
3. Limite técnico a não ultrapassar: 200 MB comprimido no módulo base Android.
4. Nenhum pack premium deve entrar por `require()` estático no módulo base.

#### Camada remota no R2

Ficam no R2:

1. 18 histórias premium.
2. Cenas ilustradas premium.
3. Páginas de colorir premium.
4. Áudios de narração premium.
5. Packs futuros de histórias.
6. Packs futuros de animais, se crescerem.
7. Mídia futura de jogos.
8. Conteúdos extras pós lançamento.

Cada história premium será um pack próprio.

Exemplo:

```text
packs/
  david_goliath/
    v1/
      manifest.json
      scenes/
      coloring/
      audio/
      cover.webp
      pack.sha256
```

## 6. Manifesto oficial de conteúdo

O app deve buscar um manifesto versionado, pequeno e cacheável.

Schema mínimo:

```json
{
  "manifestVersion": 1,
  "minAppVersion": "1.0.0",
  "generatedAt": "2026-07-01T00:00:00Z",
  "packs": [
    {
      "id": "david_goliath",
      "version": 1,
      "type": "story",
      "access": "premium",
      "title": "Davi e Golias",
      "bytes": 22800000,
      "sha256": "hash-do-pack-ou-indice",
      "requiredAppVersion": "1.0.0",
      "baseUrl": "https://cdn.pequenostracosdefe.app/packs/david_goliath/v1/",
      "files": [
        {
          "path": "scenes/david_goliath_scene_01.webp",
          "bytes": 320000,
          "sha256": "..."
        }
      ]
    }
  ]
}
```

Regras:

1. Todo pack tem `id`, `version`, `type`, `access`, `bytes`, `sha256`, `requiredAppVersion`, `baseUrl` e lista de arquivos.
2. O app baixa para pasta temporária.
3. O app valida tamanho e hash.
4. O app move para armazenamento persistente.
5. O app registra o pack como `ready` apenas depois da validação.
6. Pack corrompido nunca aparece como disponível.
7. Se `version` subir, o app baixa apenas aquele pack.
8. Se `requiredAppVersion` for maior que a versão instalada, o app exibe aviso controlado.
9. O manifesto local fallback garante que as histórias grátis funcionem sem internet.

## 7. Persistência local dos packs

Pack baixado e validado não deve depender de cache descartável.

Fluxo obrigatório:

1. Baixar arquivos para pasta temporária.
2. Validar bytes.
3. Validar hash.
4. Mover para diretório persistente do app.
5. Atualizar índice local de packs.
6. Marcar status como `ready`.
7. Liberar a história.
8. Se falhar, apagar temporário e permitir tentar novamente.

Estados oficiais de pack:

1. `not_downloaded`.
2. `queued`.
3. `downloading`.
4. `validating`.
5. `ready`.
6. `update_available`.
7. `failed`.
8. `blocked_premium`.
9. `requires_app_update`.

Regras de UX:

1. História grátis local nunca mostra download.
2. História premium não baixada mostra botão de download.
3. Download mostra progresso real quando possível.
4. Sem internet mostra fallback amigável.
5. História baixada abre offline.
6. Se pack for apagado pelo sistema ou pelo usuário, o app detecta e volta para `not_downloaded`.

## 8. Segurança de packs premium

R2 não é DRM.

No lançamento, a proteção será suficiente para o estágio atual:

1. RevenueCat decide se o usuário tem entitlement premium.
2. O app só oferece download premium se `isActive` estiver verdadeiro.
3. O manifesto premium não deve ser exposto em telas de usuário Free.
4. Paths dos packs não devem ser triviais demais.
5. Usar domínio próprio e cache da Cloudflare.
6. Não usar `r2.dev` como domínio público de produção.
7. Não prometer proteção anti cópia absoluta.

Evolução futura se houver abuso:

1. Cloudflare Worker.
2. URLs assinadas.
3. Manifesto premium gerado por endpoint.
4. Validação server-side do RevenueCat.
5. Supabase ou backend próprio.
6. Device/account binding.

Não implementar Worker ou backend antes de necessidade real.

## 9. Acesso, Free e Plano Família

### 9.1 Plano grátis

Libera:

1. A Criação.
2. Noé.
3. Narração das histórias grátis.
4. Quiz das histórias grátis.
5. Momento com Beni das histórias grátis.
6. Livrinho das histórias grátis.
7. Colorir das histórias grátis.
8. Criar com Beni sem salvar.
9. Criar livre sem salvar.
10. Duas rodadas grátis por dia em Brincar.

Não libera salvar arte, galeria funcional, jogos ilimitados, histórias premium, narrações premium, avatares exclusivos, downloads offline premium e Brincar ilimitado.

### 9.2 Plano Família

Libera todas as histórias, narrações, quizzes, Momentos com Beni, Livrinhos, colorir, download offline premium, Brincar ilimitado, salvar artes, galeria, avatares e conteúdo futuro conforme estratégia.

### 9.3 Regra das duas rodadas grátis

A regra de duas rodadas grátis por dia em Brincar é obrigatória no lançamento.

Regras:

1. Contador diário compartilhado por todos os jogos de Brincar.
2. Reseta por dia local.
3. Persistido em storage.
4. Centralizado em `accessControl` ou serviço equivalente.
5. Não depende de `__DEV__`.
6. Trocar tela, fechar app ou abrir novamente não pode burlar.
7. Não é punição infantil, é limite de plano.
8. A mensagem deve pedir que a criança chame um adulto.

Mensagem oficial:

> Você já brincou suas rodadas de hoje. Para brincar sem limite, peça para um adulto conhecer o Plano Família.

## 10. RevenueCat

RevenueCat será usado para assinatura sem backend próprio.

Entitlement oficial:

```text
premium
```

Fluxo:

1. App inicializa RevenueCat.
2. Usuário Free vê paywall na Área dos Pais e nos pontos premium.
3. Compra ocorre atrás de gate parental.
4. `CustomerInfo.entitlements.active.premium` libera Plano Família.
5. `restorePurchases` aparece na Área dos Pais.
6. App chama `getCustomerInfo()` antes de liberar download premium.
7. Se offline, usa cache do RevenueCat quando disponível.
8. Se dúvida ou erro, não libera download novo, mas mantém conteúdo já baixado se o usuário tinha acesso quando baixou.

Compartilhamento:

1. iOS: ativar Family Sharing no App Store Connect.
2. Android: aceitar conta única no lançamento.
3. Compartilhamento real entre múltiplos aparelhos Android fica para fase futura com login.

## 11. Aba Brincar, escopo obrigatório de lançamento

A aba Brincar é obrigatória para o lançamento.

Nome:

```text
Brincar com Beni
```

Subtítulo:

```text
Jogos, desenhos e descobertas da Bíblia.
```

Hierarquia:

1. Cabeçalho.
2. Beni guia.
3. Palavrinhas do Beni.
4. Bichinhos da Bíblia.
5. Pares do Beni.
6. Criar com Beni.
7. Criar livre.
8. Minhas artes.

Fala inicial do Beni:

> Escolha uma brincadeira. Eu te ajudo pelo caminho!

### 11.1 Palavrinhas do Beni

Função: jogo de montar palavras ligadas a histórias, personagens, animais, virtudes e objetos bíblicos.

Modos de lançamento:

1. Completar letra.
2. Ordenar sílabas.
3. Montar letras embaralhadas.
4. Ouvir e montar, se áudio estiver pronto e leve.
5. Desafio com bônus de tempo, sem punição por erro.

Palavras iniciais: arca, luz, Davi, leão, ovelha, peixe, pão, amor, fé, rei, Maria e Jesus.

Regras:

1. Toda palavra deve ter vínculo bíblico, virtude ou aprendizagem infantil.
2. Erro gera dica, não punição.
3. Não usar tempo como pressão negativa.
4. Feedback do Beni é curto e positivo.
5. Pode usar áudio por palavra se estiver leve e padronizado.

### 11.2 Bichinhos da Bíblia

Função: jogo de adivinhar animais com imagem, som, pista e ligação bíblica.

Escopo de lançamento:

1. 15 animais.
2. 15 sons curtos.
3. Uma imagem otimizada por animal.
4. Níveis fácil, médio e difícil usando a mesma imagem com máscara, recorte ou pista, não três imagens por animal.
5. Áudios curtos.
6. Assets preferencialmente locais se couberem no budget.
7. Se o peso crescer, transformar Bichinhos em pack remoto próprio.

Animais iniciais: leão, ovelha, peixe, pomba, corvo, jumento, camelo, passarinho, cordeiro, cavalo, boi, vaca, cobra com cuidado visual, burro e cabra.

### 11.3 Pares do Beni

Função: jogo da memória.

Versão de lançamento:

1. Usar capas atuais otimizadas.
2. Começar leve.
3. Pré carregar somente as cartas da rodada.
4. Não carregar imagens gigantes em lista.
5. Níveis: 6 cartas, 8 cartas e 12 cartas.
6. Recompensa com estrelinhas.
7. Respeitar limite Free.

### 11.4 Criar com Beni e Criar livre

No Free:

1. Pode desenhar.
2. Não pode salvar.
3. Antes de abrir a folha, avisar com carinho que salvar é benefício do Plano Família.

No Plano Família:

1. Pode salvar.
2. Pode ver galeria.
3. Pode acessar thumbnails.
4. Pode continuar experiência criativa.

Regra técnica:

1. Não salvar base64 pesado como fluxo principal.
2. Usar arquivo local quando possível.
3. Gerar thumbnail separado.
4. Limitar histórico de undo.
5. Nunca segurar imagens gigantes desnecessariamente na memória.

### 11.5 Minhas artes

Free mostra explicação do benefício e não mostra galeria funcional. Plano Família mostra artes salvas com thumbnails e abre arte completa sob demanda.

## 12. Beni, onboarding e áudio do guia

Beni precisa ser resetado depois que Brincar estiver implementado, porque o tour depende da navegação final.

Entram antes do lançamento:

1. Onboarding curto.
2. Tour com Beni.
3. Fala para Início.
4. Fala para Aventuras.
5. Fala para Brincar.
6. Fala para Estrelinhas.
7. Fala para Perfil.
8. Fala para limite Free.
9. Fala para Plano Família.
10. Fala para download de história premium.
11. Fala para história pronta offline.
12. Fala para erro de conexão.
13. Fala para Criar com Beni.
14. Fala para Minhas artes.
15. Fala para conclusão de história.

Regras:

1. Beni não cobre alvo visual importante.
2. Card do guia não tampa navegação.
3. Deve existir opção de pular.
4. Deve existir opção sem voz.
5. Deve existir opção de rever apresentação.
6. Áudio do Beni é local e leve.
7. As falas oficiais precisam de documento próprio antes de gerar áudios.

## 13. Imagens e assets

### 13.1 Regras de formato

Cenas ilustradas:

1. Formato final recomendado: WebP lossy.
2. Qualidade inicial de teste: q80.
3. Budget por arquivo: 150 a 400 KB.
4. Não têm flood fill, podem usar compressão com perdas.
5. Validar visualmente no aparelho.

Páginas de colorir:

1. Formato recomendado: WebP lossless ou alta qualidade.
2. Nunca usar compressão destrutiva sem testar flood fill.
3. Budget por arquivo: 200 a 500 KB.
4. Validar preenchimento real em aparelho.
5. Fundo branco e contornos preservados.

Capas:

1. Formato: WebP.
2. Proporção: 16:9.
3. Dimensão padrão: 1672 x 941 ou equivalente aprovado.
4. Budget por arquivo: 80 a 200 KB.

Thumbnails:

1. Sempre usar thumbnail em listas, galerias, cards e prévias.
2. Budget: 10 a 40 KB.
3. Não usar imagem full em card pequeno.

### 13.2 Regras de conversão

1. Converter offline, nunca em runtime.
2. Fazer piloto com uma história Free e uma Premium.
3. Medir peso antes e depois.
4. Validar visualmente.
5. Validar flood fill.
6. Só escalar depois de aprovado.

## 14. Áudio, trilha e efeitos

### 14.1 Narração

1. Padrão atual: MP3 mono, 128 kbps CBR.
2. Não re encodar sem decisão deliberada.
3. Se houver variação perceptível, fazer normalização de volume.
4. Arquivo por cena.
5. Carregar sob demanda.

### 14.2 Beni

1. Áudios curtos.
2. Locais no binário.
3. Organizados por grupo.
4. Só gerar depois do roteiro oficial do Beni.
5. Não gravar falas antes da nova aba Brincar estar definida.

### 14.3 Trilha sonora e efeitos

Podem entrar no lançamento se forem leves, tiverem direitos de uso claros, tiverem toggle de mudo, não cobrirem narração, não aumentarem risco de peso, memória ou atraso, e não exigirem reescrever audio service.

Se algum desses pontos falhar, entram como atualização 1.1.

## 15. Livrinho e Colorir

### 15.1 Livrinho

Livrinho é experiência emocional central.

Regras:

1. Não usar base64 pesado na troca de páginas.
2. Usar `file://` ou asset local otimizado.
3. Pré carregar próxima página.
4. Evitar decodificar imagem full repetidamente.
5. Medir antes e depois.
6. Validar em Android real.
7. Manter dois modos quando aplicável: história ilustrada e meu livrinho.

### 15.2 Colorir

Regras:

1. Preservar flood fill.
2. Testar WebP de colorir em aparelho.
3. Limitar histórico de undo.
4. Não capturar viewport inteiro desnecessariamente.
5. Salvar somente no Plano Família.
6. Gerar thumbnail.
7. Não travar ao preencher áreas grandes.
8. Validar em Android 2 a 3 GB.

## 16. Performance, metas e orçamento

Metas oficiais:

| Métrica | Alvo |
|---|---|
| Cold start | Menor que 2s em aparelho intermediário |
| Warm start | Menor que 1s |
| Transições | 60fps sem jank perceptível |
| Memória ativa em Android 2 a 3 GB | 150 a 200 MB como alvo |
| História local | Abre instantaneamente |
| História premium não baixada | Progresso, retry e offline detection |
| História premium baixada | Abre como local |
| Narração | Início rápido, sem delay perceptível |
| Livrinho | Troca fluida |
| Colorir | Sem travar no preenchimento |
| Crash free sessions | Próximo de 100% |

O que nunca fazer:

1. Nunca carregar todas as histórias premium no startup.
2. Nunca carregar imagens full em listas.
3. Nunca usar base64 como armazenamento principal de imagem grande.
4. Nunca instalar biblioteca de performance sem evidência.
5. Nunca memoizar por reflexo sem profiler ou sintoma.
6. Nunca usar FlashList sem lista grande real.
7. Nunca otimizar sem medir baseline.

## 17. EAS Update, builds e manutenção

O projeto terá três pistas de entrega.

### Pista 1, EAS Update

Usar para correção de bug em JS, ajuste de texto, ajuste de layout, pequena lógica sem nativo, feature flag segura e correção visual pequena.

Não usar para código nativo, nova permissão, mudar propósito do app, liberar feature grande escondida ou alterar assinatura de SDK nativo.

### Pista 2, build de loja

Usar para novo módulo nativo, receita nativa, RevenueCat, mudança de permissão, upgrade de SDK, mudança de config plugin, mudança de bundle id, package, scheme ou ícone e release principal.

### Pista 3, pack remoto R2

Usar para novas histórias, novas cenas, novas páginas de colorir, novos áudios, mídia de jogos, packs de animais, conteúdo sazonal e correção de asset pesado.

### RuntimeVersion

Decisão oficial para o primeiro ciclo:

1. Usar `runtimeVersion` com policy `appVersion`.
2. Incrementar `version` a cada release de loja.
3. Testar EAS Update em preview antes de produção.
4. Validar `Updates.runtimeVersion` no AAB real.
5. Reavaliar `fingerprint` após o primeiro ciclo, somente se build real confirmar estabilidade.

### Rollout

1. OTA nunca vai direto para 100%.
2. Publicar em staging/preview primeiro.
3. Produção em rollout gradual.
4. Manter runbook de rollback.
5. Builds de loja também devem usar rollout gradual quando possível.

## 18. Compliance, privacidade e loja

### 18.1 Segurança infantil

Regras:

1. Sem anúncios no lançamento.
2. Sem chat.
3. Sem leaderboard público.
4. Sem conteúdo gerado por usuário público.
5. Sem tracking comportamental infantil.
6. Sem links externos acessíveis sem gate parental.
7. Compra apenas na Área dos Pais.
8. Política de privacidade obrigatória.
9. Data Safety do Google precisa refletir o app real.
10. App Privacy da Apple precisa refletir o app real.

### 18.2 Observabilidade permitida

Permitido no lançamento, se aprovado em bloco próprio:

1. Crash reporting sem dados pessoais da criança.
2. Métricas técnicas agregadas.
3. Erro de download de pack.
4. Falha de validação de hash.
5. Tempo de abertura.
6. Erro de inicialização.
7. Erro de compra ou restore sem expor dado sensível.

Não permitido sem revisão:

1. Firebase Analytics genérico.
2. SDK de anúncio.
3. Tracking comportamental.
4. Identificador de criança.
5. Eventos de uso detalhados por criança.
6. Gravação de tela.
7. Ferramenta de heatmap.

## 19. Roadmap oficial até o lançamento

### Fase 0, documento e higiene

Objetivo: preparar o repo e a governança.

Entregáveis:

1. Salvar este documento no repo.
2. Atualizar changelog.
3. Rodar `git status`.
4. Rodar `git gc`.
5. Auditar `.easignore`.
6. Ignorar backups não usados sem apagar às cegas.
7. Manter `.agents` e `.claude` fora do commit, salvo decisão específica.

Critério de saída: documento no repo, repo limpo, gates verdes e nenhum asset perdido.

### Fase 1, otimização de mídia

Objetivo: reduzir peso e destravar publicação.

Entregáveis:

1. Relatório de assets.
2. Piloto WebP em A Criação.
3. Piloto WebP em uma história premium.
4. Colorir em lossless ou alta qualidade.
5. Validação de flood fill.
6. Conversão das cenas aprovadas.
7. Conversão das capas.
8. Thumbnails quando necessário.
9. Medição de peso pós conversão.

Critério de saída: visual aprovado, flood fill aprovado, peso reduzido, nenhum fluxo quebrado, smoke e doctor verdes.

### Fase 2, infraestrutura híbrida piloto

Objetivo: provar pack remoto com uma história premium.

Entregáveis:

1. R2 configurado.
2. Domínio próprio CDN.
3. Manifesto versionado.
4. Downloader.
5. Validação `sha256`.
6. Persistência local.
7. Índice local de packs.
8. Estados de download.
9. Uma história premium removida do binário e servida via pack.
10. Offline após download.

Critério de saída: história premium piloto baixa, valida, abre, toca áudio, permite colorir, abre Livrinho, funciona offline e não entra no binário por `require()`.

### Fase 3, migração das 18 premium

Objetivo: tirar todo premium pesado do binário.

Entregáveis:

1. 18 packs premium.
2. Manifesto completo.
3. Fallback local das 2 grátis.
4. Remoção dos requires estáticos premium.
5. Auditoria de build real.
6. Acesso premium dependente de entitlement.

Critério de saída: binário base abaixo do limite com folga, A Criação e Noé locais, premium por download, offline premium pós download e Android real validado.

### Fase 4, Brincar completo

Objetivo: entregar Brincar como aba completa de lançamento.

Entregáveis:

1. Tab Brincar.
2. Tela Brincar com hierarquia final.
3. Palavrinhas do Beni.
4. Bichinhos da Bíblia.
5. Pares do Beni.
6. Criar com Beni.
7. Criar livre.
8. Minhas artes.
9. Regra das duas rodadas grátis.
10. Recompensas com estrelinhas.
11. Estado Free.
12. Estado Plano Família.
13. Assets otimizados.
14. Sons curtos se aprovados.

Critério de saída: Brincar parece premium, não trava, Free respeita limite, Plano Família libera ilimitado, sem asset gigante desnecessário e sem loading técnico.

### Fase 5, RevenueCat e acesso real

Objetivo: assinatura e Plano Família funcionando.

Entregáveis:

1. RevenueCat instalado.
2. Entitlement premium.
3. Paywall atrás da Área dos Pais.
4. Compra sandbox.
5. Restore purchases.
6. Family Sharing iOS configurado.
7. Conta única Android aceita no lançamento.
8. Gating de download premium.
9. Gating de Brincar ilimitado.
10. Gating de salvar arte e galeria.

Critério de saída: compra libera tudo, restore funciona, Free não acessa premium por brecha, premium não depende de `__DEV__`, sem compra fora da Área dos Pais.

### Fase 6, Beni e onboarding final

Objetivo: resetar tour com Brincar final.

Entregáveis:

1. Documento oficial de falas do Beni.
2. Áudios essenciais do Beni.
3. Onboarding curto.
4. Tour revisto.
5. Opção sem voz.
6. Opção de pular.
7. Opção de rever apresentação.
8. Beni não cobre alvos.

Critério de saída: criança entende o app, pais entendem Plano Família, Beni guia sem atrapalhar, áudios leves e padronizados.

### Fase 7, hardening de Livrinho, Colorir e Mapa

Objetivo: polir fluxos centrais.

Entregáveis:

1. Livrinho sem base64 pesado.
2. Pré carregamento de página.
3. Colorir validado.
4. Galeria com thumbnails.
5. Mapa claro.
6. Horizonte de futuro controlado.
7. Sem texto cortado.
8. Estrelinhas revisadas.

Critério de saída: fluxos centrais premium, Android intermediário sem travar, UX aprovada visualmente.

### Fase 8, loja, build e beta

Objetivo: preparar lançamento.

Entregáveis:

1. EAS Build configurado.
2. EAS Update configurado.
3. RuntimeVersion `appVersion`.
4. Build real Android.
5. Build real iOS, se aplicável.
6. Teste Android 2 a 3 GB.
7. TestFlight ou Internal track.
8. Política de privacidade.
9. Data Safety.
10. App Privacy.
11. Screenshots.
12. Descrição de loja.
13. Classificação etária.
14. Roteiro de beta.

Critério de saída: build abaixo do limite, restore funciona, download premium funciona, Brincar funciona, crash-free aceitável, sem bloqueador crítico.

### Fase 9, lançamento

Objetivo: publicar com segurança.

Entregáveis:

1. Submit Android.
2. Submit iOS, se decidido.
3. Rollout gradual.
4. Monitoramento.
5. Plano de suporte.
6. Lista de hotfix.
7. Runbook de rollback.

Critério de saída: app publicado, produto entrega o que promete, sem crash crítico, primeiro ciclo de feedback iniciado.

## 20. O que não fazer agora

1. Não criar backend por garantia.
2. Não colocar todas as premium no binário.
3. Não começar loja antes de medir build real.
4. Não aplicar WebP com perdas no colorir sem testar.
5. Não re encodar áudio sem motivo.
6. Não instalar analytics genérico.
7. Não criar Modo Igreja com conta antes do MVP.
8. Não usar Play Asset Delivery como arquitetura principal.
9. Não adiar Brincar para depois do lançamento, porque Eduardo decidiu que Brincar completo entra no lançamento.
10. Não fazer PR grande sem auditoria e descrição clara.
11. Não misturar otimização, Brincar, RevenueCat e Beni no mesmo commit.
12. Não criar tela de loading branca para download.
13. Não deixar premium quebrado offline.
14. Não usar `__DEV__` como regra de acesso.
15. Não esconder feature grande por OTA para evitar revisão de loja.

## 21. Critérios finais de loja

O app só pode ir para loja quando:

1. Binário real Android medido e abaixo do limite com folga.
2. A Criação e Noé locais e instantâneas.
3. As 18 premium fora do binário base.
4. Pelo menos um ciclo completo de download premium validado.
5. Todas as premium migradas e auditadas.
6. Brincar completo funcionando.
7. Duas rodadas Free funcionando.
8. Plano Família liberando tudo.
9. Salvar arte bloqueado no Free.
10. RevenueCat funcionando em sandbox.
11. Restore purchases funcionando.
12. Beni onboarding revisado.
13. Áudios essenciais do Beni integrados.
14. Livrinho fluido.
15. Colorir fluido.
16. Flood fill validado.
17. Android 2 a 3 GB testado.
18. Nenhum texto bíblico truncado.
19. Política de privacidade pronta.
20. Data Safety e App Privacy coerentes.
21. Sem tracker infantil indevido.
22. Gates verdes.
23. Validação visual final do Eduardo.
24. Beta com famílias sem bloqueador crítico.

## 22. Prompt base para Claude Code

Usar no começo de qualquer bloco relevante:

```text
Você está trabalhando no app infantil bíblico Pequenos Traços de Fé, em Expo React Native, guiado por Beni.

Leia docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md antes de qualquer ação.

Regras:
1. Um bloco por commit.
2. git add seletivo.
3. Sem push, merge, PR ou rebase sem aprovação explícita do Eduardo.
4. Não alterar arquitetura sem atualizar o documento.
5. Não usar __DEV__ como regra de acesso.
6. Não mover ou renomear assets sem inventário.
7. Não instalar backend, analytics, notificações, login, compras reais ou SDK novo sem bloco próprio aprovado.
8. Não tocar em arquivos fora da allowlist do bloco.
9. Rodar npm run audio:audit, npm run smoke e npx expo-doctor ao fim do bloco.
10. Entregar relatório final com arquivos alterados, testes, riscos e próximos passos.

Objetivo atual:
seguir a próxima fase aprovada pelo Eduardo no documento oficial.
```

## 23. Próxima ação recomendada

Próximo bloco oficial:

```text
Fase 0, salvar documento e higiene de repositório.
```

Depois:

1. Fase 1, otimização WebP com piloto.
2. Fase 2, R2 e pack remoto piloto.
3. Fase 3, migração das 18 premium.
4. Fase 4, Brincar completo.
5. Fase 5, RevenueCat.
6. Fase 6, Beni final.
7. Fase 7, hardening.
8. Fase 8, loja e beta.
9. Fase 9, lançamento.

## 24. Changelog

| Versão | Data | Mudança |
|---|---|---|
| v2.0 | 01/07/2026 | Documento oficial final. Travado lançamento com Brincar completo. Travada arquitetura híbrida obrigatória, R2, RevenueCat sem backend tradicional, packs persistentes, manifesto versionado, EAS Update, otimização WebP com ressalva de flood fill, Beni final antes de loja, compliance infantil, roadmap final até lançamento. |
