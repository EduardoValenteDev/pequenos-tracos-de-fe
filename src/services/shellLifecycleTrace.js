/**
 * shellLifecycleTrace.js — registro de instâncias VIVAS do shell de navegação.
 *
 * [F6-R3.x · A-05 / D-10 / F-C5 / F-08 / B-11]
 *
 * POR QUE ISTO EXISTE. O shell já contava MONTAGENS acumuladas (`TK-A-022`). Esse número
 * responde "quantas vezes o shell nasceu", que é uma pergunta diferente — e mais fraca —
 * da que a auditoria física precisa responder: **existem duas árvores de `MainTabs` vivas
 * ao mesmo tempo?**
 *
 * `montagens = 2` é AMBÍGUO. Pode ser:
 *   (a) remontagem normal — nasceu, morreu, nasceu de novo. Nunca houve duas. Saudável.
 *   (b) duas árvores simultâneas — nasceu, nasceu de novo sem a primeira morrer. Defeito.
 * O acumulado diz "2" nos dois casos. Só o contador de VIVOS separa um do outro, e ele
 * só existe se a DESMONTAGEM também for notada.
 *
 * CONTRATO. Montagem incrementa vivos; desmontagem decrementa; `vivos` nunca deveria
 * passar de `SHELL_MAX_VIVOS`; toda montagem deve ter a sua desmontagem correspondente.
 * A violação de qualquer um desses pontos vira `anomalia` — nomeada, não implícita.
 *
 * O QUE ISTO NÃO É. Não é telemetria, não é analytics, não é produto. É um contador em
 * memória, sem UI, sem persistência, sem rede e sem dependência nenhuma — de propósito:
 * quem observa o shell não pode ser mais frágil que o shell. Quem imprime é o chamador
 * (o `log` central do app, que cala em produção); este módulo só CONTA e DESCREVE.
 *
 * LIMITE HONESTO. Isto é OBSERVAÇÃO, não correção. Nenhuma decisão de navegação muda por
 * causa deste registro. Se a anomalia aparecer numa campanha física, ela vira evidência
 * para a fase proprietária — não uma alteração de navegação feita às cegas.
 */

/** Quantas árvores do mesmo shell podem estar vivas ao mesmo tempo. Mais que isso é defeito. */
export const SHELL_MAX_VIVOS = 1;

const registros = new Map();

function registroDe(nome) {
  const chave = String(nome || 'desconhecido');
  let r = registros.get(chave);
  if (!r) {
    r = { nome: chave, montagens: 0, desmontagens: 0, vivos: 0, picoVivos: 0, anomalia: null };
    registros.set(chave, r);
  }
  return r;
}

/**
 * Cópia imutável do estado. `pareado` é a invariante em uma linha:
 * toda montagem ou já morreu, ou está viva — e nunca há mais vivos que o teto.
 */
function instantaneo(r) {
  return {
    nome: r.nome,
    montagens: r.montagens,
    desmontagens: r.desmontagens,
    vivos: r.vivos,
    picoVivos: r.picoVivos,
    anomalia: r.anomalia,
    pareado: r.montagens === r.desmontagens + r.vivos && r.vivos <= SHELL_MAX_VIVOS,
  };
}

/** Nota o nascimento de uma árvore do shell. Devolve o instantâneo resultante. */
export function notarMontagem(nome) {
  const r = registroDe(nome);
  r.montagens += 1;
  r.vivos += 1;
  if (r.vivos > r.picoVivos) r.picoVivos = r.vivos;
  // Duas árvores vivas: a anomalia FICA registrada. O defeito aconteceu mesmo que o
  // estado se normalize depois — apagá-lo ao normalizar seria esconder a evidência.
  if (r.vivos > SHELL_MAX_VIVOS) r.anomalia = 'duas_arvores_vivas';
  return instantaneo(r);
}

/** Nota a morte de uma árvore do shell. Devolve o instantâneo resultante. */
export function notarDesmontagem(nome) {
  const r = registroDe(nome);
  r.desmontagens += 1;
  if (r.vivos <= 0) {
    // Desmontagem sem montagem correspondente: o piso é zero, mas não em silêncio.
    r.vivos = 0;
    r.anomalia = 'desmontagem_sem_montagem';
  } else {
    r.vivos -= 1;
  }
  return instantaneo(r);
}

/** Estado atual, sem alterá-lo. */
export function shellLifecycleSnapshot(nome) {
  return instantaneo(registroDe(nome));
}

/** Zera o registro (um shell, ou todos). Existe para os testes — o app nunca chama. */
export function resetShellLifecycle(nome) {
  if (nome === undefined) registros.clear();
  else registros.delete(String(nome));
}

/**
 * Linha legível para o `log` do chamador. Traz os DOIS números lado a lado — o acumulado
 * e os vivos — porque é a comparação entre eles que distingue remontagem de duplicação.
 */
export function descreverShellLifecycle(evento, snap) {
  const s = snap || {};
  const base = `[shell] ${s.nome} ${evento}`
    + ` · montagens #${s.montagens}`
    + ` · vivos ${s.vivos}/${SHELL_MAX_VIVOS}`
    + ` · pico ${s.picoVivos}`
    + ` · desmontagens ${s.desmontagens}`;
  if (s.anomalia) return `${base} · ANOMALIA: ${s.anomalia}`;
  return `${base} · ${s.pareado ? 'pareado' : 'PAREAMENTO PENDENTE'}`;
}
