import React, { forwardRef, useImperativeHandle, useRef, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export const ERASER_COLOR = '__ERASER__';

const TIMEOUT_MS = 7000;

/* ─────────────────────────────────────────────────────────────────────────────
   [Fase 6 · F6-R3.5 · TK-A-001] OS QUATRO EIXOS DE VERSIONAMENTO — quatro nomes,
   zero colisão. Cada eixo responde a UMA pergunta e só a ela. É PROIBIDO inferir
   um eixo a partir de outro (regra 5 de §11.5.3 do PLAN):

     1. `APP_STORAGE_SCHEMA_VERSION` (src/services/storageKeys.js, hoje 3)
        responde "QUE CHAVES o AsyncStorage tem". NÃO muda nesta fase e nenhum
        degrau novo entra na escada de `storageMigrationService.js`.

     2. `POINTER_VERSION` (src/services/drawingStorage.js, hoje 3), serializado
        como o campo `v` do PONTEIRO, responde "ONDE ESTÁ O BLOB". Congelado.

     3. `paintSchemaVersion` (novo, aqui) responde "QUE CAMPOS O PAYLOAD TEM" —
        nunca "onde ele está guardado".

     4. `layoutVersion` (novo, aqui) responde "O QUE AS COORDENADAS SIGNIFICAM"
        (`logicalW`/`logicalH` — mais `W`/`H`/`imgX`/`imgY`/`imgW`/`imgH`, que desde
        `TK-A-035` descrevem o bitmap salvo e o retângulo do lineart dentro dele, não
        mais a janela) — nunca "que campos existem".

   ⚠️ `CANVAS_PAYLOAD_V` é o campo `v` INTERNO do payload do canvas e está
   CONGELADO EM 2 PARA SEMPRE. Ele é marca legada, jamais discriminador de
   evolução. Emitir `v: 3` aqui seria destrutivo de verdade, não estético: a
   guarda do writer em `src/screens/ColoringScreen.js` (`isAcceptableC60Payload`)
   classifica `obj.v === 3` como PONTEIRO e DESCARTA o payload — a pintura da
   criança se perderia. Quem precisar versionar a evolução do payload move
   `PAINT_SCHEMA_VERSION`; quem precisar versionar a semântica da geometria move
   `LAYOUT_VERSION`. Nunca `v`. Portões `G-VER-1`..`G-VER-3` lacram estas regras.

   A ausência de `paintSchemaVersion` significa payload legado; a ausência de
   `layoutVersion` significa geometria legada; e as duas ausências são
   INDEPENDENTES uma da outra.
───────────────────────────────────────────────────────────────────────────── */
export const CANVAS_PAYLOAD_V = 2;
export const PAINT_SCHEMA_VERSION = 1;
export const LAYOUT_VERSION = 1;

/* ─────────────────────────────────────────────────────────────────────────────
   buildHtml — generates the complete WebView HTML/JS for the coloring canvas.

   Architecture:
     • off  canvas (W×H) — composite built per frame
     • tmp  canvas (W×H) — holds paintD for drawImage compositing
     • C    canvas (W×H) — visible, transformed by zoom/pan

   Layer order per frame (renderAll):
     1. Cream background (#FFFDF8)
     2. User paint layer (paintD via tmp canvas)
     3. Original line-art image drawn on top — lines always visible

   BFS invariant: fill/erase runs ONLY within [imgX, imgY, imgW, imgH].
   The padding area outside that rectangle shares the background colour and
   would silently connect separate fill regions if BFS were allowed to enter it.

   visBuf is pre-allocated once and cleaned after each BFS by scanning only
   enqueued pixels (O(N_fill)) rather than a full W*H memset.
─────────────────────────────────────────────────────────────────────────────── */
/* Modo Colorir Grande — o desenho de história abre com um zoom inicial leve para
   parecer maior de verdade (a arte 4:5 exibida inteira é limitada pela LARGURA do
   celular; alinhar não aumenta o tamanho real, só um zoom de view aumenta). É só
   um transform de VIEW (scale/tx/ty), centralizado, que NÃO toca o motor de pintura
   (flood fill/baseD/paintD/export). "Ver tudo" volta a 1.0 (imagem inteira).
   No Colorir Imersivo a câmera inicial centraliza a arte na ÁREA VISUAL SEGURA
   (acima do overlay), então um zoom elegante já preenche bem essa área sem parecer
   agressivo. 1.20 abria grande porém antipático; 1.15 enquadra com presença e
   naturalidade (a 1.15 a arte 4:5 preenche quase exatamente a área acima do
   overlay). Faixa segura 1.14 … 1.16. */
const INITIAL_COLORING_SCALE = 1.15;

function buildHtml(imgDataUrl) {
  const imgJson = imgDataUrl ? JSON.stringify(imgDataUrl) : 'null';
  const devFlag = __DEV__ ? 'true' : 'false';
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#FFFDF8}
#c{position:absolute;top:0;left:0;touch-action:none}
</style>
</head><body><canvas id="c"></canvas><script>
(function(){

/* ─── Dev flag (set at HTML build time) ─── */
var DEV=${devFlag};

/* [Fase 6 · TK-A-001] Eixos de versionamento, injetados do módulo RN (fonte única
   no topo deste arquivo). CANVAS_PAYLOAD_V é o campo "v" congelado em 2. */
var CANVAS_PAYLOAD_V=${CANVAS_PAYLOAD_V};
var PAINT_SCHEMA_VERSION=${PAINT_SCHEMA_VERSION};
var LAYOUT_VERSION=${LAYOUT_VERSION};

/* [Fase 6 · TK-A-002/TK-A-004] Classificação dos eixos POR NOME, sem inferência
   cruzada e sem consultar o envelope de armazenamento (nada de "uri"/"fmt"/"v"
   entra aqui). Devolve, para cada eixo, o valor declarado ou null quando o eixo
   está AUSENTE — ausência é legado, nunca defeito. 'ok' é false só quando o eixo
   está PRESENTE e mente sobre si mesmo (não é inteiro positivo): um payload assim
   nunca poderia ter sido escrito por este app. Os dois eixos são independentes:
   o veredito de um jamais decide o do outro. */
function axisOf(value){
  if(value===undefined||value===null) return {declared:null,legacy:true,ok:true};
  var n=(typeof value==='number')?value:NaN;
  var ok=(typeof value==='number')&&isFinite(n)&&n>0&&Math.floor(n)===n;
  return {declared:ok?n:value,legacy:false,ok:ok};
}
function classifyAxes(p){
  var obj=(p&&typeof p==='object')?p:{};
  return {paint:axisOf(obj.paintSchemaVersion),layout:axisOf(obj.layoutVersion)};
}
function devLog(msg){
  if(!DEV)return;
  try{window.ReactNativeWebView.postMessage('LOG:'+msg);}catch(e){}
}

/* ─── Global error reporters ─── */
window.onerror=function(msg,src,line,col,err){
  try{window.ReactNativeWebView.postMessage('ERR:'+msg+' ('+src+':'+line+')');}catch(e){}
  return true;
};
window.addEventListener('unhandledrejection',function(e){
  try{window.ReactNativeWebView.postMessage('ERR:unhandledrejection:'+e.reason);}catch(x){}
});

/* ─── Canvas setup ─── */
var C=document.getElementById('c');
var ctx=C.getContext('2d');
var off=document.createElement('canvas');
var offCtx=off.getContext('2d');
var tmp=document.createElement('canvas');
var tmpCtx=tmp.getContext('2d');
var W=0,H=0;
/* Backing store em pixels FÍSICOS (retina) → lineart nítida, não "apagada".
   W,H passam a ser px físicos; o canvas DISPLAY continua do tamanho CSS via
   style. Todas as coordenadas de toque são convertidas por DPR (ver handlers).
   Limitado a 3 para não explodir memória/BFS em telas 4x. */
var DPR=Math.min(window.devicePixelRatio||1,3);

/* ─── [Fase 6 · F6-R3.5 · TK-A-035] ESPAÇO LÓGICO DA OBRA (motor raster) ───────
   ANTES: a camada de tinta era do tamanho da JANELA (W×H em px físicos). Girar o
   aparelho, abrir Split View ou arrastar o divisor redefinia W/H enquanto 'paintD',
   'baseD', 'qBuf' e 'visBuf' continuavam dimensionados pela janela anterior — e o
   BFS seguia indexando '(y*W+x)' com o W NOVO. Resultado: pintura deslocada e
   barreiras lidas no lugar errado. Era o 'F6-CVS-01' do lado raster.

   AGORA: a pintura vive no RETÂNGULO LÓGICO DO LINEART ('LW'×'LH'), que é derivado
   SÓ do próprio desenho — nunca do aparelho, nunca da orientação, nunca do DPR.
   Duas consequências que importam para a criança:
     · a obra é a MESMA em qualquer janela: girar só reprojeta a exibição;
     · a mesma obra abre em qualquer aparelho, porque o espaço lógico de um lineart
       é idêntico em todos eles (nada de "incompatível" por causa de tela diferente).

   ⚠️ 'G-CVS-1': 'resize()' NÃO realoca 'qBuf', 'visBuf' nem 'paintD'. Com o modelo
   no espaço lógico isso deixa de ser uma promessa e passa a ser estrutural — esses
   três buffers não dependem mais de W/H para existir.

   ⚠️ Q8 regra 4: 'LW'/'LH' pertencem ao espaço lógico da OBRA, não à viewport de
   quem abre. 'imgX'/'imgY'/'imgW'/'imgH' continuam existindo, mas agora são
   EXIBIÇÃO (a projeção 'contain' do retângulo lógico dentro da janela de agora) —
   nunca armazenamento.

   Resolução canônica = o tamanho natural do lineart, que é a resolução real da
   arte; nada além disso é informação verdadeira. O teto existe só para limitar
   memória/BFS em um asset gigante e é aplicado preservando a proporção. */
var LW=0,LH=0;
var LOGICAL_MAX_LONG=2048;
var espacoTravado=false;
/* Escala de exibição do espaço lógico dentro da janela (px físicos por px lógico). */
var dS=1;

/* ─── Image data layers ─── */
/* baseD — pixel snapshot of (bg + line art), used ONLY for BFS barrier detection */
/* paintD — user colour layer, transparent where unpainted                         */
/* lineArtImg — original Image object, re-drawn on top every frame                */
var baseD=null,paintD=null,lineArtImg=null;

/* ─── BFS buffers (pre-allocated to avoid per-tap GC pressure) ─── */
var qBuf=null;    /* Int32Array  W*H*2 — interleaved x,y queue             */
var visBuf=null;  /* Uint8Array  W*H   — visited flags, cleared after BFS  */

/* ─── Projeção de EXIBIÇÃO do retângulo lógico (recalculada por 'reprojetar') ───
   [Fase 6 · TK-A-035] Estes quatro números mudaram de papel: eram a posição da arte
   DENTRO do modelo; agora são a posição do MODELO dentro da janela de agora. Quem
   guarda pintura não os consulta mais — a projeção acontece na exibição, nunca no
   armazenamento. Continuam publicados no payload porque descrevem o retângulo do
   lineart dentro do bitmap exportado (que passou a ser o próprio espaço lógico). */
var imgX=0,imgY=0,imgW=0,imgH=0;

/* [Fase 6 · TK-A-035] O confinamento do BFS agora é ao ESPAÇO LÓGICO. A razão de
   existir não mudou uma vírgula: sem ela o BFS entra na área creme (lum≈255, não é
   barreira) e conecta regiões que só se tocam pela borda — céu e chão viram uma
   zona só. O que mudou é que a borda deixou de depender da janela. */
function inImg(x,y){
  return x>=0&&x<LW&&y>=0&&y<LH;
}

/* Projeção 'contain' do espaço lógico na janela: um fator só, isotrópico, sobra
   centralizada — a mesma conta canônica de 'useViewportProjection' e do motor
   vetorial. 'SP' é a folga histórica de 6px que impede a borda da arte de cair em
   posição subpixel (o que corromperia a detecção de barreira no baseD). */
var SP=6;
function reprojetar(){
  if(!(LW>0&&LH>0&&W>0&&H>0)){imgX=0;imgY=0;imgW=0;imgH=0;dS=1;return;}
  var availW=Math.max(1,W-SP*2), availH=Math.max(1,H-SP*2);
  dS=Math.min(availW/LW,availH/LH);
  imgW=Math.round(LW*dS); imgH=Math.round(LH*dS);
  imgX=Math.round((W-imgW)/2); imgY=Math.round((H-imgH)/2);
}

/* Estabelece o espaço lógico a partir do tamanho natural do lineart. Chamado UMA
   vez, na inicialização — e a trava fecha na mesma volta. Diferente do motor
   vetorial (que pode readotar a janela enquanto a folha está genuinamente vazia),
   aqui a trava é fechada já no boot: o modelo raster É um buffer de píxeis, e
   readotar significaria REALOCAR 'paintD'/'qBuf'/'visBuf' — exatamente o que
   'G-CVS-1' proíbe. Coordenada vetorial reprojeta sem perda; pixel, não. */
function definirEspacoLogico(natW,natH){
  /* A trava é PORTANTE, não decorativa: uma segunda definição realocaria os buffers e
     'G-CVS-1' seria violado por dentro, em silêncio. Preferir a recusa a confiar em
     que nenhum chamador futuro vá chamar duas vezes. */
  if(espacoTravado)return false;
  var w=Math.max(1,Math.round(natW||0)), h=Math.max(1,Math.round(natH||0));
  var lo=Math.max(w,h), k=lo>LOGICAL_MAX_LONG?LOGICAL_MAX_LONG/lo:1;
  LW=Math.max(1,Math.round(w*k)); LH=Math.max(1,Math.round(h*k));
  tmp.width=LW; tmp.height=LH;
  espacoTravado=true;
  reprojetar();
  return true;
}

/* Retângulo do lineart dentro de uma janela histórica de 'w'×'h'. É a MESMA conta
   que sempre colocou a arte na tela — extraída para que a reconstrução de uma obra
   legada seja determinística a partir de evidência real (Q8 regra 6), e não de
   chute. Devolve null quando não há como calcular. */
function colocacaoHistorica(w,h,natW,natH){
  if(!(w>0&&h>0&&natW>0&&natH>0))return null;
  var aw=w-SP*2, ah=h-SP*2;
  if(!(aw>0&&ah>0))return null;
  var s=Math.min(aw/natW,ah/natH);
  var iw=Math.round(natW*s), ih=Math.round(natH*s);
  return {x:Math.round((w-iw)/2),y:Math.round((h-ih)/2),w:iw,h:ih};
}

/* ─── Undo history ─── */
var hist=[],MAX_HIST=10;

/* ─── State ─── */
var hasPainted=false;
var color='#FF0000',isEraser=false;
var DX=[-1,1,0,0],DY=[0,0,-1,1];

/* ─── Zoom / pan ─── */
var scale=1.0,minScale=1.0,maxScale=3.0;
var tx=0,ty=0;
/* Modo Colorir Grande: scale inicial do desenho de história (1.0 = imagem inteira). */
var INITIAL_COLORING_SCALE=${INITIAL_COLORING_SCALE};
/* Colorir Imersivo — área coberta pelo overlay flutuante (ferramentas+paleta) na
   base do viewport, como fração da altura. A câmera inicial e o pan tratam essa
   faixa como "não-segura": o foco da arte abre CENTRALIZADO na área ACIMA dela e o
   pan permite subir a arte para revelar o que fica sob o overlay.
   INITIAL_VIEW_BOTTOM_SAFE_INSET (px) é derivado de H em resize(). */
var INITIAL_VIEW_BOTTOM_SAFE_FRAC=0.20;
var INITIAL_VIEW_BOTTOM_SAFE_INSET=0;
var lastFillRejectedAt=0;

/* ─── Touch state ─── */
/* suppressPaintUntil: timestamp after which fills are allowed again.
   Set after a pinch ends to prevent the finger-lift from triggering a fill. */
var suppressPaintUntil=0;

/* ──────────────────────────────────────────
   RENDERING
   Layer order: 1. cream bg  2. user paint  3. line art on top
─────────────────────────────────────────── */
function resize(){
  /* [Fase 6 · TK-A-016] Fecha o gesto em voo ANTES de a projeção mudar. Sem isto,
     um pinch interrompido por uma rotação terminaria como toque solto e poderia
     pintar numa coordenada que já significa outro ponto da arte. */
  finalizarGestoAtomico();
  var cssW=window.innerWidth|0, cssH=window.innerHeight|0;
  /* Backing FÍSICO (×DPR) para nitidez; display em CSS px via style. */
  W=Math.round(cssW*DPR); H=Math.round(cssH*DPR);
  C.style.width=cssW+'px'; C.style.height=cssH+'px';
  C.width=W; C.height=H;
  off.width=W; off.height=H;
  INITIAL_VIEW_BOTTOM_SAFE_INSET=Math.round(H*INITIAL_VIEW_BOTTOM_SAFE_FRAC);
  /* ⚠️ [Fase 6 · TK-A-085 · G-CVS-1] Daqui não sai realocação de 'paintD', 'qBuf'
     nem 'visBuf', e 'tmp' (o buffer da camada de tinta) não é redimensionado: eles
     pertencem ao espaço LÓGICO, que a janela não decide. Redimensionar qualquer um
     deles aqui apagaria a pintura da criança em toda rotação (SD-8). O que a janela
     move é só a PROJEÇÃO. */
  reprojetar();
  if(baseD) renderAll();
}

function renderAll(){
  try{
    /* 1. Cream background */
    offCtx.fillStyle='#FFFDF8';
    offCtx.fillRect(0,0,W,H);
    /* 2. User paint layer
       [Fase 6 · TK-A-036] A tinta sai SEMPRE do estado lógico canônico ('paintD') e
       é projetada uma única vez para o retângulo de exibição. Nunca de um quadro
       anterior nem do buffer de tela: reamostrar do que já estava desenhado
       encadearia perdas a cada rotação e a arte iria borrando sozinha. */
    if(paintD&&LW>0&&LH>0){
      tmpCtx.clearRect(0,0,LW,LH);
      tmpCtx.putImageData(paintD,0,0);
      offCtx.drawImage(tmp,0,0,LW,LH,imgX,imgY,imgW,imgH);
    }
    /* 3. Line art on top with multiply blending.
       WHY multiply: the coloring PNG has an opaque white background.
       With default source-over, white pixels cover the paint → invisible.
       With multiply: white(255)×dest = dest (paint shows through);
       black(0)×dest = 0 (lines always show).
       Antialiased edge pixels are proportionally preserved.               */
    if(lineArtImg){
      offCtx.globalCompositeOperation='multiply';
      offCtx.drawImage(lineArtImg,imgX,imgY,imgW,imgH);
      offCtx.globalCompositeOperation='source-over';
    }
    show();
  }catch(e){
    window.ReactNativeWebView.postMessage('ERR:renderAll:'+e.message);
  }
}

function show(){
  ctx.clearRect(0,0,W,H);
  ctx.save();
  ctx.translate(tx,ty);
  ctx.scale(scale,scale);
  ctx.drawImage(off,0,0);
  ctx.restore();
}

/* ──────────────────────────────────────────
   ZOOM / PAN
─────────────────────────────────────────── */
function clamp(){
  tx=Math.max(W*(1-scale),Math.min(0,tx));
  /* Colorir Imersivo: inset virtual inferior — permite empurrar a arte para CIMA
     além da borda, revelando a parte coberta pelo overlay flutuante de
     ferramentas/paleta. Só afeta o limite INFERIOR do pan; o topo
     (Math.min(0,ty)) segue normal. */
  ty=Math.max(H*(1-scale)-INITIAL_VIEW_BOTTOM_SAFE_INSET,Math.min(0,ty));
}

/* ──────────────────────────────────────────
   FLOOD FILL HELPERS
─────────────────────────────────────────── */
function hex2rgb(h){
  return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
}
function lum(r,g,b){return 0.299*r+0.587*g+0.114*b;}

/* isBarrier — TAP REJECTION threshold 230.
   Rejects fills that start on a line or its close antialiased fringe.   */
function isBarrier(r,g,b,a){
  if(a<30)return false;
  return lum(r,g,b)<230;
}
/* isBFSBarrier — BFS SPREAD threshold 210.
   Lets the flood fill expand one extra pixel row into the outermost
   anti-aliased fringe (lum 210–229), eliminating visible white gaps at
   region boundaries.  The multiply-blended line art renders those fringe
   pixels correctly: paint shows through, lines remain dark.
   Solid line cores (lum < 210) remain walls — no cross-line bleed.      */
function isBFSBarrier(r,g,b,a){
  if(a<30)return false;
  return lum(r,g,b)<210;
}

function pushHist(){
  if(!paintD)return;
  if(hist.length>=MAX_HIST)hist.shift();
  hist.push(new Uint8ClampedArray(paintD.data));
}

/* ──────────────────────────────────────────
   FILL  (BFS flood fill — image-bounds-clamped)
─────────────────────────────────────────── */
function fill(sx,sy,rgb){
  if(!baseD||!paintD||!qBuf||!visBuf){devLog('[COLORING_DEBUG] fill skipped: not ready baseD='+!!baseD+' paintD='+!!paintD);return;}
  sx=sx|0; sy=sy|0;
  /* Critical: reject taps outside image bounds.  The cream padding area
     has lum≈255 (not a barrier) and would connect all edge-touching regions
     if BFS were allowed to enter it.                                         */
  if(!inImg(sx,sy)){devLog('[COLORING_DEBUG] fill rejected: outside inImg sx='+sx+' sy='+sy);return;}
  var bd=baseD.data,pd=paintD.data;
  var bi=(sy*LW+sx)*4;
  if(isBarrier(bd[bi],bd[bi+1],bd[bi+2],bd[bi+3])){devLog('[COLORING_DEBUG] fill rejected: isBarrier lum='+lum(bd[bi],bd[bi+1],bd[bi+2]).toFixed(0));var _now=Date.now();if(_now-lastFillRejectedAt>2000){lastFillRejectedAt=_now;window.ReactNativeWebView.postMessage('FILL_REJECTED');}return;}
  var tR=pd[bi],tG=pd[bi+1],tB=pd[bi+2],tA=pd[bi+3];
  var fR=rgb[0],fG=rgb[1],fB=rgb[2];
  if(tA===255&&tR===fR&&tG===fG&&tB===fB)return;
  pushHist();
  var vis=visBuf,buf=qBuf,qh=0,qt=0;
  vis[sy*LW+sx]=1; buf[qt++]=sx; buf[qt++]=sy;
  while(qh<qt){
    var cx=buf[qh++],cy=buf[qh++],idx=(cy*LW+cx)*4;
    pd[idx]=fR; pd[idx+1]=fG; pd[idx+2]=fB; pd[idx+3]=255;
    for(var i=0;i<4;i++){
      var nx=cx+DX[i],ny=cy+DY[i];
      if(!inImg(nx,ny))continue; /* confine BFS to image rectangle */
      var vi=ny*LW+nx; if(vis[vi])continue;
      var ni=vi*4;
      if(isBFSBarrier(bd[ni],bd[ni+1],bd[ni+2],bd[ni+3]))continue;
      if(pd[ni]!==tR||pd[ni+1]!==tG||pd[ni+2]!==tB||pd[ni+3]!==tA)continue;
      vis[vi]=1; buf[qt++]=nx; buf[qt++]=ny;
    }
  }
  /* Clear visited flags only for enqueued pixels — O(N_fill) not O(W*H). */
  for(var k=1;k<qt;k+=2) vis[buf[k]*LW+buf[k-1]]=0;
  devLog('[COLORING_DEBUG] fillPixelCount='+Math.floor(qt/2)+' hasPaint='+hasPainted);
  notifyPainted(); renderAll();
  devLog('[COLORING_DEBUG] renderAll called after fill');
}

/* ──────────────────────────────────────────
   ERASE  (BFS clear on paint layer only)
─────────────────────────────────────────── */
function erase(sx,sy){
  if(!paintD||!qBuf||!visBuf)return;
  sx=sx|0; sy=sy|0;
  if(!inImg(sx,sy))return;
  var pd=paintD.data,si=(sy*LW+sx)*4;
  var tR=pd[si],tG=pd[si+1],tB=pd[si+2],tA=pd[si+3];
  if(tA===0)return;
  pushHist();
  var vis=visBuf,buf=qBuf,qh=0,qt=0;
  vis[sy*LW+sx]=1; buf[qt++]=sx; buf[qt++]=sy;
  while(qh<qt){
    var cx=buf[qh++],cy=buf[qh++],idx=(cy*LW+cx)*4;
    pd[idx]=0; pd[idx+1]=0; pd[idx+2]=0; pd[idx+3]=0;
    for(var i=0;i<4;i++){
      var nx=cx+DX[i],ny=cy+DY[i];
      if(!inImg(nx,ny))continue;
      var vi=ny*LW+nx; if(vis[vi])continue;
      var ni=vi*4;
      if(pd[ni]!==tR||pd[ni+1]!==tG||pd[ni+2]!==tB||pd[ni+3]!==tA)continue;
      vis[vi]=1; buf[qt++]=nx; buf[qt++]=ny;
    }
  }
  for(var k=1;k<qt;k+=2) vis[buf[k]*LW+buf[k-1]]=0;
  notifyPainted(); renderAll();
}

/* ──────────────────────────────────────────
   MEDIDA REAL DE PINTURA  (C60 · Parte 3)
   O motor é o ÚNICO lugar do app com acesso aos pixels. Aqui ele CONTA quanto foi
   realmente pintado e publica a medida — em vez do antigo sinal de mão única, que
   ficava verdadeiro para sempre e deixava folha em branco/apagada passar por "pintada".
   paintablePx  = pixels do retângulo da ARTE que NÃO são traço (isBFSBarrier) → o lineart
                  já sai da conta, e a moldura creme fora da imagem nunca entrou.
   paintedPx    = pixels da CAMADA DE TINTA com alfa>0 dentro desse mesmo retângulo →
                  transparente não conta; branco só conta quando foi escolhido como cor.
   paintRev     = revisão monotônica: sobe a CADA operação que muda a tinta. É o que casa
                  pintura ↔ instantâneo na transação atômica (Parte 4).
─────────────────────────────────────────── */
var paintRev=0;
var paintablePx=0;

/* [Fase 6 · TK-A-035] As duas medidas passam a percorrer o ESPAÇO LÓGICO inteiro —
   que É o retângulo da arte. A conta é a mesma de antes; o que sumiu foi o recorte
   contra a janela, porque a moldura creme deixou de existir dentro do modelo. Como
   o denominador não depende mais do aparelho, a mesma obra tem a mesma cobertura em
   qualquer tela: a criança não conclui numa e fica devendo noutra. */
function computePaintablePx(){
  if(!baseD||LW<=0||LH<=0){paintablePx=0;return;}
  var bd=baseD.data,n=0;
  for(var y=0;y<LH;y++){
    var row=y*LW;
    for(var x=0;x<LW;x++){
      var i=(row+x)*4;
      if(!isBFSBarrier(bd[i],bd[i+1],bd[i+2],bd[i+3]))n++;
    }
  }
  paintablePx=n;
}

function countPaintedPx(){
  if(!paintD||LW<=0||LH<=0)return 0;
  var pd=paintD.data,n=0;
  for(var y=0;y<LH;y++){
    var row=y*LW;
    for(var x=0;x<LW;x++){
      if(pd[(row+x)*4+3]>0)n++;
    }
  }
  return n;
}

/* Publica a medida atual. Chamado depois de TODA operação que altera a tinta —
   pintar, apagar, desfazer, limpar e carregar arte salva — para que "tem cor"
   seja de MÃO DUPLA: apagar tudo derruba o sinal no mesmo toque. */
function postPaintState(){
  try{
    var painted=countPaintedPx();
    hasPainted=painted>0;
    window.ReactNativeWebView.postMessage('PAINT_STATE:'+JSON.stringify({
      rev:paintRev,paintedPx:painted,paintablePx:paintablePx
    }));
  }catch(e){/* medir nunca pode derrubar o motor */}
}

function notifyPainted(){
  paintRev++;
  if(!hasPainted){hasPainted=true;window.ReactNativeWebView.postMessage('PAINTED');}
  postPaintState();
}

/* ──────────────────────────────────────────
   TOUCH HANDLING
─────────────────────────────────────────── */
var touchState='idle';
var tapX=0,tapY=0,pinchD=0,pinchMX=0,pinchMY=0;
var TAP_THRESH=8;

function d2(a,b){var dx=a.clientX-b.clientX,dy=a.clientY-b.clientY;return Math.sqrt(dx*dx+dy*dy);}

/* [Fase 6 · F6-R3.5 · TK-A-016] FECHAMENTO ATÔMICO DO GESTO — espelho raster do que
   o motor vetorial faz com o traço em voo. Aqui o gesto que altera a tinta é um
   TOQUE, e ele só vira pintura quando o dedo levanta: se a janela mudar no meio, as
   coordenadas de partida passam a significar outro ponto da arte. Fechar o gesto
   ANTES da reprojeção é o que impede o pior caso — uma pintura aparecer no lugar
   errado sem que ninguém tenha pedido.
   Não grava, não exporta e não descarta pintura: só encerra o gesto em curso. A
   janela de silêncio é a MESMA já usada depois do pinch, pelo mesmo motivo (o dedo
   que ainda está na tela não deve virar toque de pintura). */
function finalizarGestoAtomico(){
  if(touchState==='idle')return false;
  touchState='idle';
  pinchD=0;
  suppressPaintUntil=Date.now()+300;
  return true;
}

/* Converte px físico da janela → coordenada do ESPAÇO LÓGICO, na mesma volta em que
   o toque é lido. Nenhum ponto do modelo carrega pixel de dispositivo. */
function paraLogico(px,py){
  if(!(dS>0))return{x:0,y:0,dentro:false};
  var x=(px-imgX)/dS, y=(py-imgY)/dS;
  return{x:Math.floor(x),y:Math.floor(y),dentro:(x>=0&&x<LW&&y>=0&&y<LH)};
}

C.addEventListener('touchstart',function(e){
  e.preventDefault();
  if(e.touches.length>=2){
    touchState='pinch';
    pinchD=d2(e.touches[0],e.touches[1]);
    /* clientX/Y são CSS px → ×DPR para o espaço FÍSICO do backing (tx/ty/W/H). */
    pinchMX=(e.touches[0].clientX+e.touches[1].clientX)/2*DPR;
    pinchMY=(e.touches[0].clientY+e.touches[1].clientY)/2*DPR;
  }else{
    touchState='tap';
    tapX=e.touches[0].clientX*DPR;
    tapY=e.touches[0].clientY*DPR;
  }
},{passive:false});

C.addEventListener('touchmove',function(e){
  e.preventDefault();
  if(touchState==='pinch'&&e.touches.length>=2){
    var nd=d2(e.touches[0],e.touches[1]);
    var mX=(e.touches[0].clientX+e.touches[1].clientX)/2*DPR;
    var mY=(e.touches[0].clientY+e.touches[1].clientY)/2*DPR;
    if(pinchD>0){
      var ns=Math.max(minScale,Math.min(maxScale,scale*nd/pinchD));
      /* Pan + zoom combined: keep the canvas point under pinchMX/pinchMY
         at new midpoint mX/mY. Formula: new_tx = mX - (pinchMX-tx)*(ns/scale).
         When ns==scale (pure pan): new_tx = tx + (mX-pinchMX) → clean delta pan.
         When mX==pinchMX (pure zoom): same as old formula. Both cases correct. */
      tx=mX-(pinchMX-tx)*(ns/scale);
      ty=mY-(pinchMY-ty)*(ns/scale);
      scale=ns; clamp(); show();
    }
    pinchD=nd; pinchMX=mX; pinchMY=mY;
  }
  /* Single finger: no pan — tap only. Two fingers handle all movement. */
},{passive:false});

C.addEventListener('touchend',function(e){
  e.preventDefault();
  var prev=touchState;
  if(e.touches.length>=2){
    touchState='pinch';
    pinchMX=(e.touches[0].clientX+e.touches[1].clientX)/2*DPR;
    pinchMY=(e.touches[0].clientY+e.touches[1].clientY)/2*DPR;
    pinchD=d2(e.touches[0],e.touches[1]);
  }else if(e.touches.length===1){
    /* After pinch: single finger always treated as tap, fills suppressed by
       suppressPaintUntil (300 ms cooldown set below). */
    touchState='tap';
    tapX=e.touches[0].clientX*DPR;
    tapY=e.touches[0].clientY*DPR;
  }else touchState='idle';
  /* Cooldown: any pinch-end (one or both fingers lifted) suppresses fills
     for 300 ms — guards against the simultaneous 2-finger-lift edge case. */
  if(prev==='pinch') suppressPaintUntil=Date.now()+300;

  if(prev==='tap'&&e.changedTouches.length>0&&Date.now()>suppressPaintUntil){
    var touch=e.changedTouches[0];
    var r=C.getBoundingClientRect();
    /* (clientX-r.left) é offset CSS no canvas → ×DPR para px físicos do backing. */
    var ox=((touch.clientX-r.left)*DPR-tx)/scale;
    var oy=((touch.clientY-r.top)*DPR-ty)/scale;
    /* [Fase 6 · TK-A-033] MOLDURA INERTE — política idêntica à do motor vetorial: o
       gesto que NASCE na sobra é IGNORADO. Ali não há papel, e pintar fora da folha
       ensinaria à criança uma borda que não existe. (No motor vetorial há também o
       caso do gesto que começa dentro e passa pela moldura, fixado à borda lógica;
       aqui esse caso não existe, porque o gesto de pintura é um toque só.) */
    var pl=paraLogico(ox,oy);
    devLog('[COLORING_DEBUG] touch clientX='+touch.clientX+' clientY='+touch.clientY
      +' logicalX='+pl.x+' logicalY='+pl.y+' LW='+LW+' LH='+LH
      +' imgX='+imgX+' imgY='+imgY+' imgW='+imgW+' imgH='+imgH
      +' dentro='+pl.dentro+' eraser='+isEraser+' color='+color);
    if(!pl.dentro){devLog('[COLORING_DEBUG] toque na moldura ignorado');return;}
    if(isEraser) erase(pl.x,pl.y); else fill(pl.x,pl.y,hex2rgb(color));
  }
},{passive:false});

/* ──────────────────────────────────────────
   WINDOW API  (called via injectJavaScript)
─────────────────────────────────────────── */
window.setColor=function(h){
  devLog('[COLORING_DEBUG] SET_COLOR received h='+h);
  color=h;isEraser=false;
};
window.setEraser=function(){
  devLog('[COLORING_DEBUG] SET_ERASER');
  isEraser=true;
};

/* Limpar e desfazer TAMBÉM mudam a tinta: sobem a revisão e republicam a medida.
   É o que faz "Pronto" voltar a desabilitado assim que a folha é limpa (Parte 5) e
   o que faz Desfazer restaurar tanto os pixels quanto a possibilidade de concluir. */
/* [Fase 6 · TK-A-035] Camada de tinta NOVA sempre nasce no espaço lógico. Criá-la
   com W/H voltaria a acoplar a pintura à janela — e um "limpar" feito em paisagem
   deixaria o buffer com um tamanho que o BFS não indexa. */
function novaCamadaTinta(){
  return tmpCtx.createImageData(Math.max(1,LW),Math.max(1,LH));
}

window.clearPaint=function(){
  if(paintD){pushHist();paintD=novaCamadaTinta();paintRev++;renderAll();postPaintState();}
};

window.undo=function(){
  if(hist.length===0)return;
  var prev=hist.pop();
  if(!paintD)paintD=novaCamadaTinta();
  paintD.data.set(prev);
  paintRev++;
  renderAll();
  postPaintState();
};

window.resetZoom=function(){scale=1;tx=0;ty=0;show();};

/* Reconferência sob demanda da medida real, SEM alterar tinta nem revisão. */
window.postPaintState=function(){postPaintState();};

/* [Fase 6 · TK-A-016] Fechamento atômico pedido de FORA (ida para segundo plano,
   perda de foco). Não grava, não exporta, não descarta — só encerra o gesto. */
window.commitGesture=function(){finalizarGestoAtomico();};

window.exportPaint=function(){
  try{
    /* [Fase 6 · TK-A-035/TK-A-036] O bitmap salvo é o ESPAÇO LÓGICO em 1:1 — nunca
       uma cópia da tela. Reamostrar da janela gravaria dentro da obra a moldura
       desta orientação e a resolução deste aparelho, e a arte ficaria refém do
       momento em que a criança apertou "salvar". Como o espaço lógico é o próprio
       retângulo do lineart, o PNG também deixou de carregar a faixa creme vazia. */
    var out=document.createElement('canvas');
    out.width=Math.max(1,LW); out.height=Math.max(1,LH);
    var outCtx=out.getContext('2d');
    if(paintD) outCtx.putImageData(paintD,0,0);
    /* v2 payload: includes canvas dimensions so loadPaint can validate
       compatibility before applying the bitmap to a potentially different-sized canvas. */
    /* Campos ADITIVOS da medida real (C60 · Parte 3/4): o instantâneo carrega quanta cor
       ele próprio contém e de QUAL revisão veio. Assim quem grava consegue provar, sem
       decodificar PNG do lado nativo, que gravou uma arte com cor — e que ela é o MESMO
       estado que foi validado. O campo "v" continua 2: leitores antigos ignoram os campos novos.
       ATENÇÃO: este bloco vive DENTRO do template literal do HTML — nada de crases aqui. */
    /* [Fase 6 · TK-A-003] Os dois eixos novos passam a ser EMITIDOS POR NOME, e o
       campo "v" permanece CANVAS_PAYLOAD_V (2) — nunca 3 (ver TK-A-001). Todos os
       campos que já existiam continuam presentes, na mesma posição semântica: a
       adição é estritamente aditiva e nenhum leitor antigo quebra. */
    /* [Fase 6 · TK-A-035 · G-CVS-2] O espaço lógico é DECLARADO POR NOME
       ('logicalW'/'logicalH'), como no motor vetorial: sem a declaração, a obra
       guardaria coordenadas cujo significado a próxima abertura teria de adivinhar.
       Os campos que já existiam continuam presentes e continuam VERDADEIROS na sua
       própria definição: 'W'/'H' são as dimensões do bitmap salvo, e
       'imgX'/'imgY'/'imgW'/'imgH' são o retângulo do lineart DENTRO desse bitmap —
       que agora o ocupa inteiro. Quem lê razões ('imgX/W', 'imgW/W') para recortar a
       arte segue lendo o recorte certo. O campo 'v' permanece CANVAS_PAYLOAD_V (2) e
       nunca 3: a adição é estritamente aditiva e os quatro eixos seguem separados. */
    var payload=JSON.stringify({v:CANVAS_PAYLOAD_V,
      paintSchemaVersion:PAINT_SCHEMA_VERSION,layoutVersion:LAYOUT_VERSION,
      logicalW:LW,logicalH:LH,
      W:LW,H:LH,imgX:0,imgY:0,imgW:LW,imgH:LH,
      rev:paintRev,paintedPx:countPaintedPx(),paintablePx:paintablePx,
      data:out.toDataURL('image/png')});
    window.ReactNativeWebView.postMessage('PAINT_EXPORT:'+payload);
  }catch(err){
    window.ReactNativeWebView.postMessage('ERR:export_failed:'+err.message);
  }
};

/* ─── [Fase 6 · F6-R3.5 · TK-A-041 · Q8 regras 1-3] LEITOR DE COMPATIBILIDADE ────
   Classificação EXAUSTIVA e DETERMINÍSTICA de tudo o que pode chegar como obra
   guardada do Colorir. A função é PURA: não decodifica, não desenha, não grava e
   não apaga — ela só diz EM QUE RAMO a obra caiu. Existe porque um leitor sem ramo
   definido é um leitor que, diante do desconhecido, abre folha em branco em
   silêncio — exatamente a quarta invariante ZERO que 'SD-8' proíbe.

   O conjunto de ramos é FECHADO e toda entrada cai em EXATAMENTE UM deles. A ordem
   dos testes É a especificação da precedência (o primeiro que casa vence):

     1. 'ausente'                nada foi guardado. NÃO é obra: é a folha nova
                                 legítima, e folha em branco aqui é o certo.
     2. 'v1-datauri'             data URL cru, sem metadado nenhum (formato mais
                                 antigo que existe no acervo).
     3. 'ilegivel'               não é JSON — truncado, cortado pela metade, lixo.
     4. 'eixo-invalido'          um eixo está PRESENTE e mente sobre si mesmo. Vence
                                 os ramos de forma porque é afirmação mais forte:
                                 nenhum payload assim poderia ter sido escrito aqui.
                                 Continua CANDIDATO — quem decide se abre é a
                                 geometria, e a decisão dela nunca é destrutiva
                                 (TK-A-002: nenhum payload fica inválido por eixo).
     5. 'envelope-nao-resolvido' o ponteiro de armazenamento chegou ao motor sem ter
                                 sido resolvido. Reconhecido pela FORMA (tem 'uri' e
                                 não tem 'data'), nunca pelo número da versão do
                                 ponteiro — o motor não lê o eixo do envelope
                                 (§11.5.3 regra 5). É engano de camada, não obra
                                 corrompida, e chamá-lo de corrompido convidaria a
                                 tratar como lixo o que é uma obra intacta em disco.
     6. 'sem-tinta'              JSON legítimo, mas sem o campo 'data'.
     7. 'logico'                 JSON com 'data' e eixo de layout DECLARADO.
     8. 'v2-legado'              JSON com 'data' e eixo de layout AUSENTE.

   'candidato' diz apenas que existe caminho de leitura — o veredito final ainda
   depende do retângulo de origem, medido depois da decodificação. Nenhum ramo, em
   nenhuma combinação, autoriza apagar, truncar, regravar ou substituir os bytes
   guardados (Q8 regras 2 e 3). */
function classificarPayload(jsonStr){
  if(typeof jsonStr!=='string'||!jsonStr)
    return {ramo:'ausente',candidato:false,payload:null,dataUrl:null};
  if(jsonStr.indexOf('data:')===0)
    return {ramo:'v1-datauri',candidato:true,payload:null,dataUrl:jsonStr};
  var p;
  try{p=JSON.parse(jsonStr);}catch(e){
    return {ramo:'ilegivel',candidato:false,payload:null,dataUrl:null};
  }
  if(!p||typeof p!=='object'||Array.isArray(p))
    return {ramo:'ilegivel',candidato:false,payload:null,dataUrl:null};
  var ax=classifyAxes(p);
  if(!ax.paint.ok||!ax.layout.ok)
    return {ramo:'eixo-invalido',candidato:true,payload:p,dataUrl:(typeof p.data==='string')?p.data:null};
  if(typeof p.data!=='string'){
    if(typeof p.uri==='string')
      return {ramo:'envelope-nao-resolvido',candidato:false,payload:p,dataUrl:null};
    return {ramo:'sem-tinta',candidato:false,payload:p,dataUrl:null};
  }
  if(!ax.layout.legacy)
    return {ramo:'logico',candidato:true,payload:p,dataUrl:p.data};
  return {ramo:'v2-legado',candidato:true,payload:p,dataUrl:p.data};
}

/* ─── [Fase 6 · F6-R3.5 · TK-A-036 · Q8 regras 2, 3, 6] ORIGEM DA REPROJEÇÃO ─────
   Devolve o retângulo do lineart DENTRO do bitmap salvo — o único ponto de partida
   legítimo para trazer uma obra ao espaço lógico de agora. A leitura é ESTRITAMENTE
   SOMENTE LEITURA: escolhe COMO INTERPRETAR os bytes gravados, não os regrava, não
   migra, não converte e não descarta. A representação nova só aparece no próximo
   save explícito da criança (Q8 regra 8).

   Três origens, todas determinísticas a partir de evidência real:
     1. obra que DECLARA 'logicalW'/'logicalH' — o bitmap É o espaço lógico;
     2. obra legada que traz a colocação ('imgX'…'imgH') — o retângulo está escrito;
     3. obra legada sem colocação — o bitmap era a JANELA inteira daquele momento, e
        a colocação daquela janela é recalculável pela MESMA conta que sempre a
        produziu ('colocacaoHistorica'), com o tamanho natural do lineart de hoje.

   Devolve null quando não há evidência suficiente. Null NUNCA autoriza apagar: quem
   recebe null não aplica nada e a obra continua guardada exatamente como estava
   (Q8 regra 3) — incompatibilidade dimensional não destrói.

   ⚠️ Este é o mínimo exigido pela atomicidade de C-A9: no instante em que o modelo
   passa a viver no espaço lógico, uma obra já existente PRECISA continuar abrindo,
   sob pena de "obra recuperável aberta como canvas vazio" (SD-8). O leitor de
   compatibilidade completo — corpus, vereditos por caso e TA-12 — permanece em
   'C-A10' e não é antecipado aqui. */
function retanguloDeOrigem(p,bmpW,bmpH){
  if(!(bmpW>0&&bmpH>0))return null;
  var lw=Number(p&&p.logicalW), lh=Number(p&&p.logicalH);
  if(isFinite(lw)&&lw>0&&isFinite(lh)&&lh>0)return{x:0,y:0,w:bmpW,h:bmpH};
  var ix=Number(p&&p.imgX), iy=Number(p&&p.imgY);
  var iw=Number(p&&p.imgW), ih=Number(p&&p.imgH);
  if(isFinite(ix)&&isFinite(iy)&&isFinite(iw)&&iw>0&&isFinite(ih)&&ih>0)
    return{x:ix,y:iy,w:iw,h:ih};
  /* Chegou aqui sem retângulo escrito. A RECONSTRUÇÃO HISTÓRICA é do ramo LEGADO
     de geometria — e só dele. Quem DECLARA 'layoutVersion' se comprometeu a trazer
     a geometria explícita; se ela não veio, o payload se contradiz, e o leitor NÃO
     deduz o retângulo a partir dos píxeis. Deduzir seria inferir um eixo a partir de
     outro (§11.5.3 regra 5) — a mesma proibição que TK-A-002 já fixou. Sem retângulo
     nada é aplicado, e não aplicar nunca apaga (Q8 regra 3). */
  if(!classifyAxes(p).layout.legacy)return null;
  /* Folha livre (Ateliê raster): não há lineart, o bitmap é a obra inteira. */
  if(!lineArtImg)return{x:0,y:0,w:bmpW,h:bmpH};
  return colocacaoHistorica(bmpW,bmpH,lineArtImg.naturalWidth,lineArtImg.naturalHeight);
}

/* Validação REAL do desenho salvo, SEM aplicar tinta. Confirma que o payload
   existe, parseia e é RECUPERÁVEL para o espaço lógico de agora. Posta:
     PAINT_VALID    → há tinta carregável e compatível (mostrar modal "continuar")
     PAINT_INVALID  → ausente / corrompido / incompatível (limpar e abrir como nova)
   Usado para decidir o modal ANTES de carregar — nunca deixa modal falso. */
window.validatePaint=function(jsonStr){
  try{
    /* [Fase 6 · TK-A-041] Os DOIS pontos de entrada — 'validatePaint' e 'loadPaint' —
       classificam pelo MESMO leitor. Antes cada um tinha a sua cascata de 'if', e duas
       cascatas que precisam concordar acabam discordando: bastaria uma divergir para
       a tela mostrar "continuar pintando" e a carga seguinte devolver folha em branco. */
    var cls=classificarPayload(jsonStr);
    window.ReactNativeWebView.postMessage('PAINT_BRANCH:'+JSON.stringify({ramo:cls.ramo,candidato:cls.candidato}));
    if(!cls.candidato){window.ReactNativeWebView.postMessage('PAINT_INVALID');return;}
    if(cls.ramo==='v1-datauri'){
      /* v1 legado: sem metadado nenhum. A pergunta deixou de ser "tem o tamanho
         desta janela?" — que reprovava a obra da criança só por ela ter sido feita
         noutra orientação (Q8 regra 3) — e passou a ser "dá para reconstruir?". */
      var im=new window.Image();
      im.onload=function(){window.ReactNativeWebView.postMessage(retanguloDeOrigem(null,im.naturalWidth,im.naturalHeight)?'PAINT_VALID':'PAINT_INVALID');};
      im.onerror=function(){window.ReactNativeWebView.postMessage('PAINT_INVALID');};
      im.src=jsonStr; return;
    }
    var p=cls.payload;
    if(!p||typeof p.data!=='string'){window.ReactNativeWebView.postMessage('PAINT_INVALID');return;}
    /* [Fase 6 · TK-A-004] Veredito POR EIXO, publicado como sinal ADITIVO e
       observável. Cada eixo é julgado isoladamente: o veredito de um NUNCA
       contamina o do outro, e nenhum deles é deduzido de "v", de "fmt" nem de
       "uri" (o envelope de armazenamento não é consultado aqui — ele responde a
       outra pergunta, ver TK-A-001).
       ⚠️ Este veredito é INFORMATIVO: por Q8 regra 3, incompatibilidade de eixo
       jamais autoriza apagar, regravar ou substituir a obra por folha em branco.
       Quem decide o que fazer com uma obra legada é o leitor de compatibilidade,
       e a decisão dele nunca é destrutiva. Nenhum payload passa a ser INVÁLIDO
       por causa desta task. */
    var ax=classifyAxes(p);
    window.ReactNativeWebView.postMessage('PAINT_AXES:'+JSON.stringify({
      paint:{declared:ax.paint.declared,legacy:ax.paint.legacy,ok:ax.paint.ok},
      layout:{declared:ax.layout.declared,legacy:ax.layout.legacy,ok:ax.layout.ok}
    }));
    /* [Fase 6 · TK-A-035] Obra que DECLARA o espaço lógico é recuperável por
       construção: o bitmap É o espaço lógico. Resposta imediata, sem decodificar. */
    var lwD=Number(p.logicalW), lhD=Number(p.logicalH);
    if(isFinite(lwD)&&lwD>0&&isFinite(lhD)&&lhD>0){
      window.ReactNativeWebView.postMessage('PAINT_VALID'); return;
    }
    /* Obra legada: a decisão depende de existir retângulo de origem — e ele pode
       vir do payload ou ser recalculado a partir do tamanho do próprio bitmap.
       Repare no que NÃO está mais aqui: a comparação com W/H da janela. Ela fazia
       uma obra perfeitamente inteira ser tratada como inválida só porque a criança
       virou o aparelho — e "inválida" abria folha em branco (SD-8). */
    var im2=new window.Image();
    im2.onload=function(){window.ReactNativeWebView.postMessage(retanguloDeOrigem(p,im2.naturalWidth,im2.naturalHeight)?'PAINT_VALID':'PAINT_INVALID');};
    im2.onerror=function(){window.ReactNativeWebView.postMessage('PAINT_INVALID');};
    im2.src=p.data;
  }catch(err){
    window.ReactNativeWebView.postMessage('PAINT_INVALID');
  }
};

window.loadPaint=function(jsonStr){
  try{
    var payload,dataUrl,savedW,savedH,axes;
    /* [Fase 6 · TK-A-041] REGISTRO, antes de qualquer decisão. Toda carga publica o
       ramo em que caiu — inclusive (e principalmente) quando o ramo é terminal. Sem
       este registro, "não abriu" e "abriu vazia" chegam iguais a quem observa, e a
       diferença entre as duas é a diferença entre preservar e perder a obra. */
    var cls=classificarPayload(jsonStr);
    window.ReactNativeWebView.postMessage('LOAD_PAINT_BRANCH:'+JSON.stringify({ramo:cls.ramo,candidato:cls.candidato}));
    if(!cls.candidato){
      /* [Fase 6 · TK-A-044 · Q8 regra 3] Ramo terminal. Repare no que NÃO acontece
         aqui: 'paintD' não é tocado, nada é exportado, nada é regravado e nada é
         removido do armazenamento. Falha de leitura reporta — nunca vira dano.
           · 'ausente' é o único que não é falha: não havia obra, então a folha nova
             é o comportamento CERTO e nenhum alarme é levantado (SD-8: canvas
             branco só quando de fato não há obra);
           · 'ilegivel' é o único legitimamente corrompido;
           · os demais são obra que EXISTE e que este motor não soube abrir — dizem
             'INCOMPATIBLE', que a tela traduz num estado explícito (TK-A-045),
             jamais numa folha em branco silenciosa. */
      if(cls.ramo==='ausente')return;
      devLog('[COLORING_STATE] ramo terminal '+cls.ramo+' — nada aplicado, nada apagado');
      window.ReactNativeWebView.postMessage(cls.ramo==='ilegivel'?'LOAD_PAINT_CORRUPTED':'LOAD_PAINT_INCOMPATIBLE');
      return;
    }
    if(cls.ramo==='v1-datauri'){
      /* Legacy format (v1): raw data URL, no dimension metadata.
         Fall back to using the image's natural pixel size for validation. */
      payload=null; dataUrl=jsonStr; savedW=null; savedH=null;
      /* [Fase 6 · TK-A-002] Um data URL cru não declara eixo NENHUM: os dois
         ficam ausentes, e ausência é legado — nunca defeito. */
      axes=classifyAxes(null);
    }else{
      payload=cls.payload;
      /* [Fase 6 · TK-A-002] A representação é identificada PELO NOME DO EIXO,
         ANTES de qualquer ramo legado — e os ramos legados continuam INTACTOS
         logo abaixo, porque a ausência de eixo continua sendo um caminho de
         leitura de primeira classe, não um erro. */
      axes=classifyAxes(payload);
      dataUrl=payload.data;
      if(axes.layout.legacy){
        /* Geometria LEGADA: W/H são o que sempre foram. Quando o payload antigo
           nem os traz, o fallback histórico pelo tamanho natural do bitmap
           permanece exatamente como era — nada de comportamento antigo se perde. */
        savedW=payload.W; savedH=payload.H;
      }else{
        /* Geometria DECLARADA: quem declara 'layoutVersion' se compromete a
           trazer a geometria explícita. Se ela não vier, o leitor NÃO adivinha
           pelo tamanho natural do bitmap — adivinhar seria inferir um eixo a
           partir de outro (§11.5.3 regra 5). Fica nulo e o ramo de
           incompatibilidade decide, sem nunca apagar nada. */
        savedW=(payload.W!==null&&payload.W!==undefined)?payload.W:null;
        savedH=(payload.H!==null&&payload.H!==undefined)?payload.H:null;
      }
    }
    /* Sinal ADITIVO e observável da classificação por eixo. Os dois eixos são
       independentes: 'paint.legacy' diz que campos esperar, 'layout.legacy' diz
       como ler as coordenadas, e nenhum decide o outro. */
    window.ReactNativeWebView.postMessage('LOAD_PAINT_AXES:'+JSON.stringify({
      paint:{declared:axes.paint.declared,legacy:axes.paint.legacy,ok:axes.paint.ok},
      layout:{declared:axes.layout.declared,legacy:axes.layout.legacy,ok:axes.layout.ok}
    }));
    var img=new window.Image();
    img.onload=function(){
      try{
        /* [Fase 6 · F6-R3.5 · TK-A-036 · Q8] O portão dimensional que existia aqui
           EXIGIA que o bitmap salvo tivesse exatamente o tamanho da janela de agora.
           Era ele que transformava "criança pintou em retrato e reabriu em paisagem"
           em 'LOAD_PAINT_INCOMPATIBLE' — obra inteira, recuperável, tratada como se
           não existisse. Com o espaço lógico, a pergunta certa é outra: de qual
           retângulo do bitmap sai a obra? Havendo retângulo, a obra entra INTEIRA,
           com proporção preservada, em UMA única reamostragem que parte do bitmap
           canônico — nunca de um quadro anterior, para que rotações sucessivas não
           acumulem perda.
           Não havendo retângulo, nada é aplicado e nada é apagado: os bytes antigos
           continuam intactos no armazenamento (Q8 regra 3). */
        if(!(LW>0&&LH>0)){
          window.ReactNativeWebView.postMessage('LOAD_PAINT_INCOMPATIBLE');
          return;
        }
        var org=retanguloDeOrigem(payload,img.naturalWidth,img.naturalHeight);
        if(!org){
          devLog('[COLORING_STATE] sem retangulo de origem — nada aplicado, nada apagado W_saved='+savedW+' H_saved='+savedH+' bmp='+img.naturalWidth+'x'+img.naturalHeight);
          window.ReactNativeWebView.postMessage('LOAD_PAINT_INCOMPATIBLE');
          return;
        }
        var tc=document.createElement('canvas'); tc.width=LW; tc.height=LH;
        var tcCtx=tc.getContext('2d');
        tcCtx.drawImage(img,org.x,org.y,org.w,org.h,0,0,LW,LH);
        if(!paintD) paintD=novaCamadaTinta();
        paintD.data.set(tcCtx.getImageData(0,0,LW,LH).data);
        /* A arte retomada entra como uma REVISÃO nova e é MEDIDA como qualquer outra:
           nunca mais "tem pintura" só porque existia um payload salvo — se o que voltou
           for uma folha transparente, a medida dirá zero e "Pronto" seguirá desabilitado. */
        paintRev++; renderAll(); postPaintState();
        /* Sinal ADITIVO: a pintura salva já foi DECODIFICADA e DESENHADA neste frame.
           Quem retoma uma arte (ex.: Colorir 60) usa isto para só então revelar o
           canvas — nunca o contorno sem cor. O fluxo legado ignora a mensagem. */
        window.ReactNativeWebView.postMessage('PAINT_APPLIED');
        devLog('[COLORING_STATE] load OK espacoLogico='+LW+'x'+LH+' origem='+org.x+','+org.y+' '+org.w+'x'+org.h);
      }catch(e){
        window.ReactNativeWebView.postMessage('ERR:loadPaint_draw:'+e.message);
      }
    };
    img.onerror=function(){
      window.ReactNativeWebView.postMessage('LOAD_PAINT_CORRUPTED');
    };
    img.src=dataUrl;
  }catch(err){
    window.ReactNativeWebView.postMessage('ERR:loadPaint:'+err.message);
  }
};

/* ──────────────────────────────────────────
   INITIALISATION
─────────────────────────────────────────── */
/* [Fase 6 · TK-A-085 · G-CVS-1] Os buffers do BFS são dimensionados pelo ESPAÇO
   LÓGICO e alocados UMA vez, na inicialização. 'resize()' não passa por aqui. */
function allocBufs(){
  qBuf=new Int32Array(Math.max(1,LW*LH*2));
  visBuf=new Uint8Array(Math.max(1,LW*LH));
}

function initCanvas(uri){
  devLog('initCanvas start uriLen='+uri.length);
  var img=new window.Image();
  img.onload=function(){
    try{
      resize();
      devLog('img.naturalSize='+img.naturalWidth+'x'+img.naturalHeight+' canvas='+W+'x'+H);
      /* Store reference for compositing — line art is re-drawn each frame. */
      lineArtImg=img;
      /* [Fase 6 · TK-A-035] O ESPAÇO LÓGICO nasce do lineart — e só dele. A janela
         entra depois, e só na projeção ('reprojetar', dentro de 'definirEspacoLogico'),
         que mantém a folga histórica de 6px e a colocação inteira que impedem a borda
         da arte de cair em posição subpixel. */
      definirEspacoLogico(img.naturalWidth,img.naturalHeight);
      devLog('espacoLogico='+LW+'x'+LH+' projecao x='+imgX+' y='+imgY+' w='+imgW+' h='+imgH);
      /* Capture barrier snapshot (bg + line art) for BFS isBarrier checks —
         agora NO ESPAÇO LÓGICO, em 1:1 com o lineart. A barreira deixou de ser
         reamostrada pelo tamanho da tela, o que também a torna igual em qualquer
         aparelho: a mesma região fechada é a mesma região fechada em todo lugar. */
      tmpCtx.fillStyle='#FFFDF8'; tmpCtx.fillRect(0,0,LW,LH);
      tmpCtx.drawImage(img,0,0,LW,LH);
      baseD=tmpCtx.getImageData(0,0,LW,LH);
      devLog('getImageData OK size='+(LW*LH*4));
      paintD=novaCamadaTinta();
      /* Área PINTÁVEL medida UMA vez, com o lineart já no lugar: é o denominador da
         cobertura mínima (Parte 3). Feito aqui porque baseD (fundo + traço) acabou de
         ser capturado e imgX/Y/W/H já estão definitivos. */
      computePaintablePx();
      allocBufs();
      devLog('bufs allocated qBuf='+qBuf.length+' visBuf='+visBuf.length);
      /* Colorir Imersivo — câmera inicial inteligente: abre com zoom de presença,
         mas CENTRALIZADO na ÁREA VISUAL SEGURA (acima do overlay), não no centro
         bruto do canvas. Assim o foco da arte não nasce atrás do overlay e o
         enquadramento fica natural/intencional. É só view (scale/tx/ty) — baseD/
         paintD/imgX..imgW e o flood fill ficam intactos; clamp() mantém as bordas
         alcançáveis por pan. "Ver tudo" (resetZoom) volta a scale 1, tx 0, ty 0. */
      var focusX=imgX+imgW/2;                       // centro da imagem (X)
      var focusY=imgY+imgH/2;                       // centro da imagem (Y)
      var safeCenterX=W/2;                          // largura inteira visível
      var safeCenterY=(H-INITIAL_VIEW_BOTTOM_SAFE_INSET)/2; // centro acima do overlay
      scale=INITIAL_COLORING_SCALE;
      tx=safeCenterX-focusX*scale;
      ty=safeCenterY-focusY*scale;
      clamp();
      renderAll();
      window.ReactNativeWebView.postMessage('READY');
      /* Medida INICIAL (folha em branco = 0 pintados): quem depende de cor real já nasce
         com o retrato certo, em vez de herdar um "pintado" implícito. */
      postPaintState();
      devLog('READY sent zoom='+scale);
    }catch(e){
      window.ReactNativeWebView.postMessage('ERR:initCanvas:'+e.message);
    }
  };
  img.onerror=function(){
    window.ReactNativeWebView.postMessage('ERR:img_load_failed');
    devLog('img.onerror uriLen='+uri.length);
  };
  img.src=uri;
}

window.addEventListener('resize',resize);
resize();

var imgUri=${imgJson};
if(imgUri){
  initCanvas(imgUri);
}else{
  try{
    /* Atelier free-draw canvas — blank slate.
       [Fase 6 · TK-A-035] Sem lineart não há retângulo de arte, então a folha adota
       a janela do primeiro quadro como espaço lógico — UMA vez, e a trava fecha aí
       mesmo. Readotar depois significaria realocar 'paintD'/'qBuf'/'visBuf', que é
       exatamente o que 'G-CVS-1' proíbe: pixel realocado é pintura perdida. */
    definirEspacoLogico(W,H);
    tmpCtx.fillStyle='#FFFDF8'; tmpCtx.fillRect(0,0,LW,LH);
    baseD=tmpCtx.getImageData(0,0,LW,LH);
    paintD=novaCamadaTinta();
    computePaintablePx();
    allocBufs();
    renderAll();
    window.ReactNativeWebView.postMessage('READY');
    postPaintState();
  }catch(e){
    window.ReactNativeWebView.postMessage('ERR:placeholder:'+e.message);
  }
}
})();
</script></body></html>`;
}

/* ──────────────────────────────────────────────────────────────────
   Cache em memória da lineart já convertida (base64 data URL).
   Chave estável = a própria referência do require()/asset (id de módulo do
   Metro), constante por imagem. Ao reabrir a mesma cena, reaproveita o data URL
   e evita o download+leitura do arquivo (loading menor em reaberturas).
   Vive no escopo do módulo → persiste entre montagens da tela.
────────────────────────────────────────────────────────────────── */
const lineartCache = new Map();

/* ──────────────────────────────────────────────────────────────────
   [C60-P13-PREWARM] Chave de cache e conversão da lineart isoladas em funções de MÓDULO.
   Motivo (§Parte 10): a transição direta entre as partes da jornada de cores remonta a tela por
   identidade — e era AQUI que nascia a "tela quase vazia com rodinha" vista no teste físico: a
   próxima lineart só começava a ser convertida (asset → base64 → data URL) DEPOIS da remontagem.
   Com a conversão exposta, a celebração consegue AQUECER a próxima parte antes de a criança tocar
   no botão; quando a tela remonta, o cache já responde HIT e o primeiro quadro chega quase junto.
   Nenhuma mudança de contrato do componente e nenhuma dependência nova.
────────────────────────────────────────────────────────────────── */
function lineartCacheKeyOf(imageSource) {
  // F2.4e.3: require (id de módulo do Metro) OU { uri: 'file://…' } (colorir remoto do pack).
  const isUriSource = !!(imageSource && typeof imageSource === 'object' && typeof imageSource.uri === 'string');
  return isUriSource ? imageSource.uri : imageSource;
}

/**
 * Converte a lineart em data URL base64 e MEMORIZA no cache do módulo. Devolve o data URL já
 * pronto quando ele existe (sem download/leitura). Lança em falha — quem chama decide o que fazer.
 */
async function convertLineartToDataUrl(imageSource) {
  const isUriSource = !!(imageSource && typeof imageSource === 'object' && typeof imageSource.uri === 'string');
  const cacheKey = lineartCacheKeyOf(imageSource);
  const cached = lineartCache.get(cacheKey);
  if (cached) return cached;

  let localUri;
  if (isUriSource) {
    localUri = imageSource.uri; // fonte remota já resolvida (file:// persistente do pack)
  } else {
    const asset = Asset.fromModule(imageSource);
    if (!asset.downloaded) await asset.downloadAsync();
    localUri = asset.localUri || asset.uri;
  }
  if (!localUri) throw new Error('asset sem localUri/uri');
  let dataUrl;
  if (localUri.startsWith('file')) {
    // Lê o arquivo local direto em base64 — sem blob/FileReader.
    const b64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    dataUrl = 'data:image/png;base64,' + b64;
  } else {
    // URI remota/http (fallback raro): fetch + FileReader.
    const resp = await fetch(localUri);
    const blob = await resp.blob();
    dataUrl = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onloadend = () => (typeof reader.result === 'string'
        ? res(reader.result) : rej(new Error('FileReader result is not a string')));
      reader.onerror = () => rej(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  }
  if (!dataUrl || dataUrl.length < 64) throw new Error('dataUrl vazio');
  lineartCache.set(cacheKey, dataUrl); // guarda p/ próximas aberturas (require OU uri)
  return dataUrl;
}

/**
 * prewarmLineart(imageSource) — AQUECE a lineart no cache do módulo, fora de qualquer render.
 * Devolve `true` quando a imagem está pronta em cache e `false` em qualquer falha: NUNCA lança e
 * NUNCA altera estado de tela. É best-effort — a tela que a consome continua funcionando sem ela
 * (só perde a vantagem do cache quente). Não baixa conteúdo remoto novo: é a mesma fonte que a
 * tela usaria de qualquer jeito, só que resolvida ANTES.
 */
export async function prewarmLineart(imageSource) {
  if (!imageSource) return false;
  try {
    const cacheKey = lineartCacheKeyOf(imageSource);
    if (lineartCache.get(cacheKey)) return true; // já quente: nada a fazer
    const dataUrl = await convertLineartToDataUrl(imageSource);
    return typeof dataUrl === 'string' && dataUrl.length > 0;
  } catch {
    return false; // aquecimento é best-effort: falhar aqui não pode afetar a experiência
  }
}

/* ──────────────────────────────────────────────────────────────────
   [F6-R3.4 · TK-A-012..TK-A-014] TÉRMINO DO PROCESSO DE CONTEÚDO DA WEBVIEW
   ─────────────────────────────────────────────────────────────────
   Até aqui o app tinha ZERO ocorrência das duas props de término de processo em
   `src/`: quando o sistema matava o processo de conteúdo da WebView, o app não
   ficava sabendo — e ninguém podia sequer contar quantas vezes isso acontecia.

   ⚠️ GUARDRAIL `FD-12` — O QUE ESTE REGISTRO É, E O QUE ELE NÃO É.
   Este registro descreve **o evento**, nunca a causa. Ele NÃO prova, NÃO confirma
   e NÃO refuta `P-164`; ele não autoriza ninguém a escrever que "a causa foi X"
   nem a rotular qualquer correção como resolvida. É instrumento de captura para a
   campanha física — a leitura do que foi capturado é humana, e vem depois.

   É OBSERVABILIDADE PURA: o handler não recarrega, não remonta, não limpa, não
   grava e não altera nada visível. Recarregar aqui seria justamente destruir a
   pintura que o evento ameaça (`SD-8`).

   Sobre o destino do registro (a incerteza localizada de `TK-A-014`): NÃO pode ser
   o `devLog` da ponte, porque aquele logger vive DENTRO da página e não sobrevive
   à morte do próprio processo que deveria relatar. E não passa por `utils/logger`,
   que cala fora de desenvolvimento: a validação física pode rodar num build de
   pré-visualização, e um registro invisível justamente ali não seria evidência
   nenhuma. Fica `console.warn` — o mesmo idioma que `AtelierCanvas` já usa para
   anomalia de WebView, legível no console do aparelho em qualquer build.

   O contador é de MÓDULO, não de instância: uma remontagem depois do término não
   pode zerar a contagem, senão a contagem não contaria nada.
────────────────────────────────────────────────────────────────── */
let webViewProcessTerminations = 0;

function recordWebViewProcessTermination(origem, detalhe) {
  webViewProcessTerminations += 1;
  const quando = new Date().toISOString();
  console.warn(
    '[ColoringCanvas] PROCESSO DE CONTEUDO DA WEBVIEW TERMINOU'
    + ` · origem=${origem} · ocorrencia=#${webViewProcessTerminations} · quando=${quando}`
    + (detalhe ? ` · ${detalhe}` : '')
    + ' · EVENTO OBSERVADO, CAUSA NAO DETERMINADA',
  );
}

/* ──────────────────────────────────────────────────────────────────
   React Native component
────────────────────────────────────────────────────────────────── */
const ColoringCanvas = forwardRef(function ColoringCanvas(
  // `onPaintState` (ADITIVO · C60 · Parte 3) recebe a MEDIDA REAL da tinta a cada operação:
  // { rev, paintedPx, paintablePx }. Diferente de `onPainted` (mão única, legado), ele é de mão
  // DUPLA — apagar tudo devolve paintedPx=0 no mesmo toque. O fluxo legado simplesmente não passa
  // a prop e nada muda para ele.
  { selectedColor = '#FF0000', imageSource = null, storyId = null, sceneNumber = null, onPainted, onGoBack, onLoadCorrupted, onLoadIncompatible, onFillRejected, onReadyChange, onPaintValid, onPaintInvalid, onPaintApplied, onPaintState },
  ref,
) {
  const webViewRef = useRef(null);
  const isReadyRef = useRef(false);
  const pendingExportCallbackRef = useRef(null);
  const pendingLoadRef = useRef(null);
  const pendingValidateRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState(null); // null | 'error' | 'timeout'
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Carrega a lineart como data URL base64 de forma CONFIÁVEL via expo-asset +
  // expo-file-system. Evita `fetch().blob()` + FileReader (instável no React
  // Native/Hermes), que falhava silenciosamente → canvas branco. O WebView recebe
  // um data URL self-contained (sem depender do dev server nem do file:// no iOS).
  // retryKey é dep para o "Tentar novamente" forçar nova tentativa.
  useEffect(() => {
    if (!imageSource) { setImageDataUrl(null); return; }
    let cancelled = false;

    // F2.4e.3: imageSource pode ser um require (módulo) OU { uri: 'file://…' } (colorir remoto
    // do pack). A chave de cache e a resolução do localUri tratam os dois casos; o pipeline
    // file://→base64→dataURL (em `convertLineartToDataUrl`) é IDÊNTICO nos dois (o WebView
    // recebe um data URL self-contained).
    const cacheKey = lineartCacheKeyOf(imageSource);

    // Cache HIT: reaproveita a lineart já convertida (sem download/leitura). É por aqui que a
    // transição direta da jornada entra "quente" quando a celebração já aqueceu a próxima parte.
    const cached = lineartCache.get(cacheKey);
    if (cached) {
      if (__DEV__) console.log(`[ColoringCanvas] lineart CACHE HIT story=${storyId} scene=${sceneNumber}`);
      setImageDataUrl(cached);
      return () => { cancelled = true; };
    }

    (async () => {
      const t0 = Date.now();
      try {
        const dataUrl = await convertLineartToDataUrl(imageSource);
        if (__DEV__) {
          console.log(`[ColoringCanvas] lineart CACHE MISS story=${storyId} scene=${sceneNumber} convMs=${Date.now() - t0} len=${dataUrl.length}`);
        }
        if (!cancelled) setImageDataUrl(dataUrl);
      } catch (err) {
        // Falha VISÍVEL (nunca canvas branco silencioso): mostra estado de erro.
        if (__DEV__) {
          console.warn(`[ColoringCanvas] lineart FALHOU story=${storyId} scene=${sceneNumber}:`, err?.message);
        }
        if (!cancelled) {
          setImageDataUrl(null);
          setIsLoading(false);
          setErrorType('error');
        }
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSource, retryKey, storyId, sceneNumber]);

  // When imageDataUrl transitions to a real URL (prefetch complete), reset the
  // loading state so the spinner shows again while the WebView processes the image.
  useEffect(() => {
    if (imageDataUrl !== null) {
      isReadyRef.current = false;
      setErrorType(null);
      setIsLoading(true);
    }
  }, [imageDataUrl]);

  // Safety timeout: if READY is not received within TIMEOUT_MS, show error UI.
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => {
      if (!isReadyRef.current) {
        setIsLoading(false);
        setErrorType('timeout');
      }
    }, TIMEOUT_MS);
    return () => clearTimeout(t);
  // retryKey ensures each retry attempt starts a fresh timeout.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, retryKey]);

  // retryKey is included so a new HTML object is produced on retry, causing
  // the WebView (keyed on retryKey) to fully remount with clean JS state.
  const htmlSource = useMemo(
    () => ({ html: buildHtml(imageDataUrl) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageDataUrl, retryKey],
  );

  // Sync selected colour/eraser into WebView whenever the prop changes.
  useEffect(() => {
    if (!isReadyRef.current || !webViewRef.current) return;
    const js = selectedColor === ERASER_COLOR
      ? 'window.setEraser(); true;'
      : `window.setColor(${JSON.stringify(selectedColor)}); true;`;
    webViewRef.current.injectJavaScript(js);
  }, [selectedColor]);

  // Cleanup pending refs on unmount to prevent stale callbacks.
  useEffect(() => {
    return () => {
      pendingExportCallbackRef.current = null;
      pendingLoadRef.current = null;
      pendingValidateRef.current = null;
    };
  }, []);

  // Sinaliza prontidão do canvas (lineart carregado) para o consumidor. Permite
  // que a tela BLOQUEIE o salvar até o desenho estar carregado corretamente.
  const ready = !isLoading && !errorType;
  useEffect(() => {
    onReadyChange?.(ready);
  }, [ready, onReadyChange]);

  useImperativeHandle(ref, () => ({
    clearCanvas() { webViewRef.current?.injectJavaScript('window.clearPaint(); true;'); },
    // Republica a medida atual sem alterar a tinta (nem a revisão). Usado para reconferir o
    // estado antes de uma decisão importante, sem depender de o último sinal ter chegado.
    measurePaint() { webViewRef.current?.injectJavaScript('window.postPaintState && window.postPaintState(); true;'); },
    undo()        { webViewRef.current?.injectJavaScript('window.undo(); true;'); },
    resetZoom()   { webViewRef.current?.injectJavaScript('window.resetZoom(); true;'); },
    // [Fase 6 · TK-A-016] Fecha o gesto em curso no MODELO, sem gravar, exportar
    // ou descartar. Chamado quando a superfície sai de cena.
    commitGesture() { webViewRef.current?.injectJavaScript('window.commitGesture && window.commitGesture(); true;'); },

    exportPaint(callback) {
      pendingExportCallbackRef.current = callback;
      webViewRef.current?.injectJavaScript('window.exportPaint(); true;');
    },

    loadPaint(savedData) {
      const js = `window.loadPaint(${JSON.stringify(savedData)}); true;`;
      if (isReadyRef.current && webViewRef.current) {
        webViewRef.current.injectJavaScript(js);
      } else {
        pendingLoadRef.current = savedData;
      }
    },

    // Valida (sem aplicar) se o desenho salvo é carregável e compatível com o
    // canvas atual. Resultado vem por onPaintValid / onPaintInvalid.
    validatePaint(savedData) {
      const js = `window.validatePaint(${JSON.stringify(savedData)}); true;`;
      if (isReadyRef.current && webViewRef.current) {
        webViewRef.current.injectJavaScript(js);
      } else {
        pendingValidateRef.current = savedData;
      }
    },
  }));

  function handleMessage(e) {
    const msg = e.nativeEvent.data;
    if (msg === 'READY') {
      isReadyRef.current = true;
      setIsLoading(false);
      setErrorType(null);
      const colorJs = selectedColor === ERASER_COLOR
        ? 'window.setEraser(); true;'
        : `window.setColor(${JSON.stringify(selectedColor)}); true;`;
      webViewRef.current?.injectJavaScript(colorJs);
      if (pendingValidateRef.current) {
        const pendingVJs = `window.validatePaint(${JSON.stringify(pendingValidateRef.current)}); true;`;
        webViewRef.current?.injectJavaScript(pendingVJs);
        pendingValidateRef.current = null;
      }
      if (pendingLoadRef.current) {
        const pendingJs = `window.loadPaint(${JSON.stringify(pendingLoadRef.current)}); true;`;
        webViewRef.current?.injectJavaScript(pendingJs);
        pendingLoadRef.current = null;
      }
    } else if (msg === 'PAINTED') {
      onPainted?.();
    } else if (msg.startsWith('PAINT_STATE:')) {
      // Medida real da tinta (C60 · Parte 3). Entregue crua; quem decide o que é "cor
      // suficiente" é `coloring60PaintMetrics` — o motor não conhece regra de produto.
      try { onPaintState?.(JSON.parse(msg.slice('PAINT_STATE:'.length))); } catch { /* medida ilegível: ignorada */ }
    } else if (msg.startsWith('PAINT_EXPORT:')) {
      const exportData = msg.slice('PAINT_EXPORT:'.length);
      pendingExportCallbackRef.current?.(exportData);
      pendingExportCallbackRef.current = null;
    } else if (msg === 'PAINT_APPLIED') {
      onPaintApplied?.();
    } else if (msg === 'PAINT_VALID') {
      onPaintValid?.();
    } else if (msg.startsWith('PAINT_BRANCH:') || msg.startsWith('LOAD_PAINT_BRANCH:')) {
      // [Fase 6 · TK-A-041] O REGISTRO da classificação. Sinal ADITIVO: nenhum fluxo
      // decide nada por ele — ele existe para que "em que ramo esta obra caiu?" tenha
      // resposta observável no aparelho, e não só no arnês. Em produção não custa nada.
      if (__DEV__) console.log('[ColoringCanvas] [COMPAT]', msg);
    } else if (msg === 'PAINT_INVALID') {
      // Nada é "curado" e nada é limpo: o armazenamento não é tocado por uma leitura
      // que não deu certo (Q8 regra 3). O que muda é só o que a tela vai apresentar.
      if (__DEV__) console.log('[ColoringCanvas] [COLORING_STATE] arte guardada não aplicável nesta leitura — nada foi apagado');
      onPaintInvalid?.();
    } else if (msg === 'LOAD_PAINT_CORRUPTED') {
      onLoadCorrupted?.();
    } else if (msg === 'FILL_REJECTED') {
      onFillRejected?.();
    } else if (msg === 'LOAD_PAINT_INCOMPATIBLE') {
      if (__DEV__) console.log('[ColoringCanvas] [COLORING_STATE] obra existente não aberta por este motor — bytes preservados no armazenamento');
      onLoadIncompatible?.();
    } else if (msg.startsWith('LOG:')) {
      if (__DEV__) console.log('[ColoringCanvas WebView]', msg.slice(4));
    } else if (msg.startsWith('ERR:')) {
      if (__DEV__) console.warn('[ColoringCanvas WebView]', msg);
      if (!isReadyRef.current) {
        setIsLoading(false);
        setErrorType('error');
      }
    }
  }

  function handleRetry() {
    isReadyRef.current = false;
    setErrorType(null);
    setIsLoading(true);
    // Incrementing retryKey forces: prefetch re-fetch (via effect dep) +
    // htmlSource rebuild + WebView full remount (via key prop).
    setRetryKey(k => k + 1);
  }

  return (
    <View style={styles.container}>
      {/* Só monta o WebView quando a lineart está pronta (ou quando é canvas livre
          sem imagem). Assim, imagem pendente/falha NUNCA vira canvas branco
          "pronto" silencioso — fica spinner (carregando) ou estado de erro. */}
      {(imageDataUrl != null || imageSource == null) && (
        <WebView
          key={retryKey}
          ref={webViewRef}
          source={htmlSource}
          originWhitelist={['*']}
          scrollEnabled={false}
          bounces={false}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          // [TK-A-012] iOS — o processo de conteúdo do WKWebView foi encerrado pelo sistema.
          onContentProcessDidTerminate={() => {
            recordWebViewProcessTermination('ios:onContentProcessDidTerminate');
          }}
          // [TK-A-013] Android — o processo de renderização morreu. `didCrash` distingue queda de
          // encerramento por pressão de recurso; é DADO do evento, não diagnóstico da causa.
          onRenderProcessGone={(evento) => {
            const didCrash = evento?.nativeEvent?.didCrash;
            recordWebViewProcessTermination('android:onRenderProcessGone', `didCrash=${didCrash === true}`);
          }}
        />
      )}

      {isLoading && !errorType && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FF8C42" />
          <Text style={styles.loadingText}>Carregando desenho...</Text>
        </View>
      )}

      {errorType && (
        <View style={styles.overlay}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>
            {errorType === 'timeout'
              ? 'A folha demorou para abrir'
              : 'Erro ao abrir o desenho'}
          </Text>
          <Text style={styles.errorSub}>
            {errorType === 'timeout'
              ? 'Pode ter sido lentidão na rede ou no dispositivo.'
              : 'Algo deu errado ao carregar a imagem.'}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>🔄 Tentar novamente</Text>
          </TouchableOpacity>
          {onGoBack && (
            <TouchableOpacity style={styles.goBackBtn} onPress={onGoBack} activeOpacity={0.8}>
              <Text style={styles.goBackBtnText}>← Voltar ao início</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

export default ColoringCanvas;

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#FFFDF8' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    paddingHorizontal: 32,
  },
  loadingText: { fontFamily: 'Nunito', fontSize: 14, color: '#8A7464', fontWeight: '700', marginTop: 12 },
  errorEmoji: { fontSize: 56, marginBottom: 12 },
  errorTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    color: '#444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSub: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  retryBtn: {
    backgroundColor: '#FF8C42',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  retryBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
  goBackBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  goBackBtnText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'underline',
  },
});
