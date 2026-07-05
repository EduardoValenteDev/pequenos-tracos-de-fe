import React, { forwardRef, useImperativeHandle, useRef, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export const ERASER_COLOR = '__ERASER__';

const TIMEOUT_MS = 7000;

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

/* ─── Image data layers ─── */
/* baseD — pixel snapshot of (bg + line art), used ONLY for BFS barrier detection */
/* paintD — user colour layer, transparent where unpainted                         */
/* lineArtImg — original Image object, re-drawn on top every frame                */
var baseD=null,paintD=null,lineArtImg=null;

/* ─── BFS buffers (pre-allocated to avoid per-tap GC pressure) ─── */
var qBuf=null;    /* Int32Array  W*H*2 — interleaved x,y queue             */
var visBuf=null;  /* Uint8Array  W*H   — visited flags, cleared after BFS  */

/* ─── Image placement (filled by initCanvas) ─── */
/* BFS is strictly confined to this rectangle.  Without this, the BFS enters
   the cream padding area (lum≈255, not a barrier) and connects regions that
   touch the image edge — e.g. sky and ground merge into one fill zone.      */
var imgX=0,imgY=0,imgW=0,imgH=0;

function inImg(x,y){
  return x>=imgX&&x<imgX+imgW&&y>=imgY&&y<imgY+imgH;
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
  var cssW=window.innerWidth|0, cssH=window.innerHeight|0;
  /* Backing FÍSICO (×DPR) para nitidez; display em CSS px via style. */
  W=Math.round(cssW*DPR); H=Math.round(cssH*DPR);
  C.style.width=cssW+'px'; C.style.height=cssH+'px';
  C.width=W; C.height=H;
  off.width=W; off.height=H;
  tmp.width=W; tmp.height=H;
  INITIAL_VIEW_BOTTOM_SAFE_INSET=Math.round(H*INITIAL_VIEW_BOTTOM_SAFE_FRAC);
  if(baseD) renderAll();
}

function renderAll(){
  try{
    /* 1. Cream background */
    offCtx.fillStyle='#FFFDF8';
    offCtx.fillRect(0,0,W,H);
    /* 2. User paint layer */
    if(paintD){
      tmpCtx.clearRect(0,0,W,H);
      tmpCtx.putImageData(paintD,0,0);
      offCtx.drawImage(tmp,0,0);
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
  var bi=(sy*W+sx)*4;
  if(isBarrier(bd[bi],bd[bi+1],bd[bi+2],bd[bi+3])){devLog('[COLORING_DEBUG] fill rejected: isBarrier lum='+lum(bd[bi],bd[bi+1],bd[bi+2]).toFixed(0));var _now=Date.now();if(_now-lastFillRejectedAt>2000){lastFillRejectedAt=_now;window.ReactNativeWebView.postMessage('FILL_REJECTED');}return;}
  var tR=pd[bi],tG=pd[bi+1],tB=pd[bi+2],tA=pd[bi+3];
  var fR=rgb[0],fG=rgb[1],fB=rgb[2];
  if(tA===255&&tR===fR&&tG===fG&&tB===fB)return;
  pushHist();
  var vis=visBuf,buf=qBuf,qh=0,qt=0;
  vis[sy*W+sx]=1; buf[qt++]=sx; buf[qt++]=sy;
  while(qh<qt){
    var cx=buf[qh++],cy=buf[qh++],idx=(cy*W+cx)*4;
    pd[idx]=fR; pd[idx+1]=fG; pd[idx+2]=fB; pd[idx+3]=255;
    for(var i=0;i<4;i++){
      var nx=cx+DX[i],ny=cy+DY[i];
      if(!inImg(nx,ny))continue; /* confine BFS to image rectangle */
      var vi=ny*W+nx; if(vis[vi])continue;
      var ni=vi*4;
      if(isBFSBarrier(bd[ni],bd[ni+1],bd[ni+2],bd[ni+3]))continue;
      if(pd[ni]!==tR||pd[ni+1]!==tG||pd[ni+2]!==tB||pd[ni+3]!==tA)continue;
      vis[vi]=1; buf[qt++]=nx; buf[qt++]=ny;
    }
  }
  /* Clear visited flags only for enqueued pixels — O(N_fill) not O(W*H). */
  for(var k=1;k<qt;k+=2) vis[buf[k]*W+buf[k-1]]=0;
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
  var pd=paintD.data,si=(sy*W+sx)*4;
  var tR=pd[si],tG=pd[si+1],tB=pd[si+2],tA=pd[si+3];
  if(tA===0)return;
  pushHist();
  var vis=visBuf,buf=qBuf,qh=0,qt=0;
  vis[sy*W+sx]=1; buf[qt++]=sx; buf[qt++]=sy;
  while(qh<qt){
    var cx=buf[qh++],cy=buf[qh++],idx=(cy*W+cx)*4;
    pd[idx]=0; pd[idx+1]=0; pd[idx+2]=0; pd[idx+3]=0;
    for(var i=0;i<4;i++){
      var nx=cx+DX[i],ny=cy+DY[i];
      if(!inImg(nx,ny))continue;
      var vi=ny*W+nx; if(vis[vi])continue;
      var ni=vi*4;
      if(pd[ni]!==tR||pd[ni+1]!==tG||pd[ni+2]!==tB||pd[ni+3]!==tA)continue;
      vis[vi]=1; buf[qt++]=nx; buf[qt++]=ny;
    }
  }
  for(var k=1;k<qt;k+=2) vis[buf[k]*W+buf[k-1]]=0;
  notifyPainted(); renderAll();
}

function notifyPainted(){
  if(!hasPainted){hasPainted=true;window.ReactNativeWebView.postMessage('PAINTED');}
}

/* ──────────────────────────────────────────
   TOUCH HANDLING
─────────────────────────────────────────── */
var touchState='idle';
var tapX=0,tapY=0,pinchD=0,pinchMX=0,pinchMY=0;
var TAP_THRESH=8;

function d2(a,b){var dx=a.clientX-b.clientX,dy=a.clientY-b.clientY;return Math.sqrt(dx*dx+dy*dy);}

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
    var ox=Math.floor(((touch.clientX-r.left)*DPR-tx)/scale);
    var oy=Math.floor(((touch.clientY-r.top)*DPR-ty)/scale);
    devLog('[COLORING_DEBUG] touch clientX='+touch.clientX+' clientY='+touch.clientY
      +' canvasX='+ox+' canvasY='+oy
      +' imgX='+imgX+' imgY='+imgY+' imgW='+imgW+' imgH='+imgH
      +' inImg='+inImg(ox,oy)+' eraser='+isEraser+' color='+color);
    if(isEraser) erase(ox,oy); else fill(ox,oy,hex2rgb(color));
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

window.clearPaint=function(){
  if(paintD){pushHist();paintD=offCtx.createImageData(W,H);renderAll();}
};

window.undo=function(){
  if(hist.length===0)return;
  var prev=hist.pop();
  if(!paintD)paintD=offCtx.createImageData(W,H);
  paintD.data.set(prev);
  renderAll();
};

window.resetZoom=function(){scale=1;tx=0;ty=0;show();};

window.exportPaint=function(){
  try{
    var out=document.createElement('canvas');
    out.width=W; out.height=H;
    var outCtx=out.getContext('2d');
    if(paintD) outCtx.putImageData(paintD,0,0);
    /* v2 payload: includes canvas dimensions so loadPaint can validate
       compatibility before applying the bitmap to a potentially different-sized canvas. */
    var payload=JSON.stringify({v:2,W:W,H:H,imgX:imgX,imgY:imgY,imgW:imgW,imgH:imgH,data:out.toDataURL('image/png')});
    window.ReactNativeWebView.postMessage('PAINT_EXPORT:'+payload);
  }catch(err){
    window.ReactNativeWebView.postMessage('ERR:export_failed:'+err.message);
  }
};

/* Validação REAL do desenho salvo, SEM aplicar tinta. Confirma que o payload
   existe, parseia e é COMPATÍVEL com o tamanho atual do canvas (mesmas W,H —
   imgX/Y/W/H são determinísticos a partir disso). Posta:
     PAINT_VALID    → há tinta carregável e compatível (mostrar modal "continuar")
     PAINT_INVALID  → ausente / corrompido / incompatível (limpar e abrir como nova)
   Usado para decidir o modal ANTES de carregar — nunca deixa modal falso. */
window.validatePaint=function(jsonStr){
  try{
    if(typeof jsonStr!=='string'||!jsonStr){window.ReactNativeWebView.postMessage('PAINT_INVALID');return;}
    if(jsonStr.startsWith('data:')){
      /* v1 legado: sem dims no payload → compara o tamanho natural da imagem. */
      var im=new window.Image();
      im.onload=function(){window.ReactNativeWebView.postMessage((im.naturalWidth===W&&im.naturalHeight===H)?'PAINT_VALID':'PAINT_INVALID');};
      im.onerror=function(){window.ReactNativeWebView.postMessage('PAINT_INVALID');};
      im.src=jsonStr; return;
    }
    var p;
    try{p=JSON.parse(jsonStr);}catch(e){window.ReactNativeWebView.postMessage('PAINT_INVALID');return;}
    if(!p||typeof p.data!=='string'){window.ReactNativeWebView.postMessage('PAINT_INVALID');return;}
    var sw=(p.W!==null&&p.W!==undefined)?p.W:null;
    var sh=(p.H!==null&&p.H!==undefined)?p.H:null;
    if(sw===null||sh===null){
      var im2=new window.Image();
      im2.onload=function(){window.ReactNativeWebView.postMessage((im2.naturalWidth===W&&im2.naturalHeight===H)?'PAINT_VALID':'PAINT_INVALID');};
      im2.onerror=function(){window.ReactNativeWebView.postMessage('PAINT_INVALID');};
      im2.src=p.data; return;
    }
    window.ReactNativeWebView.postMessage((sw===W&&sh===H)?'PAINT_VALID':'PAINT_INVALID');
  }catch(err){
    window.ReactNativeWebView.postMessage('PAINT_INVALID');
  }
};

window.loadPaint=function(jsonStr){
  try{
    var payload,dataUrl,savedW,savedH;
    if(jsonStr.startsWith('data:')){
      /* Legacy format (v1): raw data URL, no dimension metadata.
         Fall back to using the image's natural pixel size for validation. */
      payload=null; dataUrl=jsonStr; savedW=null; savedH=null;
    }else{
      try{payload=JSON.parse(jsonStr);}catch(parseErr){
        devLog('[COLORING_STATE] parse error: '+parseErr.message);
        window.ReactNativeWebView.postMessage('LOAD_PAINT_CORRUPTED');
        return;
      }
      dataUrl=payload.data; savedW=payload.W; savedH=payload.H;
    }
    var img=new window.Image();
    img.onload=function(){
      try{
        /* Dimension gate: saved bitmap must exactly match the current canvas size.
           imgX/Y/W/H are deterministic from W,H + image natural size, so matching
           W and H guarantees the paint pixels align with the line art.          */
        var checkW=(savedW!==null&&savedW!==undefined)?savedW:img.naturalWidth;
        var checkH=(savedH!==null&&savedH!==undefined)?savedH:img.naturalHeight;
        if(checkW!==W||checkH!==H){
          devLog('[COLORING_STATE] incompatible saved state ignored W_saved='+checkW+' H_saved='+checkH+' W_curr='+W+' H_curr='+H);
          window.ReactNativeWebView.postMessage('LOAD_PAINT_INCOMPATIBLE');
          return;
        }
        var tc=document.createElement('canvas'); tc.width=W; tc.height=H;
        var tcCtx=tc.getContext('2d'); tcCtx.drawImage(img,0,0);
        if(!paintD) paintD=offCtx.createImageData(W,H);
        paintD.data.set(tcCtx.getImageData(0,0,W,H).data);
        hasPainted=true; renderAll();
        devLog('[COLORING_STATE] load OK W='+W+' H='+H);
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
function allocBufs(){
  qBuf=new Int32Array(W*H*2);
  visBuf=new Uint8Array(W*H);
}

function initCanvas(uri){
  devLog('initCanvas start uriLen='+uri.length);
  var img=new window.Image();
  img.onload=function(){
    try{
      resize();
      devLog('img.naturalSize='+img.naturalWidth+'x'+img.naturalHeight+' canvas='+W+'x'+H);
      /* 6px padding — minimal margin so image occupies maximum canvas space
         while preventing sub-pixel placement of the image edge.
         inImg bounds still enforced, BFS cannot escape into padding.       */
      var SP=6;
      var availW=W-SP*2, availH=H-SP*2;
      var s=Math.min(availW/img.naturalWidth,availH/img.naturalHeight);
      /* Integer placement — no sub-pixel antialiasing on the image boundary
         that could corrupt barrier detection in baseD.                      */
      imgW=Math.round(img.naturalWidth*s);
      imgH=Math.round(img.naturalHeight*s);
      imgX=Math.round((W-imgW)/2);
      imgY=Math.round((H-imgH)/2);
      devLog('imgPlacement x='+imgX+' y='+imgY+' w='+imgW+' h='+imgH);
      /* Store reference for compositing — line art is re-drawn each frame. */
      lineArtImg=img;
      /* Capture barrier snapshot (bg + line art) for BFS isBarrier checks. */
      offCtx.fillStyle='#FFFDF8'; offCtx.fillRect(0,0,W,H);
      offCtx.drawImage(img,imgX,imgY,imgW,imgH);
      baseD=offCtx.getImageData(0,0,W,H);
      devLog('getImageData OK size='+(W*H*4));
      paintD=offCtx.createImageData(W,H);
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
    /* Atelier free-draw canvas — blank slate, full viewport. */
    imgX=0; imgY=0; imgW=W; imgH=H;
    offCtx.fillStyle='#FFFDF8'; offCtx.fillRect(0,0,W,H);
    baseD=offCtx.getImageData(0,0,W,H);
    paintD=offCtx.createImageData(W,H);
    allocBufs();
    show();
    window.ReactNativeWebView.postMessage('READY');
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
   React Native component
────────────────────────────────────────────────────────────────── */
const ColoringCanvas = forwardRef(function ColoringCanvas(
  { selectedColor = '#FF0000', imageSource = null, storyId = null, sceneNumber = null, onPainted, onGoBack, onLoadCorrupted, onLoadIncompatible, onFillRejected, onReadyChange, onPaintValid, onPaintInvalid },
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
    // file://→base64→dataURL abaixo é IDÊNTICO (o WebView recebe um data URL self-contained).
    const isUriSource = !!(imageSource && typeof imageSource === 'object' && typeof imageSource.uri === 'string');
    const cacheKey = isUriSource ? imageSource.uri : imageSource;

    // Cache HIT: reaproveita a lineart já convertida (sem download/leitura).
    const cached = lineartCache.get(cacheKey);
    if (cached) {
      if (__DEV__) console.log(`[ColoringCanvas] lineart CACHE HIT story=${storyId} scene=${sceneNumber}`);
      setImageDataUrl(cached);
      return () => { cancelled = true; };
    }

    (async () => {
      const t0 = Date.now();
      try {
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
    undo()        { webViewRef.current?.injectJavaScript('window.undo(); true;'); },
    resetZoom()   { webViewRef.current?.injectJavaScript('window.resetZoom(); true;'); },

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
    } else if (msg.startsWith('PAINT_EXPORT:')) {
      const exportData = msg.slice('PAINT_EXPORT:'.length);
      pendingExportCallbackRef.current?.(exportData);
      pendingExportCallbackRef.current = null;
    } else if (msg === 'PAINT_VALID') {
      onPaintValid?.();
    } else if (msg === 'PAINT_INVALID') {
      if (__DEV__) console.log('[ColoringCanvas] [COLORING_STATE] saved state invalid/incompatible — healing (clear + fresh)');
      onPaintInvalid?.();
    } else if (msg === 'LOAD_PAINT_CORRUPTED') {
      onLoadCorrupted?.();
    } else if (msg === 'FILL_REJECTED') {
      onFillRejected?.();
    } else if (msg === 'LOAD_PAINT_INCOMPATIBLE') {
      if (__DEV__) console.log('[ColoringCanvas] [COLORING_STATE] incompatible saved state ignored — starting fresh');
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
