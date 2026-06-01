"""
compress-images-pillow.py
Comprime PNGs usando quantização de paleta (Pillow) sem instalar pngquant.
Resultado similar ao pngquant para linearts (fundo branco + linhas pretas).

Parâmetros:
  --input DIR    Pasta de entrada (default: tmp/asset-compression-test)
  --output DIR   Pasta de saída (default: tmp/asset-compression-test/compressed)
  --colors N     Número máximo de cores na paleta (default: 128, range 2-256)
  --recursive    Processar subpastas recursivamente

Não altera arquivos originais.
"""

import os
import sys
import argparse
import json
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERRO: Pillow não instalado. Execute: pip install Pillow --user")
    sys.exit(1)

# ── Argumentos ────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description='Compress PNG images using Pillow quantization')
parser.add_argument('--input',     default='tmp/asset-compression-test', help='Input directory')
parser.add_argument('--output',    default='tmp/asset-compression-test/compressed', help='Output directory')
parser.add_argument('--colors',    type=int, default=128, help='Max palette colors (2-256)')
parser.add_argument('--recursive', action='store_true', help='Process subdirectories')
parser.add_argument('--report',    default='tmp/asset-compression-test/compression-report.json', help='JSON report output')
args = parser.parse_args()

ROOT = Path(__file__).parent.parent
input_dir  = ROOT / args.input
output_dir = ROOT / args.output
report_path = ROOT / args.report

output_dir.mkdir(parents=True, exist_ok=True)

# ── Coleta de arquivos PNG ─────────────────────────────────────────────────────
if args.recursive:
    png_files = list(input_dir.rglob('*.png'))
else:
    png_files = list(input_dir.glob('*.png'))

# Filter out system images that should NOT be compressed
SKIP_FILES = {'icon.png', 'adaptive-icon.png', 'splash-icon.png', 'favicon.png'}
png_files = [f for f in png_files if f.name not in SKIP_FILES]

if not png_files:
    print(f"Nenhum PNG encontrado em: {input_dir}")
    sys.exit(0)

print(f"\n{'='*60}")
print(f"  COMPRESS-IMAGES-PILLOW")
print(f"  Input:  {input_dir}")
print(f"  Output: {output_dir}")
print(f"  Colors: {args.colors}")
print(f"  Files:  {len(png_files)}")
print(f"{'='*60}\n")

results = []
total_before = 0
total_after  = 0
skipped      = 0
errors       = 0

for src_path in sorted(png_files):
    # Mirror the subpath relative to input_dir
    rel = src_path.relative_to(input_dir)
    dst_path = output_dir / rel
    dst_path.parent.mkdir(parents=True, exist_ok=True)

    before_bytes = src_path.stat().st_size
    before_kb    = before_bytes / 1024

    try:
        img = Image.open(src_path)

        # Preserve original mode info for analysis
        original_mode = img.mode
        has_alpha = 'A' in img.mode or img.mode == 'P' and 'transparency' in img.info

        # Convert to RGBA to safely handle transparency
        img_rgba = img.convert('RGBA')

        # Quantize: reduce to N-color palette
        # dither=Image.Dither.NONE is critical for linearts (no Floyd-Steinberg)
        quantized = img_rgba.quantize(
            colors=args.colors,
            method=Image.Quantize.FASTOCTREE,
            dither=Image.Dither.NONE
        )

        # Save with maximum deflate compression + strip metadata
        quantized.save(
            dst_path,
            format='PNG',
            optimize=True,
            compress_level=9
        )

        after_bytes = dst_path.stat().st_size
        after_kb    = after_bytes / 1024
        reduction   = (1 - after_bytes / before_bytes) * 100

        # Skip if larger (equivalent to pngquant --skip-if-larger)
        if after_bytes >= before_bytes:
            import shutil
            shutil.copy2(src_path, dst_path)
            after_bytes = before_bytes
            after_kb    = before_kb
            reduction   = 0
            skipped += 1
            status = '= UNCHANGED'
        else:
            status = f'↓ {reduction:.1f}%'

        total_before += before_bytes
        total_after  += after_bytes

        result = {
            'file':        str(rel),
            'before_kb':   round(before_kb, 1),
            'after_kb':    round(after_kb, 1),
            'reduction_pct': round(reduction, 1),
            'original_mode': original_mode,
            'skipped':     after_bytes >= before_bytes,
            'error':       None,
        }
        results.append(result)

        flag = '=' if after_bytes >= before_bytes else 'OK'
        print(f"  [{flag}] {str(rel):<55} {before_kb:>6.0f} KB -> {after_kb:>5.0f} KB  {status}")

    except Exception as e:
        errors += 1
        results.append({
            'file': str(rel), 'before_kb': round(before_kb, 1),
            'after_kb': None, 'reduction_pct': None,
            'original_mode': None, 'skipped': False, 'error': str(e),
        })
        print(f"  [ERR] {rel} -- {e}")

# ── Sumário ───────────────────────────────────────────────────────────────────
total_reduction = (1 - total_after / total_before) * 100 if total_before > 0 else 0

print(f"\n{'='*60}")
print(f"  RESUMO")
print(f"{'='*60}")
print(f"  Arquivos processados: {len(results)}")
print(f"  Comprimidos:          {len(results) - skipped - errors}")
print(f"  Inalterados:          {skipped} (--skip-if-larger)")
print(f"  Erros:                {errors}")
print(f"  Antes:  {total_before/1024/1024:.2f} MB")
print(f"  Depois: {total_after/1024/1024:.2f} MB")
print(f"  Redução: {total_reduction:.1f}%")
print(f"  Output: {output_dir}")

# ── Salvar relatório JSON ─────────────────────────────────────────────────────
report_path.parent.mkdir(parents=True, exist_ok=True)
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump({
        'date': __import__('datetime').datetime.now().isoformat(),
        'input_dir': str(input_dir),
        'output_dir': str(output_dir),
        'colors': args.colors,
        'total_before_kb': round(total_before / 1024, 1),
        'total_after_kb': round(total_after / 1024, 1),
        'reduction_pct': round(total_reduction, 1),
        'files_processed': len(results),
        'files_compressed': len(results) - skipped - errors,
        'files_skipped': skipped,
        'files_error': errors,
        'results': results,
    }, f, indent=2, ensure_ascii=False)
print(f"  Relatório: {report_path}")
