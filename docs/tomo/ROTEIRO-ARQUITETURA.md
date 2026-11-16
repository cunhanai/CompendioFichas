# Tomo — roteiro de definição da arquitetura

Passo a passo para definir o Tomo inteiro, do macro ao micro: produto, requisitos, banco, código,
integrações, frontend, DevOps e documentação. Cada etapa termina num entregável escrito e nas
decisões registradas em [`DECISOES.md`](./DECISOES.md). Só se avança quando a etapa anterior
estiver confirmada.

## Método

O roteiro combina três práticas usadas em empresas:

- **arc42**: um modelo de documentação de arquitetura em 12 seções. Ele funciona como checklist
  do que precisa ser definido. Cada seção é opcional, mas pular uma tem que ser uma escolha
  consciente.
- **C4**: os diagramas em 4 níveis de zoom (contexto → contêineres → componentes → código). É o
  "macro ao micro" desenhado.
- **ADR** (Architecture Decision Record): cada decisão importante vira uma página curta com
  contexto, opções consideradas, decisão e consequências. No repo novo ficam em `docs/adr/`.

A ordem vai do problema para a solução e do geral para o específico. As etapas 10 a 13 (banco,
backend, API e frontend) se repetem por módulo: primeiro os módulos da plataforma, depois o
`pathfinder_1e`.

```
Etapas 0–5   O QUÊ e POR QUÊ   método, visão, inventário, requisitos, restrições, contexto
Etapas 6–9   COMO, no macro    estratégia, módulos, implantação, conceitos transversais
Etapas 10–14 COMO, no micro    banco, backend, API, frontend, fluxos (por módulo)
Etapas 15–17 FECHAMENTO        qualidade e riscos, plano de construção e migração, portfólio
```

## Etapa 0 — Regras do jogo

**Objetivo:** combinar como decidimos e onde registramos.

- [ ] Modelo de ADR (contexto, opções, decisão, consequências, status)
- [ ] Estrutura da documentação do repo novo: `docs/architecture/` (seções arc42), `docs/adr/`,
      `docs/diagrams/` (C4 em Mermaid), `docs/migration/de-para/`
- [ ] Ferramenta de diagramas (Mermaid, que o GitHub desenha sozinho, ou Structurizr)
- [ ] Idioma da documentação e do código (ex.: docs em português, código e banco em inglês)
- [ ] Convenção de nomes de branches e commits (Conventional Commits)

**Entregável:** esqueleto de `docs/` + ADR-0001 "Como registramos decisões".

## Etapa 1 — Visão, objetivos e escopo (arc42 §1)

**Objetivo:** dizer em uma página o que o Tomo é, para quem e o que ele não é.

- [ ] Problema que o Tomo resolve e proposta de valor
- [ ] Personas e papéis: jogador, mestre? (existe hoje?), mantenedor da biblioteca, admin, master
- [ ] Objetivos do produto (ex.: fichas sempre corretas pelas regras; acessível no celular)
- [ ] Objetivos de portfólio (o que precisa ficar demonstrável)
- [ ] Fora do escopo (ex.: rolagem de dados online? mesa virtual? app nativo?)
- [ ] Sistemas de RPG e ordem de entrada (Pathfinder 1e primeiro; Vampiro e Dune depois)
- [ ] Os 3 a 5 **objetivos de qualidade** mais importantes, em ordem (ex.: segurança dos dados,
      manutenibilidade, usabilidade no celular, custo zero)

**Entregável:** `docs/architecture/01-introducao-e-objetivos.md`.

## Etapa 2 — Inventário do sistema atual

**Objetivo:** aplicar a regra "só entra o que for confirmado". Listar tudo o que o Compêndio faz
hoje e marcar cada item como **entra igual**, **entra mudado** ou **não entra**.

- [ ] Telas e funcionalidades (base: o detalhamento funcional das telas já escrito)
- [ ] Mecânicas e regras de cálculo do Pathfinder (base: `src/entities/character/model/`)
- [ ] Snapshots de nível (árvore, restauração, exclusão)
- [ ] Biblioteca compartilhada (10 categorias, PT/EN, lixeira)
- [ ] Contas e administração (master, admin, criação sem cadastro público, troca forçada de senha)
- [ ] Segurança (limite de tentativas, auditoria, alertas)
- [ ] Novidades/changelog, compartilhamento de ficha, galeria de fotos, favorito, lixeira
- [ ] Itens do BACKLOG atual (mantenedor, solicitações, configurações...)

**Entregável:** `docs/migration/inventario.md` (tabela item × decisão × observação).

## Etapa 3 — Requisitos

**Objetivo:** transformar visão e inventário em requisitos verificáveis.

- [ ] **Funcionais:** casos de uso por área, cada um com ator, pré-condição, fluxo principal e
      alternativos
- [ ] **Matriz de permissões:** papel × ação (quem cria, vê, edita, exclui o quê)
- [ ] **Qualidade (não funcionais)** em cenários mensuráveis, cobrindo segurança, privacidade
      (LGPD: exportar/excluir os próprios dados?), confiabilidade, desempenho (ex.: editar um
      campo e ver a ficha recalculada em menos de 500 ms em 95% das vezes), disponibilidade,
      manutenibilidade, testabilidade, usabilidade, acessibilidade (WCAG AA?), internacionalização
      (PT/EN) e custo
- [ ] Volume esperado: usuários, fichas por usuário, fotos, tamanho da biblioteca

**Entregável:** `docs/architecture/requisitos.md` + seção 10 do arc42 (cenários de qualidade).

## Etapa 4 — Restrições (arc42 §2)

**Objetivo:** listar o que não é negociável, para nenhuma solução esbarrar nisso depois.

- [ ] Técnicas: Vercel Hobby (limites de função, tempo, tamanho), Neon gratuito (armazenamento,
      branches, janela de histórico), Python, React + Vite
- [ ] Organizacionais: uma desenvolvedora, orçamento zero, desenvolvimento só em nuvem
- [ ] Legais: LGPD, uso pessoal e não comercial (Hobby)
- [ ] Convenções: idioma, estilo de código, padrões de commit

**Entregável:** `docs/architecture/02-restricoes.md`.

## Etapa 5 — Contexto (C4 nível 1, arc42 §3)

**Objetivo:** desenhar o Tomo como uma caixa e tudo o que fala com ele.

- [ ] Atores (cada papel da etapa 1)
- [ ] Sistemas externos: Vercel, Neon, Upstash, armazenamento de fotos, Sentry, GitHub; e-mail?
      (hoje não existe envio de e-mail: recuperação de senha por e-mail entra?)
- [ ] O que entra e sai em cada ligação

**Entregável:** diagrama de contexto + `docs/architecture/03-contexto.md`.

## Etapa 6 — Estratégia da solução (arc42 §4)

**Objetivo:** as poucas decisões grandes que moldam todo o resto, cada uma como ADR.

- [ ] Estilo: monólito modular com clean architecture (confirmado em parte: D-009)
- [ ] Linguagens e frameworks: Python + FastAPI? React + Vite (D-007)
- [ ] Banco e organização em schemas (D-010, D-011)
- [ ] Estilo de API: REST + OpenAPI? (alternativas: GraphQL, RPC)
- [ ] Onde ficam regras e cálculos: só no backend (D-008)
- [ ] Autenticação: sessão em cookie (como hoje) ou token? Hash Argon2id (P-006)
- [ ] Hospedagem: Vercel (D-006); plano de saída se precisar (Docker)

**Entregável:** `docs/architecture/04-estrategia.md` + ADRs 0002 em diante.

## Etapa 7 — Domínio e módulos

**Objetivo:** dividir o Tomo em módulos com fronteiras claras (DDD estratégico).

- [ ] **Linguagem ubíqua:** glossário do domínio (ficha, sistema, snapshot, biblioteca, item...)
      e o nome em inglês de cada termo para o código
- [ ] **Módulos** e a responsabilidade de cada um (proposta P-002: identity, platform, sheets,
      audit, support, um por sistema)
- [ ] **Mapa de dependências:** quem pode chamar quem (sistemas dependem da plataforma, nunca o
      contrário; sistemas não se conhecem)
- [ ] Como um módulo conversa com outro: interface pública síncrona e/ou eventos internos (ex.:
      "ficha excluída" → auditoria registra)
- [ ] Módulo ↔ schema do banco (1 para 1?)
- [ ] Modelo das fichas: envelope + detalhes por sistema (P-001)

**Entregável:** diagrama de módulos + `docs/architecture/05-blocos.md` (nível 1).

## Etapa 8 — Contêineres e implantação (C4 nível 2, arc42 §7) — DevOps

**Objetivo:** como o Tomo roda, onde e como chega lá.

- [ ] Contêineres: site estático, API, Postgres, Redis, armazenamento de fotos
- [ ] Ambientes (local, staging, produção): domínios, branch git, branch de banco, variáveis
- [ ] DNS, HTTPS, cookies entre `tomo` e `tomo-api`, CORS
- [ ] Repositório: monorepo, ferramentas (pnpm, uv), proteção de branches, público ou privado
- [ ] CI: o que roda em cada PR (lint, tipos, import-linter, testes, build, checagem de
      migração, auditoria de dependências)
- [ ] CD: como e quando faz deploy; migrações aplicadas pela CI; versão e changelog
- [ ] Segredos: onde ficam, quem acessa, rotação
- [ ] Desenvolvimento local: como subir API + front + banco (Docker Compose? branch Neon `dev`?)
- [ ] Atualização de dependências (Renovate/Dependabot)

**Entregável:** diagrama de contêineres e de implantação + `docs/architecture/07-implantacao.md`.

## Etapa 9 — Conceitos transversais (arc42 §8)

**Objetivo:** decidir uma vez as regras que valem para todos os módulos.

- [ ] **Segurança:** autenticação, sessões, papéis e permissões, Argon2id, limite de tentativas,
      CSRF, CORS, cabeçalhos de segurança, validação de entrada, uploads, segredos
- [ ] **Erros:** formato padrão de erro da API (ex.: RFC 9457 "Problem Details"), códigos HTTP
- [ ] **Observabilidade:** logs estruturados, id de requisição, Sentry, métricas, alertas
- [ ] **Auditoria:** o que é auditado e por quanto tempo
- [ ] **Configuração:** variáveis de ambiente validadas (pydantic-settings) + configurações no
      banco (P-005)
- [ ] **Dados:** IDs (UUIDv7), datas e fuso horário (UTC no banco), exclusão lógica e lixeira,
      concorrência (duas abas editando a mesma ficha: versão otimista?)
- [ ] **Internacionalização:** PT/EN na interface e na biblioteca
- [ ] **Arquivos:** onde ficam as fotos, tamanhos, formatos, limpeza
- [ ] **Desempenho:** cache, paginação, limites de tamanho de requisição
- [ ] **API:** versionamento, paginação, filtros, ordenação, idempotência
- [ ] **Testes:** pirâmide (unidade no domínio, integração com banco real, ponta a ponta no
      navegador), meta de cobertura, dados de teste
- [ ] **Qualidade de código:** ruff, mypy (modo estrito?), import-linter, pre-commit, revisão
- [ ] **Backup, restauração e migrações:** política (proposta P-007)
- [ ] **Privacidade:** LGPD, exclusão de conta, exportação de dados

**Entregável:** `docs/architecture/08-conceitos-transversais.md` + ADRs.

## Etapa 10 — Banco de dados (por módulo)

**Objetivo:** o modelo físico de cada schema.

- [ ] Convenções gerais: nomes (inglês, `snake_case`, plural?), PK UUIDv7, `created_at` /
      `updated_at` / `deleted_at`, chaves estrangeiras, `ON DELETE`, `CHECK`, índices, enums
      (tipo Postgres ou tabela?)
- [ ] Papéis e permissões por schema (ex.: app só insere em `audit`)
- [ ] Modelo entidade-relacionamento de cada schema
- [ ] Integridade do envelope de fichas (P-001)
- [ ] Migrações com Alembic: organização com vários schemas, uma linha do tempo só ou uma por
      módulo
- [ ] Dados iniciais (seeds) e dados de demonstração
- [ ] **Tabela "de → para"** do módulo: cada coluna antiga → destino novo ou "descartada"

**Entregável:** diagrama ER + `docs/database/<schema>.md` + `docs/migration/de-para/<schema>.md`.

## Etapa 11 — Backend (C4 nível 3, por módulo)

**Objetivo:** a estrutura interna do código.

- [ ] Organização das pastas: por módulo primeiro ou por camada primeiro (P-003)
- [ ] Regras entre camadas e módulos, escritas como contratos do import-linter
- [ ] **Domínio:** entidades, objetos de valor, regras (Python puro); dataclasses ou Pydantic?
- [ ] **Aplicação:** casos de uso (um por ação), interfaces (ABC) de repositórios e serviços
- [ ] **Infraestrutura:** repositórios SQLAlchemy, Redis, fotos, hash de senha
- [ ] **Apresentação:** rotas FastAPI, modelos Pydantic de entrada e saída
- [ ] Transações (Unit of Work), injeção de dependência, tratamento de erros entre camadas
- [ ] Onde moram as regras de cálculo de cada sistema e como recalcular a ficha

**Entregável:** diagrama de componentes + `docs/architecture/05-blocos.md` (nível 2) + esqueleto
do código.

## Etapa 12 — Contrato da API (por módulo)

**Objetivo:** cada rota que o front vai usar.

- [ ] Recursos e rotas por caso de uso (método, URL, permissão)
- [ ] Corpo de entrada e saída de cada rota
- [ ] Erros possíveis por rota
- [ ] Convenções de paginação, filtros e ordenação aplicadas
- [ ] Geração do cliente TypeScript a partir do OpenAPI

**Entregável:** OpenAPI revisado (gerado pelo código) + `docs/api/convencoes.md`.

## Etapa 13 — Frontend

**Objetivo:** a arquitetura do app React, ligada ao design que vem do Claude Design.

- [ ] Estrutura de pastas (Feature-Sliced Design como hoje, ou outra)
- [ ] Rotas e proteção por papel
- [ ] Busca e cache de dados (TanStack Query), estados de carregamento, erro e vazio
- [ ] Formulários e validação (o que valida no front, sabendo que o back é a referência)
- [ ] Como mostrar o recálculo vindo da API ao editar a ficha (sem travar a digitação)
- [ ] Design system: tokens (cores, tipografia, espaçamento) vindos do Claude Design, componentes
      base, modo claro/escuro
- [ ] Acessibilidade, responsividade (celular primeiro?), internacionalização
- [ ] Testes: componentes (Vitest + Testing Library) e ponta a ponta (Playwright)

**Entregável:** `docs/architecture/frontend.md` + esqueleto do app.

## Etapa 14 — Fluxos críticos (arc42 §6)

**Objetivo:** desenhar, passo a passo entre front, API e banco, os fluxos que não podem falhar.

- [ ] Login, logout, troca forçada de senha
- [ ] Criar ficha (escolha do sistema → envelope + detalhes)
- [ ] Editar ficha e receber o recálculo
- [ ] Subir de nível (snapshot automático) e restaurar snapshot
- [ ] Compartilhar ficha; enviar e remover foto
- [ ] Lixeira: excluir, restaurar, excluir para sempre
- [ ] Admin: criar usuário, redefinir senha, desativar conta
- [ ] Solicitação de alteração na biblioteca, do pedido à aplicação

**Entregável:** diagramas de sequência em `docs/architecture/06-execucao.md`.

## Etapa 15 — Qualidade, riscos e ameaças (arc42 §10–11)

- [ ] Conferir cada cenário de qualidade da etapa 3 contra a arquitetura
- [ ] Modelagem de ameaças simples (STRIDE) dos fluxos da etapa 14
- [ ] Lista de riscos e dívidas técnicas aceitas

**Entregável:** `docs/architecture/10-qualidade.md` e `11-riscos.md`.

## Etapa 16 — Plano de construção e migração

- [ ] Ordem de construção em fatias verticais (uma funcionalidade inteira de cada vez: banco →
      API → tela)
- [ ] Marcos e critério de pronto de cada um
- [ ] Script de migração a partir das tabelas "de → para", ensaios e verificação
- [ ] Backup do banco atual antes de tudo
- [ ] Dia da troca e plano de volta

**Entregável:** `docs/migration/plano.md` + backlog do repo novo.

## Etapa 17 — Portfólio

- [ ] README do repo com visão, diagramas, stack, como rodar e links
- [ ] Documentação de arquitetura navegável (arc42 + ADRs)
- [ ] Ambiente de demonstração com dados fictícios
- [ ] Selos de CI e cobertura, changelog, licença

**Entregável:** repo pronto para mostrar.

## Onde estamos

- [x] Decisões iniciais registradas em `DECISOES.md`
- [ ] **Próximo passo: Etapa 0**, depois Etapa 1 (visão e escopo)

## Fontes

- [arc42 — as 12 seções](https://arc42.org/overview) e [documentação do arc42](https://docs.arc42.org/home/)
- [Modelo C4 (Wikipedia)](https://www.wikipedia.org/wiki/C4_model)
- [Milan Jovanović — visualizar arquitetura com C4](https://milanjovanovic.tech/blog/visualize-your-software-architecture-with-the-c4-model.md)
- [import-linter](https://import-linter.readthedocs.io/en/stable/contract_types/)
