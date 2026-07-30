/**
 * coloring60LocalAssets.js — Registro estático (Metro-safe) das FONTES RUNTIME locais
 * do piloto Colorir 60. Consulta por identidade composta (`storyId`, `activityId`).
 *
 * Regras de Metro (invioláveis): todo `require()` de asset é LITERAL e relativo, e aponta
 * para um arquivo que EXISTE fisicamente. Este módulo NÃO importa coloringImages.js, NÃO
 * reusa getColoringImage, NÃO constrói caminho por concatenação/template e NÃO usa
 * `require()` dinâmico. Ele também NÃO é um resolvedor (resolução por regra de negócio,
 * fallback e local-first pertencem ao P2) — é apenas o mapa estático de fontes.
 *
 * Estado por atividade — as TRÊS estão ATIVAS neste registro:
 *   - `light`            → reusa DIRETAMENTE scene_02.png (mesmo arquivo dos 200 legados),
 *                          por caminho literal relativo, idêntico ao padrão de
 *                          coloringImages.js. Sem cópia, sem mover, sem renomear, sem
 *                          activities/light.png.
 *   - `living_world`     → seu próprio PNG sob activities/.
 *   - `people_and_care`  → seu próprio PNG sob activities/.
 *
 * Os caminhos exatos dessas duas vivem SÓ nos `require()` abaixo, de propósito: o smoke muta
 * aquele literal para provar que um path incorreto é rejeitado, e repetir a string aqui em
 * cima faria a mutação acertar o comentário e sobreviver.
 *
 * `living_world` e `people_and_care` NÃO são mais `null`: seus PNGs foram integrados
 * atomicamente com os `require()` literais abaixo, então não resta slot vazio aqui. O
 * `null` continua valendo como AUSÊNCIA HONESTA de identidade desconhecida — nunca como
 * placeholder nem lineart alheio.
 *
 * "A Criação" permanece LOCAL: as três fontes são assets do bundle, não vêm de pack remoto.
 * A migração para conteúdo remoto NÃO é implementada aqui e exige spec própria.
 *
 * Governança: specs 014/015/016/017 · DECISIONS.md PL01A-03/PL01G · tasks.md P1.T2/T3/T4.
 */

// `light` reusa scene_02.png por caminho literal relativo — é o MESMO arquivo que atende a
// cena 02 no mapa legado, compartilhado de propósito, sem cópia. De src/assets/, "../../"
// chega à raiz do repo; o alvo resolve para assets/stories/creation/coloring/scene_02.png
// (mesmo literal usado em coloringImages.js).
const CREATION_LIGHT_SOURCE = require('../../assets/stories/creation/coloring/scene_02.png');

// Mapa estático por (storyId → activityId → fonte runtime). As três atividades resolvem.
// INVARIANTE do Metro que continua valendo: NUNCA colocar aqui um require() de arquivo
// ainda inexistente — o bundle quebra na hora, não em runtime.
const COLORING60_LOCAL_SOURCES = {
  creation: {
    light: CREATION_LIGHT_SOURCE,
    living_world: require('../../assets/stories/creation/coloring/activities/living_world.png'),
    people_and_care: require('../../assets/stories/creation/coloring/activities/people_and_care.png'),
  },
};

/**
 * getColoring60LocalSource(storyId, activityId) — fonte runtime estática da atividade, ou
 * `null` quando a identidade é desconhecida. Hoje as três atividades de "A Criação" têm
 * fonte, então `null` significa identidade fora do piloto. Retorno honesto: `null` NÃO é
 * erro nem placeholder.
 */
export function getColoring60LocalSource(storyId, activityId) {
  const byStory = COLORING60_LOCAL_SOURCES[storyId];
  if (!byStory) return null;
  const source = byStory[activityId];
  return source == null ? null : source;
}
