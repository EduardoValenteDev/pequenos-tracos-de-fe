/**
 * AtelierCanvas — WebView canvas para desenho livre.
 *
 * Protocolo WebView → RN:
 *   READY                 Canvas pronto
 *   PAINTED               Primeira pincelada
 *   PLACED                Carimbo posicionado
 *   STAMP_SEL:{...}       Carimbo selecionado (id,emoji,label,size)
 *   STAMP_DESEL           Carimbo desselecionado
 *   STATE_EXPORT:{...}    stateJson + thumbnailBase64 + previewBase64
 *   STATE_AXES:{...}      Classificação dos eixos + espaço lógico em que a obra foi lida
 *   LOAD_CORRUPTED        JSON inválido ao carregar
 *   CANVAS_ERROR:{...}    Erro JS interno
 *
 * API via injectJavaScript:
 *   window.setTool('draw'|'eraser')
 *   window.setColor(hex)
 *   window.setBrushSize(n)
 *   window.setEraserSize(n)
 *   window.setBackground(hex)
 *   window.setPendingStamp(emoji, label)
 *   window.clearPending()
 *   window.resizeSelectedStamp(delta)  -- delta em px
 *   window.deleteSelectedStamp()
 *   window.commitGesture()
 *   window.undo()
 *   window.clearAll()
 *   window.exportState()
 *   window.loadState(jsonStr)
 */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

/* ─────────────────────────────────────────────────────────────────────────────
   [Fase 6 · F6-R3.5 · TK-A-001] OS QUATRO EIXOS DE VERSIONAMENTO no motor
   VETORIAL. Mesma separação normativa do motor raster (ver o bloco equivalente em
   `src/components/ColoringCanvas.js`), aplicada ao payload deste canvas:

     1. `APP_STORAGE_SCHEMA_VERSION` — "que chaves o AsyncStorage tem". Intocado.
     2. `POINTER_VERSION` / campo `v` do PONTEIRO — "onde está o blob". Congelado.
     3. `paintSchemaVersion` — "que campos o payload tem".
     4. `layoutVersion` — "o que as coordenadas significam" (aqui: `logicalW` e
        `logicalH`, além das coordenadas de `strokes` e `stamps`).

   ⚠️ `CANVAS_PAYLOAD_V` é o campo `v` INTERNO do `stateJson` e está CONGELADO EM 2
   PARA SEMPRE — marca legada, jamais discriminador de evolução. Nenhum eixo é
   inferido de outro: ausência de `paintSchemaVersion` significa payload legado,
   ausência de `layoutVersion` significa geometria legada, e as duas ausências são
   INDEPENDENTES. Portões `G-VER-1`..`G-VER-3` lacram estas regras.

   Os dois eixos são declarados aqui com valor próprio porque o payload vetorial
   evolui por conta própria: ele não herda nem empresta a versão do payload raster.
───────────────────────────────────────────────────────────────────────────── */
export const CANVAS_PAYLOAD_V = 2;
export const PAINT_SCHEMA_VERSION = 1;
export const LAYOUT_VERSION = 1;

/* ─── HTML do canvas ────────────────────────────────────────────── */
const CANVAS_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#FFFDF8}
#C{position:absolute;top:0;left:0;touch-action:none;display:block}
</style>
</head>
<body>
<canvas id="C"></canvas>
<script>
(function(){
'use strict';

/* Captura erros globais */
window.onerror=function(m,s,l){
  notify('CANVAS_ERROR:'+JSON.stringify({message:m,line:l}));
  return true;
};

/* Retry até ReactNativeWebView estar disponível */
function notify(msg){
  if(window.ReactNativeWebView){
    window.ReactNativeWebView.postMessage(String(msg));
  } else {
    setTimeout(function(){notify(msg);},50);
  }
}

var C=document.getElementById('C');
var ctx=C.getContext('2d');
/* TELA: a janela de AGORA, nesta orientação, neste tamanho de painel. Muda o tempo
   todo e NUNCA é persistida. */
var W=0,H=0;

/* ── [Fase 6 · F6-R3.5 · TK-A-034] ESPAÇO LÓGICO DA OBRA ───────────────────────────
   LÓGICO: o espaço em que a obra é MODELADA e ARMAZENADA. Não muda quando a janela
   muda. É a ÚNICA coordenada que pode ser persistida.

   Antes deste bloco, 'strokes' e 'stamps' guardavam PÍXEL DE TELA: 'resize()' redefinia
   W/H e o modelo continuava com os números da janela anterior. Girar o aparelho, abrir
   Split View ou arrastar o divisor deixava o traço da criança deslocado — e, na direção
   apertada, fora da tela. Era o 'F6-CVS-01'.

   Agora nenhum ponto do modelo carrega píxel de dispositivo: a tela é obtida por
   projeção 'contain' ('pS'/'pX'/'pY'), a mesma conta canônica de 'useViewportProjection'
   ('TK-A-030'/'TK-A-032') — 'scale = min(w/W, h/H)', um fator só, isotrópico, sobra
   centralizada nos dois eixos.

   ⚠️ Q8 regra 4: 'logicalW'/'logicalH' pertencem ao ESPAÇO LÓGICO HISTÓRICO da obra,
   nunca à viewport atual. Q8 regra 7: abrir não migra. Q8 regra 8: representação nova só
   no PRÓXIMO SAVE EXPLÍCITO da criança. Por isso 'espacoTravado' é uma trava de mão
   única: enquanto a folha está genuinamente em branco a janela pode ser adotada (folha
   vazia não tem geometria a preservar, e adotar evita moldura inútil); a partir do
   primeiro conteúdo ou do primeiro carregamento de obra o espaço lógico é IMUTÁVEL.
   Reatribuí-lo depois disso seria exatamente a corrupção que este bloco existe para
   impedir ('SD-8'). */
var LW=0,LH=0;
var pS=1,pX=0,pY=0;
var espacoTravado=false;
/* Cor da moldura = o mesmo papel do 'body'. A sobra é superfície, não obra. */
var FRAME_COLOR='#FFFDF8';

function adotarEspacoLogico(){
  if(W>0&&H>0){ LW=W; LH=H; }
}
function reprojetar(){
  if(!(LW>0&&LH>0&&W>0&&H>0)){ pS=1; pX=0; pY=0; return; }
  pS=Math.min(W/LW,H/LH);
  pX=(W-LW*pS)/2;
  pY=(H-LH*pS)/2;
}
/* Uma casa decimal: em janela menor que o espaço lógico (pS<1) o inteiro lógico já é
   mais fino que o píxel; em janela maior (pS>1) o inteiro seria grosso. Uma casa cobre
   os dois lados sem inchar o JSON da obra. */
function q(n){ return Math.round(n*10)/10; }

/* [Fase 6 · TK-A-001] Eixos de versionamento, injetados do módulo RN (fonte única
   no topo deste arquivo). CANVAS_PAYLOAD_V é o campo "v" congelado em 2. */
var CANVAS_PAYLOAD_V=${CANVAS_PAYLOAD_V};
var PAINT_SCHEMA_VERSION=${PAINT_SCHEMA_VERSION};
var LAYOUT_VERSION=${LAYOUT_VERSION};

/* [Fase 6 · TK-A-002] Classificação dos eixos POR NOME, sem inferência cruzada e
   sem consultar o envelope de armazenamento. 'legacy' = eixo AUSENTE (caminho de
   leitura de primeira classe, nunca defeito); 'ok' = false só quando o eixo está
   PRESENTE e mente sobre si mesmo. Os dois eixos são independentes. */
function axisOf(value){
  if(value===undefined||value===null) return {declared:null,legacy:true,ok:true};
  var n=(typeof value==='number')?value:NaN;
  var ok=(typeof value==='number')&&isFinite(n)&&n>0&&Math.floor(n)===n;
  return {declared:ok?n:value,legacy:false,ok:ok};
}
function classifyAxes(d){
  var obj=(d&&typeof d==='object')?d:{};
  return {paint:axisOf(obj.paintSchemaVersion),layout:axisOf(obj.layoutVersion)};
}

/* Estado principal */
var bgColor='#FFFDF8';
var strokes=[];  /* [{id,color,size,eraser,points:[{x,y}]}] */
var stamps=[];   /* [{id,emoji,label,x,y,size}] (legado: renderiza artes antigas; sem UI nova) */
/* C1 — historico por OPERACAO (nao bitmap, nao por-ponto): pilhas past/future de estados
   leves (JSON dos tracos). rev e o contador de mutacao — o RN deriva isDirty comparando
   com lastSavedRevision. Limite alto e seguro. */
var past=[], future=[];
var rev=0;
var HIST_LIMIT=150;

/* Ferramenta */
var tool='draw';
var curColor='#F44336';
var brushSz=10;
var eraserSz=32;

/* Estado de interação */
var drawing=false;
var curStroke=null;
var dragging=false;
var selId=null;
var dragStartX=0,dragStartY=0,dragOrigX=0,dragOrigY=0;
var pendingStamp=null; /* {emoji,label} */

function genId(){return 'i'+Date.now()+'_'+(Math.random()*9999|0);}

function snap(){
  return {
    strokes:JSON.parse(JSON.stringify(strokes)),
    stamps:JSON.parse(JSON.stringify(stamps)),
    bgColor:bgColor
  };
}
function restore(s){ strokes=s.strokes; stamps=s.stamps; bgColor=s.bgColor; }
function isEmptyState(){ return strokes.length===0 && stamps.length===0; }
/* Chamar ANTES de uma ação que muda o conteúdo: empilha o estado atual e limpa o futuro
   (um novo traço depois de Desfazer descarta o Refazer). */
function commit(){
  /* [TK-A-034] Trava de mão única do espaço lógico. 'commit' antecede TODA mutação de
     conteúdo (traço, carimbo, fundo, apagar tudo), então é o ponto exato em que a folha
     deixa de estar em branco. Daqui em diante 'resize' não pode mais redefinir LW/LH. */
  espacoTravado=true;
  try{
    past.push(snap());
    if(past.length>HIST_LIMIT) past.shift();
    future=[];
  }catch(e){}
}
/* Chamar DEPOIS de uma mutação de conteúdo: avança a revisão e avisa o RN. */
function bump(){ rev++; notifyHist(); }
function notifyHist(){
  notify('HIST:'+JSON.stringify({
    canUndo:past.length>0, canRedo:future.length>0,
    empty:isEmptyState(), rev:rev, strokes:strokes.length
  }));
}

/* ── Renderização ────────────────────────────────────────────────────────────────
   [Fase 6 · TK-A-034] 'paintInto' desenha O MODELO em QUALQUER destino, com a projeção
   passada por parâmetro. A tela usa a projeção da janela de agora; a exportação usa a
   identidade no espaço lógico. Um caminho de desenho só: a imagem salva não pode
   divergir da imagem vista porque as duas nascem do mesmo código sobre os mesmos dados.

   [TK-A-033] A MOLDURA (letterbox) é INERTE: 'clip' ao retângulo lógico garante que
   nenhum píxel de traço a alcance, seja qual for a coordenada — a garantia é do
   recorte, não da aritmética do toque. */
function paintInto(g,sc,ox,oy,comSel,comMoldura){
  g.setTransform(1,0,0,1,0,0);
  g.clearRect(0,0,g.canvas.width,g.canvas.height);
  if(comMoldura){
    /* Faixa de sobra: fundo do papel, sem obra. Não é área pintável. */
    g.fillStyle=FRAME_COLOR;
    g.fillRect(0,0,g.canvas.width,g.canvas.height);
  }
  g.save();
  g.beginPath();
  g.rect(ox,oy,LW*sc,LH*sc);
  g.clip();
  g.setTransform(sc,0,0,sc,ox,oy);
  g.fillStyle=bgColor;
  g.fillRect(0,0,LW,LH);
  for(var i=0;i<strokes.length;i++) drawStroke(g,strokes[i]);
  for(var j=0;j<stamps.length;j++) drawStamp(g,stamps[j],comSel&&stamps[j].id===selId);
  if(curStroke) drawStroke(g,curStroke);
  g.restore();
  g.setTransform(1,0,0,1,0,0);
}

function render(){ paintInto(ctx,pS,pX,pY,true,true); }

function drawStroke(ctx,s){
  if(!s||!s.points||s.points.length===0) return;
  ctx.save();
  ctx.globalCompositeOperation=s.eraser?'destination-out':'source-over';
  ctx.strokeStyle=s.eraser?'rgba(0,0,0,1)':s.color;
  ctx.fillStyle=s.eraser?'rgba(0,0,0,1)':s.color;
  ctx.lineWidth=s.size;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  if(s.points.length===1){
    ctx.beginPath();
    ctx.arc(s.points[0].x,s.points[0].y,s.size/2,0,Math.PI*2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(s.points[0].x,s.points[0].y);
    for(var i=1;i<s.points.length;i++) ctx.lineTo(s.points[i].x,s.points[i].y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStamp(ctx,s,sel){
  ctx.save();
  ctx.globalCompositeOperation='source-over';
  ctx.font=s.size+'px serif';
  ctx.textAlign='left';
  ctx.textBaseline='alphabetic';
  var m=ctx.measureText(s.emoji);
  var drawX,drawY;
  if(typeof m.actualBoundingBoxLeft==='number'&&m.actualBoundingBoxAscent>0){
    /* Use actual glyph bounding box so the VISUAL centre of the emoji lands
       exactly on (s.x, s.y).  This fixes the rightward drift caused by
       variation-selector characters (U+FE0F) inflating measureText.width for
       emoji like ❤️ and 🕊️, and the vertical offset from iOS serif metrics. */
    drawX=s.x-(m.actualBoundingBoxRight-m.actualBoundingBoxLeft)/2;
    drawY=s.y+(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2;
  }else{
    /* Fallback for environments without TextMetrics level-2 support. */
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    drawX=s.x;
    drawY=s.y;
  }
  ctx.fillText(s.emoji,drawX,drawY);
  if(sel){
    ctx.strokeStyle='#F4B23C';
    ctx.lineWidth=3;
    ctx.setLineDash([6,4]);
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size/2+10,0,Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function hitTest(s,px,py){
  var dx=px-s.x,dy=py-s.y,r=s.size/2+14;
  return dx*dx+dy*dy<=r*r;
}

function findStampAt(px,py){
  for(var i=stamps.length-1;i>=0;i--){
    if(hitTest(stamps[i],px,py)) return stamps[i];
  }
  return null;
}

function doSelect(id){
  selId=id;
  if(id){
    for(var i=0;i<stamps.length;i++){
      if(stamps[i].id===id){
        var s=stamps[i];
        notify('STAMP_SEL:'+JSON.stringify({id:s.id,emoji:s.emoji,label:s.label,size:s.size}));
        break;
      }
    }
  } else {
    notify('STAMP_DESEL');
  }
  render();
}

/* ── [Fase 6 · TK-A-033/TK-A-034] TOQUE: TELA → LÓGICO ───────────────────────────────
   O toque nasce em píxel de tela e é registrado em coordenada LÓGICA, na mesma volta —
   nenhum ponto de dispositivo entra no modelo.

   POLÍTICA DA MOLDURA, determinística e a MESMA que o motor raster deve seguir ('C-A9'):
     · gesto que COMEÇA na moldura é IGNORADO — ali não há papel, e um traço que aparece
       fora da folha ensina à criança uma borda que não existe;
     · gesto que começa DENTRO e passa por cima da moldura é FIXADO À BORDA LÓGICA — o
       traço em andamento não pode ser perdido no meio por causa de onde o dedo passou.
   'dentro' carrega a distinção; quem chama decide qual das duas regras aplicar. */
function getP(t){
  var r=C.getBoundingClientRect();
  return{x:t.clientX-r.left,y:t.clientY-r.top};
}
function getL(t){
  var p=getP(t);
  if(!(pS>0)) return {x:0,y:0,dentro:false};
  var x=(p.x-pX)/pS, y=(p.y-pY)/pS;
  return {
    x:q(Math.max(0,Math.min(LW,x))),
    y:q(Math.max(0,Math.min(LH,y))),
    dentro:(x>=0&&x<=LW&&y>=0&&y<=LH),
  };
}

/* ── [Fase 6 · F6-R3.5 · TK-A-016] FECHAMENTO ATÔMICO DO GESTO ───────────────────────
   Chamado ANTES de qualquer reprojeção (mudança de viewport) e ao ir para segundo
   plano. O gesto em voo é comitado NO MODELO — inteiro ou não comitado — e só então a
   geometria muda. Sem isto, o traço em andamento teria os primeiros pontos numa
   projeção e os últimos noutra: uma única linha da criança partida ao meio, com um
   degrau no lugar da curva. Devolve 'true' quando havia gesto a fechar. */
function finalizarGestoAtomico(){
  var fechou=false;
  if(dragging){
    dragging=false;
    fechou=true;
  }
  if(drawing&&curStroke){
    var tinha=curStroke.points.length>0;
    if(tinha){
      commit();
      strokes.push(curStroke);
      notify('PAINTED');
    }
    curStroke=null;
    drawing=false;
    if(tinha){ fechou=true; bump(); }
  }
  return fechou;
}

/* ── Eventos de toque ── */
C.addEventListener('touchstart',function(e){
  e.preventDefault();
  if(e.touches.length!==1) return;
  var p=getL(e.touches[0]);
  /* [TK-A-033] Gesto que NASCE na moldura não existe: ali não há papel. */
  if(!p.dentro) return;

  /* 1. Colocar carimbo pendente (legado: só se o RN pedir; a UI nova não pede) */
  if(pendingStamp){
    commit();
    var ns={id:genId(),emoji:pendingStamp.emoji,label:pendingStamp.label||'',x:p.x,y:p.y,size:72};
    stamps.push(ns);
    pendingStamp=null;
    doSelect(ns.id);
    notify('PAINTED');
    notify('PLACED');
    bump();
    return;
  }

  /* 2. Tocar em carimbo existente → selecionar + arrastar */
  var hit=findStampAt(p.x,p.y);
  if(hit){
    doSelect(hit.id);
    dragging=true;
    dragStartX=p.x; dragStartY=p.y;
    dragOrigX=hit.x; dragOrigY=hit.y;
    return;
  }

  /* 3. Tocar em área vazia com carimbo selecionado → desselecionar */
  if(selId){
    doSelect(null);
    return;
  }

  /* 4. Desenhar ou apagar */
  drawing=true;
  curStroke={
    id:genId(),
    color:curColor,
    size:tool==='eraser'?eraserSz:brushSz,
    eraser:tool==='eraser',
    points:[{x:p.x,y:p.y}]
  };
  render();
},{passive:false});

C.addEventListener('touchmove',function(e){
  e.preventDefault();
  if(e.touches.length!==1) return;
  /* [TK-A-033] Gesto JÁ EM ANDAMENTO: a moldura não interrompe — o ponto é fixado à
     borda lógica ('getL' já clampa) e o traço continua. */
  var p=getL(e.touches[0]);

  if(dragging&&selId){
    for(var i=0;i<stamps.length;i++){
      if(stamps[i].id===selId){
        var s=stamps[i];
        /* Limites do CARIMBO no espaço LÓGICO da obra — nunca na janela de agora. */
        s.x=q(Math.max(s.size/2,Math.min(LW-s.size/2,dragOrigX+(p.x-dragStartX))));
        s.y=q(Math.max(s.size/2,Math.min(LH-s.size/2,dragOrigY+(p.y-dragStartY))));
        break;
      }
    }
    render();
    return;
  }

  if(drawing&&curStroke){
    var last=curStroke.points[curStroke.points.length-1];
    var dx=p.x-last.x,dy=p.y-last.y;
    if(dx*dx+dy*dy<4) return;
    curStroke.points.push({x:p.x,y:p.y});
    render();
  }
},{passive:false});

C.addEventListener('touchend',function(e){
  e.preventDefault();
  if(dragging){
    /* Notifica posição final do carimbo */
    for(var i=0;i<stamps.length;i++){
      if(stamps[i].id===selId){
        var s=stamps[i];
        notify('STAMP_SEL:'+JSON.stringify({id:s.id,emoji:s.emoji,label:s.label,size:s.size}));
        break;
      }
    }
    dragging=false;
    return;
  }
  /* [TK-A-016] O dedo levantado e a mudança de viewport fecham o gesto pelo MESMO
     caminho. Dois caminhos de fechamento divergiriam com o tempo, e a divergência
     apareceria justamente no caso raro — o gesto interrompido por uma rotação. */
  if(finalizarGestoAtomico()) render();
},{passive:false});

/* ── API exposta ao React Native ── */
/* C1.1 — setColor NÃO força mais tool='draw' (isso silenciosamente revertia a borracha).
   Quem manda na ferramenta é o RN, via setTool/applyTool. Fonte única, injeção ATÔMICA. */
window.setTool=function(t){ if(t==='draw'||t==='eraser') tool=t; };
window.setColor=function(c){ if(typeof c==='string') curColor=c; };
window.setBrushSize=function(sz){ var n=Number(sz); if(n>0) brushSz=n; };
window.setEraserSize=function(sz){ var n=Number(sz); if(n>0) eraserSz=n; };
/* Config ATÔMICA (C1.1 §4): ferramenta + cor + tamanhos numa injeção só — a WebView nunca
   fica num estado intermediário entre ferramenta e tamanho. */
window.applyTool=function(cfg){
  if(!cfg||typeof cfg!=='object') return;
  if(cfg.tool==='draw'||cfg.tool==='eraser') tool=cfg.tool;
  if(typeof cfg.color==='string') curColor=cfg.color;
  var b=Number(cfg.brush); if(b>0) brushSz=b;
  var e=Number(cfg.eraser); if(e>0) eraserSz=e;
};
window.setBackground=function(c){
  commit(); bgColor=c; notify('PAINTED'); render(); bump();
};
window.setPendingStamp=function(emoji,label){
  pendingStamp={emoji:emoji,label:label||''};
  selId=null; notify('STAMP_DESEL'); render();
};
window.clearPending=function(){ pendingStamp=null; };
window.resizeSelectedStamp=function(delta){
  if(!selId) return;
  for(var i=0;i<stamps.length;i++){
    if(stamps[i].id===selId){
      stamps[i].size=Math.max(32,Math.min(160,stamps[i].size+delta));
      notify('STAMP_SEL:'+JSON.stringify({id:stamps[i].id,emoji:stamps[i].emoji,label:stamps[i].label,size:stamps[i].size}));
      render();
      break;
    }
  }
};
window.deleteSelectedStamp=function(){
  if(!selId) return;
  commit();
  stamps=stamps.filter(function(s){return s.id!==selId;});
  selId=null; notify('STAMP_DESEL'); render(); bump();
};
window.undo=function(){
  if(past.length===0) return;
  future.push(snap());
  restore(past.pop());
  selId=null; notify('STAMP_DESEL'); render(); bump();
};
window.redo=function(){
  if(future.length===0) return;
  past.push(snap());
  restore(future.pop());
  selId=null; notify('STAMP_DESEL'); render(); bump();
};
window.clearAll=function(){
  commit();
  strokes=[]; stamps=[]; bgColor='#FFFDF8';
  selId=null; pendingStamp=null;
  notify('STAMP_DESEL'); render(); notify('CLEARED'); bump();
};
window.isEmpty=function(){ return isEmptyState(); };
/* [Fase 6 · TK-A-016] Fecha o gesto em voo por ordem do RN — usado quando a superfície
   vai para segundo plano. NÃO grava, NÃO exporta e NÃO descarta: só transforma "traço
   em andamento" em "traço no modelo". Um gesto em voo quando o processo de conteúdo é
   encerrado seria pixel infantil perdido; comitá-lo no modelo é o que o torna
   recuperável. Idempotente: sem gesto em voo, não faz nada. */
window.commitGesture=function(){
  if(finalizarGestoAtomico()) render();
};
/* Diagnóstico do Modo Criador (§20). Puro relatório; não muda estado. */
window.getStats=function(){
  notify('STATS:'+JSON.stringify({
    W:W,H:H,
    /* [TK-A-034] O diagnóstico distingue os DOIS espaços por nome. Ver 'W:H' sozinho
       não diz se a obra está no lugar certo; ver 'LW:LH' com a projeção, sim. */
    LW:LW,LH:LH,espacoTravado:espacoTravado,
    scale:pS,offX:pX,offY:pY,
    strokes:strokes.length,stamps:stamps.length,
    past:past.length,future:future.length,rev:rev,
    tool:tool,color:curColor,brush:brushSz,eraser:eraserSz,empty:isEmptyState()
  }));
};
window.exportState=function(){
  try{
    var prevSel=selId; selId=null; render();
    /* A borracha apaga com destination-out: os pixels ficam TRANSPARENTES no
       canvas vivo (e ali aparecem como o fundo). Mas JPEG NÃO tem canal alfa —
       pixels transparentes viram PRETOS no arquivo salvo (o "borrao preto").
       Antes de exportar, achatamos o canvas contra o fundo: um canvas opaco
       preenchido com bgColor + C desenhado por cima. Assim a area apagada
       exporta como o fundo, nunca como preto. O render ao vivo e os strokes
       (stateJson) ficam intactos. */
    /* [Fase 6 · TK-A-034] A imagem sai no ESPAÇO LÓGICO, redesenhada do MODELO em 1:1 —
       nunca reamostrada do buffer de tela. Reamostrar da tela gravaria a moldura desta
       janela dentro da obra e traria a perda de resolução da projeção de agora; a obra
       salva ficaria refém da orientação em que a criança apertou "salvar". */
    var fw=Math.max(1,Math.round(LW)), fh=Math.max(1,Math.round(LH));
    var art=document.createElement('canvas');
    art.width=fw; art.height=fh;
    paintInto(art.getContext('2d'),1,0,0,false,false);
    var flat=document.createElement('canvas');
    flat.width=fw; flat.height=fh;
    var fctx=flat.getContext('2d');
    fctx.fillStyle=bgColor; fctx.fillRect(0,0,fw,fh);
    fctx.drawImage(art,0,0);
    var tw=300,th=Math.round(300*fh/fw)||300;
    var tb=document.createElement('canvas');
    tb.width=tw; tb.height=th;
    tb.getContext('2d').drawImage(flat,0,0,tw,th);
    var thumbData=tb.toDataURL('image/jpeg',0.6);
    var previewData=flat.toDataURL('image/jpeg',0.85);
    /* [Fase 6 · TK-A-003] Os dois eixos novos são EMITIDOS POR NOME e o campo "v"
       permanece CANVAS_PAYLOAD_V (2) — nunca 3 (ver TK-A-001). Adição estritamente
       aditiva: todos os campos que já existiam continuam presentes e um leitor
       antigo ignora os campos novos sem quebrar. */
    /* [Fase 6 · TK-A-034 · G-CVS-2] 'logicalW'/'logicalH' são DECLARADOS: sem eles, a
       obra guardaria coordenadas cujo significado ninguém conhece, e a próxima abertura
       teria de ADIVINHAR o espaço. É a declaração — e não a janela de quem abre — que
       define onde o traço está. Q8 regra 8: isto só é gravado no SAVE EXPLÍCITO da
       criança; abrir uma obra antiga jamais chega aqui. */
    var st=JSON.stringify({v:CANVAS_PAYLOAD_V,
      paintSchemaVersion:PAINT_SCHEMA_VERSION,layoutVersion:LAYOUT_VERSION,
      logicalW:LW,logicalH:LH,
      strokes:strokes,stamps:stamps,bgColor:bgColor});
    notify('STATE_EXPORT:'+JSON.stringify({stateJson:st,thumbnailBase64:thumbData,previewBase64:previewData}));
    selId=prevSel;
  }catch(err){
    notify('CANVAS_ERROR:'+JSON.stringify({message:'export:'+err.message}));
  }
};
/* Zera o histórico e a revisão — o estado recém-carregado é a base "salva". */
function resetHist(){ past=[]; future=[]; rev=0; }

/* Folha nova/vazia: sem obra não há geometria histórica a respeitar. A janela é adotada
   e a trava volta a ficar aberta, para que girar ANTES do primeiro traço dê à criança a
   folha inteira em vez de uma moldura sem motivo. */
function abrirEmBranco(){
  espacoTravado=false;
  adotarEspacoLogico();
  reprojetar();
}

/* ── [Fase 6 · TK-A-034 · Q8 regras 2, 4, 6, 7, 8] ESPAÇO LÓGICO AO ABRIR ────────────
   Abrir é ESTRITAMENTE SOMENTE LEITURA. Esta função escolhe COMO INTERPRETAR os números
   que já estão gravados; ela não regrava, não migra, não converte e não descarta nada.

   1. Obra que DECLARA 'logicalW'/'logicalH': a declaração manda. Ela pertence ao espaço
      lógico HISTÓRICO da obra e não à janela de quem está abrindo (Q8 regra 4). Uma obra
      feita em retrato aberta em paisagem aparece INTEIRA, com moldura — nunca esticada,
      nunca cortada.
   2. Obra LEGADA, sem declaração: o 'stateJson' antigo não guardava o espaço. A
      reconstrução determinística possível a partir da evidência real é a janela ATUAL —
      que é exatamente como esses números sempre foram interpretados até aqui. Abrir uma
      obra legada na mesma orientação em que foi feita continua idêntico ao que já era;
      girar depois passa a REPROJETAR em vez de deslocar. Nenhum byte antigo muda: a
      representação nova só nasce no próximo save explícito da criança (Q8 regra 8).

   Incompatibilidade dimensional NUNCA autoriza destruição (Q8 regra 3): não há caminho
   nesta função que esvazie 'strokes'/'stamps' nem que devolva folha em branco. */
function estabelecerEspacoLogico(d){
  var lw=Number(d&&d.logicalW), lh=Number(d&&d.logicalH);
  var declarado=isFinite(lw)&&lw>0&&isFinite(lh)&&lh>0;
  if(declarado){ LW=lw; LH=lh; }
  else { adotarEspacoLogico(); }
  espacoTravado=true;
  reprojetar();
  return declarado;
}
window.loadState=function(jsonStr){
  try{
    if(!jsonStr||typeof jsonStr!=='string'){
      strokes=[]; stamps=[]; bgColor='#FFFDF8'; selId=null; resetHist(); abrirEmBranco(); render();
      notifyHist(); notify('STATE_LOADED'); return;
    }
    var d=JSON.parse(jsonStr);
    if(!d||typeof d!=='object'){
      strokes=[]; stamps=[]; bgColor='#FFFDF8'; selId=null; resetHist(); abrirEmBranco(); render();
      notifyHist(); notify('STATE_LOADED'); return;
    }
    /* [Fase 6 · TK-A-002] A representação é identificada PELO NOME DO EIXO, ANTES
       dos ramos legados — e os dois ramos legados abaixo (d.v===2 e d.ops)
       continuam INTACTOS, porque a ausência de eixo é caminho de leitura de
       primeira classe. O ramo novo NÃO depende de "v": um payload que declara
       'paintSchemaVersion' é lido pelo conjunto de campos que ele declara ter, e
       não pela marca legada. Isso fecha um caminho real de perda — hoje um
       payload sem 'v' cairia no 'else' final e voltaria como folha em branco. */
    var axes=classifyAxes(d);
    if(!axes.paint.legacy){
      strokes=Array.isArray(d.strokes)?d.strokes:[];
      stamps=Array.isArray(d.stamps)?d.stamps:[];
      bgColor=typeof d.bgColor==='string'?d.bgColor:'#FFFDF8';
    } else if(d.v===2){
      strokes=Array.isArray(d.strokes)?d.strokes:[];
      stamps=Array.isArray(d.stamps)?d.stamps:[];
      bgColor=typeof d.bgColor==='string'?d.bgColor:'#FFFDF8';
    } else if(Array.isArray(d.ops)){
      /* Migra formato antigo: só traz strokes, ignora shapes/stamps velhos */
      strokes=d.ops.filter(function(op){return op&&op.type==='stroke';});
      stamps=[];
      bgColor=typeof d.bgColor==='string'?d.bgColor:'#FFFDF8';
    } else {
      strokes=[]; stamps=[]; bgColor='#FFFDF8';
    }
    /* Sinal ADITIVO e observável da classificação por eixo (TK-A-002/TK-A-004):
       'paint.legacy' diz que campos esperar, 'layout.legacy' diz como ler as
       coordenadas, e nenhum decide o outro. Informativo — por Q8 regra 3 nenhum
       veredito de eixo autoriza apagar, regravar ou substituir a obra. */
    /* [TK-A-034] O espaço lógico é estabelecido DEPOIS de os campos entrarem e ANTES do
       primeiro 'render' — a obra nunca chega a ser desenhada numa geometria provisória. */
    var declarouEspaco=estabelecerEspacoLogico(d);
    /* Sinal ADITIVO e observável da classificação por eixo (TK-A-002/TK-A-004):
       'paint.legacy' diz que campos esperar, 'layout.legacy' diz como ler as
       coordenadas, e nenhum decide o outro. Informativo — por Q8 regra 3 nenhum
       veredito de eixo autoriza apagar, regravar ou substituir a obra. */
    notify('STATE_AXES:'+JSON.stringify({
      paint:{declared:axes.paint.declared,legacy:axes.paint.legacy,ok:axes.paint.ok},
      layout:{declared:axes.layout.declared,legacy:axes.layout.legacy,ok:axes.layout.ok},
      /* [TK-A-034] Terceira informação, também informativa: em QUE espaço a obra acabou
         de ser interpretada, e se esse espaço veio DECLARADO ou foi reconstruído. */
      logical:{w:LW,h:LH,declared:declarouEspaco}
    }));
    selId=null; resetHist(); render();
    notifyHist(); notify('STATE_LOADED');
  }catch(err){
    strokes=[]; stamps=[]; bgColor='#FFFDF8'; selId=null; resetHist();
    abrirEmBranco();
    render();
    notifyHist(); notify('LOAD_CORRUPTED');
  }
};

/* ── [Fase 6 · TK-A-034/TK-A-016/G-CVS-1] RESIZE ─────────────────────────────────────
   'resize' mede a JANELA e reprojeta. Ele NÃO redefine mais o espaço lógico de uma obra
   que já existe — essa reatribuição era o defeito. O que ele faz, em ordem:

     1. fecha o gesto em voo de forma ATÔMICA ('TK-A-016'), para que uma única linha da
        criança não fique metade numa projeção e metade noutra;
     2. mede W/H e redimensiona o buffer de TELA — que é buffer de exibição, e o único
        que pode ser realocado aqui (o análogo raster de 'qBuf'/'visBuf'/'paintD' é
        modelo, e 'G-CVS-1' proíbe realocá-lo);
     3. adota a janela como espaço lógico SOMENTE com a trava aberta (folha em branco);
     4. reprojeta a partir do MODELO — nunca a partir do buffer de tela anterior. */
function resize(){
  finalizarGestoAtomico();   /* já avisa o RN por 'bump' quando houve o que fechar */
  W=window.innerWidth|0; H=window.innerHeight|0;
  C.width=W; C.height=H;
  if(!espacoTravado||!(LW>0&&LH>0)) adotarEspacoLogico();
  reprojetar();
  render();
}
window.addEventListener('resize',resize);
resize();
notifyHist();
notify('READY');

})();
</script>
</body>
</html>`;

/* ─── [F6-R3.4 · TK-A-012..TK-A-014] Término do processo de conteúdo da WebView ───
   ⚠️ GUARDRAIL `FD-12`: este registro descreve **o evento**, nunca a causa. Ele NÃO
   prova, NÃO confirma e NÃO refuta `P-164`, e não autoriza rotular nada como
   resolvido. É instrumento de captura para a campanha física; a leitura é humana.

   OBSERVABILIDADE PURA: o handler não recarrega, não remonta, não limpa e não grava
   — recarregar aqui destruiria a composição que o evento ameaça (`SD-8`).

   O registro sai por `console.warn`, o idioma que este arquivo já usa para anomalia
   de WebView (`onError`, erro de JS, READY ausente): sobrevive fora de
   desenvolvimento, e a validação física pode rodar num build de pré-visualização.
   O contador é de módulo — uma remontagem depois do término não pode zerá-lo.
   O motor do Colorir mantém o seu próprio contador, com a sua própria etiqueta:
   são duas superfícies distintas e misturar as contagens esconderia qual caiu. */
let webViewProcessTerminations = 0;

function recordWebViewProcessTermination(origem, detalhe) {
  webViewProcessTerminations += 1;
  const quando = new Date().toISOString();
  console.warn(
    '[AtelierCanvas] PROCESSO DE CONTEUDO DA WEBVIEW TERMINOU'
    + ` · origem=${origem} · ocorrencia=#${webViewProcessTerminations} · quando=${quando}`
    + (detalhe ? ` · ${detalhe}` : '')
    + ' · EVENTO OBSERVADO, CAUSA NAO DETERMINADA',
  );
}

/* ─── Componente React Native ─────────────────────────────────── */
const AtelierCanvas = forwardRef(function AtelierCanvas(
  { onReady, onPainted, onPlaced, onStampSelected, onStampDeselected, onLoadCorrupted, onHist },
  ref,
) {
  const webViewRef        = useRef(null);
  const isReadyRef        = useRef(false);
  const pendingLoadRef    = useRef(null);
  const pendingExportRef  = useRef(null);
  const pendingStatsRef   = useRef(null);
  const timeoutRef        = useRef(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const [loadState, setLoadState]   = useState('loading');

  /* Timeout de segurança: 7 s sem READY → erro */
  useEffect(() => {
    isReadyRef.current = false;
    setLoadState('loading');
    timeoutRef.current = setTimeout(() => {
      if (!isReadyRef.current) {
        console.warn('[AtelierCanvas] READY não recebido em 7s — mostrando erro');
        setLoadState('error');
      }
    }, 7000);
    return () => clearTimeout(timeoutRef.current);
  }, [webViewKey]);

  useImperativeHandle(ref, () => ({
    setTool(t)        { inject(`window.setTool(${JSON.stringify(t)});true;`); },
    setColor(hex)     { inject(`window.setColor(${JSON.stringify(hex)});true;`); },
    setBrushSize(sz)  { inject(`window.setBrushSize(${Number(sz)});true;`); },
    setEraserSize(sz) { inject(`window.setEraserSize(${Number(sz)});true;`); },
    applyTool(cfg)    { inject(`window.applyTool(${JSON.stringify(cfg || {})});true;`); },
    setBackground(hex){ inject(`window.setBackground(${JSON.stringify(hex)});true;`); },
    setPendingStamp(emoji, label) {
      inject(`window.setPendingStamp(${JSON.stringify(emoji)},${JSON.stringify(label||'')});true;`);
    },
    clearPending()    { inject('window.clearPending();true;'); },
    resizeSelectedStamp(delta) { inject(`window.resizeSelectedStamp(${Number(delta)});true;`); },
    deleteSelectedStamp()      { inject('window.deleteSelectedStamp();true;'); },
    /* [Fase 6 · TK-A-016] Fechamento atômico do gesto por ordem da tela (ida para
       segundo plano). Não grava e não exporta — ver `window.commitGesture`. */
    commitGesture()   { inject('window.commitGesture();true;'); },
    undo()            { inject('window.undo();true;'); },
    redo()            { inject('window.redo();true;'); },
    clearAll()        { inject('window.clearAll();true;'); },
    getStats(cb) {
      pendingStatsRef.current = cb;
      inject('window.getStats();true;');
    },
    exportState(cb) {
      pendingExportRef.current = cb;
      inject('window.exportState();true;');
    },
    loadState(jsonStr) {
      const js = `window.loadState(${JSON.stringify(jsonStr)});true;`;
      if (isReadyRef.current) inject(js);
      else pendingLoadRef.current = js;
    },
  }));

  function inject(js) {
    webViewRef.current?.injectJavaScript(js);
  }

  function handleMessage(e) {
    const msg = e.nativeEvent.data;
    if (msg === 'READY') {
      clearTimeout(timeoutRef.current);
      isReadyRef.current = true;
      setLoadState('ready');
      onReady?.();
      if (pendingLoadRef.current) {
        inject(pendingLoadRef.current);
        pendingLoadRef.current = null;
      }
    } else if (msg === 'PAINTED') {
      onPainted?.();
    } else if (msg === 'PLACED') {
      onPlaced?.();
    } else if (msg === 'STAMP_DESEL') {
      onStampDeselected?.();
    } else if (msg.startsWith('STAMP_SEL:')) {
      try {
        const info = JSON.parse(msg.slice('STAMP_SEL:'.length));
        onStampSelected?.(info);
      } catch {}
    } else if (msg.startsWith('STATE_EXPORT:')) {
      try {
        const payload = JSON.parse(msg.slice('STATE_EXPORT:'.length));
        pendingExportRef.current?.(payload);
        pendingExportRef.current = null;
      } catch (err) {
        console.warn('[AtelierCanvas] STATE_EXPORT parse error:', err);
      }
    } else if (msg.startsWith('HIST:')) {
      try { onHist?.(JSON.parse(msg.slice('HIST:'.length))); } catch {}
    } else if (msg.startsWith('STATS:')) {
      try {
        pendingStatsRef.current?.(JSON.parse(msg.slice('STATS:'.length)));
        pendingStatsRef.current = null;
      } catch {}
    } else if (msg === 'LOAD_CORRUPTED') {
      onLoadCorrupted?.();
    } else if (msg.startsWith('CANVAS_ERROR:')) {
      console.warn('[AtelierCanvas] Erro JS:', msg);
    }
  }

  function handleRetry() {
    pendingLoadRef.current = null;
    pendingExportRef.current = null;
    setWebViewKey(k => k + 1);
  }

  return (
    <View style={styles.container}>
      <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{ html: CANVAS_HTML }}
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
        onError={() => {
          console.warn('[AtelierCanvas] WebView onError');
          setLoadState('error');
        }}
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

      {loadState === 'loading' && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#F4B23C" />
          <Text style={styles.overlayText}>Preparando a folha...</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>A folha não abriu.</Text>
          <Text style={styles.errorSub}>Toque para tentar novamente.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

export default AtelierCanvas;

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview:   { flex: 1, backgroundColor: '#FFFDF8' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  overlayText: { fontFamily: 'Nunito', fontSize: 15, color: '#8A7464', marginTop: 6 },
  errorEmoji: { fontSize: 52 },
  errorTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: '#3A2A1E', textAlign: 'center' },
  errorSub:   { fontFamily: 'Nunito', fontSize: 13, color: '#8A7464', textAlign: 'center' },
  retryBtn: {
    marginTop: 10, backgroundColor: '#F4B23C',
    paddingVertical: 13, paddingHorizontal: 30, borderRadius: 22,
    elevation: 4,
  },
  retryBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
});
