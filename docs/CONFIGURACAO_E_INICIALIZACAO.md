# Configuração e inicialização — contrato canônico

**Origem:** P3J-R (recuperação das regressões físicas). Fecha o risco **R24** registrado em
`specs/012-loading-performance-foundation/RELATORIO_FECHAMENTO_LP.md`.

---

## 1. Comando oficial de inicialização

```powershell
cd C:\tmp\ptf_colorir_canonical_runtime_wt
npm run start:dev
```

`start:dev` é exatamente `node scripts/check-env.js && expo start --dev-client --clear --lan`:
o portão de configuração roda **antes** do Metro. Se faltar variável obrigatória, o comando falha
no terminal com instrução objetiva e **o Metro não sobe** — o defeito aparece antes de o aplicativo
abrir, e não como uma tela de erro ambígua no aparelho.

Para apenas conferir a configuração, sem subir nada:

```powershell
npm run check:env
```

## 2. Preparação (uma única vez por clone)

```powershell
Copy-Item .env.example .env     # PowerShell
```

```bash
cp .env.example .env            # Git Bash
```

O `.env` resultante é ignorado pelo Git e **vale para todas as sessões seguintes**. Não é preciso
exportar variável no shell antes de cada `expo start` — a prática antiga registrada em
`docs/F2_4E_3/4/5/6_*.md` (`EXPO_PUBLIC_GLOBAL_MANIFEST_URL=… npx expo start -c`) fica aposentada:
depender da memória de quem inicia a sessão foi a causa direta da falha física do P3J.

## 3. Por que a falha do P3J não era de internet

`useStoryPackDownload` lê `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` na carga do módulo. Sem valor,
`GLOBAL_MANIFEST_URL` resolve `null` e `download()` retorna `error: 'config'` **sem tocar a rede**.
A tela de detalhe pintava esse caso com a mesma frase de qualquer outra falha
("Não foi possível baixar. Tentar de novo"), então um defeito de **configuração** se apresentava
como defeito de **conectividade**. O portão acima, somado ao diagnóstico `failureStage: "config"`,
elimina essa confusão nas duas pontas.

## 4. Fonte canônica por ambiente

| Ambiente | Origem do valor | Onde está declarado |
| --- | --- | --- |
| Desenvolvimento local (Metro / Development Client) | arquivo `.env`, criado a partir de `.env.example` | fora do Git, por clone |
| Build `preview` | bloco `env` do perfil | `eas.json` |
| Build `preview-criador` | bloco `env` do perfil | `eas.json` |
| Build `production` | bloco `env` do perfil | `eas.json` |

É **uma única origem lógica** — a variável de ambiente `EXPO_PUBLIC_GLOBAL_MANIFEST_URL`, sempre com
a mesma URL — resolvida pelo mecanismo canônico de cada ambiente. Não existe segunda URL, segundo
nome de variável nem caminho paralelo de configuração.

O perfil `development` do `eas.json` **não** declara a variável de propósito: o build de Development
Client não embute o bundle JS; o valor é resolvido pelo processo do **Metro** em tempo de execução
(`babel-preset-expo` em modo dev reescreve `process.env.EXPO_PUBLIC_*` para `expo/virtual/env`, que é
`process.env` do servidor). Quem cobre esse caminho é o `.env` local, não o perfil de build.

## 5. A URL é pública, não é segredo

Toda variável `EXPO_PUBLIC_*` é embutida no bundle e viaja para **todo aparelho instalado**: qualquer
pessoa com o app pode lê-la. Por construção nenhuma delas pode ser segredo, e guardar placeholder em
`.env.example` não protegeria nada — custaria apenas reprodutibilidade.

A URL aponta para um endpoint público de bucket Cloudflare R2 (`pub-*.r2.dev`): leitura anônima, sem
credencial embutida, sem query string, sem parâmetro de assinatura. Verificado ao vivo durante o
P3J-R: HTTP 200, `application/json`, JSON válido, 18 packs. **Por isso pode existir como configuração
versionada** — e é o que `.env.example` e `eas.json` passam a fazer.

Segredo de verdade (chave de API, token, credencial de assinatura) **nunca** entra em
`.env.example` nem em `eas.json`: vai para `.env` (ignorado pelo Git) ou para as *Environment
Variables* do EAS.

## 6. Ponto de atenção antes do próximo build EAS

A validação física anterior provou que o build instalado **resolveu** a URL em runtime, embora ela não
estivesse em nenhum perfil do `eas.json` — a origem provável é uma *Environment Variable* definida no
servidor do EAS. Como o valor declarado em `eas.json` **prevalece** sobre a homônima do servidor,
confirme antes do próximo build:

```powershell
eas env:list
```

Se existir `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` no servidor com valor **diferente** do declarado aqui,
decida qual é o correto antes de construir. O dashboard do EAS não é inspecionável a partir do
repositório; esta conferência é manual e deliberada.

## 7. Como acrescentar uma nova variável obrigatória

1. Declare-a em `.env.example` com comentário explicando o efeito da ausência.
2. Acrescente-a ao array `OBRIGATORIAS` em `scripts/check-env.js`, com `publica: true|false` e um
   validador de formato.
3. Se for pública e necessária em build, declare-a nos perfis do `eas.json`.
4. Se for segredo, **não** a coloque em `.env.example` nem em `eas.json`: apenas em `.env` e nas
   Environment Variables do EAS, mantendo a checagem de presença no passo 2.
