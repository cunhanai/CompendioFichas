# Backlog

Pedidos do usuário ainda não implementados (ou implementados parcialmente — ver nota em cada
item), sem data definida para início. Lista viva — itens saem daqui quando implementados (ver
`DESIGN_NOTES.md` para o registro de quando/como cada um foi resolvido) e novos pedidos entram
conforme chegam. Para o resumo de alto nível de feito/planejado/faltando, veja
[`ONBOARDING.md`](./ONBOARDING.md#5-estado-do-projeto-feito-planejado-faltando).

Os itens da seção "Já resolvidos" no fim deste arquivo foram registrados originalmente a partir
de um pedido em lote de 2026-09-30/10-01 (branch `claude/reported-bugs-batch-3`); quatro itens
pequenos dessa leva já foram resolvidos na hora e não aparecem aqui.

## Como este arquivo é organizado (regra de processo)

Cada item pendente abaixo carrega sempre os mesmos seis campos — **Título, Resumo, Estado
atual, Pronto pra começar, Tamanho, Prioridade** — pensado para alimentar sem reformatação uma
futura tela de Solicitações/kanban (ver item correspondente mais abaixo). **Toda vez que um novo
item entrar neste arquivo, a prioridade dele precisa ser definida com o usuário antes — não
inventada.** Um item sem prioridade combinada entra como "a definir", nunca com um número
chutado.

Escala de prioridade em uso (definida pelo usuário em 2026-11-04):

- **P0** — bugs reportados. Sempre primeiro, por padrão, sem precisar perguntar de novo a cada
  novo bug.
- **P1** — próximo depois dos bugs, nesta ordem explícita: prévia da história renderizar
  markdown, depois listagem responsiva de sistemas/personagens.
- **P2** — depois do P1: botão de exclusão permanente (lixeira, master-only), depois
  visualização de item da lixeira.
- **Sem prioridade definida** — todo o resto; precisa de conversa com o usuário antes de entrar
  numa dessas faixas (a maioria também precisa de decisão de design antes de qualquer código,
  ver campo "Pronto pra começar" de cada um).

## P0 — Bugs reportados

### Redefinir senha de outro usuário não funciona

- **Resumo:** admin abre "Gestão de usuários", clica em "Redefinir senha" de outra conta, e a
  ação não funciona — sem diagnóstico ainda do que "não funciona" significa (nada acontece?
  erro visível? gera senha mas ela não serve pra logar?).
- **Estado atual:** investigado estaticamente em 2026-11-04 — lido de ponta a ponta o fluxo
  completo (`UsersManagementPanel.tsx` → `ConfirmDialog` → `api.post('/admin/users/:id/reset-
password')` → dispatcher `api/admin/users/[...path].ts` → `resetPasswordHandler` em
  `api/_lib/routes/adminUsers.ts` → `requireAdminUser`/`hashPassword`/`generateTempPassword` →
  `TempPasswordDialog` → o próprio login consumindo a senha nova e `mustChangePassword`) e
  **nenhum defeito foi encontrado por leitura de código** — toda a cadeia parece correta.
  Sem `DATABASE_URL` neste ambiente não há como logar e reproduzir de fato.
- **Pronto para começar:** Não — falta reprodução concreta (o que a tela mostra/não mostra, se
  aparece erro, código de status no Network, se a senha temporária gerada de fato não funciona
  no login) antes de inventar uma correção para um defeito que a leitura de código não confirma.
- **Tamanho:** P (uma vez que haja reprodução concreta — hoje é investigação, não código)
- **Prioridade:** P0

### Alerta de segurança dispensado volta ao atualizar a página (F5)

- **Resumo:** admin dispensa o alerta "N tentativas de login falhas...", ele some da tela, mas
  reaparece depois de um F5 — diferente do bug já corrigido em 2026-10-13 (reaparecer na hora,
  sem F5; ver "Já resolvidos").
- **Estado atual:** investigado estaticamente em 2026-11-04 — lido o fluxo completo
  (`SecurityAlertBanner.tsx` → `dismissSecurityAlert` em `AppDataProvider.tsx` → `PATCH /api/
admin/users/security-alerts/:id` → `dismissSecurityAlertHandler` em `adminUsers.ts`, que
  marca `dismissed = true` em toda linha ativa → `GET /api/bootstrap`, que já filtra por
  `dismissed = false`) e **nenhum defeito foi encontrado por leitura de código**. Hipótese não
  descartada: um novo alerta genuíno sendo levantado por `maybeRaiseSecurityAlert` se os logins
  falhos continuarem depois do dismiss — nesse caso não seria bug, seria o alerta antigo
  reaparecendo por coincidência de texto. Sem ambiente pra reproduzir, não dá pra confirmar.
- **Pronto para começar:** Não — falta reprodução com o Network aberto no momento em que o
  alerta reaparece (ver se é o mesmo `id` de antes do dismiss, ou um `id` novo).
- **Tamanho:** P (uma vez que haja reprodução concreta)
- **Prioridade:** P0

## P2 — Lixeira: hard delete e visualização (registrados agora, não implementados ainda)

### Botão de exclusão permanente na lixeira, master-only

- **Resumo:** hoje restaurar é a única ação da lixeira (soft delete sem rotina de limpeza
  automática — fichas e itens de biblioteca). Pedido: um botão visível só pro usuário master
  pra apagar um item da lixeira **definitivamente** (hard delete), em vez de só restaurar.
- **Estado atual:** não iniciado.
- **Pronto para começar:** Sim — bem definido (quem pode ver o botão, o que ele faz), não
  depende do menu de Configurações nem da lixeira genérica (pode entrar na UI de lixeira atual,
  tanto `TrashDialog`/fichas quanto a lixeira de `LibraryPage`, e mudar de lugar depois se/quando
  o submenu de Configurações for desenhado).
- **Tamanho:** M (toca dois lugares — lixeira de fichas e de biblioteca — e exige endpoint
  novo de hard delete admin-only em cada um)
- **Prioridade:** P2

### Visualizar o conteúdo de um item da lixeira ao clicar nele

- **Resumo:** hoje a lixeira (fichas e biblioteca) só lista nome + metadado + botão de
  restaurar — não dá pra ver o conteúdo completo do item antes de decidir restaurar ou apagar.
  Pedido: clicar no item abre uma visualização (provavelmente somente leitura) do conteúdo
  dele.
- **Estado atual:** não iniciado.
- **Pronto para começar:** Sim — bem definido, mesma independência do menu de Configurações que
  o item anterior.
- **Tamanho:** M (um diálogo de visualização por categoria de item teria algum reaproveitamento
  dos próprios diálogos de detalhe/edição já existentes, só em modo leitura)
- **Prioridade:** P2

## Sem prioridade definida — precisam de decisão ou são grandes o suficiente para valer uma conversa antes

### Modificadores de atributo variáveis: distinguir tipos + redesenhar o popup

- **Resumo:** pedido explícito de mudança de design no popup de atributo: "o valor final e o
  modificador do atributo final devem estar em destaque, depois as somas por tipo, depois o
  descritivo de que tipo de atributos o personagem tem" — hoje não existe essa distinção de
  tipo (temporário vs. modificador de classe vs. possivelmente outros).
- **Estado atual:** não iniciado.
- **Pronto para começar:** Não — precisa definir primeiro quais tipos de modificador existem
  (temporário, classe, racial, outros?), como cada tipo empilha/soma, e o layout novo do popup
  (`AbilityDialog` ou equivalente).
- **Tamanho:** M
- **Prioridade:** a definir

### Novos sistemas de RPG além de Pathfinder 1ª Ed.

- **Resumo:** por ordem de prioridade do próprio pedido original: Vampire: The Masquerade,
  Dune, Tormenta20 e, talvez, Pathfinder 2ª Ed. e D&D 5ª Ed. Hoje só Pathfinder 1e está de fato
  implementado — os outros já aparecem na navegação/dados semente só como placeholder "em
  breve" (ver `CLAUDE.md`).
- **Estado atual:** não iniciado — nem o levantamento preliminar.
- **Pronto para começar:** Não — antes de qualquer sistema novo, precisa avaliar o estado atual
  do app pra receber fichas de outros sistemas. O tipo `Character`
  (`entities/character/model/types.ts`) e as ~22 tabelas relacionais de personagem hoje são
  inteiramente modeladas em cima da ficha de Pathfinder 1e (atributos, perícias, grimórios,
  manobras — mecânicas que não existem igual em Vampire ou Dune); não dá pra saber de antemão
  quanto disso é genérico o suficiente pra reaproveitar (a shell do app — auth, biblioteca
  compartilhada, compartilhamento, lixeira — provavelmente sim; o modelo de dados da ficha em
  si, provavelmente não) sem comparar com as fichas reais de cada sistema novo. Esse
  levantamento é o primeiro passo, antes de decidir a abordagem (um `Character` por sistema? Um
  núcleo comum + extensão por sistema? Tabelas totalmente novas por sistema?).
- **Tamanho:** G (o levantamento sozinho já é trabalho; a implementação de cada sistema, mais
  ainda)
- **Prioridade:** a definir

### Criptografar todos os dados das fichas no banco

- **Resumo:** criptografar os dados de ficha de personagem armazenados no banco.
- **Estado atual:** não iniciado.
- **Pronto para começar:** Não — decisão de arquitetura grande: que tipo de criptografia (nível
  de coluna com `pgcrypto`, nível de aplicação com uma chave em variável de ambiente, etc.),
  quais tabelas/colunas exatamente (a ficha inteira é ~22 tabelas), e como isso interage com
  buscas/filtros hoje feitos direto no banco.
- **Tamanho:** G
- **Prioridade:** a definir

### Papel de "mantenedor" da biblioteca compartilhada + hierarquia de roles extensível

- **Resumo:** hoje qualquer usuário autenticado pode adicionar/editar a biblioteca
  compartilhada; o pedido é criar um papel dedicado só pra isso, deixando usuários comuns
  apenas visualizar e puxar itens pra ficha. Hierarquia desejada: `master > admin > mantenedor
  > usuário comum`, cumulativa, já deixando margem pra hierarquias não-lineares no futuro (ex.:
  > duas roles mutuamente exclusivas derivadas da mesma role-base, cada uma com permissões
  > próprias além da base comum).
- **Estado atual:** não iniciado.
- **Pronto para começar:** Não — é uma mudança de modelagem de permissões bem maior que o
  `isAdmin`/`isMaster` booleano atual (`users` table), precisa de desenho antes de codar. Falta
  também decidir o nome do papel ("mantenedor" foi só um rascunho do próprio pedido).
- **Tamanho:** G
- **Prioridade:** a definir

### Página genérica de "Solicitações"

- **Resumo:** usuários comuns (que no desenho do item de "mantenedor" acima deixam de poder
  editar a biblioteca direto) precisam de um jeito de pedir uma adição/edição/exclusão de item,
  revisável por quem tem o papel de mantenedor (ou acima). Pedido explícito pra ser **genérica
  desde o início** — não "solicitações da biblioteca", mas uma tela com entrada no menu
  principal reutilizável por qualquer fluxo futuro de pedido→revisão (sugestões de melhoria,
  relato de bugs, roadmap visível pro usuário). Campos já especificados: sistema, tipo de
  solicitação, subtipo descritivo, descrição da ação pedida, texto livre do solicitante (máx.
  500 caracteres), autor, role de destino (inferida automaticamente), data/hora, e — quando for
  edição/exclusão — referência ao item da biblioteca. Regras de acesso já definidas: autor vê
  qualquer solicitação mas só cancela/resolve a própria; qualquer um comenta na própria;
  mantenedor+ age em qualquer uma (comentar, recusar, resolver, "e talvez mais alguma coisa").
  Visualização pode ser tabela ou kanban (por status); precisa de busca/filtros/ordenação.
- **Estado atual:** não iniciado.
- **Pronto para começar:** Não — o próprio usuário classificou essa tela como "quase uma tela
  de suporte" e **ainda mal definida**: falta decidir como tabela/kanban e os diferentes "tipos
  de uso" (biblioteca, bugs, sugestões, roadmap) convivem na mesma tela genérica (abas? filtro
  de tipo? telas de entrada diferentes pro mesmo backend?), e que outras ações o mantenedor+
  pode ter além de comentar/recusar/resolver.
- **Tamanho:** G
- **Prioridade:** a definir

### Menu de "Configurações" (submenu) + lixeira genérica num submenu próprio

- **Resumo:** hoje "Perfil"/conta e "Gestão de usuários" ficam direto na navegação principal; o
  pedido é agrupar os dois num submenu de Configurações. Acompanha: tirar a lixeira de dentro de
  "Gestão de usuários" (onde não faz sentido conceitualmente) e a lixeira de biblioteca de
  dentro da própria `LibraryPage`, juntando as duas num submenu de lixeira à parte.
- **Estado atual:** não iniciado.
- **Pronto para começar:** Não — o próprio usuário marcou como em aberto: qual ícone, onde entra
  na sidebar/bottom bar, como fica em mobile, etc.
- **Tamanho:** M
- **Prioridade:** a definir

## P1 (concluído nesta leva, 2026-11-04) — ver "Já resolvidos"

Os dois itens de prioridade P1 — prévia da história em markdown e listagem responsiva de
sistemas/personagens — foram implementados nesta mesma leva e já aparecem na seção "Já
resolvidos" abaixo, não como pendentes.

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
- **[feito]** Prévia da história do personagem (aba Geral) agora renderiza markdown de verdade
  em vez de texto puro (negrito aparecia com asteriscos literais) — o componente `Markdown`
  compartilhado ganhou uma prop `className` opcional, mesclada no wrapper, pra a prévia poder
  aplicar `line-clamp-3` direto nele (como o antigo `<p>` fazia) sem perder a renderização de
  **negrito**/_itálico_ (inline, então o clamp trunca igual).
- **[feito]** Listagem de sistemas e de personagens responsiva: lista (uma coluna) no mobile,
  cards lado a lado a partir do breakpoint `sm` no desktop. `SystemCard` ganhou um terceiro
  variant (`'responsive'`) que renderiza as duas formas já existentes (`wide`/lista e
  `grid`/card) ao mesmo tempo, cada uma escondida por CSS no breakpoint errado (mesmo padrão já
  usado no chevron do `CharCard`, sem JS de media query) — `SystemsPage` só trocou `variant="wide"`
  por `variant="responsive"` e envolveu as listas num grid responsivo. `CharactersPage` não tinha
  (e não ganhou) um variant de card compacto equivalente para `CharCard` — não existia nenhum
  pronto pra copiar, só o reaproveitamento do mesmo card atual, agora reorganizado num grid
  responsivo (1 coluna no mobile, 2–3 no desktop) em vez de uma lista de uma coluna sempre; o
  card em si manteve a mesma forma alongada em ambos os tamanhos de tela.
