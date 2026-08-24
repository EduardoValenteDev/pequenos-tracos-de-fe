import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, navSidebarRole, navSidebarWidth } from '../theme/tokens';
import { getAvatarImage, getProfileAvatarSkinTone } from '../data/avatars';
import AvatarImage from './AvatarImage';
import { useProfile } from '../context/ProfileContext';
import BeniCircularArt from './common/BeniCircularArt';
import FaithIcon from './ui/FaithIcon';
import { registerGuideTarget } from '../services/guideTargetRegistry';
import { useWindowBand, BANDS } from '../hooks/useWindowBand';

/**
 * [`TK-C-019`] Faixa → chave dos *tokens* de navegação lateral.
 *
 * A faixa COMPACTA não tem chave, e a ausência é o contrato: no telefone a
 * navegação é a barra inferior, então não existe papel lateral a escolher. É a
 * restrição 6 de PLAN §19.1 (`CN-1`) chegando aqui pela FORMA do *token*, não por
 * um `if` que alguém possa relaxar depois.
 *
 * A tradução mora no consumidor porque `useWindowBand` importa `breakpoints` de
 * `tokens.js` — o *token* não pode importar `BANDS` de volta sem fechar um ciclo.
 * Mesmo arranjo de `HubSurface.HUB_COLUMN_CEILING`.
 */
const SIDEBAR_BAND_KEY = Object.freeze({
  [BANDS.MEDIUM]: 'tablet',
  [BANDS.EXPANDED]: 'tabletL',
});

/** Papel de navegação desta faixa — `null` onde não existe barra lateral. */
export function sidebarRole(band) {
  const chave = SIDEBAR_BAND_KEY[band];
  return chave ? navSidebarRole[chave] ?? null : null;
}

/**
 * Largura ESTRUTURAL da barra nesta faixa — quanto a navegação OCUPA.
 *
 * Não é espaço disponível, e ninguém deve subtraí-la da janela para descobrir o que
 * sobra: quem precisa do espaço MEDE (restrição 4 de §19.1 · `G-SID-3` · `RG-12`).
 * `null` significa "esta faixa não tem barra lateral", nunca "largura zero".
 */
export function sidebarWidth(band) {
  const papel = sidebarRole(band);
  const largura = papel ? navSidebarWidth[papel] : undefined;
  return Number.isFinite(largura) ? largura : null;
}

/**
 * TabletSidebar — APRESENTAÇÃO da tab bar no tablet (Fase 6 · B3 · P-27).
 *
 * Não decide navegação e não tem catálogo próprio de abas. Até a Fase 6 este arquivo
 * mantinha uma cópia da lista de abas, que podia divergir de `TAB_DEFS` sem ninguém
 * perceber. Agora os itens chegam prontos em `items`, derivados das rotas REAIS do
 * `Tab.Navigator` — o que a sidebar mostra é o que o navegador tem.
 *
 * Bloco 1.2 (mantido) — `name` é a IDENTIDADE DE ROTA (onTabPress navega por ela).
 * `label` é o que o usuário lê. Emoji saiu: ícone semântico via FaithIcon.
 *
 * ── Fase 6 · F6-SG-C · `C-C8` — os três defeitos de PLAN §19 corrigidos aqui ──
 *
 * DEFEITO 1 (`TK-C-019`) — `styles.sidebar: { width: 200 }` fixo, idêntico a 600dp e
 * a 1366dp. A largura saiu do componente e passou à fonte canônica (`tokens.js`),
 * com semântica adaptativa: `rail` na faixa média, `full` na expandida. O literal
 * não foi renomeado — §19.1 diz que `sidebarWidth: 200` não cumpriria o requisito.
 *
 * DEFEITO 2 (`TK-C-020`) — `navButtons: { gap: 2 }` sem `flex` e sem ancoragem
 * inferior deixava ~700pt de vazio vertical em iPad retrato: a coluna de navegação
 * terminava logo abaixo do perfil e o resto da barra era nada. Agora ela CRESCE até
 * o fim da barra e ancora o grupo embaixo. O grupo continua coeso de propósito —
 * espalhar cinco destinos por ~900pt daria um a cada 180pt e eles deixariam de ser
 * lidos como um conjunto. `flexGrow: 1` em vez de `flex: 1` porque `flex` também
 * liga `flexShrink`, e numa janela baixa a barra passaria a cortar os PRIMEIROS
 * botões (o `justifyContent` empurra o corte para cima). Crescer sem encolher é o
 * que o defeito pede. Quanto de vazio sobrou é medida FÍSICA (`SD-4`, §28 #16).
 *
 * DEFEITO 3 (`TK-C-021`) — `import { colors } from '../theme/colors'` era tema
 * legado concorrente. A origem passou a ser `theme/tokens`. A troca é de ORIGEM,
 * mas nenhuma cor da paleta v1.1 coincide em valor com a legada, então a aparência
 * MUDA e o registro é explícito (conferência visual em aparelho pendente):
 *
 *   sidebar bg .......... colors.sidebarBg  #FFF4E7 → color.paper100  #F8F0DC
 *   borda/divisor ....... colors.border     #EED8C4 → color.paper200  #EFE3C8
 *   trilho de progresso . colors.border     #EED8C4 → color.paper300  #E4D5B4  (papel nomeado no token)
 *   preenchimento ....... colors.primary    #F4B23C → color.gold300   #E8C05A  (recompensa)
 *   estrela/moldura ..... colors.primary    #F4B23C → color.gold500   #C99A3B  (ornamento)
 *   saudação ............ colors.text       #3A2A1E → color.ink900    #3E2E1B
 *   texto secundário .... colors.textLight  #8A7464 → color.ink600    #7A6A50
 *   fundo do item ativo . colors.activeBg   #FFEAD7 → color.terra100  #F7DED2
 *   ícone ativo ......... colors.primary    #F4B23C → color.terra500  #C9502A
 *   rótulo ativo ........ colors.primaryDark#D98A18 → color.terra600  #A73F1F
 *   fundo do Beni ....... literal           #FFF8EF → color.paper50   #FDF8EE
 *
 * O estado ativo virou TERRACOTA, não dourado: selecionar um destino é AÇÃO, e o
 * dourado é recompensa ("NUNCA botão", §2.1). O par claro/escuro do original
 * (`primary`/`primaryDark`) foi preservado como `terra500`/`terra600`.
 *
 * NÃO migrado de propósito: `fontFamily` (`FredokaOne`/`Nunito`) e a sombra — não
 * vêm de `theme/colors` e trocá-los seria migração de tipografia e de forma sem
 * task. Os defeitos 4 e 5 de §19 (alvo de toque ≈52pt e textos de 10/11px) são do
 * bloco `B2`, que continua BLOQUEADO: nenhuma medida deles foi tocada aqui.
 *
 * Props:
 *   items      — [{ name, label, faithIcon }] na ordem das rotas do navegador
 *   activeTab  — nome da rota focada (estado real do navegador)
 *   onTabPress — recebe o nome da rota; quem navega é o shell
 */
export default function TabletSidebar({ items, activeTab, onTabPress, totalStars, maxStars }) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { band } = useWindowBand();

  const largura = sidebarWidth(band);
  const starsPercent = maxStars > 0 ? Math.min(totalStars / maxStars, 1) : 0;
  const greeting = profile.name ? `Olá, ${profile.name}!` : 'Olá!';

  function starsLabel(n) {
    return n === 1 ? '1 estrela' : `${n} estrelas`;
  }

  // Faixa sem papel lateral não recebe barra lateral. Hoje é inalcançável — o shell
  // só monta esta barra quando a faixa não é compacta —, e é justamente por isso que
  // a guarda existe: se aquela condição afrouxar, o telefone não herda uma barra.
  if (largura === null) return null;

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: largura,
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      {/* Área do perfil */}
      <View style={styles.profileArea}>
        <View style={styles.lumiRow}>
          <View style={styles.avatarCircle}>
            <AvatarImage source={getAvatarImage(profile.avatarId, getProfileAvatarSkinTone(profile, profile.avatarId))} size={56} />
          </View>
          <BeniCircularArt
            variant="avatarBase"
            size={30}
            backgroundColor={color.paper50}
            borderColor={color.gold500 + '40'}
            borderWidth={2}
            showShadow={false}
            style={styles.lumiBadge}
            accessibilityLabel="Beni"
          />
        </View>
        <Text style={styles.greeting} numberOfLines={1}>{greeting}</Text>
        {/* Bloco 1.2: emoji ⭐ trocado por ícone semântico. */}
        <View style={styles.starsRow}>
          <FaithIcon name="star" size={14} color={color.gold500} />
          <Text style={styles.stars}>{starsLabel(totalStars)} alcançadas</Text>
        </View>
        <View style={styles.progressOuter}>
          <View style={[styles.progressInner, { width: `${starsPercent * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{totalStars}/{maxStars}</Text>
      </View>

      {/* Botões de navegação */}
      <View style={styles.navButtons}>
        {(items ?? []).map(tab => {
          const isActive = activeTab === tab.name;
          const btn = (
            <TouchableOpacity
              style={[styles.navButton, isActive && styles.navButtonActive]}
              onPress={() => onTabPress(tab.name)}
              activeOpacity={0.75}
            >
              <View style={styles.navIcon}>
                <FaithIcon
                  name={tab.faithIcon}
                  size={isActive ? 24 : 21}
                  color={isActive ? color.terra500 : color.ink600}
                />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
          // Itens que viram ALVO medível dos guias na sidebar do tablet:
          //   Aventuras → Card 2 do tour de Aventuras · Início → Card 1 do guia da Home.
          const sidebarTargetName =
            tab.name === 'Aventuras' ? 'adventures.sidebarTab'
              : tab.name === 'Início' ? 'home.sidebarTab'
                : tab.name === 'Ateliê' ? 'atelier.sidebarTab'
                  : tab.name === 'Estrelinhas' ? 'stars.sidebarTab'
                    : tab.name === 'Perfil' ? 'profile.sidebarTab'
                      : null;
          if (sidebarTargetName) {
            return (
              <View key={tab.name} collapsable={false} ref={registerGuideTarget(sidebarTargetName)}>
                {btn}
              </View>
            );
          }
          return <View key={tab.name}>{btn}</View>;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sem `width`: a largura estrutural é adaptativa e vem de `tokens.js` (`TK-C-019`).
  sidebar: {
    backgroundColor: color.paper100,
    borderRightWidth: 1,
    borderRightColor: color.paper200,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    paddingHorizontal: 10,
  },

  profileArea: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.paper200,
    marginBottom: 12,
  },
  lumiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.gold500 + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: color.gold500 + '50',
  },
  // O círculo/borda/fundo vêm de BeniCircularArt; aqui só a posição relativa.
  lumiBadge: {
    marginLeft: -10,
  },
  greeting: {
    fontFamily: font.bodyBold,
    fontSize: 15,
    color: color.ink900,
    marginBottom: 3,
    textAlign: 'center',
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  stars: {
    fontFamily: font.body,
    fontSize: 11,
    color: color.ink600,
    textAlign: 'center',
  },
  progressOuter: {
    width: '90%',
    height: 7,
    backgroundColor: color.paper300,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressInner: {
    height: '100%',
    backgroundColor: color.gold300,
    borderRadius: 4,
  },
  progressLabel: {
    fontFamily: font.body,
    fontSize: 10,
    color: color.ink600,
  },

  // `TK-C-020`: cresce até o fim da barra e ancora o grupo embaixo — sem `flexShrink`,
  // para que uma janela baixa nunca corte os primeiros destinos.
  navButtons: { flexGrow: 1, justifyContent: 'flex-end', gap: 2 },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    gap: 10,
  },
  navButtonActive: {
    backgroundColor: color.terra100,
    borderWidth: 1,
    borderColor: color.terra500 + '33',
  },
  // Bloco 1.2: ícone semântico (FaithIcon) no lugar do emoji.
  navIcon: { width: 26, alignItems: 'center', justifyContent: 'center' },
  navLabel: {
    fontFamily: font.body,
    fontSize: 14,
    color: color.ink600,
    fontWeight: '600',
  },
  navLabelActive: {
    fontFamily: font.bodyBold,
    color: color.terra600,
    fontWeight: '700',
  },
});
