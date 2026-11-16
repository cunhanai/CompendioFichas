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

UUID: proposta de usar **UUIDv7** nos registros novos. Ele é ordenado por tempo, o que deixa os
índices mais eficientes que o UUIDv4. O Python 3.14 gera nativamente com `uuid.uuid7()`. Os UUIDs
antigos (v4) são mantidos como estão na migração.

### P-002 — Dividir o "core" em módulos com responsabilidade clara

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

### P-003 — Organização do código: por módulo primeiro, camadas dentro

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

### P-008 — Aproveitar o padrão Python do trabalho (`app-contabil`)

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

## Abertas

| ID | Pergunta | Contexto |
| --- | --- | --- |
| Q-001 | Repo novo público ou privado? | No plano gratuito do GitHub, repo privado não aplica proteção de branches. Para portfólio, público costuma ser melhor (sem segredos no código, que nunca deveriam estar lá de qualquer forma). |
| Q-002 | Redirecionar o domínio do app antigo para o Tomo no dia da troca? | Só serve para quem tem o link antigo salvo cair no app novo. Com menos de 3 usuários, pode ser só avisar. |
| Q-004 | Um banco Upstash (Redis) por ambiente, ou um só? | Proposta: um por ambiente, para os testes de staging não bloquearem logins de produção. |
| Q-005 | Confirmar os valores de imagem propostos (1600 px, 500 KB, WebP) | Ver P-005 |
| Q-007 | Como guardar os snapshots de nível sem JSON? | No sistema atual, cada snapshot é a ficha inteira serializada em JSON (texto). Pela D-026 isso não pode mais. Opções: (a) tabelas relacionais de snapshot espelhando as da ficha; (b) cada snapshot como uma linha de `sheets` marcada como "versão congelada", reaproveitando as mesmas tabelas; (c) guardar só o que mudou entre níveis. Decidir na etapa 10. |
| Q-008 | Onde ficam os logs e os erros? | A Vercel no Hobby guarda poucos logs por pouco tempo e não permite log drain; o Elastic hospedado só tem teste de 14 dias. Proposta: Sentry gratuito (erros e logs) + logs estruturados na Vercel. Ver resposta de 2026-11-16 no chat. |

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
| **ADR** | Architecture Decision Record: uma página curta por decisão de arquitetura (contexto, decisão, consequências). |
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
