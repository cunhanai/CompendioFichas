# Backlog

Pedidos do usuário ainda não implementados (ou implementados parcialmente — ver nota em cada
item), registrados como pedido em 2026-09-30/10-01. Itens marcados **[feito]** já foram
resolvidos nesta mesma leva de trabalho (branch `claude/reported-bugs-batch-3`); os demais
continuam pendentes, sem data definida para início.

## Pendentes — precisam de decisão ou são grandes o suficiente para valer uma conversa antes

- **Ver os dados de vida (HP) dos personagens** — pedido vago demais pra agir sem confirmar: HP já
  aparece na ficha (Quick Stats, GeralTab) e no editor de PV. Preciso entender *onde* o usuário
  esperava ver e não está vendo — no card do personagem na lista (`CharCard`)? No dashboard? Em
  algum resumo específico?
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
  hoje `ClassPickerDialog`-style flows pra habilidades especiais criam o item só na ficha, sem
  passar pela biblioteca (diferente de talentos, que já usa `addLibraryItem`). Precisa decidir:
  quando a descrição/incremento for específico só daquele personagem (o usuário menciona esse
  caso explicitamente), como isso convive com "a habilidade também está na biblioteca" — a ficha
  guarda uma cópia customizada, ou a biblioteca precisa suportar campos "por personagem" além dos
  campos compartilhados? Depende da decisão do item anterior (biblioteca editável) pra fazer
  sentido por completo.

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
- **Habilidades tipo magia (spell-like abilities)** — o modelo de dados já existe
  (`Character.spellLikeAbilities`, tabela `character_special_abilities` com `kind: 'spell-like'`),
  mas não há um fluxo de UI dedicado pra adicionar uma com os campos que o usuário descreveu:
  lista de magias de origem, usos por dia, nível de conjurador (normalmente igual ao nível efetivo
  ou ao total de dados de vida do personagem, mas pode ser diferente e digitado à mão). Precisa de
  um novo diálogo (provavelmente em `features/feats-and-abilities`) com esses campos — hoje
  provavelmente reaproveita o fluxo genérico de "nova habilidade especial" sem os campos
  específicos.
- **Bold/itálico no campo de história do personagem** — hoje é um `<textarea>` de texto puro.
  Precisa de um editor de texto rico (ou pelo menos um subconjunto markdown com `**negrito**` e
  `*itálico*` + uma barrinha de formatação) e mudar a exibição (`GeralTab`) pra renderizar a
  formatação em vez de mostrar o texto cru. Vale a pena decidir se é markdown-lite (mais simples)
  ou um editor WYSIWYG de verdade antes de implementar.

## Pendentes — pequenos, mesmo padrão já usado em outro lugar (próximos candidatos óbvios)

- **Raça deve vir da biblioteca compartilhada** (com opção de adicionar nova) — mesmo padrão já
  implementado pra Classes nesta leva (`library_classes`, endpoint genérico, `RacePickerDialog`
  espelhando `ClassPickerDialog`). Não fiz ainda por volume de mudanças nesta mesma leva; é o
  próximo candidato mais óbvio.
- **Um campo "Tipo" na Identidade do personagem, também vindo da biblioteca compartilhada** —
  mesmo padrão (`library_types` ou reaproveitar uma categoria existente + campo novo em
  `characters`/`Identity`).
- **Idiomas: confirmar se já vêm da biblioteca ou só como lista livre, e adicionar o fluxo de
  "adicionar novo à biblioteca" se estiver faltando** — a categoria `idiomas` já existe na
  biblioteca compartilhada (schema/backend), mas não foi confirmado se `LanguagesDialog` na ficha
  já lê de lá ou ainda é uma lista de texto livre sem ligação com a biblioteca.

## Itens desta mensagem já resolvidos nesta leva — **[feito]**

- **[feito]** Badge indicando quando a experiência (XP) está desativada.
- **[feito]** Experiência (XP) sempre por último na lista de estatísticas da aba Geral.
- **[feito]** Alinhamento dos tiles (Base/Temp./Total/Modificador) no popup de atributo.
- **[feito]** Snapshot espúria ao subir um personagem novo pro nível 1 (a primeira classe
  adicionada não deveria gerar histórico).
