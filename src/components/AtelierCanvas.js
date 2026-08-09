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
var W=0,H=0;

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

/* ── Renderização ── */
function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=bgColor;
  ctx.fillRect(0,0,W,H);
  for(var i=0;i<strokes.length;i++) drawStroke(strokes[i]);
  for(var j=0;j<stamps.length;j++) drawStamp(stamps[j],stamps[j].id===selId);
  if(curStroke) drawStroke(curStroke);
}

function drawStroke(s){
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

function drawStamp(s,sel){
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

function getP(t){
  var r=C.getBoundingClientRect();
  return{x:(t.clientX-r.left)|0,y:(t.clientY-r.top)|0};
}

/* ── Eventos de toque ── */
C.addEventListener('touchstart',function(e){
  e.preventDefault();
  if(e.touches.length!==1) return;
  var p=getP(e.touches[0]);

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
  var p=getP(e.touches[0]);

  if(dragging&&selId){
    for(var i=0;i<stamps.length;i++){
      if(stamps[i].id===selId){
        var s=stamps[i];
        s.x=Math.max(s.size/2,Math.min(W-s.size/2,dragOrigX+(p.x-dragStartX)));
        s.y=Math.max(s.size/2,Math.min(H-s.size/2,dragOrigY+(p.y-dragStartY)));
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
  if(drawing&&curStroke){
    commit();
    strokes.push(curStroke);
    curStroke=null;
    drawing=false;
    notify('PAINTED');
    render();
    bump();
  }
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
/* Diagnóstico do Modo Criador (§20). Puro relatório; não muda estado. */
window.getStats=function(){
  notify('STATS:'+JSON.stringify({
    W:W,H:H,strokes:strokes.length,stamps:stamps.length,
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
    var flat=document.createElement('canvas');
    flat.width=W; flat.height=H;
    var fctx=flat.getContext('2d');
    fctx.fillStyle=bgColor; fctx.fillRect(0,0,W,H);
    fctx.drawImage(C,0,0);
    var tw=300,th=Math.round(300*H/W)||300;
    var tb=document.createElement('canvas');
    tb.width=tw; tb.height=th;
    tb.getContext('2d').drawImage(flat,0,0,tw,th);
    var thumbData=tb.toDataURL('image/jpeg',0.6);
    var previewData=flat.toDataURL('image/jpeg',0.85);
    /* [Fase 6 · TK-A-003] Os dois eixos novos são EMITIDOS POR NOME e o campo "v"
       permanece CANVAS_PAYLOAD_V (2) — nunca 3 (ver TK-A-001). Adição estritamente
       aditiva: todos os campos que já existiam continuam presentes e um leitor
       antigo ignora os campos novos sem quebrar. */
    var st=JSON.stringify({v:CANVAS_PAYLOAD_V,
      paintSchemaVersion:PAINT_SCHEMA_VERSION,layoutVersion:LAYOUT_VERSION,
      strokes:strokes,stamps:stamps,bgColor:bgColor});
    notify('STATE_EXPORT:'+JSON.stringify({stateJson:st,thumbnailBase64:thumbData,previewBase64:previewData}));
    selId=prevSel;
  }catch(err){
    notify('CANVAS_ERROR:'+JSON.stringify({message:'export:'+err.message}));
  }
};
/* Zera o histórico e a revisão — o estado recém-carregado é a base "salva". */
function resetHist(){ past=[]; future=[]; rev=0; }
window.loadState=function(jsonStr){
  try{
    if(!jsonStr||typeof jsonStr!=='string'){
      strokes=[]; stamps=[]; bgColor='#FFFDF8'; selId=null; resetHist(); render();
      notifyHist(); notify('STATE_LOADED'); return;
    }
    var d=JSON.parse(jsonStr);
    if(!d||typeof d!=='object'){
      strokes=[]; stamps=[]; bgColor='#FFFDF8'; selId=null; resetHist(); render();
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
    notify('STATE_AXES:'+JSON.stringify({
      paint:{declared:axes.paint.declared,legacy:axes.paint.legacy,ok:axes.paint.ok},
      layout:{declared:axes.layout.declared,legacy:axes.layout.legacy,ok:axes.layout.ok}
    }));
    selId=null; resetHist(); render();
    notifyHist(); notify('STATE_LOADED');
  }catch(err){
    strokes=[]; stamps=[]; bgColor='#FFFDF8'; selId=null; resetHist();
    render();
    notifyHist(); notify('LOAD_CORRUPTED');
  }
};

function resize(){
  W=window.innerWidth|0; H=window.innerHeight|0;
  C.width=W; C.height=H;
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
