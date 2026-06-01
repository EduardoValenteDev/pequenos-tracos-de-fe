"""
verify-flood-fill-safety.py
Verifica se imagens comprimidas preservam compatibilidade com o flood fill do ColoringCanvas.

O flood fill usa threshold de luminancia:
  lum(r,g,b) = (r*299 + g*587 + b*114) / 1000
  Pixels com lum >= 210 -> branco (area de preenchimento)
  Pixels com lum <  210 -> barreira (linha preta)

Verifica:
- Pixels de fundo (que eram brancos): ainda tem lum >= 210?
- Pixels de linha (que eram pretos): ainda tem lum < 100?
- Ha pixels "cinza medio" problematicos (lum entre 100-210) que nao existiam antes?

Run: python scripts/verify-flood-fill-safety.py
"""

import sys
import json
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("ERRO: pip install Pillow numpy")
    sys.exit(1)

ROOT = Path(__file__).parent.parent
THRESHOLD = 210  # ColoringCanvas threshold

def lum(r, g, b):
    return (r * 299 + g * 587 + b * 114) // 1000

def analyze_image(path):
    img = Image.open(path).convert('RGBA')
    arr = np.array(img)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]

    # Compute luminance for all pixels
    luminance = (r.astype(int) * 299 + g.astype(int) * 587 + b.astype(int) * 114) // 1000

    total_pixels = luminance.size
    # Only analyze non-transparent pixels
    visible = a > 10

    white_pixels  = np.sum((luminance >= THRESHOLD) & visible)
    black_pixels  = np.sum((luminance < 100) & visible)
    gray_pixels   = np.sum((luminance >= 100) & (luminance < THRESHOLD) & visible)
    total_visible = np.sum(visible)

    white_pct = white_pixels / total_visible * 100 if total_visible > 0 else 0
    black_pct = black_pixels / total_visible * 100 if total_visible > 0 else 0
    gray_pct  = gray_pixels  / total_visible * 100 if total_visible > 0 else 0

    # Check min luminance of "white" areas (should be >= 210)
    white_mask = (luminance >= THRESHOLD) & visible
    min_white_lum = int(luminance[white_mask].min()) if white_mask.any() else 255

    # Check: is there any problematic zone (gray > 1% of image)?
    has_flood_fill_risk = gray_pct > 2.0

    return {
        'white_pct':        round(white_pct, 1),
        'black_pct':        round(black_pct, 1),
        'gray_pct':         round(gray_pct, 1),
        'min_white_lum':    min_white_lum,
        'has_flood_fill_risk': has_flood_fill_risk,
        'total_visible':    int(total_visible),
    }

print("\n" + "="*65)
print("  VERIFY-FLOOD-FILL-SAFETY")
print("="*65)
print(f"  Threshold ColoringCanvas: lum >= {THRESHOLD} = branco (area)")
print(f"  Risco: pixels cinza (lum 100-{THRESHOLD}) > 2% da imagem\n")

compressed_dir = ROOT / 'tmp' / 'asset-compression-test' / 'compressed'

if not compressed_dir.exists():
    print("ERRO: pasta compressed/ nao encontrada. Rodar compress-images-pillow.py primeiro.")
    sys.exit(1)

# Get all PNGs in compressed dir (recursive, skip re-compressed)
png_files = [f for f in compressed_dir.rglob('*.png')
             if 'compressed' not in str(f.relative_to(compressed_dir))]

if not png_files:
    print("Nenhum PNG em compressed/")
    sys.exit(0)

results = []
risky_files = []

print(f"  {'Arquivo':<55} {'Branco':>7} {'Preto':>7} {'Cinza':>7} {'MinLum':>7} {'Risco':>8}")
print(f"  {'-'*55} {'-'*7} {'-'*7} {'-'*7} {'-'*7} {'-'*8}")

for f in sorted(png_files):
    rel = f.relative_to(compressed_dir)
    stats = analyze_image(f)
    risk_flag = "*** RISCO" if stats['has_flood_fill_risk'] else "OK"
    if stats['has_flood_fill_risk']:
        risky_files.append(str(rel))

    print(f"  {str(rel):<55} {stats['white_pct']:>6.1f}%  {stats['black_pct']:>6.1f}%  "
          f"{stats['gray_pct']:>6.1f}%  {stats['min_white_lum']:>6}  {risk_flag:>8}")
    results.append({'file': str(rel), **stats})

print(f"\n{'='*65}")
print(f"  RESULTADO")
print(f"{'='*65}")
print(f"  Arquivos analisados: {len(results)}")
print(f"  Arquivos com risco de flood fill: {len(risky_files)}")
if risky_files:
    print("  ARQUIVOS DE RISCO:")
    for r in risky_files:
        print(f"    - {r}")
else:
    print("  Nenhum arquivo com risco de flood fill detectado. OK para aplicar.")

# Save report
report = {
    'threshold': THRESHOLD,
    'files_analyzed': len(results),
    'files_at_risk': len(risky_files),
    'risky_files': risky_files,
    'results': results,
}
report_path = ROOT / 'tmp' / 'asset-compression-test' / 'flood-fill-safety-report.json'
with open(report_path, 'w', encoding='utf-8') as fp:
    json.dump(report, fp, indent=2, ensure_ascii=False)
print(f"  Relatorio salvo: {report_path}")
