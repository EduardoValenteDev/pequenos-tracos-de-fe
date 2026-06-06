/**
 * productConfig.js — Configuração central de produto do Beni.
 * Fonte de verdade para nome, marca, e-mail de suporte e labels de UI.
 *
 * Regra: qualquer texto de marca que aparece na UI deve vir daqui.
 * Não hardcode "Beni", "Pequenos Traços" ou e-mails diretamente nos componentes.
 */

const productConfig = {
  // ── Identidade ────────────────────────────────────────────────────────────
  appName: 'Beni',
  appSubtitle: 'Histórias bíblicas para pequenos corações',
  mascotName: 'Beni',
  oldMascotName: 'Lumi', // mantido para referência de migração

  // ── Versão ────────────────────────────────────────────────────────────────
  versionLabel: 'Beni · v1.0 MVP',

  // ── Suporte ───────────────────────────────────────────────────────────────
  // TODO: substituir pelo e-mail oficial do domínio Beni quando disponível.
  supportEmail: 'contato@pequenostracosdefe.com',

  // ── Área dos Pais ─────────────────────────────────────────────────────────
  parentAreaTitle: 'Área dos Pais',

  // ── Nomes oficiais das áreas (tabs) ───────────────────────────────────────
  homeName: 'Início',
  storiesName: 'Aventuras',
  atelierName: 'Ateliê',
  rewardsName: 'Estrelinhas',
  profileName: 'Perfil',

  // ── Nomes conceituais futuros (Sprint Beni 2.0+) ──────────────────────────
  homeConcept: 'Portal do Beni',
  storiesConcept: 'Mapa das Histórias',
  atelierConcept: 'Ateliê do Beni',
  rewardsConcept: 'Álbum de Estrelinhas',
  profileConcept: 'Meu Cantinho',
};

export default productConfig;
