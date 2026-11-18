# Tomo — registro de decisões da reconstrução

Registro vivo de tudo o que foi conversado e decidido sobre a reconstrução do Compêndio de Fichas
como **Tomo**. Toda decisão nova entra aqui no momento em que é tomada.

- **Roteiro de definição da arquitetura:** [`ROTEIRO-ARQUITETURA.md`](./ROTEIRO-ARQUITETURA.md)
- **Documento anterior (superado):** "Tomo — Plano de migração e nova arquitetura" (Claude Docs,
  2026-11-13). Previa backend em TypeScript/Hono e o pacote `@tomo/rules` compartilhado. Vale só
  como histórico; o que continua valendo foi copiado para cá.

## Regra de reinício (2026-11-16)

A definição do Tomo recomeçou do zero. **Só entra no Tomo o que for confirmado a partir de
2026-11-16**, e isso vale para funcionalidades, mecânicas, telas, regras e dados. O sistema atual
(este repositório) passa a ser só referência. As decisões já tomadas continuam valendo (seção
"Confirmadas"), mas podem ser revistas quando o roteiro chegar à etapa correspondente.

Status usados:

- **Confirmada:** a usuária decidiu explicitamente.
- **Proposta:** recomendação técnica aguardando confirmação.
- **Aberta:** pergunta sem resposta ainda.
- **Descartada:** considerada e rejeitada, com o motivo.

## Confirmadas

| ID | Tema | Decisão | Data |
| --- | --- | --- | --- |
| D-001 | Produto | O produto passa a se chamar **Tomo**. O nome "Compêndio de Fichas" deixa de existir por completo. O design está sendo feito no Claude Design, fora deste repositório. | 2026-11-15 |
| D-002 | Reconstrução | Reconstruir do zero, num **repositório novo**, mantendo as mecânicas que forem confirmadas. | 2026-11-13 |
| D-003 | Nível | Qualidade de empresa real e **apresentável como portfólio**: front, back, banco e DevOps profissionais. | 2026-11-13 |
| D-004 | Separação | Frontend e backend desacoplados, como **dois projetos separados na Vercel**. | 2026-11-13 |
| D-005 | Domínios | Front em `tomo.anacunha.com.br`, API em `tomo-api.anacunha.com.br` (domínio próprio). | 2026-11-13 |
| D-006 | Hospedagem | Continuar na **Vercel**, plano Hobby, uso pessoal. | 2026-11-15 |
| D-007 | Frontend | **React + Vite + TypeScript**. O front só exibe: não calcula regras de jogo. | 2026-11-15 |
| D-008 | Cálculos | **Todos os cálculos de regras rodam só no backend.** A API devolve a ficha já calculada. | 2026-11-15 |
| D-009 | Backend | **Python**, organizado em **clean architecture** (domain / application / infrastructure / presentation), com **Pydantic** e **ABC** (classes abstratas para interfaces). | 2026-11-15 |
| D-010 | Banco | **Postgres na Neon**, num projeto Neon novo (o plano gratuito atual permite até 100 projetos). | 2026-11-15 |
| D-011 | Schemas | Vários **schemas Postgres** no mesmo banco, um por módulo, e **um schema por sistema de RPG com a edição no nome** (`pathfinder_1e`, `vtm_v5`, `dune`...). | 2026-11-15 |
| D-012 | Auditoria | A auditoria tem **schema próprio** (`audit`). | 2026-11-16 |
| D-013 | Configuração | Limites e regras da plataforma (ex.: tamanho máximo de imagem, quantidade máxima de imagens) ficam **no banco, editáveis**, para mudar sem deploy. Ver P-005. | 2026-11-16 |
| D-014 | IDs | Fichas usam **UUID** como chave. | 2026-11-16 |
| D-015 | Senhas | Senhas novas com **hash mais forte que o bcrypt** atual. As senhas antigas **não** precisam ser preservadas: a usuária repassa senhas novas a todos. | 2026-11-16 |
| D-016 | Dados antigos | O banco antigo **não é tocado** agora. O Tomo é desenvolvido com banco novo e vazio, e um **script de migração** dos dados antigos vem depois. Nenhum dado existente pode ser perdido. | 2026-11-15 |
| D-017 | De → para | Ao desenhar cada schema, montar junto a **tabela de "de → para"** (coluna antiga → destino novo). | 2026-11-16 |
| D-018 | Edições | Vampiro e Dune: edição indiferente para a usuária; a escolha fica para quando esses sistemas entrarem. | 2026-11-16 |
| D-019 | Usuários | Menos de 3 pessoas usam o app hoje, o que simplifica o dia da troca. | 2026-11-16 |
| D-020 | Método | Definir a arquitetura **do macro ao micro**, seguindo o roteiro, redecidindo e confirmando tudo, sem pular etapas. | 2026-11-16 |
| D-021 | Solicitações | O schema **`support`** existe desde o início. As tabelas ficam para quando a usuária terminar de definir a funcionalidade (P-004 vale só como rascunho). | 2026-11-16 |
| D-022 | Senhas | **Argon2id** com a biblioteca **pwdlib**. Na migração, toda conta recebe senha temporária e troca obrigatória no primeiro login. | 2026-11-16 |
| D-023 | Auditoria antiga | A auditoria do sistema atual **não é migrada**: é exportada para um arquivo (criptografado, guardado fora do banco) e o Tomo começa com a auditoria limpa. | 2026-11-16 |
| D-024 | Galeria | O limite de imagens vale para a **galeria de cada personagem** (hoje 3), configurável no banco. | 2026-11-16 |
| D-025 | Imagens | Ao adicionar uma imagem, um **compactador** reduz automaticamente a que for grande demais e **avisa a usuária** do que foi feito. Valores em P-005. | 2026-11-16 |
| D-026 | Banco | **Só Postgres, relacional.** Nada de JSONB nem JSON serializado dentro do Postgres: dado com forma de documento ou vai para um banco NoSQL, ou não existe. O "nada de JSONB" do projeto atual se referia a JSON dentro do Postgres, que é diferente de um banco NoSQL. | 2026-11-16 |
| D-027 | Repositório | **Público**, por ser portfólio, com **README completo no padrão do GitHub** (descrição, selos, prints, stack, arquitetura, como rodar, como contribuir, licença). | 2026-11-17 |
| D-028 | Dia da troca | Sem redirecionamento do domínio antigo: os usuários são **avisados**. | 2026-11-17 |
| D-029 | Fichas | Modelo **envelope** (Class Table Inheritance) aceito, com a exigência da usuária: **nenhum dado repetido** e **nenhuma brecha para divergência** entre as tabelas. Cada informação mora em uma tabela só; o que liga as duas (o `id` e o tipo do sistema) é garantido pelo banco, não pelo código. Detalhes em P-001. | 2026-11-17 |
| D-030 | IDs | **UUID versão 7** nos registros novos. | 2026-11-17 |
| D-031 | Módulos | A divisão em módulos e schemas da plataforma (P-002) fica **suspensa** até a usuária terminar a lista de funcionalidades. Motivos: `identity` e `platform` talvez tenham pouco conteúdo para justificar schemas próprios, e o Tomo não terá só fichas no futuro. Já confirmados continuam: `audit`, `support` e um schema por sistema de RPG. | 2026-11-17 |
| D-032 | Padrão de código | Usar o padrão Python do trabalho (P-008): uv, ruff, pyright estrito, import-linter, pytest, mais a camada `domain` e interfaces ABC, com **lint também na CI**. | 2026-11-17 |
| D-033 | CI/CD | **Nada chega à Vercel sem passar pela CI com testes.** Se algo falhar, nada é publicado. Deploys de **preview** com banco e API de preview. Fluxo de branches do git definido e aplicado no repo. Desenho em P-013 e P-014. | 2026-11-17 |
| D-034 | Código | Organização **por módulo primeiro**, com as camadas dentro de cada módulo (P-003). | 2026-11-17 |
| D-035 | Diagramas | **Excalidraw** é a primeira opção; Structurizr a segunda; Mermaid não (visual simples demais). | 2026-11-17 |
| D-036 | Documentação | Toda a documentação de arquitetura em Markdown **acessível a partir do README**, com índices que levam aos arquivos detalhados. | 2026-11-17 |
| D-037 | Idiomas | **Documentação em português e inglês.** O site **nasce multi-idioma** (português e inglês), mesmo que a tradução para o inglês venha depois. Detalhes em P-016. | 2026-11-17 |
| D-038 | Commits | Padrão **Conventional Commits** (`feat:`, `fix:`, `docs:`...). | 2026-11-17 |
| D-039 | Público | O Tomo é planejado para **pelo menos 8 usuários** (o tamanho da maior campanha) e para crescer, aberto a outras pessoas conhecidas. | 2026-11-17 |
| D-040 | Redis | **Só a produção usa o Redis** (Upstash). Preview e local funcionam sem ele, com o limitador de tentativas desligado. | 2026-11-17 |
| D-041 | Pipeline | Pipeline como em P-013: **deploy só pelo GitHub Actions**, previews com banco de **dados fictícios**, **sem staging** (os previews fazem esse papel). | 2026-11-17 |
| D-042 | E-mail | **Voltar a guardar o e-mail** dos usuários, **criptografado no banco** e descriptografado só no Python quando for usado (desenho em P-019). Redefinição de senha ("esqueci a senha", como em P-011) e verificação de e-mail com o **Resend**. | 2026-11-17 |
| D-043 | Imagens | Imagens num **armazenamento de objetos**, **Cloudflare R2 a princípio** (ver a alternativa em P-012, ainda em discussão). Limite de **500 KB**; versão de exibição de 1600 a 2048 px em **WebP** + miniatura, **sem guardar o original**. A usuária manda a foto do celular como está, e o sistema reduz sozinho e avisa (D-025). | 2026-11-17 |
| D-044 | Idiomas | **Código e banco em inglês.** A **interface é multi-idioma**. (A documentação bilíngue da D-037 está em reconfirmação, Q-019.) | 2026-11-17 |
| D-045 | ADR | Modelo de ADR com as seções **contexto, opções consideradas, decisão, consequências e status**. | 2026-11-17 |
| D-046 | Configurações | A lista final de configurações da plataforma sai da lista de funcionalidades (P-017 vale como exemplo). | 2026-11-17 |
| D-047 | Comercialização | O Tomo **talvez seja comercializado** (não decidido). A arquitetura precisa funcionar nos três casos: nunca vender, vender desde o início, ou começar gratuito e vender depois. Ideia inicial: **uma única assinatura** que cubra os servidores com uma pequena margem. Análise em P-022. | 2026-11-18 |

## Propostas aguardando confirmação

### P-001 — Fichas: "envelope" comum + detalhes por sistema (herança em tabelas)

O padrão tem nome: **Class Table Inheritance** (Martin Fowler, *Patterns of Enterprise
Application Architecture*), também chamado de supertipo/subtipo. Os dados comuns a toda ficha
ficam numa tabela base; os específicos de cada sistema, numa tabela do schema do sistema, com a
**mesma chave primária**.

```
sheets.sheets                 id (UUID, PK), system, owner_id, nome, favorita, deleted_at, criada/atualizada
pathfinder_1e.sheets          id (PK e FK → sheets.sheets.id), system CHECK = 'pathfinder_1e', ...
```

As três alternativas clássicas:

| Padrão | Como fica | Problema para o Tomo |
| --- | --- | --- |
| **Class Table Inheritance** (recomendado) | Tabela base comum + tabela por sistema, mesma PK | Exige um JOIN para montar a ficha completa (barato) |
| Concrete Table Inheritance | Cada sistema tem a ficha inteira no próprio schema | Dashboard, lista de personagens, lixeira e compartilhamento precisariam juntar N schemas, e pioram a cada sistema novo |
| Single Table Inheritance / JSONB | Uma tabela só, com o que é específico num JSON | Perde chaves estrangeiras e restrições; JSON no Postgres está vetado (D-026) |

**Variante considerada em 2026-11-16: ficha inteira por sistema + uma view no `core`** (`UNION
ALL` das tabelas de cada sistema), ou uma view materializada. Resolve só a leitura. Não resolve o
resto, porque:

1. Chave estrangeira não pode apontar para uma view. Compartilhamento, fotos, snapshots e
   favoritos ficariam sem integridade, ou duplicados em cada sistema.
2. Cada sistema novo exige alterar a view no `core`: a dependência fica invertida (o `core`
   passa a conhecer todos os sistemas).
3. Os campos comuns ficam repetidos em N tabelas. Mudar um deles vira N migrações.
4. A view com `UNION` não aceita escrita. Lixeira, favorito e renomear precisariam saber antes em
   qual tabela a ficha está.
5. O banco não garante que o mesmo UUID não exista em dois sistemas.

A view materializada piora: só se atualiza com `REFRESH` (lista desatualizada até lá), recalcula
tudo a cada atualização (consome a cota da Neon) e também não aceita chave estrangeira. Serve
para relatório, não para uso transacional. Uma view continua útil **em cima** do envelope, só para
leitura (ex.: resumo do cartão do dashboard).

É o recomendado aqui porque o Tomo tem muitas telas que tratam fichas de qualquer sistema da mesma
forma (dashboard, recentes, favorita, lista, lixeira, compartilhamento, fotos, snapshots).

**Garantia de integridade pedida ("só existe envelope se existir a ficha do sistema", e
vice-versa):**

1. Ficha do sistema → envelope: chave estrangeira comum (`pathfinder_1e.sheets.id` →
   `sheets.sheets.id`).
2. Envelope do tipo certo: chave estrangeira composta `(id, system)` → `sheets.sheets (id, system)`,
   com `CHECK (system = 'pathfinder_1e')` na tabela do sistema. Uma ficha marcada como Vampiro não
   consegue ter detalhes de Pathfinder.
3. Envelope sem ficha do sistema: o Postgres não tem chave estrangeira "ao contrário". Duas
   travas: (a) o caso de uso cria os dois registros na mesma transação; (b) uma constraint
   trigger `DEFERRABLE INITIALLY DEFERRED` confere no fim da transação que o envelope tem o seu
   par. Se não tiver, a transação inteira é desfeita.

**Por que não há dado repetido (resposta à exigência da D-029):**

| Informação | Onde mora | Pode divergir? |
| --- | --- | --- |
| Nome, dono, favorita, lixeira, datas | Só na tabela base | Não: existe uma vez só |
| Atributos, classes, perícias, magias... | Só na tabela do sistema | Não: existe uma vez só |
| `id` | Nas duas | Não: na tabela do sistema ele é chave estrangeira da base; o banco recusa qualquer valor que não exista lá |
| Tipo do sistema | Na base (`system`) e, como constante, na tabela do sistema | Não: na tabela do sistema ele é fixo por `CHECK` (não é um dado, é um rótulo), e a chave estrangeira composta `(id, system)` obriga os dois a serem iguais. Na base, o `system` não pode mudar depois de criado (a chave estrangeira bloqueia a alteração enquanto existir a ficha do sistema) |

UUID: confirmado **UUIDv7** (D-030) nos registros novos. Ele é ordenado por tempo, o que deixa os
índices mais eficientes que o UUIDv4. O Python 3.14 gera nativamente com `uuid.uuid7()`. Os UUIDs
antigos (v4) são mantidos como estão na migração.

### P-002 — Dividir o "core" em módulos com responsabilidade clara (suspensa, D-031)

Um módulo "core" com tudo o que é comum tende a virar uma gaveta de bagunça. Proposta de
schemas/módulos:

| Schema / módulo | Responsabilidade |
| --- | --- |
| `identity` | Usuários, credenciais (hash de senha), sessões, papéis (master, admin, mantenedor...) e preferências do usuário |
| `platform` | Configurações e limites da plataforma (P-005), catálogo de sistemas de RPG, novidades (changelog) e notificações |
| `sheets` | Envelope das fichas, compartilhamento, fotos, snapshots, lixeira, favoritos |
| `audit` | Log de auditoria (só inserção) e alertas de segurança |
| `support` | Solicitações/chamados (P-004) |
| `pathfinder_1e`, `vtm_v5`, `dune`... | Detalhes da ficha e biblioteca de cada sistema |

Pergunta da usuária, "as partes de core ficam juntas ou separadas das configs do sistema e do
usuário?" — proposta: **separadas**. Configurações da plataforma em `platform`; preferências de
cada usuário junto do usuário, em `identity`.

### P-003 — Organização do código: por módulo primeiro, camadas dentro (confirmada, D-034)

A usuária usa no trabalho a organização **por camada primeiro**
(`domain/{core,audit,...}`, `application/{core,audit,...}`...). A proposta é **por módulo
primeiro**, com as camadas dentro de cada módulo (`modules/sheets/{domain,application,...}`).

| Critério | Por módulo primeiro (proposto) | Por camada primeiro |
| --- | --- | --- |
| Tudo de uma funcionalidade fica junto | Sim, numa pasta | Espalhado em 4 pastas |
| Fronteira entre módulos | Visível na árvore e fácil de proteger | Fica implícita |
| Extrair um módulo depois | Mover uma pasta | Garimpar 4 pastas |
| Recomendação da comunidade para monólito modular | Sim (Spring Modulith, Milan Jovanović, Vaadin) | Indicado para apps pequenos ou times divididos por especialidade |

Nos dois casos, as regras de importação são garantidas pelo **import-linter** (a biblioteca que a
usuária lembrava): contrato `layers` (domain não importa application, etc.), contrato
`independence` (sistemas de RPG não se importam entre si) e contrato `forbidden` (nada importa a
infraestrutura de outro módulo). A decisão final fica para a etapa 11 do roteiro.

### P-004 — Schema `support` para solicitações/chamados

"Virar uma tabela só de mensagens" seria o caso mínimo: se solicitação fosse só "mandar um
recado ao admin", bastaria uma tabela (autor, texto, data) e ela caberia em qualquer schema. O que
já está especificado no BACKLOG atual vai além disso e justifica um schema próprio:

| Tabela | Para quê |
| --- | --- |
| `support.request_types` | Catálogo de tipos e subtipos (pedido de biblioteca, bug, sugestão...) e qual papel atende cada um |
| `support.requests` | O chamado: autor, sistema, tipo, subtipo, status, título, descrição (até 500 caracteres), papel de destino, item referenciado |
| `support.request_comments` | Conversa dentro do chamado |
| `support.request_events` | Histórico: quem mudou status, recusou, resolveu, e quando |
| `support.library_change_proposals` | A proposta de alteração de um item da biblioteca (o item proposto em si, o item alvo, quando foi aplicada) |
| `support.request_watchers` | Quem acompanha o chamado e recebe notificação |
| `support.request_attachments` | Opcional: prints anexados em relato de bug |

### P-005 — Configurações da plataforma no banco

Tabela `platform.settings` com chave, valor, tipo e descrição. A API valida cada chave com um
modelo Pydantic (tipo e faixa permitida) e guarda os valores em cache por alguns minutos.
Exemplos: `photos.max_bytes`, `photos.max_per_sheet`. Só master/admin alteram, e cada alteração
vai para a auditoria.

Esclarecido em 2026-11-16: "5 KB" foi engano, e o limite de 3 é da galeria do personagem
(D-024).

Referência de tamanho de foto (JPEG de boa qualidade; WebP fica cerca de 30% menor):

| Tamanho do arquivo | Dimensões aproximadas | O que é |
| --- | --- | --- |
| 5 KB | 64×64 | Um ícone |
| ~150–400 KB | 1600×1200 | Ocupa a tela de um notebook com nitidez |
| ~500 KB | até ~2000×1500 | Teto confortável para uma foto de galeria |
| ~5 MB | 4000×3000 (12 megapixels) | Foto original de celular, sem compressão nenhuma |

Proposta de valores e de funcionamento:

- `photos.max_dimension` = **1600 px** no lado maior; `photos.max_bytes` = **500 KB**;
  `photos.max_per_sheet` = **3**; formato final **WebP**.
- O compactador roda **no navegador**, antes do envio. Ele aceita a imagem original (até uns 20
  MB), reduz para caber nos limites e mostra o aviso, por exemplo: "Sua imagem tinha 4,2 MB
  (4000×3000) e foi reduzida para 380 KB (1600×1200)".
- Comprimir antes do envio também é necessário porque a Vercel recusa requisições acima de
  **4,5 MB**: uma foto de 5 MB nem chegaria à API.
- A API confere tudo de novo e **regrava a imagem com o Pillow**: garante que é mesmo uma imagem,
  aplica os limites e **remove os metadados EXIF**. Fotos de celular costumam trazer a
  **localização GPS** de onde foram tiradas.
- O sistema atual já reduz as fotos (até 1280 px e ~500 KB, em `src/shared/lib/image.ts`), mas
  sem avisar. As novidades são o aviso, o WebP, a revalidação no servidor e a remoção do EXIF.

### P-006 — Algoritmo de senha (confirmada como D-022)

**Argon2id**, o primeiro da lista da OWASP (Password Storage Cheat Sheet), com no mínimo os
parâmetros da OWASP (19 MiB de memória, 2 iterações, paralelismo 1), ajustados para cerca de
250–500 ms por verificação. Biblioteca **pwdlib** com Argon2, que é a recomendada hoje pela
documentação do FastAPI. Na migração, toda conta vem com senha temporária e troca obrigatória no
primeiro login (o mecanismo de "forçar troca de senha" já existe hoje).

### P-007 — Outras propostas técnicas (já explicadas na conversa, decidir no roteiro)

- **FastAPI** como framework web, **SQLAlchemy 2.0** + **Alembic** (migrações), **uv** (pacotes),
  **pytest**, **ruff** (lint/format), **pyright** em modo estrito (checagem de tipos; substitui o
  mypy proposto antes, por ser o que a usuária já usa no trabalho), **import-linter**.
- Contrato da API em **OpenAPI**, gerado pelo FastAPI; cliente TypeScript do front gerado a partir
  dele (`openapi-typescript`).
- Monorepo: `apps/web` (pnpm) e `apps/api` (uv) no mesmo repo novo.
- Três ambientes: local, staging e produção, cada um com seu branch de banco na Neon.
- Cookie de sessão `__Host-`, CORS restrito à origem do front, checagem de `Origin` contra CSRF.
- Backups: branch Neon antes de cada release + `pg_dump` semanal criptografado + teste de
  restauração mensal. Migrações só para a frente, compatíveis com a versão anterior.
- Fotos fora do banco (Vercel Blob), com o banco guardando só a URL.
- Python na Vercel: usar o endpoint "pooled" da Neon; manter um Dockerfile para poder mudar de
  hospedagem sem mexer no código.

### P-008 — Aproveitar o padrão Python do trabalho (confirmada, D-032)

A usuária compartilhou o `pyproject.toml` do projeto do trabalho (2026-11-16). Quase tudo serve
para o Tomo. Detalhe importante: aquele projeto já é organizado **por módulo primeiro**
(`api.modules.<modulo>.{router,service,repository}`), o mesmo formato proposto em P-003.

| Aproveitar como está | Adaptar | Não se aplica |
| --- | --- | --- |
| uv + `uv.lock`, hatchling, layout `src/`, grupos de dependência `dev`/`lint`/`test` | Camadas do módulo: o Tomo tem muita regra de jogo, então ganha uma camada **`domain`** (Python puro) e **interfaces ABC**, além de router → service → repository | `clickhouse-connect`, `confluent-kafka`, extra `worker` (não há Kafka nem worker; tarefas agendadas, se houver, vão para o Vercel Cron) |
| Python 3.14 (a Vercel suporta 3.12, 3.13 e 3.14; fixar com `.python-version`) | **Lint também na CI**, não só no pre-commit: commits feitos por sessões na nuvem não passam pelo pre-commit, e o selo de CI verde conta no portfólio | `ecs-logging` (Elastic): no Tomo, logs vão para a Vercel e erros para o Sentry |
| FastAPI, Pydantic, pydantic-settings, SQLAlchemy async + asyncpg, Alembic | Contratos `forbidden` repetidos por módulo: conferir se a versão atual do import-linter aceita curingas (`modules.*.repository`) para escrever uma regra só | `pyjwt`: só se a etapa 6 escolher token em vez da sessão em cookie |
| pwdlib[argon2] (já decidido, D-022) | Testes de integração: Postgres como `services` do **GitHub Actions** (em vez do GitLab CI) ou um branch Neon descartável por execução | `markdown-it-py`: o front já renderiza markdown; só entra se o back precisar |
| Bloco ruff `select = ["ALL"]` com os mesmos `ignore`, pyright estrito com `pythonPlatform = "Linux"`, migrações fora do lint | asyncpg com o pooler da Neon: testar prepared statements na etapa 8 | `pydantic[email]`: só se o Tomo tiver e-mail |
| pytest + pytest-asyncio + marcador `integracao`; `[tool.fastapi] entrypoint` | | |

### P-009 — Banco relacional (Postgres) × NoSQL

Pergunta de 2026-11-16: usar só NoSQL, só Postgres, ou Postgres para usuários e configurações e
NoSQL para as fichas? Avaliado com a restrição de usar só serviços gratuitos e a prioridade em
segurança.

**Decidido em 2026-11-16 (D-026): só Postgres, relacional, sem JSONB.** Regra da usuária: um
dado com forma de documento ou vai para um banco NoSQL, ou não existe; JSON dentro do Postgres não
é opção.

| | Só Postgres | Só NoSQL (ex.: MongoDB Atlas) | Híbrido |
| --- | --- | --- | --- |
| Integridade entre fichas, usuários, compartilhamentos, biblioteca, snapshots | Garantida pelo banco (FK, CHECK, UNIQUE) | Fica toda no código da aplicação | Garantida dentro de cada banco, **nunca entre os dois** |
| Transação atômica (ex.: criar envelope + ficha) | Sim | Sim, com limites | **Não entre os dois bancos** (precisa de compensação manual) |
| Ficha com formato diferente por sistema | Schema por sistema (D-011) | Natural | Natural |
| Ler a ficha inteira para calcular | Vários JOINs (resolvido no repositório) | Uma leitura | Uma leitura |
| Gratuito | Neon: branches, restauração por horário (janela curta), ~0,5–1 GB | Atlas M0: 512 MB, 100 operações/s, sem backup automático confirmado, cluster parado pode ser encerrado | Os limites dos dois, somados |
| Segurança | Um conjunto de credenciais; permissões por schema (ex.: `audit` só aceita inserção) | Credencial própria; risco de injeção de operadores (`$ne`, `$where`) se a entrada não for validada | **Dois** conjuntos de credenciais, duas superfícies de ataque, dois backups |
| Acesso pela Vercel | Os IPs da Vercel variam: o banco fica aberto à internet, protegido por senha + TLS | Idem: no Atlas gratuito seria preciso liberar `0.0.0.0/0` | Idem, nos dois |
| Peso e desempenho no volume do Tomo | Sobra | Sobra | Sobra, com mais latência por falar com dois serviços |
| Portfólio | Modelagem relacional bem feita é o que mais se avalia | Bom, mas a maior parte do domínio é relacional | Tende a parecer complexidade sem motivo |

O híbrido é a pior opção para uma pessoa só: dobra credenciais, backups, monitoramento e pontos
de falha, e perde a atomicidade justamente na operação mais comum (criar ou excluir uma ficha
mexe nos dois bancos). O único ganho real do NoSQL aqui é ler a ficha numa operação só, e isso o
repositório resolve no Postgres.

### P-010 — Monitoramento de erros: Sentry

**O que é:** um serviço que captura os erros da aplicação (backend e frontend), agrupa erros
iguais num mesmo "problema", conta quantas vezes aconteceram e com quantos usuários, mostra o
stack trace com as linhas de código e os valores das variáveis, o que aconteceu antes do erro
("breadcrumbs") e em qual versão ele apareceu. Avisa por e-mail quando surge um erro novo ou um
erro resolvido volta.

**Plano gratuito (Developer), conferido em 2026-11-17 em fontes de terceiros:** 1 usuário, 5.000
erros por mês, 5 GB de logs, 5 milhões de spans (medição de desempenho), 50 gravações de sessão,
1 monitor de cron, 1 monitor de disponibilidade, 30 dias de histórico. O plano gratuito **não
cobra excedente**: passando da cota, os eventos são descartados até o mês virar. Conferir na
página de preços da Sentry antes de criar a conta.

**Sentry × Kibana:**

| | Kibana (Elastic Stack) | Sentry |
| --- | --- | --- |
| O que é | Painel de busca e visualização sobre o Elasticsearch, que guarda qualquer texto enviado | Ferramenta especializada em erros e desempenho |
| Entende erros? | Não: mostra linhas de log; agrupar e alertar exige montar consultas | Sim: agrupa, conta, mostra o código, avisa |
| Erros do navegador | Não captura sozinho | Captura (SDK do React) |
| Como os dados chegam | Agentes (Beats, Logstash) ou fila (Kafka, como no trabalho) | O SDK dentro da aplicação envia direto por HTTPS |
| Gratuito hospedado | Não (só teste de 14 dias) | Sim (plano Developer) |

**Como os logs e erros chegam ao Sentry, sem Kafka:** o SDK (`sentry-sdk` com a integração
FastAPI no backend, `@sentry/react` no front) roda dentro da própria aplicação e envia os eventos
por HTTPS direto para a Sentry. Os logs do `logging` do Python também podem ir pelo SDK (recurso
de logs da Sentry). Cuidados: não enviar dados pessoais (`send_default_pii=False`), filtrar senha
e cookie antes do envio, e garantir o envio antes de a função serverless terminar.

**Precisa guardar logs?** Proposta: não montar armazenamento próprio de logs agora. Erros no
Sentry (com alerta por e-mail, porque os usuários nem sempre avisam quando algo quebra), logs
estruturados na saída da Vercel para olhar na hora, e a auditoria no banco para eventos de
segurança.

**Complemento de 2026-11-17 (perguntas da usuária).**

*Onde se veem os erros:* no site da Sentry (sentry.io), com login próprio (ativar verificação em
duas etapas), na lista "Issues"; alerta por e-mail a cada erro novo.

*HTTPS é arriscado?* Não: o HTTPS (TLS) é o que protege o envio, o mesmo de um banco online. Os
riscos reais e as medidas:

| Risco | Medida |
| --- | --- |
| Enviar dado pessoal ou segredo dentro do erro | `send_default_pii=False`; filtro `before_send` no SDK que apaga senha, cookie, token, e-mail e cabeçalho `Authorization` **antes** de sair do servidor; regras de limpeza também do lado da Sentry |
| A chave do front (DSN) é pública por natureza: alguém pode mandar erros falsos e gastar a cota | "Allowed Domains" restrito a `tomo.anacunha.com.br`, limite de eventos por chave; opcionalmente o front envia pela nossa API (`tunnel`), e a DSN nem aparece no navegador |
| Alguém entrar na conta da Sentry | Verificação em duas etapas; conta só da usuária |
| Os dados ficarem num terceiro | Região de dados na **UE (Alemanha)**, escolhida na criação da conta; histórico de 30 dias |

*Sentry × logs no nosso banco:*

| | Sentry | Logs no nosso banco |
| --- | --- | --- |
| Erros do navegador | Captura sozinho | Exige uma rota pública de recebimento, que pode ser abusada |
| Erro quando o banco cai | Registra | **Perde**: justamente o erro mais importante não consegue ser gravado |
| Agrupar, contar, mostrar o código, alertar | Pronto | Tudo a construir (um projeto à parte) |
| Espaço e cota | Do lado deles | Gasta os ~0,5 GB e as horas de processamento gratuitas da Neon |
| Dados ficam com a gente | Não (terceiro, com as medidas acima) | Sim |
| Tela dentro do Tomo, só para o master | Não (fica na sentry.io) | Sim |

Proposta: **cada um no seu papel.** Erros técnicos no Sentry. No nosso banco, o que é do
negócio: auditoria, eventos de segurança e atividade (quem fez o quê), numa tela do Tomo só para
o master.

### P-011 — E-mail: redefinição de senha e verificação de e-mail

**Viável de graça.** Serviços de e-mail transacional com plano gratuito:

| Serviço | Plano gratuito (fontes de terceiros, 2026) |
| --- | --- |
| Resend (proposto) | 3.000 e-mails por mês, até 100 por dia, 1 domínio |
| Brevo | 300 e-mails por dia |

Com 8 a algumas dezenas de usuários, o volume fica muito abaixo disso. Ambos têm API HTTP e SMTP.

**O que exige:**

- Registros DNS no domínio (SPF, DKIM e DMARC), que provam que os e-mails saem mesmo do Tomo e
  evitam a caixa de spam. Ex.: remetente `nao-responda@tomo.anacunha.com.br`.
- Voltar a guardar o e-mail dos usuários (o sistema atual removeu esse campo). É dado pessoal:
  guardar só o necessário e permitir a exclusão (LGPD).

**Fluxos:**

1. **Verificação de e-mail:** ao cadastrar ou trocar o e-mail, o Tomo envia um link com um token
   de uso único e validade curta. O e-mail só vale depois de confirmado.
2. **Esqueci minha senha:** a pessoa informa o e-mail; a resposta é sempre a mesma ("se existir
   uma conta, enviamos um link"), para não revelar quem tem conta. O link traz um token aleatório
   de uso único, válido por cerca de 30 minutos; o banco guarda só o hash do token. Trocar a
   senha encerra todas as sessões. Pedidos têm limite de tentativas.
3. A redefinição pelo admin continua existindo.

### P-012 — Armazenamento de imagens

**Prática de mercado:** a imagem fica num **armazenamento de objetos** (object storage, padrão
S3) e o banco guarda só os dados sobre ela (chave do arquivo, dono, ficha, tamanho, dimensões,
formato, ordem, data). Nunca a imagem em si, como o sistema atual faz em base64.

**Fluxo proposto:**

1. O front comprime a imagem e pede à API uma autorização de envio.
2. A API confere login, permissão e limites e devolve uma **URL assinada** de envio, válida por
   poucos minutos.
3. O navegador envia o arquivo **direto ao armazenamento**, sem passar pela função da Vercel (o
   limite de 4,5 MB deixa de importar).
4. A API confere o arquivo, regrava com o Pillow (formato, limites, remoção do EXIF/GPS), gera a
   miniatura e registra no banco.
5. Para exibir, a API entrega **URLs assinadas de leitura** de curta duração. O armazenamento é
   **privado**: ninguém abre uma foto só adivinhando o endereço.

| Opção | Gratuito | Prós | Contras |
| --- | --- | --- | --- |
| **Cloudflare R2** (proposto) | 10 GB, 1 milhão de escritas e 10 milhões de leituras por mês, tráfego de saída grátis | Padrão S3 (dá para trocar de fornecedor sem reescrever), URLs assinadas, saída grátis | Mais um fornecedor; acima da cota é cobrado (a Cloudflare pede cartão cadastrado para ativar) |
| Vercel Blob | Cota do Hobby (uso limitado) | Mesma plataforma | Arquivos privados precisam passar por uma função; ao estourar a cota, o acesso é **bloqueado por 30 dias** |

**Tamanhos:** guardar uma versão de exibição (lado maior de 1600 a 2048 px, WebP, ~200–600 KB) e
uma miniatura (~400 px, ~30 KB) para listas. O original não é guardado. O WebP é o formato de
saída: a usuária envia JPEG, PNG ou WebP normalmente, e o Tomo converte, porque o WebP fica cerca
de 30% menor com a mesma qualidade e todos os navegadores atuais exibem.

**Por que não guardar 5 MB:** 10 vezes mais armazenamento e tráfego sem ganho visível (a foto é
exibida com cerca de 1000 px de largura). Exemplo: 8 usuários × 10 fichas × 3 fotos = 240 fotos,
cerca de 1,2 GB a 5 MB cada contra ~120 MB a 500 KB. Abrir uma galeria no 4G seria baixar 15 MB
contra 1,5 MB.

**Complemento de 2026-11-17 (perguntas da usuária).** O WebP é o formato do arquivo, e o
armazenamento é onde ele fica: os dois se combinam com qualquer opção abaixo. Como todas seguem o
padrão S3, trocar de fornecedor depois é configuração, não código.

| | Cloudflare R2 | Backblaze B2 | Vercel Blob (Hobby) |
| --- | --- | --- | --- |
| Gratuito | 10 GB, 1 milhão de escritas e 10 milhões de leituras por mês, saída grátis | 10 GB, 1 GB de download por dia | 1 GB, 10 GB de transferência, 10 mil operações simples e 2 mil avançadas por mês |
| Passou da cota | **Cobra no cartão, sem teto.** Só existem alertas de orçamento | **Teto de gastos por dia** (pode ser US$ 0): passou, bloqueia em vez de cobrar | Bloqueia o acesso por **30 dias** (há relatos de bloqueio abaixo da cota) |
| Cartão | Exigido para ativar o R2 | A Backblaze diz que não precisa (conferir no cadastro) | Não |
| Velocidade | Rede da Cloudflare, muito rápida | Boa (data centers nos EUA ou na Europa) | Boa |

Tamanho da cota no uso do Tomo: 10 GB são ~20 mil fotos de 500 KB; 8 usuários × 10 fichas × 3
fotos = 240 fotos (~120 MB). Estourar só aconteceria por abuso, e a API só autoriza envios dentro
dos limites. Se acontecesse no R2, o preço é de cerca de US$ 0,015 por GB por mês.

Cartão virtual que vence em 24 h: não foi possível confirmar a política da Cloudflare. Se uma
cobrança falhar, o provável é a conta ser suspensa e a dívida continuar. Mais seguro: um cartão
virtual permanente com limite baixo. Ou usar o B2 com teto de US$ 0, que torna a cobrança
impossível.

### P-013 — Pipeline de CI/CD e previews

**Desligar o deploy automático da Vercel** (no `vercel.json` do projeto: `git.deploymentEnabled`
em `false`, a mesma chave que o projeto atual já usa para liberar só a `main`) e fazer **todo
deploy pelo GitHub Actions**, com a CLI da Vercel (`vercel build` + `vercel deploy --prebuilt`),
só depois dos testes. A alternativa, "Deployment Checks" da Vercel, só segura a promoção para
produção e pode conflitar com as regras de proteção do GitHub; a pipeline própria controla também
a ordem banco → API → site.

**Em cada pull request:**

1. CI: lint (ruff), tipos (pyright), import-linter, testes unitários e de integração (Postgres de
   teste), build do front e da API, auditoria de dependências. Falhou, para aqui.
2. Cria o branch de banco `preview/pr-<número>` na Neon a partir de um branch **`demo` com dados
   fictícios** (nunca da produção: o código de um PR ainda não revisado não pode enxergar dados e
   senhas reais).
3. Aplica as migrações (Alembic) e os dados de exemplo.
4. Publica a API de preview apontando para esse banco e o site de preview apontando para essa
   API. No preview, o site repassa `/api` para a API de preview: o navegador vê um endereço só e
   o login funciona (dois endereços `*.vercel.app` diferentes contam como sites diferentes e
   bloqueariam o cookie).
5. Comenta no PR os links do preview.
6. Ao fechar o PR, apaga o branch de banco. O plano gratuito da Neon permite 10 branches por
   projeto, o que dá para alguns PRs abertos ao mesmo tempo.

**Ao entrar na `main`:** CI de novo → branch de backup do banco de produção → migrações na
produção → deploy da API → deploy do site → versão e changelog. Qualquer falha interrompe antes
de publicar.

**Ambientes:** **local** (onde se programa: aqui na nuvem ou no seu computador, com um branch
`dev` do banco), **preview** (um por PR) e **produção**. Os previews substituem o ambiente de
staging. **Segredos de produção nunca vão para previews.**

**Upstash (Redis):** usado só para limitar tentativas de login. Proposta: só a produção usa
Redis; preview e local funcionam sem ele (o limitador fica desligado quando não está configurado,
como hoje). Assim nenhuma credencial de produção chega a um preview.

### P-014 — Fluxo de branches: GitHub Flow

O **Git Flow** clássico (branches `develop`, `release/*`, `hotfix/*`) foi feito para software
lançado em versões numeradas, com várias versões em uso ao mesmo tempo. O próprio autor, Vincent
Driessen, acrescentou em 2020 uma nota recomendando um fluxo mais simples, como o **GitHub
Flow**, para quem publica continuamente (aplicações web). Proposta:

1. A `main` é sempre publicável e reflete a produção. Ninguém faz push direto nela (proteção de
   branches, disponível de graça em repo público).
2. Todo trabalho nasce numa branch curta a partir da `main` (`feat/...`, `fix/...`, `docs/...`).
3. Pull request → CI verde → preview conferido → merge por squash (um commit por PR, no padrão
   Conventional Commits).
4. Versões e changelog gerados automaticamente a partir dos commits (ex.: release-please), o que
   também pode alimentar a tela de Novidades.

**Diferença, explicada em 2026-11-17:**

| | Git Flow | GitHub Flow |
| --- | --- | --- |
| Branches fixas | `main` (versões lançadas) e `develop` (próxima versão) | Só a `main` |
| Branches temporárias | `feature/*` (a partir da `develop`), `release/*` (preparar a versão), `hotfix/*` (correção urgente na `main`) | Uma branch curta por mudança, a partir da `main` |
| Caminho até a produção | feature → develop → release → main | branch → PR → main → produção |
| Feito para | Software com versões numeradas e várias versões em uso ao mesmo tempo (app instalado, biblioteca) | Site publicado continuamente, uma versão só no ar |
| Custo | Mais branches, mais merges, conflitos acumulados na `develop` | Simples; depende de CI e previews bons (que o Tomo terá) |

### P-015 — Site de documentação

O GitHub já mostra Markdown, imagens e índices de forma nativa, e cada pasta com `README.md`
vira uma página navegável. Também oferece **GitHub Pages** (hospedagem gratuita para repos
públicos) e Wiki (não versionada junto com o código, não recomendada).

Proposta: escrever a documentação em Markdown no `docs/` (legível direto no GitHub, com o README
como índice) e **publicar a mesma documentação** como site com **Material for MkDocs** no GitHub
Pages, gerado pela CI. Ganha busca, modo escuro, navegação lateral e seletor de idioma
(português/inglês, com o plugin `mkdocs-static-i18n`). É Python, como o backend. Não vale
construir um visualizador próprio.

**Diagramas:** desenhados no Excalidraw e salvos como `.excalidraw.svg` com a cena embutida: o
GitHub e o MkDocs exibem como imagem, e o mesmo arquivo reabre editável no excalidraw.com ou na
extensão do VS Code. Para os diagramas de arquitetura, usar a notação C4 com a biblioteca de
formas C4 do Excalidraw.

**Como funciona, explicado em 2026-11-17:** o MkDocs é um gerador de site estático. Ele lê os
arquivos Markdown da pasta `docs/` e um arquivo de configuração (`mkdocs.yml`: título, cores,
menu, idiomas) e gera um site HTML pronto. O "Material" é o tema que dá a aparência, a busca e o
modo escuro. No Tomo:

1. A documentação é escrita em Markdown no `docs/` do repositório, junto com o código, e já é
   legível no GitHub.
2. A cada merge na `main` que mexa no `docs/`, uma etapa do GitHub Actions roda `mkdocs build` e
   publica o resultado no GitHub Pages (ex.: `docs.tomo.anacunha.com.br`).
3. Ninguém edita o site: edita o Markdown, e o site se refaz sozinho.
4. Com dois idiomas, cada página tem duas versões (`visao-geral.pt.md` e `visao-geral.en.md`).

### P-016 — Multi-idioma desde o início (i18n)

- **Front:** nenhum texto fixo no código; todos em catálogos de tradução (`pt-BR` e `en`), com
  uma regra de lint que acusa texto solto. Biblioteca a escolher (react-i18next ou similar).
  Datas, números e moedas formatados pelo idioma (API `Intl` do navegador).
- **Idioma escolhido:** preferência salva no perfil; antes do login, o idioma do navegador.
- **API:** devolve **códigos** de erro e de mensagem (ex.: `auth.invalid_credentials`), não frases
  prontas; o front traduz. Textos que o servidor precisa gerar (e-mails) têm modelo por idioma.
- **Dados:** conteúdo que precisa existir nos dois idiomas (como a biblioteca, que já é PT/EN hoje)
  é modelado no banco com o idioma de cada registro.
- **Documentação:** português como original, inglês como tradução (P-015).

### P-017 — Exemplos de configurações da plataforma (P-005)

Valores que mudam sem deploy, editados por master/admin, cada mudança auditada. A lista final sai
das funcionalidades; exemplos:

| Chave | Exemplo |
| --- | --- |
| `photos.max_per_sheet` | 3 |
| `photos.max_dimension_px` | 1600 |
| `photos.max_bytes` | 500 KB |
| `auth.login_max_attempts` / `auth.login_window_minutes` | 5 tentativas em 15 minutos |
| `auth.session_days` | 7 |
| `auth.password_min_length` | 12 |
| `trash.retention_days` | 30 (exclusão definitiva automática depois disso) |
| `support.request_text_max_length` | 500 |
| `platform.maintenance_mode` | ligado/desligado |

### P-018 — Papéis e permissões (2026-11-17)

**Como é hoje** (dois campos sim/não na tabela `users`, conferido no código):

| Ação | Comum | Admin | Master |
| --- | --- | --- | --- |
| Próprias fichas, compartilhar, ver a biblioteca | ✓ | ✓ | ✓ |
| Adicionar e editar itens da biblioteca | ✓ (hoje qualquer um) | ✓ | ✓ |
| Criar usuários, ativar/desativar, redefinir senha, ver alertas de segurança | | ✓ | ✓ |
| Enviar item da biblioteca para a lixeira | | ✓ | ✓ |
| Dar e tirar o papel de admin | | | ✓ |
| Excluir de vez um item da biblioteca | | | ✓ |
| Ver, restaurar e excluir de vez as fichas apagadas de outras pessoas | | | ✓ |
| Ser intocável (ninguém desativa, rebaixa ou troca a senha) | | | ✓ (conta única, só no banco) |

O "mantenedor" só existe no BACKLOG (hierarquia desejada `master > admin > mantenedor > comum`,
com espaço para papéis não lineares no futuro).

**Princípio proposto para separar os papéis:** cada papel cuida de uma coisa.

| Papel | Cuida de | Pode |
| --- | --- | --- |
| **Jogador** (comum) | As próprias fichas | Fichas, compartilhamento, galeria, ver a biblioteca, abrir solicitações |
| **Mantenedor** | O conteúdo da biblioteca | Criar, editar e enviar para a lixeira itens da biblioteca; atender solicitações de biblioteca |
| **Admin** | As pessoas (operação do dia a dia) | Criar contas e enviar convites, ativar/desativar, forçar redefinição de senha, ver alertas de segurança, atender solicitações gerais. **Não** dá papéis, **não** apaga nada de vez, **não** mexe nas configurações |
| **Master** | A plataforma (o que é irreversível ou dá poder) | Tudo dos outros + dar e tirar papéis, configurações da plataforma (P-005), exclusões definitivas, restaurar dados de outras pessoas, modo de manutenção, auditoria completa. Uma conta só, definida direto no banco, intocável pela API |

**Modelo no banco (RBAC):** em vez de campos sim/não, tabelas `roles`, `permissions`,
`role_permissions` e `user_roles`. O código checa **permissões** (`library.edit`,
`users.deactivate`), nunca o nome do papel. Assim um papel novo, ou não linear (dois papéis
derivados da mesma base), é só mais uma linha, sem mudar código. O master continua sendo uma
marca à parte, que nenhuma rota consegue gravar.

### P-019 — E-mail criptografado no banco (2026-11-17)

**Problema:** o e-mail precisa ser **procurado** (login por e-mail, "esqueci a senha", impedir
duas contas com o mesmo e-mail). Uma criptografia segura gera um texto diferente a cada vez, então
não dá para procurar por ela.

**Padrão de mercado ("blind index"):** duas colunas.

| Coluna | O que guarda | Para quê |
| --- | --- | --- |
| `email_encrypted` | O e-mail criptografado com **AES-256-GCM** (biblioteca `cryptography`) | Ler o e-mail quando for preciso enviar algo; só o Python descriptografa |
| `email_lookup` | Um **HMAC-SHA256** do e-mail normalizado (minúsculas, sem espaços), com outra chave | Procurar e garantir e-mail único (`UNIQUE`). Não dá para voltar ao e-mail a partir dele |
| `email_key_version` | Qual chave criptografou | Trocar a chave no futuro sem perder dados |

As chaves ficam nas variáveis de ambiente da Vercel (só produção; preview tem chaves próprias),
nunca no banco nem no repositório. A Neon já criptografa o disco; esta camada protege contra
vazamento de um dump, backup ou acesso indevido ao banco. Limite: quem tiver o banco **e** as
chaves da Vercel lê os e-mails.

### P-020 — Login com Google (2026-11-17)

O Google não cobra pelo "Entrar com Google" (OpenID Connect). Pedindo só `openid`, `email` e
`profile`, que são escopos não sensíveis, o app não passa pela verificação do Google; a
verificação de marca só é exigida para exibir nome e logo do Tomo na tela de consentimento.
No Python: biblioteca **Authlib**.

Proposta:

- Opcional, **ao lado** da senha, não no lugar dela.
- Sem cadastro aberto (continua valendo): o Google só entra numa conta que **já existe**.
- Vincular só com o e-mail confirmado pelo Google (`email_verified`) e pela própria pessoa,
  já logada, na tela de perfil. Isso evita que alguém tome uma conta criando um Google com o
  e-mail de outra pessoa.
- O banco guarda o identificador da conta Google (`sub`), não a senha nem tokens do Google.

### P-021 — Verificação de e-mail e convite (2026-11-17)

**Para que serve a verificação:** provar que o e-mail existe **e pertence à pessoa**. Para o Tomo:

1. O "esqueci a senha" só funciona se o e-mail estiver certo. Com um erro de digitação, a conta
   fica sem recuperação; pior, se o e-mail digitado errado for de outra pessoa, ela recebe o link
   e **toma a conta**.
2. Ninguém cadastra o e-mail de outra pessoa.
3. E-mails que voltam (endereço inexistente) prejudicam a reputação do domínio, e os próximos
   caem no spam.

**Proposta, já que não há cadastro aberto:** o admin cria a conta com o e-mail, e o Tomo envia
um **convite** com link de uso único para a pessoa definir a própria senha. Clicar no convite
verifica o e-mail, e acaba a senha temporária repassada por mensagem. Trocar de e-mail depois
exige confirmar o novo.

### P-022 — Preparar a arquitetura para uma possível comercialização (2026-11-18)

**O que muda de verdade se vender** (conferido em 2026-11-18):

| Ponto | Impacto |
| --- | --- |
| **Vercel** | O plano Hobby é **só para uso pessoal, não comercial**. Vender exige o **Pro** (US$ 20 por mês por membro). Os outros serviços gratuitos (Neon, Sentry, Resend, armazenamento) também precisam ter os termos conferidos para uso comercial. |
| **Conteúdo dos sistemas de RPG** | A Community Use Policy da Paizo **proíbe cobrar** pelo acesso. Uso comercial exige outra licença. O texto de regras do Pathfinder 1e está sob a OGL, mas nomes, mundo e marca da Paizo não. Vampiro e Dune têm licenças próprias. **Precisa ser conferido com as editoras (ou com um advogado) antes de vender**, e pode definir quais sistemas entram numa versão paga. |
| **Repositório público (D-027)** | A licença do código decide se alguém pode copiar e vender o Tomo. MIT permite; AGPL obriga quem usar a abrir o código; "todos os direitos reservados" deixa o código visível, mas sem permissão de uso. |
| **LGPD** | Com clientes pagantes: termos de uso, política de privacidade, exclusão e exportação dos dados da conta. |
| **Pagamento** | Nunca guardar dados de cartão: um provedor (ex.: Stripe, Mercado Pago, Asaas) cuida do cartão e do Pix e avisa a API por webhook. Emissão de nota fiscal fica fora do sistema. |

**O que vale fazer desde já, venda ou não** (barato e não atrapalha se nunca vender):

1. **Camada de "direitos do plano" (entitlements):** o código nunca pergunta "a pessoa pagou?",
   e sim "ela pode fazer X?" e "quanto de Y ela pode ter?" (ex.: fotos por ficha). Hoje existe um
   plano só, gratuito, com os limites atuais. Os limites das configurações (D-013) passam a
   poder variar por plano. Funciona junto com as permissões dos papéis (P-018).
2. **Schema `billing` reservado:** planos, assinaturas e eventos do provedor de pagamento. Fica
   vazio (ou com o plano gratuito) até a decisão.
3. **Medir o custo por usuário** (armazenamento, uso), para calcular o preço quando chegar a hora.
4. **Exclusão e exportação de conta** e e-mail criptografado (D-042): a LGPD já pede isso hoje.

## Abertas

| ID | Pergunta | Contexto |
| --- | --- | --- |
| Q-004 | Logs: Sentry para erros técnicos + atividade e segurança no nosso banco (visíveis ao master no Tomo), ou tudo no nosso banco? | Ver P-010 (comparação de 2026-11-17) |
| Q-005 | Imagens: Cloudflare R2 (sem teto de gastos, só alertas) ou Backblaze B2 (teto de gastos em US$ 0)? | Ver P-012 |
| Q-016 | Papéis: o desenho de P-018 serve? O mantenedor cuida da biblioteca de todos os sistemas ou de sistemas específicos? | Ver P-018 |
| Q-017 | E-mail: convite por e-mail no lugar da senha temporária (P-021) e criptografia com blind index (P-019)? | |
| Q-018 | Login com Google opcional, ao lado da senha, só para contas existentes? | Ver P-020 |
| Q-020 | Se o Tomo for vendido: quem paga a assinatura? Cada pessoa, o mestre pela mesa, ou os dois? | Ver P-022. Muda o modelo de dados (assinatura ligada ao usuário ou a um grupo/mesa) |
| Q-019 | A documentação continua em PT e EN (D-037), ou só a interface é multi-idioma? | Resposta de 2026-11-17: "o código fica em inglês, só interface multi-idioma" |
| Q-007 | Como guardar os snapshots de nível sem JSON? | A usuária ainda está definindo. Opções: (a) tabelas relacionais de snapshot espelhando as da ficha; (b) cada snapshot como uma cópia congelada da ficha nas mesmas tabelas; (c) guardar só o que mudou entre níveis. |
| Q-011 | Fluxo de branches GitHub Flow em vez de Git Flow? | Ver P-014 (diferença explicada em 2026-11-17) |
| Q-012 | Site de documentação com Material for MkDocs no GitHub Pages? | Ver P-015 (funcionamento explicado em 2026-11-17) |

## Descartadas ou superadas

| Item | Motivo | Data |
| --- | --- | --- |
| Backend em TypeScript com Hono | Substituído por Python (D-009) | 2026-11-15 |
| Pacote `@tomo/rules` compartilhado entre front e back | Cálculos só no backend (D-008) | 2026-11-15 |
| Cópia das regras em TypeScript no front (opção B) | Cálculos só no backend (D-008) | 2026-11-15 |
| Manter bcrypt e preservar os hashes antigos | Senha mais forte e redefinição para todos (D-015) | 2026-11-16 |
| Better Auth / Auth.js | Eram alternativas da stack TypeScript | 2026-11-15 |
| Railway / Fly agora | Continuar na Vercel (D-006); ficam como saída futura | 2026-11-15 |

## Glossário

| Termo | O que é |
| --- | --- |
| **ADR** | Architecture Decision Record: uma página curta por decisão de arquitetura, guardada no repo (`docs/adr/0007-postgres-sem-jsonb.md`). Responde: qual era o problema (contexto), que opções havia, o que foi escolhido, o que isso traz de bom e de ruim (consequências) e se ainda vale (status: proposta, aceita, substituída). Serve para quem chegar depois entender por que o sistema é como é. |
| **Sentry** | Serviço de monitoramento de erros (P-010). |
| **Object storage** | Armazenamento de arquivos acessados por chave via HTTP (padrão S3), usado para imagens e anexos, fora do banco. |
| **URL assinada** | Endereço temporário, assinado pela API, que permite enviar ou baixar um arquivo específico por poucos minutos, sem expor credenciais. |
| **GitHub Flow / Git Flow** | Modelos de uso de branches. Ver P-014. |
| **i18n** | Internacionalização: preparar o sistema para vários idiomas. |
| **arc42** | Modelo de documentação de arquitetura com 12 seções (objetivos, restrições, contexto, estratégia, blocos, execução, implantação, conceitos transversais, decisões, qualidade, riscos, glossário). |
| **C4** | Forma de desenhar arquitetura em 4 zooms: contexto, contêineres, componentes e código. |
| **FastAPI** | Framework Python para APIs web. Usa as anotações de tipo + Pydantic para validar entrada e saída e gera a documentação OpenAPI sozinho. |
| **OpenAPI** | Formato padrão (um JSON/YAML) que descreve todas as rotas de uma API: URLs, parâmetros, corpo, respostas e erros. Dele se gera documentação interativa e o cliente do front. |
| **mypy / pyright** | Verificadores de tipos do Python. Leem as anotações (`def f(x: int) -> str`) e acusam erros de tipo **antes** de rodar o código, como o `tsc` faz no TypeScript. Fazem a mesma coisa: o mypy é o original da comunidade Python; o pyright é da Microsoft, mais rápido, é o motor do Pylance no VS Code e tem um modo estrito mais rigoroso. O Tomo usa o pyright. |
| **NoSQL** | Bancos que não usam tabelas relacionais. O tipo considerado aqui é o de **documentos** (ex.: MongoDB), em que cada registro é um objeto JSON aninhado. |
| **JSONB** | Tipo de coluna do Postgres que guarda JSON num formato binário consultável. É o "documento" dentro do banco relacional. |
| **EXIF** | Metadados gravados dentro de uma foto pela câmera: modelo do aparelho, data e, muitas vezes, a localização GPS. |
| **import-linter** | Ferramenta que falha a CI se um módulo importar algo que a arquitetura proíbe (camadas, independência entre módulos, importações proibidas). |
| **Railway / Fly.io** | Plataformas que rodam a aplicação como um contêiner sempre ligado (servidor tradicional gerenciado), ao contrário da Vercel, que liga uma função a cada requisição (serverless). Melhores para tarefas longas, websocket e conexões persistentes; cobram por tempo ligado. |
| **Upstash** | Serviço de banco Redis (chave-valor em memória) cobrado por uso. No app atual guarda a contagem de tentativas de login para bloquear quem erra demais a senha. |
| **Proteção de branches** | Regra do GitHub que impede push direto em `main` e exige PR com CI verde (e, opcionalmente, revisão) antes do merge. |
| **Class Table Inheritance** | Padrão de banco em que dados comuns ficam numa tabela base e os específicos em tabelas filhas com a mesma chave (P-001). |
| **Argon2id** | Algoritmo de hash de senha, vencedor da Password Hashing Competition e primeira recomendação da OWASP. Exige muita memória, o que encarece ataques com placas de vídeo. |

## Histórico das conversas

- **2026-11-13** — Pergunta se dava para separar front e back na Vercel. Resposta: sim, dois
  projetos, até no mesmo repo. Decidido reconstruir do zero como "Tomo", com repo novo, domínios
  próprios e foco profissional. Criado o documento de plano (hoje superado).
- **2026-11-15** — Backend passa a ser Python com clean architecture. Ideia de vários schemas
  Postgres (geral + um por sistema). Dados antigos ficam para um script de migração posterior.
  Respondidas as perguntas do plano. Proposta do envelope de fichas.
- **2026-11-16** — Confirmados: schema `audit`, configurações editáveis no banco, UUID nas fichas,
  hash de senha mais forte com redefinição de todas as senhas, cálculos só no backend, edição no
  nome dos schemas, nome Tomo integral, reinício completo da definição a partir do roteiro. Criados
  este registro e o roteiro. Mais tarde no mesmo dia: analisada (e desaconselhada) a variante de
  view no `core` em vez do envelope; confirmados o schema `support`, Argon2id/pwdlib, auditoria
  antiga exportada para arquivo, limite de imagens na galeria do personagem e compactador de
  imagem com aviso; analisados o padrão Python do trabalho (P-008) e Postgres × NoSQL (P-009).
  Decidido: só Postgres, sem JSONB (D-026). Pesquisadas opções gratuitas de logs (Q-008).
- **2026-11-17** — Confirmados: repo público com README completo, aviso aos usuários no dia da
  troca, envelope sem dado repetido, UUIDv7, padrão de código do trabalho, CI/CD obrigatória
  antes de qualquer deploy, previews com banco, módulo primeiro, Excalidraw, documentação
  indexada pelo README e bilíngue, site multi-idioma desde o início, Conventional Commits, pelo
  menos 8 usuários. Divisão em módulos da plataforma suspensa até a lista de funcionalidades.
  Pesquisados Sentry, e-mail gratuito, armazenamento de imagens, pipeline com previews, fluxo de
  branches e site de documentação (P-010 a P-017). Criado o artefato visual com o que já foi
  definido.
- **2026-11-17 (continuação)** — Confirmados: Redis só em produção, pipeline de P-013, e-mail
  de volta (criptografado) com Resend, imagens em armazenamento de objetos com 500 KB e WebP,
  código em inglês, modelo de ADR, lista de configurações a partir das funcionalidades.
  Respondidas as perguntas sobre o Sentry (segurança, onde ver, comparação com logs próprios),
  verificação de e-mail, login com Google, alternativas ao R2, GitHub Flow × Git Flow e MkDocs.
  Propostos os papéis (P-018), o e-mail criptografado (P-019), o login com Google (P-020) e o
  convite por e-mail (P-021).
- **2026-11-18** — A usuária considera comercializar o Tomo, com uma assinatura única (não
  decidido). Registrada a exigência (D-047) e analisados os impactos (P-022): Vercel Pro, licença
  das editoras, licença do código, LGPD, pagamento, camada de direitos do plano.

## Fontes

- [arc42 — visão geral das 12 seções](https://arc42.org/overview)
- [Modelo C4 (Wikipedia)](https://www.wikipedia.org/wiki/C4_model)
- [Martin Fowler — Class Table Inheritance](https://martinfowler.com/eaaCatalog/classTableInheritance.html)
- [OWASP — Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [FastAPI — hash de senha com pwdlib/Argon2](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [import-linter — tipos de contrato](https://import-linter.readthedocs.io/en/stable/contract_types/)
- [Neon — limites do plano gratuito](https://neon.com/faqs/free-plan-limits-and-quotas)
- [Milan Jovanović — vertical slices em monólito modular](https://www.milanjovanovic.tech/blog/where-vertical-slices-fit-inside-the-modular-monolith-architecture)
- [Vaadin — organização de pacotes por funcionalidade](https://vaadin.com/docs/v25/building-apps/architecture/packages)
- [Vercel — versões de Python suportadas](https://vercel.com/docs/functions/runtimes/python/python-version)
- [Vercel — limite de 4,5 MB no corpo da requisição](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)
- [MongoDB Atlas — limitações do plano gratuito](https://mongodb.com/docs/atlas/reference/free-shared-limitations/)
- [Sentry — preços (resumo de terceiros)](https://maple.dev/guides/sentry-pricing/)
- [Resend — plano gratuito (resumo de terceiros)](https://automationatlas.io/answers/resend-free-tier-explained-2026/)
- [Cloudflare R2 — preços](https://developers.cloudflare.com/r2/pricing/)
- [Vercel Blob — uso e preços](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Vercel — GitHub Actions com a Vercel](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel)
- [Vercel — Deployment Checks](https://vercel.com/docs/deployment-checks)
- [Neon — branches com GitHub Actions](https://neon.tech/docs/guides/branching-github-actions)
- [Vincent Driessen — A successful Git branching model (nota de 2020)](https://nvie.com/posts/a-successful-git-branching-model)
- [mkdocs-static-i18n](https://pypi.org/project/mkdocs-static-i18n/0.55)
- [Cloudflare — alertas de orçamento](https://developers.cloudflare.com/billing/manage/budget-alerts/)
- [Backblaze B2 — tetos de gastos e alertas](https://www.backblaze.com/docs/en/cloud-storage-data-caps-and-alerts)
- [Backblaze — guia de planos gratuitos](https://www.backblaze.com/blog/free-isnt-always-free-a-guide-to-free-cloud-tiers/)
- [Google — quando a verificação do app não é exigida](https://support.google.com/cloud/answer/13463817?hl=en)
- [Sentry — dados sensíveis (before_send)](https://docs.sentry.io/platforms/python/guides/falcon/data-management/sensitive-data/advanced-datascrubbing)
- [Sentry — privacidade e região de dados](https://sentry.io/trust/privacy/)
- [Vercel — plano Hobby (uso não comercial)](https://vercel.com/docs/plans/hobby)
- [Vercel — política de uso justo](https://vercel.com/docs/limits/fair-use-policy)
- [Paizo — Community Use Policy](https://paizo.com/community/communityuse/faq)
- [Paizo — licenças](https://paizo.com/licenses/)
