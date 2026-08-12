import React from 'react';
import ContentContainer from '../ui/ContentContainer';

/**
 * CenteredContent — DEPRECADO em favor de `ContentContainer` (Fase 6 · B1 · P-30).
 *
 * Este componente era a SEGUNDA primitiva de largura de conteúdo do app, concorrente
 * de `ContentContainer` (A0.3), e trazia dois valores próprios que ninguém governava:
 * corte de tablet em `768` (literal) e largura máxima `720` (literal). Ou seja: a mesma
 * decisão de layout tinha duas respostas diferentes dependendo da tela.
 *
 * B1 resolve por DELEGAÇÃO, não por remoção: os 4 consumidores de então (Home, Brincar,
 * Perfil, Histórias) continuaram funcionando sem edição, e a decisão de largura passou a
 * ser tomada num lugar só — `tokens.breakpoints` + `tokens.maxContentWidth`, via
 * `ContentContainer`.
 *
 * Estado atual (Fase 6 · F6-SG-C · TK-C-013): sobraram **2** consumidores — Perfil e
 * Histórias. Home e Brincar saíram em `C-C4` (`TK-C-008`) porque são telas de ESCOLHA e
 * passaram a compor com `HubSurface`: numa faixa expandida, coluna centralizada de
 * leitura era a resposta errada para uma grade de cartões. O encolhimento é a direção
 * certa para um atalho deprecado — mas chegar a zero seria remoção por acidente, e por
 * isso `TA-14 [21/21]` vigia a orfandade deste arquivo em vez de deixá-la acontecer em
 * silêncio.
 *
 * ⚠️ Mudança visual esperada em tablet, e ela é o objetivo: a coluna de conteúdo passa
 * de `720` fixo acima de 768dp para `560` (≥600dp) / `640` (≥900dp). É um dos pontos
 * do roteiro de validação física da banda 600–767.
 *
 * Não usar em código novo — importe `ContentContainer` diretamente.
 */
export default function CenteredContent({ children, style }) {
  return <ContentContainer style={style}>{children}</ContentContainer>;
}
