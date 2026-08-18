# Adendo ao artefato 44 · reconciliação humana do Vídeo 1 e jank no tablet

**Data:** 2026-08-18

Este documento é **aditivo**. Não apaga nem reescreve o artefato `44`; fecha a divergência que ele
preservou corretamente e acrescenta um achado qualitativo independente.

## 1 · Reconciliação humana PRE×POS

O fundador confirmou, depois do HARD STOP:

1. **Pares do Beni:** concluiu duas partidas adicionais — uma sem rotação e outra com rotação.
2. **Cadê a Ovelhinha?:** tocou/encontrou a ovelhinha na primeira imagem e girou na segunda.
3. **Foreground:** depois do vídeo, manteve/trouxe o Beni ao foreground para produzir o screenshot
   externo do achado em landscape.

Confronto causal:

| Delta técnico do artefato 44 | Explicação humana | Fecho |
|---|---|---|
| Pares `plays 1→3` | duas partidas adicionais concluídas | exato: `+2` |
| Pares `wins 1→3` | as duas partidas foram concluídas | exato: `+2` |
| `@ptf_bonus_stars 1→3` | duas conclusões adicionais de Pares | exato: `+2` |
| `ovelha.facil.bestTimeByScene.toy_workshop_01 = 37379` | ovelhinha encontrada antes da rotação da segunda imagem | compatível e suficiente |
| Beni em foreground, PID vivo | screenshot pós-vídeo produzido na tela do jogo | compatível e suficiente |

`DIVERGENCIA_PRE_POS_VIDEO1` fica **ENCERRADA POR RECONCILIAÇÃO HUMANA**. As mutações não
são atribuídas por inferência do agente: foram assumidas expressamente pelo fundador. A divergência
entre o gesto mínimo redigido e a execução real permanece registrada como desvio de roteiro, mas
não deixa mutação sem causa e não alterou as obras protegidas.

## 2 · Achado `TABLET-JANK-TRANSITIONS-01`

**Relato qualitativo do fundador:** no SM-X510, o app transmite sensação perceptível de rigidez ou
travamento, com transições duras, animações/navegação menos fluidas e experiência significativamente
pior que no telefone. Não houve crash nem erro funcional específico identificado.

Classificação:

- natureza: **performance percebida + UX de movimento/transição em tablet Android**;
- evidência atual: **observação subjetiva do fundador**, sem amostra de frame time, FPS, TTI,
  duração de transição ou baseline comparável;
- estado: **SINAL QUALITATIVO ABERTO**, não `FAIL` e não defeito causal localizado;
- owner primário da próxima ação: **Fase 9 / `P-127`**, que exige coleta física de amostra e
  baseline quantitativo;
- pré-requisito instrumental relacionado: **`P-139` / Fase 6**. O coletor foi tornado alcançável
  em preview, mas ainda não existe baseline versionado nem medição registrada;
- revalidação: **Fases 14 e 21**, conforme `R21`/roadmap;
- owner de correção: **não atribuído antes da medição**. Se o perfil localizar o custo no
  `GameShell`, encaminhar a F12A/`P-166`; se for shell/navegação global, encaminhar ao componente
  medido. Não presumir causa pela percepção;
- correção durante esta campanha: **PROIBIDA**.

## 3 · Efeito sobre o gate

```text
DIVERGENCIA_PRE_POS_VIDEO1 ..... ENCERRADA POR RECONCILIAÇÃO HUMANA
VIDEO_1_CONTINUIDADE ........... PASS por atestação externa
F12A-OVELHA-LANDSCAPE-01 ....... ABERTO · sem correção nesta campanha
TABLET-JANK-TRANSITIONS-01 ..... SINAL QUALITATIVO ABERTO · medir em P-127
HARD_STOP_CAUSAL_VIDEO1 ........ RETIRADO
```
