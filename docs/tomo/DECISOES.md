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
| Single Table Inheritance / JSONB | Uma tabela só, com o que é específico num JSON | Perde chaves estrangeiras e restrições; o projeto atual já saiu do JSONB por isso |

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

Dois pontos a confirmar:

- **5 KB por imagem é muito pouco.** Uma foto de 5 KB é praticamente um ícone de 64×64 pixels.
  O sistema atual comprime para até ~500 KB (`src/shared/lib/image.ts`). Era 5 KB mesmo, ou 500
  KB / 5 MB?
- **"3 imagens na biblioteca":** hoje o limite de 3 fotos é da **galeria de cada personagem**
  (`MAX_CHARACTER_PHOTOS = 3`), e a biblioteca não tem imagens. O limite é por personagem, por
  item de biblioteca ou outra coisa?

### P-006 — Algoritmo de senha

**Argon2id**, o primeiro da lista da OWASP (Password Storage Cheat Sheet), com no mínimo os
parâmetros da OWASP (19 MiB de memória, 2 iterações, paralelismo 1), ajustados para cerca de
250–500 ms por verificação. Biblioteca **pwdlib** com Argon2, que é a recomendada hoje pela
documentação do FastAPI. Na migração, toda conta vem com senha temporária e troca obrigatória no
primeiro login (o mecanismo de "forçar troca de senha" já existe hoje).

### P-007 — Outras propostas técnicas (já explicadas na conversa, decidir no roteiro)

- **FastAPI** como framework web, **SQLAlchemy 2.0** + **Alembic** (migrações), **uv** (pacotes),
  **pytest**, **ruff** (lint/format), **mypy** (checagem de tipos), **import-linter**.
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

## Abertas

| ID | Pergunta | Contexto |
| --- | --- | --- |
| Q-001 | Repo novo público ou privado? | No plano gratuito do GitHub, repo privado não aplica proteção de branches. Para portfólio, público costuma ser melhor (sem segredos no código, que nunca deveriam estar lá de qualquer forma). |
| Q-002 | Redirecionar o domínio do app antigo para o Tomo no dia da troca? | Só serve para quem tem o link antigo salvo cair no app novo. Com menos de 3 usuários, pode ser só avisar. |
| Q-003 | Migrar o histórico de auditoria antigo? | Registra logins e ações administrativas. Serve para investigar incidentes. Com menos de 3 usuários, alternativa: guardar o antigo como arquivo exportado e o Tomo começar com auditoria limpa. |
| Q-004 | Um banco Upstash (Redis) por ambiente, ou um só? | Proposta: um por ambiente, para os testes de staging não bloquearem logins de produção. |
| Q-005 | Valores e alcance dos limites de imagem | Ver P-005 |

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
| **mypy** | Verificador de tipos do Python. Lê as anotações (`def f(x: int) -> str`) e acusa erros de tipo **antes** de rodar o código, como o `tsc` faz no TypeScript. |
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
  este registro e o roteiro.

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
