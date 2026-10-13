# Backlog

Pedidos do usuário ainda não implementados (ou implementados parcialmente — ver nota em cada
item), sem data definida para início. Lista viva — itens saem daqui quando implementados (ver
`DESIGN_NOTES.md` para o registro de quando/como cada um foi resolvido) e novos pedidos entram
conforme chegam. Para o resumo de alto nível de feito/planejado/faltando, veja
[`ONBOARDING.md`](./ONBOARDING.md#5-estado-do-projeto-feito-planejado-faltando).

Os itens abaixo foram registrados originalmente a partir de um pedido em lote de 2026-09-30/10-01
(branch `claude/reported-bugs-batch-3`); quatro itens pequenos dessa leva já foram resolvidos na
hora e ficam listados em "Já resolvidos" no fim deste arquivo, não aqui.

## Pendentes — precisam de decisão ou são grandes o suficiente para valer uma conversa antes

- **Excluir ficha de personagem (soft delete), com visualização/restauração pelo usuário master**
  (pedido em 2026-10-13) — hoje não existe exclusão de personagem nenhuma (só ativo/inativo, que é
  arquivamento reversível pelo próprio dono, não remoção). Pedido: dono pode "excluir" a própria
  ficha, que vira soft delete (`characters.deleted_at`, mesmo padrão já usado em
  `character_snapshots.deletedAt`); o usuário master pode ver as fichas excluídas (de qualquer
  usuário) e restaurá-las. Pontos a decidir: uma ficha excluída ainda aparece em algum lugar pro
  próprio dono (lixeira), ou só some pra ele e só o master consegue achar de novo? Existe um prazo
  de retenção/exclusão definitiva, ou fica para sempre como soft delete? Essa tela de fichas
  excluídas é nova (`/admin/...`) ou entra em "Gestão de usuários" já existente? **Importante**:
  como o sistema já está liberado pra usuários beta com dados reais, qualquer implementação disso
  precisa garantir que soft delete nunca vira hard delete acidental (ex.: nenhuma rotina de limpeza
  automática sem confirmação explícita).
- **Itens da biblioteca compartilhada com versão em português e em inglês, cadastradas pelos
  próprios jogadores, de fontes diferentes** (pedido em 2026-10-13) — exemplo dado: o talento
  "Acuidade com Arma" poderia ter tanto o texto oficial do livro (PT) quanto o texto equivalente
  do d20pf1e (EN, "Weapon Finesse") registrados no mesmo item. "Isso será importante em breve",
  mas ainda sem decisão de implementação. Pontos a decidir: é um campo de idioma por item
  (duplicando nome/descrição/etc. em dois idiomas dentro do mesmo registro), ou dois registros
  separados linkados um ao outro? Afeta só `desc`/campos de texto longo, ou também `name` (um
  talento pode ter nomes diferentes em cada idioma — ver o exemplo dado)? Como o usuário escolhe
  qual idioma ver na ficha (preferência global da conta? por sistema? por item, alternável na
  hora)? Toca toda a biblioteca compartilhada (todas as ~8 categorias), não só talentos — o
  exemplo foi só ilustrativo.
- **Modificadores de atributo variáveis: distinguir "temporário" de "modificador de classe" (e
  possivelmente outros tipos) e redesenhar o popup do atributo** — pedido explícito de mudança de
  design: "o valor final e o modificador do atributo final devem estar em destaque, depois as
  somas por tipo, depois o descritivo de que tipo de atributos o personagem tem." Isso precisa de
  uma definição de quais tipos de modificador existem (temporário, classe, racial, seria outros?),
  como cada tipo empilha/soma, e o layout novo do popup (`AbilityDialog` ou equivalente). Não dá
  pra implementar sem alinhar isso.
- **Ao adicionar um item direto na tela da Biblioteca compartilhada, abrir o mesmo popup usado
  para adicionar aquele tipo de item a partir da ficha** — hoje `LibraryPage` usa um formulário
  genérico (`AddLibraryItemDialog`, nome+descrição) pra toda categoria, enquanto a ficha usa
  diálogos específicos por categoria em alguns casos (ex.: talentos). Unificar significa levar o
  diálogo "rico" de cada categoria pra fora da ficha também — um refactor que toca todas as ~8
  categorias da biblioteca, não uma mudança pequena.
- **Criptografar todos os dados das fichas no banco** — decisão de arquitetura grande: que tipo de
  criptografia (nível de coluna com `pgcrypto`, nível de aplicação com uma chave em variável de
  ambiente, etc.), quais tabelas/colunas exatamente (a ficha inteira é ~22 tabelas), e como isso
  interage com buscas/filtros que hoje são feitos direto no banco. Precisa de conversa antes de
  qualquer código.
- **Todo item da biblioteca compartilhada deve ser editável e removível** (hoje só dá pra
  adicionar) — toca todas as ~8 categorias: cada uma precisa de endpoint de PATCH/DELETE, e a UI
  de cada categoria (na tela de Biblioteca e dentro da ficha) precisa de botões de editar/remover
  além dos de adicionar/escolher. Relacionado ao item de habilidades especiais abaixo.
- **Habilidades especiais criadas na ficha devem estar atreladas à biblioteca, não "avulsas"** —
  confirmado pelo usuário que os dois fluxos (avulsa e puxada da biblioteca) devem continuar
  existindo como hoje; o que fica pendente aqui é só a decisão de design abaixo, não os dois
  fluxos em si. O bug de criação que existia nesse fluxo (`SpecialPickDialog` não impedia
  adicionar a mesma habilidade duas vezes, diferente de `FeatPickDialog`) **já foi corrigido**
  (ver `DESIGN_NOTES.md`). `addCustomSpecial` (`features/feats-and-abilities/model/mutations.ts`)
  cria o item só na ficha, sem passar pela biblioteca (diferente de talentos, que desde a leva de
  Pré-requisito/Benefício usa `addFeatToLibrary` ao cadastrar um novo). Note que habilidades
  especiais **puxadas** da biblioteca já existente (`addSpecialFromLibrary`) e já
  editáveis/removíveis na ficha (`SpecialDetailDialog`) não têm esse problema — é só o fluxo de
  criar uma nova do zero que não grava na biblioteca. Precisa decidir:
  quando a descrição/incremento for específico só daquele personagem (o usuário menciona esse
  caso explicitamente), como isso convive com "a habilidade também está na biblioteca" — a ficha
  guarda uma cópia customizada, ou a biblioteca precisa suportar campos "por personagem" além dos
  campos compartilhados? Depende da decisão do item anterior (biblioteca editável) pra fazer
  sentido por completo.
- **Notificação de "o que foi adicionado, arrumado ou corrigido"** (parte do pedido de
  2026-10-13 de "Sistema de changelog/novidades" — a página de atualizações e as tags já foram
  feitas, ver "Já resolvidos") — o app já tem um componente genérico de notificação
  (`NotificationBanner`, `shared/ui/organisms`, hoje usado só por `SecurityAlertBanner` para
  alertas de segurança — ver `DESIGN_NOTES.md`, "Notificações viraram um componente genérico"),
  construído de propósito para outros tipos de notificação no futuro; é um candidato natural a
  reaproveitar aqui, mas o conteúdo (lista de mudanças por release) e o gatilho de quando mostrar
  pra cada usuário (uma vez só? toda vez que loga depois de um deploy novo?) precisam de
  definição.

## Pendentes — bem definidos, mas grandes ou tocam muita coisa (não fiz nesta leva por escopo)

- **Cortar/posicionar a imagem ao adicionar foto de perfil (do usuário) ou de perfil do
  personagem** — hoje `resizeImageToDataUrl` só faz um recorte automático num quadrado central
  fixo (256×256), sem o usuário escolher a área/posição do recorte. Pedido explícito: permitir
  cortar e posicionar manualmente a imagem antes de salvar. Precisa de um componente de crop
  interativo (ex.: uma lib como `react-easy-crop`) substituindo o recorte automático, usado tanto
  no upload do avatar do usuário (`ProfilePage`) quanto no avatar do personagem
  (`PhotoUploadDialog`).
- **Galeria de fotos do personagem vira uma aba da ficha, com seleção de foto de perfil a partir
  dela, e compressão das imagens adicionadas** — três pedidos relacionados, sobre a mesma
  funcionalidade de galeria implementada nesta leva:
  - A galeria deixa de ser só um diálogo aberto por um botão no cabeçalho (`SheetHeader`) e passa
    a ser mais uma aba da ficha, junto de Geral/Combate/Perícias/etc. (`PillTabs`/`SheetPage`).
  - Poder escolher uma foto já existente na galeria (`character_photos`) pra virar a foto de
    perfil do personagem (`photoUrl`) — hoje avatar e galeria são fluxos de upload totalmente
    separados, sem nenhuma ligação entre eles.
  - Comprimir mais as imagens ao adicionar na galeria — `resizeImageKeepingAspect` já redimensiona
    (corta o lado maior a 1280px) mas vale revisar a qualidade de compressão usada no
    `canvas.toDataURL`/`toBlob` pra reduzir o tamanho final do arquivo.

## Pendentes — pequenos, mesmo padrão já usado em outro lugar (próximos candidatos óbvios)

(nenhum no momento — os últimos itens desta categoria foram resolvidos em 2026-10-13, ver "Já
resolvidos" abaixo)

## Itens já resolvidos — **[feito]**

- **[feito]** Badge indicando quando a experiência (XP) está desativada.
- **[feito]** Experiência (XP) sempre por último na lista de estatísticas da aba Geral.
- **[feito]** Alinhamento dos tiles (Base/Temp./Total/Modificador) no popup de atributo.
- **[feito]** Raça vinda da biblioteca compartilhada (categoria `racas`).
- **[feito]** Tipo de criatura vindo da biblioteca compartilhada (categoria `tipos`); subtipo como
  texto livre.
- **[feito]** Idiomas agora podem ser escolhidos da biblioteca compartilhada, além de digitados.
- **[feito]** Markdown (negrito/itálico/tabelas) na história do personagem.
- **[feito]** Habilidades similares a magia ganharam fluxo de UI de verdade — antes não existia
  nenhuma forma de adicionar uma.
- **[feito]** Snapshot espúria ao subir um personagem novo pro nível 1 (a primeira classe
  adicionada não deveria gerar histórico).
- **[feito]** Talentos ganharam campo `resumo` (prévia dedicada no card) e `Fonte` (texto ou link
  clicável).
- **[feito]** Habilidades especiais ganharam os mesmos campos `resumo`/`Fonte`, e `subtitle`
  passou a ser chamado de "Origem" na UI; bug de duplicidade na criação (`SpecialPickDialog` não
  impedia adicionar a mesma habilidade duas vezes) corrigido.
- **[feito]** Página de novidades (`/novidades`) com versionamento (`AAAA.MM.DD-beta.N`) e
  changelog retroativo a partir da PR #23, escrito em linguagem de usuário final; componente
  `FeatureTag` para marcar funcionalidades como "em desenvolvimento"/"novo".
- **[feito]** Tag "em desenvolvimento" aplicada a compartilhamento de ficha e galeria de fotos —
  ponto no canto do botão no cabeçalho da ficha + badge completo dentro de cada diálogo.
