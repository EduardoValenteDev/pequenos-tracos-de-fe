/**
 * palavrinhasGameMachine.js — Máquina de estados PURA de "Palavrinhas do Beni" (Fase 0 · T-A3).
 *
 * MÓDULO PURO: sem React Native, sem Expo, sem UI, sem áudio, sem timers reais, sem storage.
 * Toda função é `(estado, evento) → { estado, efeitos }`. NUNCA muta a entrada; o PLANO
 * recebido é congelado e apenas LIDO (a máquina nunca o altera). Timers/animações são
 * EFEITOS (tokens) que a tela interpreta — nenhuma animação libera um estado crítico.
 * (spec §15; plan P3)
 */

/** Estados (spec §15). Só PENSANDO e TRACANDO aceitam entrada do jogador. */
export const FASES = Object.freeze({
  SELECIONANDO_DIFICULDADE: 'selecionandoDificuldade',
  PREPARANDO_SESSAO: 'preparandoSessao',
  ABRINDO_LIVRO: 'abrindoLivro',
  APRESENTANDO_PALAVRA: 'apresentandoPalavra',
  PENSANDO: 'pensando',
  VALIDANDO_LETRA: 'validandoLetra',
  RESGATANDO: 'resgatando',
  PREPARANDO_TRACADO: 'preparandoTracado',
  TRACANDO: 'tracando',
  VALIDANDO_TRACADO: 'validandoTracado',
  CELEBRANDO: 'celebrando',
  PREPARANDO_REFORCO: 'preparandoReforco',
  TROCANDO_PAGINA: 'trocandoPagina',
  FINALIZADO: 'finalizado',
});

/** Fases que aceitam entrada direta do jogador. */
export const FASES_QUE_ACEITAM = Object.freeze([FASES.PENSANDO, FASES.TRACANDO]);

/** Efeitos (tokens interpretados pela tela — som, vibração, agendamentos, fila). */
export const EFEITOS = Object.freeze({
  SOM_LETRA_OK: 'somLetraOk',
  SOM_LETRA_ERRO: 'somLetraErro',
  SOM_PALAVRA: 'somPalavra',
  SOM_SEQUENCIA: 'somSequencia',
  SOM_RESULTADO: 'somResultado',
  VIBRAR_OK: 'vibrarOk',
  AGENDAR_DICA: 'agendarDica',
  AGENDAR_PROXIMA: 'agendarProxima',
  ENTRAR_RESGATE: 'entrarResgate',
  ENFILEIRAR_REFORCO: 'enfileirarReforco',
  FINALIZAR: 'finalizar',
});

/** Eventos aceitos. */
export const EVENTOS = Object.freeze({
  ESCOLHER_DIFICULDADE: 'ESCOLHER_DIFICULDADE',
  SESSAO_PRONTA: 'SESSAO_PRONTA',
  LIVRO_ABERTO: 'LIVRO_ABERTO',
  PALAVRA_PRONTA: 'PALAVRA_PRONTA',
  TOCAR_LETRA: 'TOCAR_LETRA',
  RESOLVER: 'RESOLVER',
  PEDIR_DICA: 'PEDIR_DICA',
  DESFAZER: 'DESFAZER',
  RESGATE_CONCLUIDO: 'RESGATE_CONCLUIDO',
  TRACADO_PRONTO: 'TRACADO_PRONTO',
  TRACADO_OK: 'TRACADO_OK',
  TRACADO_REINICIAR: 'TRACADO_REINICIAR',
  PROXIMA_PAGINA: 'PROXIMA_PAGINA',
  AVANCAR_PAGINA: 'AVANCAR_PAGINA',
  ABANDONAR: 'ABANDONAR',
});

export const PALAVRINHAS_MAX_ERROS = 3;   // 3ª tentativa incorreta ⇒ Resgate
export const REFORCO_MAX = 2;             // até 2 páginas extras de reforço

/** Brilho da palavra (spec §5): 3 limpo · 2 (1 erro OU 1 dica) · 1 (Resgate). PURO. */
export function brilhoDaPalavra({ erros = 0, dicas = 0, resgate = false } = {}) {
  if (resgate) return 1;
  const penal = Math.min(2, (erros > 0 ? 1 : 0) + (dicas > 0 ? 1 : 0));
  return Math.max(1, 3 - penal);
}

const zerosPalavra = () => ({ letrasTotais: 0, letrasRestantes: 0, erros: 0, dicas: 0, resgate: false, ultimaCorreta: null });

/** Sessão inicial (a UI dirige seleção → geração de plano → SESSAO_PRONTA). PURO. */
export function criarSessao() {
  return {
    fase: FASES.SELECIONANDO_DIFICULDADE,
    dificuldade: null,
    plano: Object.freeze([]),
    rounds: 0,
    rodada: 0,
    palavra: zerosPalavra(),
    // agregados da sessão
    concluidas: 0,
    independentes: 0,
    comDica: 0,
    comResgate: 0,
    brilhoTotal: 0,
    sequencia: 0,
    maiorSequencia: 0,
    filaReforco: [],
    reforcosFeitos: 0,
  };
}

const sem = (estado) => ({ estado, efeitos: [] });
const com = (estado, efeitos) => ({ estado, efeitos: Object.freeze(efeitos) });

export function aceitaEvento(estado, tipo) {
  if (!estado) return false;
  if (tipo === EVENTOS.TOCAR_LETRA || tipo === EVENTOS.PEDIR_DICA || tipo === EVENTOS.DESFAZER) return estado.fase === FASES.PENSANDO;
  if (tipo === EVENTOS.TRACADO_OK || tipo === EVENTOS.TRACADO_REINICIAR) return estado.fase === FASES.TRACANDO;
  return true;
}

export function terminou(estado) {
  return !!estado && estado.fase === FASES.FINALIZADO;
}

/** Item do plano da rodada atual (LEITURA apenas; nunca escreve no plano). PURO. */
export function paginaAtual(estado) {
  return estado && estado.plano ? (estado.plano[estado.rodada] || null) : null;
}

/**
 * Redutor puro. `(estado, evento) → { estado, efeitos }`. Transições inválidas para a fase
 * atual são NO-OP seguras (mesmo estado, efeitos vazios). PURO. Nunca muta a entrada.
 */
export function reduzir(estado, evento) {
  if (!estado || !evento || typeof evento.tipo !== 'string') return sem(estado);
  const { tipo } = evento;
  const f = estado.fase;

  switch (tipo) {
    case EVENTOS.ESCOLHER_DIFICULDADE:
      if (f !== FASES.SELECIONANDO_DIFICULDADE) return sem(estado);
      return sem({ ...estado, dificuldade: evento.dificuldade || null, fase: FASES.PREPARANDO_SESSAO });

    case EVENTOS.SESSAO_PRONTA: {
      if (f !== FASES.PREPARANDO_SESSAO) return sem(estado);
      const plano = Object.freeze(Array.isArray(evento.plano) ? evento.plano.slice() : []);
      return sem({ ...estado, plano, rounds: plano.length, rodada: 0, fase: FASES.ABRINDO_LIVRO });
    }

    case EVENTOS.LIVRO_ABERTO:
      if (f !== FASES.ABRINDO_LIVRO) return sem(estado);
      return sem({ ...estado, fase: FASES.APRESENTANDO_PALAVRA });

    case EVENTOS.PALAVRA_PRONTA: {
      if (f !== FASES.APRESENTANDO_PALAVRA) return sem(estado);
      const n = Number(evento.letras) > 0 ? Math.floor(evento.letras) : 0;
      const palavra = { letrasTotais: n, letrasRestantes: n, erros: 0, dicas: 0, resgate: false, ultimaCorreta: null };
      const dicaAuto = evento.dicaAuto === true;
      return com({ ...estado, palavra, fase: FASES.PENSANDO }, dicaAuto ? [EFEITOS.AGENDAR_DICA] : []);
    }

    case EVENTOS.TOCAR_LETRA: {
      if (f !== FASES.PENSANDO) return sem(estado);   // guard: só PENSANDO; anti-duplo-toque
      const correta = evento.correta === true;
      return sem({ ...estado, palavra: { ...estado.palavra, ultimaCorreta: correta }, fase: FASES.VALIDANDO_LETRA });
    }

    case EVENTOS.RESOLVER: {
      if (f === FASES.VALIDANDO_LETRA) {
        const p = estado.palavra;
        if (p.ultimaCorreta) {
          const restantes = Math.max(0, p.letrasRestantes - 1);
          const palavra = { ...p, letrasRestantes: restantes, ultimaCorreta: null };
          if (restantes === 0) return com({ ...estado, palavra, fase: FASES.PREPARANDO_TRACADO }, [EFEITOS.SOM_LETRA_OK, EFEITOS.VIBRAR_OK]);
          return com({ ...estado, palavra, fase: FASES.PENSANDO }, [EFEITOS.SOM_LETRA_OK, EFEITOS.VIBRAR_OK]);
        }
        const erros = p.erros + 1;
        const palavra = { ...p, erros, ultimaCorreta: null };
        if (erros >= PALAVRINHAS_MAX_ERROS) return com({ ...estado, palavra, fase: FASES.RESGATANDO }, [EFEITOS.SOM_LETRA_ERRO, EFEITOS.ENTRAR_RESGATE]);
        return com({ ...estado, palavra, fase: FASES.PENSANDO }, [EFEITOS.SOM_LETRA_ERRO]);
      }
      if (f === FASES.VALIDANDO_TRACADO) {
        return sem({ ...estado, fase: FASES.CELEBRANDO });
      }
      return sem(estado);
    }

    case EVENTOS.PEDIR_DICA: {
      if (f !== FASES.PENSANDO) return sem(estado);
      // dica NÃO pontua, NÃO avança; reduz o brilho máximo (registra uso)
      return com({ ...estado, palavra: { ...estado.palavra, dicas: estado.palavra.dicas + 1 } }, [EFEITOS.AGENDAR_DICA]);
    }

    case EVENTOS.DESFAZER: {
      if (f !== FASES.PENSANDO) return sem(estado);
      const p = estado.palavra;
      const restantes = Math.min(p.letrasTotais, p.letrasRestantes + 1);
      return sem({ ...estado, palavra: { ...p, letrasRestantes: restantes } });
    }

    case EVENTOS.RESGATE_CONCLUIDO: {
      if (f !== FASES.RESGATANDO) return sem(estado);
      const p = estado.palavra;
      const restantes = Math.max(0, p.letrasRestantes - 1);
      const palavra = { ...p, letrasRestantes: restantes, resgate: true, ultimaCorreta: null };
      if (restantes === 0) return com({ ...estado, palavra, fase: FASES.PREPARANDO_TRACADO }, [EFEITOS.SOM_LETRA_OK]);
      return com({ ...estado, palavra, fase: FASES.PENSANDO }, [EFEITOS.SOM_LETRA_OK]);
    }

    case EVENTOS.TRACADO_PRONTO:
      if (f !== FASES.PREPARANDO_TRACADO) return sem(estado);
      return sem({ ...estado, fase: FASES.TRACANDO });

    case EVENTOS.TRACADO_REINICIAR:
      if (f !== FASES.TRACANDO) return sem(estado);
      return sem(estado);   // reinício não muda a fase; UI redesenha

    case EVENTOS.TRACADO_OK:
      if (f !== FASES.TRACANDO) return sem(estado);
      return sem({ ...estado, fase: FASES.VALIDANDO_TRACADO });

    case EVENTOS.PROXIMA_PAGINA: {
      if (f !== FASES.CELEBRANDO) return sem(estado);
      // computa brilho e agrega a sessão; enfileira reforço se houve Resgate
      const p = estado.palavra;
      const brilho = brilhoDaPalavra(p);
      const semResgate = !p.resgate;
      const sequencia = semResgate ? estado.sequencia + 1 : 0;
      const efeitos = [EFEITOS.SOM_PALAVRA, EFEITOS.AGENDAR_PROXIMA];
      if (semResgate && sequencia > 0 && sequencia % 3 === 0) efeitos.push(EFEITOS.SOM_SEQUENCIA);
      const pag = paginaAtual(estado);
      const filaReforco = p.resgate && pag && pag.wordId ? [...estado.filaReforco, pag.wordId] : estado.filaReforco;
      if (p.resgate) efeitos.push(EFEITOS.ENFILEIRAR_REFORCO);
      const next = {
        ...estado,
        concluidas: estado.concluidas + 1,
        independentes: estado.independentes + (brilho === 3 && semResgate && p.dicas === 0 ? 1 : 0),
        comDica: estado.comDica + (p.dicas > 0 && semResgate ? 1 : 0),
        comResgate: estado.comResgate + (p.resgate ? 1 : 0),
        brilhoTotal: estado.brilhoTotal + brilho,
        sequencia,
        maiorSequencia: Math.max(estado.maiorSequencia, sequencia),
        filaReforco,
        fase: FASES.TROCANDO_PAGINA,
      };
      return com(next, efeitos);
    }

    case EVENTOS.AVANCAR_PAGINA: {
      if (f !== FASES.TROCANDO_PAGINA) return sem(estado);
      const proxima = estado.rodada + 1;
      if (proxima < estado.rounds) {
        return sem({ ...estado, rodada: proxima, palavra: zerosPalavra(), fase: FASES.APRESENTANDO_PALAVRA });
      }
      // fim das principais: há reforço pendente e ainda cabe?
      if (estado.filaReforco.length > 0 && estado.reforcosFeitos < REFORCO_MAX) {
        return sem({ ...estado, fase: FASES.PREPARANDO_REFORCO });
      }
      return com({ ...estado, fase: FASES.FINALIZADO }, [EFEITOS.SOM_RESULTADO, EFEITOS.FINALIZAR]);
    }

    case EVENTOS.ABANDONAR:
      if (f === FASES.FINALIZADO) return sem(estado);
      return sem({ ...estado, fase: FASES.FINALIZADO });

    default:
      return sem(estado);
  }
}

/** Reforço: consome 1 da fila e reapresenta (forma simplificada é decidida pela UI). PURO. */
export function iniciarReforco(estado) {
  if (!estado || estado.fase !== FASES.PREPARANDO_REFORCO) return sem(estado);
  const [, ...resto] = estado.filaReforco;
  return sem({ ...estado, filaReforco: resto, reforcosFeitos: estado.reforcosFeitos + 1, palavra: zerosPalavra(), fase: FASES.APRESENTANDO_PALAVRA });
}
