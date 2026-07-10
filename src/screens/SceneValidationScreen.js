/**
 * SceneValidationScreen — Validação visual de cenas (SÓ desenvolvimento).
 *
 * Superfície de REVISÃO HUMANA: percorre as 20 histórias, cena a cena (01..10),
 * mostrando lado a lado o conteúdo oficial e as duas imagens atuais:
 *   - titulo + textoNarracao       (fonte oficial de narração, já reancorada)
 *   - imagem ilustrada atual       (storySceneIllustrations)
 *   - tituloColorir + instrucaoColorir (briefing oficial de colorir, já reancorado)
 *   - imagem de colorir atual      (coloringImages)
 *
 * SÓ LEITURA. Não altera progresso, plano, conquistas, imagens, áudio ou conteúdo.
 * Não toca áudio: a validação é pelo TEXTO exibido — os MP3 ainda são os antigos.
 * Não persiste decisões: nesta fase a tela apenas EXIBE. A decisão é do Eduardo.
 *
 * Segurança: a rota só é registrada sob `isInternalToolsEnabled()` (AppNavigator) e
 * a entrada vive na seção "Administração (dev)" da Área dos Pais. Além disso a própria
 * tela revalida o gate e se recusa a renderizar fora de dev (defesa em profundidade).
 */
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stories } from '../data/stories';
import { getColoringImage } from '../assets/coloringImages';
import { getSceneIllustrationAsset } from '../data/storySceneIllustrations';
import { isInternalToolsEnabled } from '../config/internalTools';
import SoundButton from '../components/SoundButton';

/**
 * Cenas marcadas para ATENÇÃO pelas auditorias. NÃO são decisões — são hipóteses.
 * Chave: `${storyId}:${tipo}:${cena}` · tipo ∈ 'ilu' | 'col'.
 */
const ATENCAO = {
  // ── quarentena (arte nova do Eduardo, ainda não commitada) ──
  'abraham_stars:col:4': ['quarentena', 'A arte transmite fé e confiança, ou parece apenas um homem olhando o céu?'],
  'good_samaritan:col:1': ['quarentena', 'A criança entende que alguém está PERGUNTANDO algo a Jesus?'],
  'samuel_hears_god:col:10': ['quarentena', 'Confirma que "Samuel adulto" está resolvido nesta folha?'],
  'samuel_hears_god:ilu:10': ['quarentena · possível peso alto', 'Samuel é claramente adulto? Reencodar agora ou no 2C?'],
  'lost_sheep:ilu:8': ['quarentena · possível deslocamento · possível peso alto', 'A arte mostra a ovelha nos ombros (cena 9) em vez do encontro?'],
  'lost_sheep:ilu:9': ['quarentena · possível deslocamento · possível peso alto', 'A arte mostra a festa (cena 10) em vez dos ombros?'],
  'lost_sheep:ilu:10': ['quarentena · possível deslocamento · possível peso alto', 'A arte mostra o abraço (cena 8) em vez da alegria final?'],
  'lost_sheep:col:9': ['quarentena · possível deslocamento', 'Esta folha (festa) pertence à cena 10?'],
  'miraculous_catch:col:5': ['quarentena · possível arte nova', 'A rede já está cheia? A cena 5 é ANTES do milagre.'],

  // ── possível deslocamento ──
  'esther_queen:col:3': ['possível deslocamento', 'Mostra a coroação (cena 4) em vez da preparação de Ester?'],
  'esther_queen:col:4': ['possível deslocamento', 'Mostra Mardoqueu no portão (cena 5)?'],
  'esther_queen:col:5': ['possível deslocamento', 'Mostra o orgulho de Hamã (cena 6)?'],
  'esther_queen:col:6': ['possível deslocamento', 'Mostra o aviso a Ester (cena 7)?'],
  'esther_queen:col:7': ['possível deslocamento', 'Mostra o jejum e a oração (cena 8)?'],
  'esther_queen:col:8': ['possível deslocamento', 'Mostra Ester diante do rei (cena 9)?'],

  'joseph_colorful_coat:col:2': ['possível deslocamento', 'Mostra a túnica sendo entregue (cena 1)?'],
  'joseph_colorful_coat:col:3': ['possível deslocamento', 'Mostra a túnica de novo? Qual das duas você mantém?'],
  'joseph_colorful_coat:col:4': ['possível deslocamento', 'Mostra os irmãos com ciúme (cena 2)?'],
  'joseph_colorful_coat:col:5': ['possível deslocamento', 'Mostra o sonho dos feixes (cena 3)?'],
  'joseph_colorful_coat:col:6': ['possível deslocamento', 'Mostra o sonho das estrelas (cena 4)?'],
  'joseph_colorful_coat:col:7': ['possível deslocamento', 'Mostra José falando com Jacó (cena 5)?'],
  'joseph_colorful_coat:col:8': ['possível deslocamento', 'Mostra a cisterna (cena 7)?'],
  'joseph_colorful_coat:col:9': ['possível deslocamento · possível arte nova', 'Mostra a caravana (cena 8)? A cena 9 fica sem arte?'],
  'joseph_colorful_coat:col:10': ['possível arte nova', 'Existe alguma folha com o abraço da reconciliação?'],

  'good_samaritan:col:2': ['possível deslocamento · possível arte nova', 'Mostra o ferido (cena 3)? Falta o viajante ANTES do ataque?'],
  'good_samaritan:col:3': ['possível deslocamento', 'Mostra o sacerdote passando (cena 4)?'],
  'good_samaritan:col:7': ['possível deslocamento', 'Repete o curativo (cena 6) em vez do transporte?'],
  'good_samaritan:col:8': ['possível deslocamento', 'Mostra o transporte (cena 7) em vez do descanso na cama?'],
  'good_samaritan:col:10': ['possível deslocamento · possível arte nova', 'Repete o pagamento (cena 9)? Falta o "Vá e faça o mesmo"?'],

  'timothy_faith:col:2': ['possível arte nova', 'Menino orando à noite: corresponde a alguma cena?'],
  'timothy_faith:col:3': ['possível deslocamento · possível arte nova', 'Mostra Paulo e Timóteo (cenas 5/6)?'],
  'timothy_faith:col:4': ['possível deslocamento · possível arte nova', 'Mostra Paulo diante da comunidade (cena 5)?'],
  'timothy_faith:col:5': ['possível deslocamento', 'Mostra Paulo ensinando a escrever (cena 8)?'],
  'timothy_faith:col:6': ['possível deslocamento', 'Mostra a caminhada (cena 7)?'],
  'timothy_faith:col:7': ['possível deslocamento', 'Mostra Timóteo ensinando (cena 9)?'],
  'timothy_faith:col:8': ['possível deslocamento', 'Duplica a folha 09 (ensino a uma criança)?'],

  'josiah_young_king:col:5': ['possível deslocamento', 'Mostra o templo em obras (cena 4)?'],
  'josiah_young_king:col:6': ['possível deslocamento', 'Mostra a construção (cena 4) de novo?'],
  'josiah_young_king:col:7': ['possível deslocamento', 'Mostra o livro encontrado (cena 5)?'],
  'josiah_young_king:col:8': ['possível deslocamento · possível arte nova', 'Mostra a leitura ao rei (cena 6)? A cena 8 fica sem arte?'],
  'josiah_young_king:col:9': ['possível deslocamento', 'Mostra o rei diante do povo (cena 7)?'],
  'josiah_young_king:col:10': ['possível arte nova', 'Mostra a Páscoa (cena 9) em vez do exemplo final?'],

  'jesus_children:col:6': ['possível deslocamento', 'A bênção (mão na cabeça) está aqui em vez da cena 8?'],
  'jesus_children:col:8': ['possível deslocamento', 'Está trocada com a folha 06?'],

  'solomon_wisdom:col:6': ['possível arte nova', 'Isto é a Rainha de Sabá? Ela não está na narração oficial.'],
  'solomon_wisdom:col:7': ['possível arte nova', 'Isto é a construção do templo? Não está na narração oficial.'],
  'solomon_wisdom:col:9': ['possível arte nova', 'Isto é ensino às crianças? Não está na narração oficial.'],

  'moses_red_sea:col:8': ['possível arte nova', 'Há soldados/carro de guerra? A narração oficial removeu o exército.'],

  // ── duvidosas (desvio de ênfase, não erro grosseiro) ──
  'mary_says_yes:ilu:10': ['duvidosa', 'Maria parece de viagem? A narração fala de guardar a palavra.'],
  'lost_sheep:ilu:3': ['duvidosa', 'O pastor está PERCEBENDO a falta, ou só afagando o rebanho?'],
  'lost_sheep:ilu:6': ['duvidosa', 'O pastor está SAINDO para procurar?'],
  'lost_sheep:ilu:7': ['duvidosa', 'A ovelha já aparece à frente do pastor?'],
  'good_samaritan:ilu:3': ['duvidosa', 'O ferido está SOZINHO, ou já há um passante?'],
};

function AtencaoBox({ marca }) {
  if (!marca) return null;
  const [tipo, pergunta] = marca;
  return (
    <View style={styles.atencao}>
      <Text style={styles.atencaoTitulo}>Atenção: cena marcada para validação visual humana.</Text>
      <Text style={styles.atencaoTipo}>Tipo: {tipo}</Text>
      <Text style={styles.atencaoPergunta}>{pergunta}</Text>
    </View>
  );
}

export default function SceneValidationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const allowed = isInternalToolsEnabled();

  const [si, setSi] = useState(0); // índice da história
  const [ci, setCi] = useState(0); // índice da cena

  const story = stories[si];
  const cena = story && (story.cenas || [])[ci];

  const ilu = useMemo(() => (story && cena ? getSceneIllustrationAsset(story.id, cena.id) : null), [story, cena]);
  const col = useMemo(() => (story && cena ? getColoringImage(story.id, cena.id) : null), [story, cena]);

  if (!allowed) {
    return (
      <View style={[styles.bloqueado, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.bloqueadoTxt}>Indisponível.</Text>
      </View>
    );
  }

  const nCenas = (story.cenas || []).length;
  const irCena = (d) => setCi((v) => Math.min(Math.max(v + d, 0), nCenas - 1));
  const irHist = (d) => {
    setSi((v) => {
      const n = Math.min(Math.max(v + d, 0), stories.length - 1);
      if (n !== v) setCi(0);
      return n;
    });
  };

  const marcaIlu = ATENCAO[`${story.id}:ilu:${cena.id}`];
  const marcaCol = ATENCAO[`${story.id}:col:${cena.id}`];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topo}>
        <SoundButton style={styles.voltar} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.voltarTxt}>← Voltar</Text>
        </SoundButton>
        <Text style={styles.topoTitulo}>Validação visual de cenas</Text>
      </View>

      <View style={styles.avisoAudio}>
        <Text style={styles.avisoAudioTxt}>
          Os áudios ainda podem estar antigos. Validar pelo texto oficial exibido.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={styles.progresso}>
          <Text style={styles.progressoTxt}>
            História {si + 1} de {stories.length} · cena {String(cena.id).padStart(2, '0')} de {String(nCenas).padStart(2, '0')}
          </Text>
          <Text style={styles.storyId}>{story.id}</Text>
        </View>

        <View style={styles.bloco}>
          <Text style={styles.rotulo}>Título oficial da cena</Text>
          <Text style={styles.tituloCena}>{cena.titulo}</Text>
          <Text style={styles.rotulo}>Texto oficial de narração</Text>
          <Text style={styles.narracao}>{cena.textoNarracao}</Text>
        </View>

        <View style={styles.bloco}>
          <Text style={styles.rotulo}>Imagem ilustrada atual</Text>
          <AtencaoBox marca={marcaIlu} />
          {ilu ? (
            <Image source={ilu} style={styles.imagem} resizeMode="contain" />
          ) : (
            <Text style={styles.ausente}>Imagem ilustrada ausente.</Text>
          )}
        </View>

        <View style={styles.bloco}>
          <Text style={styles.rotulo}>Briefing oficial de colorir</Text>
          <Text style={styles.tituloColorir}>{cena.tituloColorir}</Text>
          <Text style={styles.instrucao}>{cena.instrucaoColorir}</Text>
          <Text style={[styles.rotulo, { marginTop: 12 }]}>Imagem de colorir atual</Text>
          <AtencaoBox marca={marcaCol} />
          {col ? (
            <Image source={col} style={styles.imagem} resizeMode="contain" />
          ) : (
            <Text style={styles.ausente}>Folha de colorir ausente.</Text>
          )}
        </View>

        <Text style={styles.nota}>
          Esta tela apenas exibe. Nenhuma decisão é salva, e nada é alterado no app.
        </Text>
      </ScrollView>

      <View style={[styles.nav, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.navLinha}>
          <SoundButton style={styles.navBtn} onPress={() => irCena(-1)} activeOpacity={0.85}>
            <Text style={styles.navTxt}>← Cena</Text>
          </SoundButton>
          <SoundButton style={styles.navBtn} onPress={() => irCena(1)} activeOpacity={0.85}>
            <Text style={styles.navTxt}>Cena →</Text>
          </SoundButton>
        </View>
        <View style={styles.navLinha}>
          <SoundButton style={[styles.navBtn, styles.navBtnAlt]} onPress={() => irHist(-1)} activeOpacity={0.85}>
            <Text style={styles.navTxt}>← História</Text>
          </SoundButton>
          <SoundButton style={[styles.navBtn, styles.navBtnAlt]} onPress={() => irHist(1)} activeOpacity={0.85}>
            <Text style={styles.navTxt}>História →</Text>
          </SoundButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF8F5' },
  bloqueado: { flex: 1, alignItems: 'center', backgroundColor: '#FAF8F5' },
  bloqueadoTxt: { fontSize: 16, color: '#7A706A' },

  topo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  voltar: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18, backgroundColor: '#E8E2DA' },
  voltarTxt: { fontSize: 14, fontWeight: '700', color: '#2C2621' },
  topoTitulo: { fontSize: 17, fontWeight: '800', color: '#1F3A5F' },

  avisoAudio: { marginHorizontal: 14, marginBottom: 8, padding: 10, borderRadius: 8, backgroundColor: '#FEF3C7', borderLeftWidth: 4, borderLeftColor: '#B45309' },
  avisoAudioTxt: { fontSize: 13, color: '#78350F', fontWeight: '600' },

  progresso: { marginHorizontal: 14, marginBottom: 10 },
  progressoTxt: { fontSize: 15, fontWeight: '800', color: '#2C2621' },
  storyId: { fontSize: 12, color: '#7A706A', marginTop: 2 },

  bloco: { marginHorizontal: 14, marginBottom: 14, padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3DDD4' },
  rotulo: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#7A706A', textTransform: 'uppercase' },
  tituloCena: { fontSize: 18, fontWeight: '800', color: '#2C2621', marginTop: 2, marginBottom: 10 },
  narracao: { fontSize: 15, lineHeight: 22, color: '#2C2621', marginTop: 4 },
  tituloColorir: { fontSize: 16, fontWeight: '700', color: '#15803D', marginTop: 2 },
  instrucao: { fontSize: 14, lineHeight: 20, color: '#2C2621', marginTop: 4 },

  imagem: { width: '100%', aspectRatio: 0.8, marginTop: 8, borderRadius: 8, backgroundColor: '#FFFFFF' },
  ausente: { marginTop: 8, fontSize: 14, color: '#B91C1C', fontWeight: '700' },

  atencao: { marginTop: 8, padding: 10, borderRadius: 8, backgroundColor: '#FDF1F1', borderLeftWidth: 4, borderLeftColor: '#B91C1C' },
  atencaoTitulo: { fontSize: 13, fontWeight: '800', color: '#B91C1C' },
  atencaoTipo: { fontSize: 12, color: '#7A706A', marginTop: 2 },
  atencaoPergunta: { fontSize: 13, color: '#2C2621', marginTop: 6, fontWeight: '600' },

  nota: { marginHorizontal: 14, marginTop: 4, fontSize: 12, color: '#7A706A', fontStyle: 'italic' },

  nav: { paddingHorizontal: 14, paddingTop: 8, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E3DDD4' },
  navLinha: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  navBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#1F3A5F', alignItems: 'center' },
  navBtnAlt: { backgroundColor: '#4A5568' },
  navTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
