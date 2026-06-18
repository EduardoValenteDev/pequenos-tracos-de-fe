# Plano de Áudios do Guia do Beni

> **Status:** plano de produto. Este documento **não ativa nada no código**.
> Só adicione uma chave ao manifesto ativo (`src/data/beniGuideAudio.js`) **quando o
> arquivo `.mp3` correspondente já existir** na pasta. Nunca crie `require()` para
> áudio inexistente (quebra o bundle do Metro).

## Decisão de produto

O app tem **guias falados por tela** (não um tour único gigante):

1. **Aventuras** — apresentação principal da jornada (já implementado: tour inicial).
2. **Home** — guia próprio.
3. **Ateliê** — guia próprio.
4. **Estrelinhas** — guia próprio.
5. **Perfil** — guia próprio.
6. **Área dos Pais** — guia próprio, com tom de responsável.
7. **Comuns** — áudios reutilizáveis em ações repetidas (próximo, concluir, etc.).

## Estrutura de pastas

```
assets/audio/beni_guide/
├── initial/      # ATIVO — tour inicial pós-onboarding
├── adventures/   # ATIVO — guia contextual da aba Aventuras
├── home/         # futuro (vazio, .gitkeep)
├── atelier/      # futuro (vazio, .gitkeep)
├── stars/        # futuro (vazio, .gitkeep)
├── profile/      # futuro (vazio, .gitkeep)
├── parents/      # futuro (vazio, .gitkeep)
└── common/       # futuro (vazio, .gitkeep)
```

## Chaves ATIVAS hoje (já no manifesto)

| audioKey | arquivo |
| --- | --- |
| `guide.initial.welcome` | `initial/guide_initial_welcome.mp3` |
| `guide.initial.adventures` | `initial/guide_initial_adventures.mp3` |
| `guide.initial.glow` | `initial/guide_initial_glow.mp3` |
| `guide.adventures.path` | `adventures/guide_adventures_path.mp3` |
| `guide.adventures.next_available` | `adventures/guide_adventures_next_available.mp3` |
| `guide.adventures.next_locked` | `adventures/guide_adventures_next_locked.mp3` |
| `guide.adventures.view_region` | `adventures/guide_adventures_view_region.mp3` |

> `next_available` e `next_locked` existem mas **não entram no tour inicial** —
> ficam reservados para o guia contextual futuro de Aventuras (estados bloqueados).

## Chaves FUTURAS planejadas (NÃO adicionar ao manifesto ainda)

### Home — `home/` (adicionar junto do bloco HOME 1.0)
| audioKey | arquivo |
| --- | --- |
| `guide.home.welcome` | `home/guide_home_welcome.mp3` |
| `guide.home.continue` | `home/guide_home_continue.mp3` |
| `guide.home.cultinho` | `home/guide_home_cultinho.mp3` |
| `guide.home.bau` | `home/guide_home_bau.mp3` |
| `guide.home.momento_beni` | `home/guide_home_momento_beni.mp3` |
| `guide.home.create_beni` *(opcional)* | `home/guide_home_create_beni.mp3` |

### Ateliê — `atelier/`
| audioKey | arquivo |
| --- | --- |
| `guide.atelier.welcome` | `atelier/guide_atelier_welcome.mp3` |
| `guide.atelier.coloring` | `atelier/guide_atelier_coloring.mp3` |
| `guide.atelier.guided_drawing` | `atelier/guide_atelier_guided_drawing.mp3` |
| `guide.atelier.free_draw` | `atelier/guide_atelier_free_draw.mp3` |
| `guide.atelier.gallery` | `atelier/guide_atelier_gallery.mp3` |

### Estrelinhas — `stars/`
| audioKey | arquivo |
| --- | --- |
| `guide.stars.welcome` | `stars/guide_stars_welcome.mp3` |
| `guide.stars.album` | `stars/guide_stars_album.mp3` |
| `guide.stars.next_reward` | `stars/guide_stars_next_reward.mp3` |
| `guide.stars.progress` | `stars/guide_stars_progress.mp3` |

### Perfil — `profile/`
| audioKey | arquivo |
| --- | --- |
| `guide.profile.welcome` | `profile/guide_profile_welcome.mp3` |
| `guide.profile.avatar` | `profile/guide_profile_avatar.mp3` |
| `guide.profile.name` | `profile/guide_profile_name.mp3` |
| `guide.profile.parent_area` | `profile/guide_profile_parent_area.mp3` |

### Área dos Pais — `parents/` (tom de responsável)
| audioKey | arquivo |
| --- | --- |
| `guide.parents.welcome` | `parents/guide_parents_welcome.mp3` |
| `guide.parents.safety` | `parents/guide_parents_safety.mp3` |
| `guide.parents.progress` | `parents/guide_parents_progress.mp3` |
| `guide.parents.plan` | `parents/guide_parents_plan.mp3` |
| `guide.parents.creator_tools` | `parents/guide_parents_creator_tools.mp3` |

### Comuns — `common/` (ações repetidas)
| audioKey | arquivo |
| --- | --- |
| `guide.common.next` | `common/guide_common_next.mp3` |
| `guide.common.done` | `common/guide_common_done.mp3` |
| `guide.common.skip` | `common/guide_common_skip.mp3` |
| `guide.common.no_voice` | `common/guide_common_no_voice.mp3` |

## Como ativar um pacote futuro (checklist)

1. Gravar/exportar os `.mp3` para a subpasta correta.
2. Adicionar o `require()` da chave em `src/data/beniGuideAudio.js`.
3. Atualizar o smoke (`scripts/smoke.js`) para cobrir os novos arquivos.
4. `getBeniGuideAudio` continua **null-safe** — chave ausente nunca quebra o app.
