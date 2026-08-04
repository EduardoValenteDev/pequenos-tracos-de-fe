/**
 * atelierResetService.js — EXCLUSÃO PARENTAL das criações do Criar Livre (Spec 019 · S4).
 *
 * POR QUE ESTE MÓDULO EXISTE, SEPARADO. O app guarda criações da criança em DOIS storages com
 * donos, formatos e ciclos de vida diferentes:
 *   · Colorir com o Beni (C60) → `@ptf_drawing60_*` + blobs em `drawings60/`;
 *   · Criar Livre               → `ptf_atelier_arts_*` + blobs em `atelier/`.
 * Um único botão "Apagar criações" que varresse os dois seria uma armadilha para o responsável:
 * quem quer limpar a galeria de desenhos livres não está pedindo para destruir as pinturas das
 * histórias, e vice-versa. Cada storage tem sua própria ação, sua própria confirmação e seu
 * próprio relatório. Este módulo é a fronteira do Criar Livre — ele NÃO importa nada do C60, de
 * modo que apagar aqui não pode alcançar as pinturas nem por engano futuro.
 *
 * COMO ELE APAGA. Delegando: `atelierStorage` continua sendo o único dono das chaves e dos
 * arquivos do Criar Livre, e `deleteArt(id)` já apaga preview, miniatura, registro e entrada do
 * índice. Este serviço apenas ENUMERA o que existe (pelo índice canônico), pede a exclusão item a
 * item e VERIFICA o resultado. Nenhuma chave é montada aqui, nenhum caminho de arquivo é montado
 * aqui: sem `getAllKeys`, sem prefixo aberto, sem `AsyncStorage.clear()`, sem varredura de
 * diretório. O que não está no índice do Criar Livre não é candidato.
 *
 * O QUE NÃO É TOCADO: pinturas do C60, progresso, conclusão, entitlement, dados de compra,
 * consentimentos, configurações parentais e antifarming.
 *
 * O ATELIÊ LEGADO CONTINUA AUSENTE. Este módulo é serviço de dados; não reintroduz tela alguma.
 */
import { listArts, getArt, deleteArt } from './atelierStorage';
import { warn } from '../utils/logger';

/**
 * deleteAllAtelierCreations() — apaga TODAS as criações do Criar Livre.
 *
 * Relatório estruturado `{ ok, requested, removed, failed, residual }`. As contagens são MEDIDAS
 * depois do fato, nunca presumidas a partir de "chamei a função": `deleteArt` engole os próprios
 * erros, então acreditar nela seria anunciar sucesso no escuro.
 *
 * A VERIFICAÇÃO USA DUAS EVIDÊNCIAS INDEPENDENTES, porque elas falham de formas diferentes:
 *   · o ÍNDICE (`listArts`) — se a reescrita do índice falhar, a arte reaparece na galeria;
 *   · o REGISTRO individual (`getArt`) — se o índice foi reescrito mas o registro sobreviveu, a
 *     galeria fica limpa e o dado continua no aparelho. Sucesso declarado aí seria mentira.
 * Qualquer uma das duas ainda respondendo pela identidade a coloca em `residual`, e `ok` vira
 * falso. NUNCA lança.
 */
export async function deleteAllAtelierCreations() {
  const relatorio = { ok: true, requested: 0, removed: 0, failed: [], residual: [] };

  let antes = [];
  try {
    antes = (await listArts()) || [];
  } catch (e) {
    // Sem conseguir ENUMERAR não existe exclusão dirigida — e a alternativa (varrer prefixo) é
    // exatamente o que esta arquitetura proíbe. Falha honesta, disco intacto.
    warn('atelierReset.list:', e);
    relatorio.ok = false;
    return relatorio;
  }

  const ids = [];
  antes.forEach((a) => {
    const id = a && a.id;
    if (typeof id === 'string' && id && !ids.includes(id)) ids.push(id);
  });
  relatorio.requested = ids.length;
  if (ids.length === 0) return relatorio;

  for (let i = 0; i < ids.length; i += 1) {
    try {
      await deleteArt(ids[i]);
    } catch (e) {
      relatorio.failed.push(ids[i]);
      warn('atelierReset.delete:', e);
    }
  }

  let depois = [];
  try {
    depois = (await listArts()) || [];
  } catch (e) {
    // Não dá para verificar ⇒ não dá para declarar sucesso.
    warn('atelierReset.verify:', e);
    relatorio.ok = false;
    return relatorio;
  }
  const noIndice = new Set(depois.map((a) => a && a.id));

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    let sobreviveu = noIndice.has(id);
    if (!sobreviveu) {
      try {
        sobreviveu = (await getArt(id)) != null;
      } catch (e) {
        sobreviveu = true;
        warn('atelierReset.verifyRecord:', e);
      }
    }
    if (sobreviveu) relatorio.residual.push(id);
    else relatorio.removed += 1;
  }

  if (relatorio.failed.length > 0 || relatorio.residual.length > 0) relatorio.ok = false;
  return relatorio;
}

export default { deleteAllAtelierCreations };
