#!/usr/bin/env node
/**
 * check-env.js — [P3J-R] PORTÃO DE CONFIGURAÇÃO. Falha ANTES de abrir o aplicativo.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * --------------------------
 * A validação física do P3J mostrou "Não foi possível baixar. Tentar de novo" com a internet
 * funcionando. A causa não era rede: `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` não existia em lugar nenhum
 * (sem `.env`, sem bloco `env` no perfil development do eas.json, sem `app.config.js`, sem variável
 * de shell), então `useStoryPackDownload` resolvia `GLOBAL_MANIFEST_URL = null` e devolvia
 * `error: 'config'` SEM tocar a rede — e a tela pintava esse erro com a mesma frase de falha de
 * internet. Um defeito de configuração se disfarçava de defeito de conectividade.
 *
 * O risco já estava registrado (R24, RELATORIO_FECHAMENTO_LP.md): "não é declarada em nenhum perfil
 * do eas.json… a origem do valor não está versionada". Este script transforma esse risco silencioso
 * numa falha ALTA e LEGÍVEL, no terminal, antes do Metro subir.
 *
 * CONTRATO
 * --------
 * · Lê os `.env*` na MESMA ordem do Expo (@expo/env), depois o ambiente do processo.
 * · O ambiente do processo VENCE o arquivo — igual ao Expo.
 * · Exit 0 = configuração suficiente para iniciar. Exit 1 = falta algo obrigatório.
 * · NUNCA imprime o valor de uma variável: só nome, classificação e comprimento.
 *
 * USO
 * ---
 *   node scripts/check-env.js          # valida e explica o que fazer se faltar
 *   npm run start:dev                  # valida e SÓ ENTÃO sobe o Metro para o Development Client
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/**
 * Variáveis exigidas para o app funcionar de ponta a ponta.
 * `publica: true` significa que o valor NÃO é segredo: ele viaja para todo aparelho instalado e é
 * lido por qualquer pessoa que abra o app — logo pode viver em `.env.example` versionado.
 */
const OBRIGATORIAS = [
  {
    nome: 'EXPO_PUBLIC_GLOBAL_MANIFEST_URL',
    publica: true,
    descricao: 'URL do content-manifest.json que lista os packs de história para download',
    valida: (v) => {
      let u;
      try { u = new URL(v); } catch { return 'não é uma URL válida'; }
      if (u.protocol !== 'https:') return 'precisa ser https';
      if (!u.pathname.endsWith('.json')) return 'precisa apontar para um arquivo .json';
      return null;
    },
  },
];

/** Ordem de arquivos do @expo/env para NODE_ENV=development (o modo de `expo start`). */
function arquivosEnv(mode) {
  return [`.env.${mode}.local`, '.env.local', `.env.${mode}`, '.env'];
}

/** Parser mínimo de .env — só o que precisamos: `CHAVE=valor`, aspas opcionais, `#` comenta. */
function lerEnvFile(abs) {
  const out = {};
  let texto;
  try { texto = fs.readFileSync(abs, 'utf8'); } catch { return out; }
  for (const linha of texto.split(/\r?\n/)) {
    const l = linha.trim();
    if (!l || l.startsWith('#')) continue;
    const eq = l.indexOf('=');
    if (eq <= 0) continue;
    const chave = l.slice(0, eq).trim().replace(/^export\s+/, '');
    let valor = l.slice(eq + 1).trim();
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    }
    out[chave] = valor;
  }
  return out;
}

/** Resolve o valor efetivo e DE ONDE ele veio, sem nunca devolvê-lo para impressão direta. */
function resolver(nome, mode) {
  if (process.env[nome] != null && process.env[nome] !== '') {
    return { valor: process.env[nome], origem: 'ambiente do processo' };
  }
  for (const arq of arquivosEnv(mode)) {
    const abs = path.join(ROOT, arq);
    if (!fs.existsSync(abs)) continue;
    const v = lerEnvFile(abs)[nome];
    if (v != null && v !== '') return { valor: v, origem: arq };
  }
  if (process.env[nome] === '') return { valor: '', origem: 'ambiente do processo (VAZIA)' };
  return { valor: null, origem: null };
}

const mode = process.env.NODE_ENV || 'development';
const linhas = [];
let falhas = 0;

linhas.push('');
linhas.push('┌─ Portão de configuração (P3J-R) ───────────────────────────────────────────');
linhas.push(`│  modo: ${mode}`);
linhas.push(`│  arquivos consultados, nesta ordem: ${arquivosEnv(mode).join(' → ')}`);
const presentes = arquivosEnv(mode).filter((a) => fs.existsSync(path.join(ROOT, a)));
linhas.push(`│  arquivos encontrados: ${presentes.length ? presentes.join(', ') : '(nenhum)'}`);
linhas.push('│');

for (const v of OBRIGATORIAS) {
  const { valor, origem } = resolver(v.nome, mode);
  if (valor == null) {
    falhas++;
    linhas.push(`│  ✗ ${v.nome}`);
    linhas.push('│      AUSENTE — não está no ambiente nem em nenhum arquivo .env');
  } else if (valor === '') {
    falhas++;
    linhas.push(`│  ✗ ${v.nome}`);
    linhas.push(`│      VAZIA — definida em ${origem}, mas sem valor`);
  } else {
    const erro = v.valida ? v.valida(valor) : null;
    if (erro) {
      falhas++;
      linhas.push(`│  ✗ ${v.nome}`);
      linhas.push(`│      INVÁLIDA — ${erro} (origem: ${origem}, ${valor.length} caracteres)`);
    } else {
      linhas.push(`│  ✓ ${v.nome}`);
      linhas.push(`│      válida — origem: ${origem}, ${valor.length} caracteres`);
    }
  }
}

linhas.push('└────────────────────────────────────────────────────────────────────────────');

if (falhas > 0) {
  linhas.push('');
  linhas.push(`FALTA CONFIGURAÇÃO: ${falhas} variável(is) obrigatória(s) sem valor utilizável.`);
  linhas.push('');
  linhas.push('Sem isso, o botão "Baixar história" falha ANTES de tocar a rede e a tela mostra um');
  linhas.push('erro que PARECE falta de internet. Resolva assim, uma única vez:');
  linhas.push('');
  linhas.push('    cp .env.example .env          (Git Bash)');
  linhas.push('    Copy-Item .env.example .env   (PowerShell)');
  linhas.push('');
  linhas.push('O arquivo `.env` fica FORA do Git (.gitignore) e vale para todas as sessões seguintes:');
  linhas.push('não é preciso exportar variável no shell a cada vez.');
  const soPublicas = OBRIGATORIAS.every((v) => v.publica);
  if (soPublicas) {
    linhas.push('');
    linhas.push('Todas as variáveis exigidas aqui são PÚBLICAS (viajam no app instalado e são lidas por');
    linhas.push('qualquer usuário) — por isso `.env.example` já traz os valores reais, e não segredos.');
  }
  console.error(linhas.join('\n'));
  process.exit(1);
}

linhas.push('');
linhas.push('Configuração completa. Pode iniciar.');
console.log(linhas.join('\n'));
process.exit(0);
