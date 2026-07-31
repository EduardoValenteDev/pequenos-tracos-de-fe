/**
 * RecoverableImage — [P3J-R] <Image> "drop-in" com RECUPERAÇÃO LIMITADA.
 *
 * POR QUE NÃO É O SafeImage
 * -------------------------
 * O `SafeImage` monta camadas (fallback/loading atrás, imagem por cima) e, por isso, muda a
 * estrutura de layout de quem o adota. As superfícies da CASCA (mapa, marcadores, capas, Beni)
 * usam <Image> posicionada com estilos próprios e milimetricamente ajustada; trocá-las por
 * SafeImage arriscaria regressão visual num bloco cujo objetivo é justamente PARAR de causar
 * regressão visual. `RecoverableImage` renderiza EXATAMENTE um <Image> com as mesmas props —
 * o layout não muda em um pixel — e acrescenta só o que falta: saber que falhou e tentar de novo.
 *
 * COMPORTAMENTO
 * -------------
 *  - `onError` marca falha e `useImageRecovery` concede tentativas finitas (ver aquele módulo).
 *  - O `key` só muda quando uma tentativa é concedida → imagem carregada NUNCA remonta (não pisca).
 *  - `renderFallback` (opcional) é renderizado ATRÁS da imagem SÓ enquanto ela está em falha, dentro
 *    de um Fragment — sem View extra, portanto sem alterar o layout de quem já usava <Image>. O
 *    elemento devolvido deve se posicionar de forma absoluta; a imagem continua montada por cima,
 *    para que a recuperação limitada ainda possa acontecer e cobrir o fallback ao voltar.
 *  - `onRecoveryStatus(status)` (opcional) informa 'error' | 'loaded' a quem preferir tratar por fora.
 *  - Escopo estritamente VISUAL: não toca pack, índice, marcador nem estado `ready`.
 *
 * O estado de falha mora AQUI, na folha, e não nas superfícies: assim as telas de capa continuam
 * sem flag de carregamento própria (que poderia voltar a false por mudança de progresso e fazer a
 * capa piscar — exatamente o que a correção LP2.1a-ii-01G-C proibiu).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useImageRecovery } from '../../hooks/useImageRecovery';

function sourceKey(source) {
  if (source == null) return null;
  if (typeof source === 'number') return source;
  if (typeof source === 'object') return source.uri ?? JSON.stringify(source);
  return null;
}

export default function RecoverableImage({ source, onError, onLoad, onRecoveryStatus, renderFallback, ...rest }) {
  const chave = sourceKey(source);
  const [falhou, setFalhou] = useState(false);

  // Source novo → estado limpo (não herda a falha da imagem anterior).
  useEffect(() => { setFalhou(false); }, [chave]);

  const { token } = useImageRecovery({ sourceKey: chave, failed: falhou });

  const aoFalhar = useCallback((e) => {
    setFalhou(true);
    if (onRecoveryStatus) onRecoveryStatus('error');
    if (onError) onError(e);
  }, [onError, onRecoveryStatus]);

  const aoCarregar = useCallback((e) => {
    setFalhou(false);
    if (onRecoveryStatus) onRecoveryStatus('loaded');
    if (onLoad) onLoad(e);
  }, [onLoad, onRecoveryStatus]);

  const imagem = <Image key={token} source={source} onError={aoFalhar} onLoad={aoCarregar} {...rest} />;
  if (!renderFallback) return imagem;
  return (
    <>
      {falhou ? renderFallback() : null}
      {imagem}
    </>
  );
}
