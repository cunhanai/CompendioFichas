# Backlog

Pedidos do usuário ainda não implementados (ou implementados parcialmente — ver nota em cada
item), sem data definida para início. Lista viva — itens saem daqui quando implementados (ver
`DESIGN_NOTES.md` para o registro de quando/como cada um foi resolvido) e novos pedidos entram
conforme chegam. Para o resumo de alto nível de feito/planejado/faltando, veja
[`ONBOARDING.md`](./ONBOARDING.md#5-estado-do-projeto-feito-planejado-faltando).

Os itens abaixo foram registrados originalmente a partir de um pedido em lote de 2026-09-30/10-01
(branch `claude/reported-bugs-batch-3`); quatro itens pequenos dessa leva já foram resolvidos na
hora e ficam listados em "Já resolvidos" no fim deste arquivo, não aqui.

## Bugs reportados — ainda não investigados

- **Redefinir senha de outro usuário não está funcionando** (reportado em 2026-11-04) — admin
  tenta redefinir a senha de outra conta (tela de Gestão de usuários) e não funciona. Ainda sem
  diagnóstico: não se sabe se é erro silencioso, 500, senha não aplicada de fato, ou outra coisa.
  Precisa reproduzir e investigar antes de corrigir.
- **Dispensar o alerta de segurança ("N tentativas de login falhas...") some da tela, mas volta
  ao atualizar a página** (reportado em 2026-11-04) — problema antigo, ainda não resolvido
  (diferente do bug já corrigido em 2026-10-13, de um alerta quase idêntico reaparecer na hora —
  ver "Já resolvidos"; este aqui é especificamente sobre sobreviver a um F5). A UI
  (`SecurityAlertBanner`/`dismissSecurityAlert` em `AppDataProvider.tsx`) remove o alerta da tela
  na hora (otimista) e chama `PATCH /api/admin/users/security-alerts/:id`; pelo código lido até
  agora (`dismissSecurityAlertHandler`, `api/_lib/routes/adminUsers.ts`), o UPDATE e o filtro de
  `GET /api/bootstrap` por `dismissed = false` parecem corretos à primeira vista — não foi
  reproduzido nem investigado de fato (sem acesso a rodar a aplicação neste ambiente), só uma
  leitura rápida do código. Precisa reproduzir com o Network aberto pra ver se o PATCH está
  falhando silenciosamente, devolvendo erro, ou se é outra causa.

## Pendentes — precisam de decisão ou são grandes o suficiente para valer uma conversa antes

- **Modificadores de atributo variáveis: distinguir "temporário" de "modificador de classe" (e
  possivelmente outros tipos) e redesenhar o popup do atributo** — pedido explícito de mudança de
  design: "o valor final e o modificador do atributo final devem estar em destaque, depois as
  somas por tipo, depois o descritivo de que tipo de atributos o personagem tem." Isso precisa de
  uma definição de quais tipos de modificador existem (temporário, classe, racial, seria outros?),
  como cada tipo empilha/soma, e o layout novo do popup (`AbilityDialog` ou equivalente). Não dá
  pra implementar sem alinhar isso.
- **Novos sistemas de RPG além de Pathfinder 1ª Ed.** (pedido em 2026-11-04) — por ordem de
  prioridade: Vampire: The Masquerade, Dune, Tormenta20 e, talvez, Pathfinder 2ª Ed. e D&D 5ª Ed.
  Hoje só Pathfinder 1e está de fato implementado — os outros sistemas já aparecem na navegação/
  dados semente só como placeholder "em breve" (ver `CLAUDE.md`). Antes de começar qualquer um
  desses sistemas, **precisa avaliar o estado atual do app pra receber fichas de outros
  sistemas** — o tipo `Character` (`entities/character/model/types.ts`) e as ~22 tabelas
  relacionais de personagem hoje são inteiramente modeladas em cima da ficha de Pathfinder 1e
  (atributos, perícias, grimórios, manobras, etc. — mecânicas que não existem igual em Vampire ou
  Dune); não dá pra saber de antemão quanto disso é genérico o suficiente pra reaproveitar (a
  shell do app — auth, biblioteca compartilhada, compartilhamento, lixeira — provavelmente sim;
  o modelo de dados da ficha em si, provavelmente não) sem entrar no código e comparar com as
  fichas reais de cada sistema novo. Esse levantamento é o primeiro passo, antes de decidir a
  abordagem (um `Character` por sistema? Um núcleo comum + extensão por sistema? Tabelas
  totalmente novas por sistema?) — fica registrado aqui pra isso acontecer antes de qualquer
  código.
- **Criptografar todos os dados das fichas no banco** — decisão de arquitetura grande: que tipo de
  criptografia (nível de coluna com `pgcrypto`, nível de aplicação com uma chave em variável de
  ambiente, etc.), quais tabelas/colunas exatamente (a ficha inteira é ~22 tabelas), e como isso
  interage com buscas/filtros que hoje são feitos direto no banco. Precisa de conversa antes de
  qualquer código.
- **Papel de "mantenedor" da biblioteca compartilhada + hierarquia de roles extensível**
  (pedido em 2026-11-04) — hoje qualquer usuário autenticado pode adicionar/editar a biblioteca
  (ver itens de biblioteca editável/removível acima, implementados nesta mesma leva); o pedido é
  criar um papel dedicado só pra isso, deixando usuários comuns apenas visualizar e puxar itens
  pra ficha, nunca editar/excluir/criar diretamente. Hierarquia desejada: `master > admin >
mantenedor > usuário comum`, cumulativa (cada papel acima tem tudo que os de baixo têm, mais o
  que é exclusivo dele) — e a modelagem precisa já deixar margem pra hierarquias não-lineares no
  futuro (ex.: duas roles distintas e mutuamente exclusivas entre si, ambas derivadas da mesma
  role-base, cada uma com permissões próprias além da base comum). Isso é uma mudança de
  modelagem de permissões bem maior que o `isAdmin`/`isMaster` booleano atual (`users` table) —
  precisa de desenho antes de codar. **Falta decidir o nome do papel** ("mantenedor" foi só um
  nome de rascunho do próprio pedido) antes de implementar.
- **Página genérica de "Solicitações"** (pedido em 2026-11-04, acompanha o item acima) — usuários
  comuns (que no desenho acima deixam de poder editar a biblioteca direto) precisam de um jeito
  de pedir uma adição/edição/exclusão de item, e isso vira uma solicitação revisável por quem tem
  o papel de mantenedor (ou acima). Pedido explícito pra ser **genérica desde o início** — não
  "solicitações da biblioteca", mas uma tela com index no menu principal reutilizável por
  qualquer contexto futuro que precise de um fluxo de pedido→revisão. Campos obrigatórios que já
  foram especificados: sistema, tipo de solicitação (aqui: adição/edição/exclusão de item da
  biblioteca), um subtipo descritivo (ex.: "adicionar talento"), descrição da ação pedida, um
  campo de texto livre do solicitante (máx. 500 caracteres), autor, role de destino (inferida
  automaticamente pelo sistema — nesse caso "mantenedor e acima", não escolhida à mão), data/hora,
  e — só quando for edição/exclusão — referência a qual item da biblioteca a solicitação se
  refere. Regras de acesso já definidas: o autor pode ver qualquer solicitação (sua ou de
  terceiros), mas só pode cancelar/marcar como resolvida **a própria**; qualquer um pode comentar
  (comentário datado) na própria solicitação; mantenedor+ pode agir em **qualquer** solicitação —
  comentar, recusar, marcar como resolvida, "e talvez mais alguma coisa, ainda não pensamos quais
  outras ações fariam sentido". Precisa de busca, filtros e ordenação na listagem. O próprio
  usuário classificou essa tela como "quase uma tela de suporte" e **ainda mal definida** — fica
  pra uma conversa de design futura antes de qualquer código, não só pelo tamanho mas porque o
  próprio escopo de ações/estados ainda está em aberto.
  - **Complemento (pedido em 2026-11-04)**: a visualização da listagem pode ser tanto tabela
    quanto kanban (por status, provavelmente). E o uso da tela pode ir além de solicitações de
    biblioteca — também serviria pra sugestões de melhoria, relato de bugs, e um roadmap de
    desenvolvimento visível pro usuário. Ainda sem definição de como esses diferentes "tipos de
    uso" convivem na mesma tela genérica (abas? filtro de tipo? telas de entrada diferentes pro
    mesmo backend?) — mais um ponto em aberto pra quando essa conversa de design acontecer.

## Pendentes — bem definidos, mas grandes ou tocam muita coisa (não fiz nesta leva por escopo)

- **Menu de "Configurações" (submenu), tirando usuário logado + Gestão de usuários do nível
  principal do menu** (pedido em 2026-11-04) — hoje "Perfil"/conta e "Gestão de usuários" ficam
  direto na navegação principal; o pedido é agrupar os dois num submenu de Configurações.
  **Ainda precisa de desenho de design** (o próprio usuário marcou isso como em aberto) — qual
  ícone, onde entra na sidebar/bottom bar, como fica em mobile, etc.
  - **Lixeira genérica num submenu à parte**: "Fichas excluídas" (já existe, hoje dentro de
    Gestão de usuários) e qualquer outro tipo de item excluído (ex.: a lixeira de itens da
    biblioteca compartilhada, já implementada nesta mesma leva, hoje dentro da própria
    `LibraryPage`) saem dali — o pedido é não ficar "dentro de Gestão de usuários" porque
    conceitualmente não é gestão de usuário nenhuma. Vira um submenu próprio.
  - **Botão de exclusão permanente, master-only**: hoje a lixeira só restaura (soft delete sem
    rotina de limpeza automática — ver itens "[feito]" de exclusão de ficha/biblioteca). Pedido
    novo: um botão, visível só pro usuário master, pra apagar um item da lixeira
    **definitivamente** (hard delete), em vez de só restaurar.
  - **Visualizar um item da lixeira ao clicar nele**: hoje a lixeira (de fichas, e a nova de
    biblioteca) só lista nome + metadado + botão de restaurar — não dá pra abrir o item e ver o
    conteúdo completo antes de decidir restaurar/apagar. Pedido: clicar no item abre uma
    visualização (provavelmente somente leitura) do conteúdo dele.

## Pendentes — pequenos, mesmo padrão já usado em outro lugar (próximos candidatos óbvios)

- **Listagem de sistemas e de personagens: cards no desktop, lista no mobile** (pedido em
  2026-11-04) — hoje `SystemsPage` e `CharactersPage` mostram tudo como lista (linha com
  avatar/ícone + texto), inclusive no desktop. Pedido: no mobile continuar em lista (mais fácil de
  visualizar na tela estreita); no desktop, virar cards — como o card "sistema favorito" que já
  existe na tela inicial (`DashboardPage`, a seção "Seus sistemas"). O padrão visual do card já
  existe pronto pra copiar; o trabalho é responsivo (breakpoint mobile/desktop) nas duas telas de
  listagem, não um componente novo do zero.
- **Prévia da história do personagem não renderiza markdown** (reportado em 2026-11-04) — a aba
  Geral mostra um resumo de `character.story` (3 linhas, com "Ler mais") como texto puro
  (`GeralTab.tsx`, `{character.story}` direto num `<p>`), então um personagem com **negrito**
  aparece com os asteriscos literais na prévia, mesmo já suportando markdown de verdade dentro do
  `StoryDialog` (que usa o componente `Markdown` compartilhado). Troca pequena: usar `Markdown`
  (ou uma versão truncada dele) também na prévia — mesmo padrão já usado em outros lugares da
  ficha.

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
- **[feito]** Página de novidades (`/novidades`) com versionamento por dia (`AAAA.MM.DD-beta`) e
  changelog retroativo a partir da PR #23, escrito em linguagem de usuário final; componente
  `FeatureTag` para marcar funcionalidades como "em desenvolvimento"/"novo".
- **[feito]** Tag "em desenvolvimento" aplicada a compartilhamento de ficha, galeria de fotos,
  abas Criaturas e Plano, e as seções Snapshots por nível/Registro de sessões na aba Histórico.
- **[feito]** Navegação entre abas da ficha mostra só os ícones; o nome da seção aparece como
  título acima do conteúdo, não mais dentro da própria aba ativa.
- **[feito]** Campo "Anotações adicionais" (texto livre com markdown) na aba Combate — generalizado
  a partir do pedido original de "anotar combos de combate".
- **[feito]** Exclusão de ficha de personagem (soft delete), com lixeira pro dono (botão em
  `CharactersPage`) e pro usuário master (aba "Fichas excluídas" em Gestão de usuários) —
  retenção de 90 dias, sem rotina de limpeza automática.
- **[feito]** Nova especialização de perícia livre "Conhecimento" (junto de
  Apresentação/Ofícios/Profissão em `MULTI_SKILL_CATEGORIES`), além das 10 especializações fixas
  já existentes.
- **[feito]** Galeria de fotos do personagem: diálogo de crop interativo (`ImageCropDialog`,
  `react-easy-crop`, com pan/zoom e opção de proporção quadrada ou original) antes de qualquer
  upload; compressão revisada (`cropAndCompressImage`, reduz dimensão e qualidade JPEG até caber
  num limite de tamanho, em vez de só redimensionar); galeria e foto de perfil do personagem
  unificadas — a galeria agora tem limite de 3 fotos e qualquer uma delas pode ser marcada (⭐)
  como foto de perfil, espelhada em `characters.photo_url`; `PhotoUploadDialog` (upload de avatar
  separado da galeria) foi removido, a edição de foto do personagem passa a ser só pela galeria.
- **[feito]** A galeria de fotos do personagem virou uma aba própria da ficha (`FotosTab`, junto
  de Geral/Combate/Perícias/etc.) em vez de só um diálogo aberto por um botão no cabeçalho —
  `PhotoGalleryDialog` foi removido, o botão de câmera no avatar agora leva direto pra essa aba.
- **[feito]** O mesmo diálogo de crop (`ImageCropDialog`) agora também é usado no upload do
  avatar da própria conta (`ProfilePage`/`AvatarUpload`), travado em proporção quadrada — antes
  só o avatar/galeria do personagem tinha corte interativo, a conta ainda usava o recorte
  automático fixo (`resizeImageToDataUrl`, removido por ter ficado sem nenhum uso).
- **[feito]** Notificação de "o que foi corrigido/adicionado": banner dispensável
  (`ChangelogNotificationBanner`) aparece em toda tela quando há uma entrada de changelog mais
  nova do que a última vista pelo usuário, reaproveitando o conteúdo de `CHANGELOG_ENTRIES` e o
  componente genérico `NotificationBanner`; a marca de "visto" é salva no banco
  (`users.last_seen_changelog_version`), não só no navegador, pelo mesmo motivo do alerta de
  segurança.
- **[feito]** Itens da biblioteca compartilhada agora são editáveis (qualquer usuário autenticado,
  mesma abertura que já existia pra adicionar) e excluíveis (admin-only, com lixeira — soft
  delete, `deleted_at` em todas as 10 tabelas de biblioteca, restaurável por um botão "Lixeira"
  admin-only em `LibraryPage`). Excluir/editar um item da biblioteca nunca afeta um personagem
  que já tenha puxado aquele item pra ficha — cada cópia na ficha é independente desde a própria
  arquitetura original (nunca uma referência).
- **[feito]** "Novo item" na Biblioteca compartilhada agora abre o mesmo formulário rico usado na
  ficha por categoria (`FeatLibraryAddDialog`/`WeaponLibraryAddDialog`, generalizados pra
  suportar edição e um modo "sem ficha"; `SpellLibraryFormDialog` novo, pois magias nunca tiveram
  formulário de criação nenhum antes) em vez do formulário genérico nome+descrição — esse
  continua existindo só pras ~6 categorias cujo formato já era só nome+descrição (perícias,
  idiomas, criaturas, classes, raças, tipos).
- **[feito]** Habilidades especiais: o fluxo confuso de "criar avulsa" (botão separado, sem
  explicar onde os dados iam parar) foi substituído por um único formulário
  (`SpecialFormDialog`, `features/feats-and-abilities`) com um interruptor "Compartilhar na
  biblioteca" (ligado por padrão) — desligado, funciona como a avulsa antiga (só na ficha);
  ligado, funciona como Talentos (salva na biblioteca e na ficha). O mesmo formulário também
  serve pra criar/editar direto na Biblioteca compartilhada (sem o interruptor, que só faz
  sentido quando há uma ficha envolvida). `addCustomSpecial` foi removido.
- **[feito]** Itens da biblioteca compartilhada agora podem ter versão em português e em inglês:
  cada idioma é uma linha própria (`locale` + `group_id` em todas as 10 tabelas de biblioteca,
  migration `0026`) ligada às outras versões do mesmo item pelo `group_id` — não um campo
  duplicado dentro do mesmo registro. Todo campo de texto livre varia por idioma, inclusive o
  nome. `users.library_locale` guarda a preferência da conta (editável em "Dados da conta", tela
  de Perfil); `useLibrary()` já devolve a biblioteca resolvida nesse idioma (com fallback pro que
  existir, se faltar a tradução), então toda a ficha mostra o idioma certo automaticamente, sem
  precisar mudar nenhum dos pickers existentes. Só a `LibraryPage` lida com os dois idiomas de
  verdade: mostra um seletor PT/EN por item quando as duas versões existem (troca só a
  visualização, não a preferência da conta), e um botão "+ tradução" quando só uma existe, que
  abre o mesmo formulário rico pré-preenchido com o conteúdo original (pra não precisar redigitar
  dano/CA/etc. que não muda entre idiomas) pra criar a outra versão, já ligada ao mesmo grupo.
