# Compêndio de Fichas — notas de design e regras do produto

Mockup em Tailwind (para futura migração a React) do sistema de fichas de RPG multi-usuário/multi-sistema. Arquivo principal: `Compendio de Fichas.dc.html` + componentes filhos (`SystemCard`, `CharCard`, `SheetTab`, `FieldView`, `AbilityScore`, `WeaponRow`, `SkillRow`).

## Escopo desta rodada
Apenas o sistema **Pathfinder 1ª Edição** foi implementado/mockado. Outros sistemas (Dune: Aventuras, Tormenta20, Vampiro: A Máscara) aparecem na listagem só como contexto de multi-sistema, alguns marcados "em breve".

## Regras de produto (fornecidas pelo usuário)

### Usuários e sistemas
- Login básico (e-mail/senha). Cadastro com e-mail, senha e nome de usuário.
- Usuário acessa os sistemas de RPG disponíveis para ele; ao selecionar um, vê a lista de personagens dele naquele sistema.
- Um sistema pode estar **ativo**, **inativo** ou **favoritado**.
  - Um sistema é ativo se contiver pelo menos um personagem ativo.
  - Sistema inativo ainda pode ser acessado — é só um marcador de organização; a lista de personagens e as fichas continuam acessíveis.
  - Favoritos aparecem no topo da lista e também em destaque no dashboard.
  - O logotipo do sistema aparece junto do nome (placeholder de logo nos cards).
- Um sistema contém, além das fichas de personagem: fichas de monstros (para mestre — **não implementado nesta rodada**, mas a navegação já reserva um ícone/entrada para isso) e uma **biblioteca compartilhada** (magias, talentos, perícias, habilidades, armas, idiomas, criaturas) — implementada como tela própria com abas por categoria e fluxo de "buscar/adicionar" a partir da ficha.

### Personagens
- Uma ficha pode estar ativa, inativa, favoritada, e compartilhável via link somente leitura.
  - Personagem ativo = está em uso atual pelo jogador (o próprio jogador decide).
  - Favoritado aparece fixado no topo da lista de personagens **e** em card de destaque no dashboard (decisão de design, ver abaixo).
- Listagem de personagens mostra: nome, foto, raça, classe(s) com nível, descrição de uma linha.
- Ficha é criável, editável e salvável; fora do modo de edição fica em modo de visualização.
- Multiclasse: cada classe tem nome + nível; soma dos níveis = nível efetivo.

### Conteúdo da ficha (Pathfinder 1e)
Nome, raça, classes/níveis, nível efetivo, tendência, divindade, tamanho, sexo, idade, altura, cabelo, olhos, história, histórico de snapshots por nível, registro de sessões (com snapshot de fim de sessão e contador de sessões), pontos de vida (atual/máximo, dano letal/não letal, PV temporários), redução de dano e imunidades, atributos (base/temporário/total/modificador, com a fórmula padrão de Pathfinder), exportar em PDF (botão sem função), iniciativa (Destreza + variado), velocidades (base/armadura/voar/nadar/escalar/cavar, em metros e quadrados de 1,5 m), Classe de Armadura completa (com CA de toque e desprevenido), Jogadas de Resistência (Fortitude/Reflexo/Vontade), BBA/BMC/DMC, Resistência a Magia, idiomas, condições ativas, experiência (com toggle para desligar o uso de XP), perícias (fixas, de classe, treinadas, com modificadores condicionais em lista livre), armas (puxadas da biblioteca, editáveis por personagem), magias (espontâneas, preparadas e similares a magia, com escolas de magia focada/oposta), talentos e habilidades especiais, espaço reservado para familiar/animais e para plano de evolução por nível (**não implementados**, apenas reservados no layout), dinheiro (PC/PP/PO/PL — no mockup fica na aba Itens, não em Geral), inventário (equipamentos e itens de CA) com cálculo de peso e carga (leve/média/pesada/erguer/arrastar).

## Decisões de design tomadas ao longo da conversa

1. **Direção visual**: escuro, temático de fantasia (fundo quase preto, acento dourado/âmbar, PV em vermelho/rosa). Foi uma escolha explícita do usuário — este mockup usa **Tailwind** em vez do design system Broadsheet (jornal), a pedido do usuário, pois o objetivo é a conversão futura para React.
2. **Layout responsivo**: sidebar de navegação no desktop, bottom bar no mobile — ambos **somente ícones**, sem rótulo de texto fixo (o título da seção aparece no cabeçalho da própria tela, não no item de navegação).
3. **Personagem favoritado**: fica fixado no topo da lista de personagens *e* ganha um card de destaque na tela inicial (dashboard), ao lado dos acessos a sistemas e do histórico de acessados recentemente.
4. **Ficha com abas**: Geral, Combate, Perícias, Magias, Talentos, Itens, Histórico — nas abas da ficha, o rótulo de texto só aparece na aba atualmente selecionada; as demais mostram apenas o ícone.
5. **Sem scroll lateral em nada** — listas e grades usam wrap/flex em vez de overflow horizontal.
6. **Cálculos "ocultos, mas auditáveis"**: valores calculados (CA, Jogadas de Resistência, atributos, iniciativa, BMC/DMC) mostram só o resultado na ficha; um clique abre um popup com o detalhamento do cálculo. Da mesma forma, clicar num atributo individual, num talento, numa habilidade especial ou numa habilidade similar a magia abre um popup com a descrição completa do item.
7. **Modo de edição**: alterna campos entre texto estático e inputs editáveis (identidade, história, atributos base/temporário, bônus de CA); no modo de visualização, os controles de PV (dano/cura, PV temporário) continuam ativos mesmo fora da edição, porque representam ações de combate.
8. **PV temporário**: pode ser adicionado (botão "+") e limpo manualmente (botão "×"), pois no Pathfinder ele não é "curado" — é gasto ou expira e é removido à mão.
9. **Biblioteca compartilhada**: tela própria com abas por categoria (Magias, Talentos, Perícias, Habilidades, Armas, Idiomas, Criaturas); dentro da ficha, os botões "Buscar" abrem modais de busca que permitem tanto vincular um item existente (com feedback visual de "adicionado") quanto cadastrar um item novo direto do fluxo da ficha.
10. **Dinheiro** vive na aba Itens (Inventário), não na aba Geral — decisão de reorganização a pedido do usuário.
11. **Ícone de Talentos**: trocado de estrela (que conflitava com o ícone de favorito) para um ícone de medalha/insígnia.

## Fórmulas de cálculo (Pathfinder 1e) fornecidas pelo usuário

- **Modificador de atributo**: total = base + temporário. Modificador = a cada 2 pontos acima de 10, +1; a cada 2 pontos abaixo de 10, −1 (ex.: Força 10 → mod +0; Carisma 6 → mod −2; Inteligência 13 → mod +1; Constituição 14 → mod +2; Sabedoria 9 → mod −1).
- **Iniciativa** = modificador de Destreza + modificador variado (editável).
- **Velocidades**: valores em metros, com base, com armadura, voar, nadar, escalar, cavar; voar tem categoria de manobrabilidade (texto editável); cada velocidade mostra também a quantidade de quadrados, a 1 quadrado por 1,5 m.
- **Classe de Armadura (CA)** = 10 + bônus de armadura (editável) + bônus de escudo (editável) + modificador de Destreza + modificador de tamanho (conforme o tamanho do personagem) + armadura natural (editável) + modificador de deflexão (editável) + modificador variado (editável). CA de Toque e CA Desprevenido são editáveis à parte.
- **Jogadas de Resistência** (Fortitude = Constituição, Reflexo = Destreza, Vontade = Sabedoria) = base editável + modificador do atributo correspondente + modificador mágico (editável) + modificador variado (editável) + modificador temporário (editável).
- **Bônus de Manobra de Combate (BMC)** = BBA + modificador de Força + modificador de tamanho.
- **Defesa de Manobra de Combate (DMC)** = 10 + BBA + modificador de Força + modificador de Destreza.
- **Perícias**: valor = modificador do atributo associado + graduação (editável) + modificador variado (editável); se a perícia for "de classe" e tiver ao menos 1 graduação, soma-se +3 ao modificador variado. Modificadores condicionais (ex.: "Furtividade com armadura pesada −5") ficam numa lista separada, fora das somas padrão.
- **Peso de equipamento** = quantidade × peso unitário (kg).
- **Carga**: soma do peso de todos os equipamentos e itens de CA determina se o personagem está em carga leve, média ou pesada, contra 6 valores editáveis (carga leve, carga média, carga pesada, erguer sobre a cabeça, erguer do chão, arrastar ou empurrar).

## Regras e decisões adicionais (rodadas seguintes de refinamento)

### Edição da identidade e progressão do personagem
- No modo de edição, a foto do personagem ganha um botão de câmera sobreposto que abre um popup de troca de foto (placeholder de upload); o nome também passa a ser um campo de texto editável no cabeçalho da ficha.
- Adicionar uma classe abre um popup de seleção de classe (lista de classes ainda não presentes no personagem); a classe entra no nível 1.
- Existe um botão "Upar de nível" que abre um popup para escolher em qual classe o próximo nível entra — só é possível subir **1 nível efetivo por vez**, mesmo em personagens multiclasse.
- Nível efetivo é sempre a soma dos níveis de todas as classes, calculado automaticamente.

### Favoritar, compartilhar e status ativo/inativo do personagem
- O botão de favoritar é clicável e tem dois estados visuais: estrela preenchida (favoritado) e estrela apenas com contorno (não favoritado).
- Compartilhamento: se a ficha ainda não está compartilhada, o botão abre um popup de confirmação; confirmando, o mesmo popup passa a mostrar o link somente leitura para copiar. Se a ficha já estiver compartilhada, o botão vai direto para o popup do link. Esse popup também tem um botão para **parar de compartilhar**.
- Na listagem de personagens, o ícone de "compartilhado" em cada card também é clicável e abre o mesmo popup do link.
- Existe um botão dedicado para marcar o personagem como **ativo/inativo** no cabeçalho da ficha. Um personagem inativo funciona como **arquivado**: a ficha não pode ser editada (o botão de editar fica desabilitado) até ele ser reativado.

### Cálculos com popup de detalhamento
- Clicar em CA, Jogadas de Resistência, Iniciativa, Atributos (em grupo) ou Manobras de Combate abre um popup com o detalhamento do cálculo.
- O popup da **Classe de Armadura** tem abas no topo para alternar entre CA total, CA de Toque e CA Desprevenido, um botão de editar dentro do próprio popup, e a edição é **inline** — cada linha do detalhamento (Armadura, Escudo, Armadura natural, Deflexão) se transforma no próprio campo de edição, sem um bloco de formulário separado. A edição dos componentes só é feita a partir da aba "CA" (as abas de Toque/Desprevenido são derivadas dos mesmos valores). A CA tem uma lista de **modificadores variados** (descrição + valor) que pode ser adicionada/removida independentemente, e esses modificadores aparecem discriminados (um a um) mesmo fora do modo de edição, não apenas como uma soma.
- Cada atributo individual (Força, Destreza, etc.) abre seu próprio popup, editável do mesmo jeito que a CA (base e temporário editáveis inline, total e modificador calculados automaticamente) e com sua **própria lista independente de modificadores variados**, também discriminada mesmo fora da edição.
- Clicar em um talento, habilidade especial ou habilidade similar a magia abre um popup com a descrição completa do item.

### Condições ativas
- Condições ativas, PV, CA e Iniciativa ficam juntos no topo da ficha, visíveis em todas as abas.
- Um botão "+" abre um popup para adicionar uma condição ativa: pode-se digitar e adicionar uma condição nova diretamente (inline) ou buscar/selecionar uma já cadastrada na biblioteca compartilhada.
- Clicar em uma condição ativa já listada a remove da lista.

### Compartilhar e exportar (segunda revisão) e ativo/inativo
- O botão de marcar ativo/inativo passou a ser um **switch** (toggle), em vez de um botão de ícone.
- O botão de exportar em PDF deixou de ser um botão isolado no cabeçalho: ele agora vive **dentro do popup de compartilhar**, que ganhou duas abas no topo — "Link público" (fluxo de ativar/copiar/parar de compartilhar) e "Download" (o botão de exportar em PDF, ainda sem função).

### Modificadores variados — indicador visual e popup de Iniciativa
- Todo modificador variado (na CA, na Iniciativa, nos atributos) é marcado com uma **bolinha laranja** ao lado do nome, tanto na lista de edição quanto na visualização discriminada fora da edição — para diferenciar visualmente esses modificadores dos componentes fixos do cálculo.
- O popup de **Iniciativa** ganhou o mesmo padrão de edição do popup de CA: botão de editar dentro do popup, modificador de Destreza mostrado como referência (não editável ali, pois vem do atributo), e uma lista própria e independente de modificadores variados (descrição + valor) que pode ser adicionada/removida e fica discriminada mesmo fora da edição.

### Condições ativas (segunda revisão) e classes/nível (ajustes finos)
- Clicar em uma condição ativa não a remove direto — abre um popup de confirmação ("Remover condição?") com o nome da condição; só é removida se o usuário confirmar.
- No popup "Upar de nível", além de escolher entre as classes já existentes do personagem, há uma opção "Nova classe (nível 1)" que abre o popup de adicionar classe — abrir uma classe nova no nível 1 também conta como o +1 nível efetivo daquela subida.
- No popup de adicionar classe, além de escolher de uma lista de classes conhecidas, é possível digitar e adicionar uma classe que não está na lista (campo de texto livre + botão "Adicionar").
- Espaçamento entre os botões de abas da ficha (Geral, Combate, Perícias...) reduzido para ficarem mais compactos.

### Idiomas — mesmo padrão de condições
- Idiomas ganharam o mesmo botão "+" (quadrado escuro com ícone de mais) usado em outras listas da ficha, no canto da lista de chips.
- Adicionar idioma abre o mesmo tipo de popup usado para condições: busca/seleção de um idioma já cadastrado na biblioteca **ou** adição direta de um nome digitado.
- Clicar em um idioma já ativo não remove direto — abre um popup de confirmação ("Remover idioma?"), no mesmo padrão do de condições.

- Padronizado: o botão "+" de adicionar idioma e o de adicionar condição ativa usam o mesmo estilo — círculo com borda tracejada.

- Corrigido: os botões de abas da ficha não preenchiam sua célula da grade (sobrava espaço vazio entre eles); agora ocupam 100% da largura da célula, ficando visualmente colados.

### Cabeçalho da ficha no mobile
- No celular, o cabeçalho da ficha reorganiza em duas linhas: os botões de ação (ativo/inativo, favoritar, compartilhar, editar) ficam em uma linha própria **no topo**, acima do avatar e do nome — não abaixo. A partir do breakpoint `sm`, tudo volta a ficar numa única linha, como no desktop.
- O breadcrumb (Início / Sistemas / Sistema / Personagem) passou a rolar horizontalmente em vez de quebrar em várias linhas no mobile.

### Modo de edição: de global para por componente
- O modo de edição deixou de ser um botão único no cabeçalho da ficha que alternava a ficha inteira entre "ver" e "editar". Agora **cada componente editável tem seu próprio botão de edição**, que abre um popup dedicado com os campos e um botão "Salvar" — no mesmo padrão visual do popup de CA e do de Iniciativa.
- Componentes com edição própria agora: Identidade (nome + raça/tamanho/sexo/idade/altura/cabelo/olhos/divindade/tendência, num só popup), Classes e níveis (popups de adicionar classe / upar de nível, sempre acessíveis), Atributos (popup por atributo), CA, Iniciativa. Os botões de adicionar classe e upar de nível deixaram de depender de um modo de edição global — ficam sempre visíveis (desde que o personagem esteja ativo).
- Foto do personagem: o botão de câmera sobre o avatar para trocar a foto agora é sempre visível (antes só aparecia em modo de edição).
- Os popups de CA, Iniciativa e Atributos ganharam um botão "Salvar" ao final da área de edição, junto do ícone de editar que já existia — clicar em Salvar sai do modo de edição do popup.
- **História do personagem**: na aba Geral aparece um resumo truncado (3 linhas) com um botão "Ler mais", que abre um popup com o texto completo. Dentro desse popup fica o botão de editar, que troca para uma área de texto editável com botão "Salvar".
- Personagem inativo continua bloqueando a edição: os botões de editar dos componentes só aparecem/funcionam quando o personagem está marcado como ativo.

### Tendência como duas listas selecionáveis
- No popup de editar identidade, Tendência deixou de ser um campo de texto livre e virou dois grupos de botões seleção única: ordem (Ordeiro/Neutro/Caótico) e moral (Bom/Neutro/Mau).
- No resumo do topo da ficha (ao lado do nível efetivo), a tendência aparece abreviada pelas iniciais da combinação escolhida — ex.: OB, ON, OM, NB, NM, CB, CN, CM — com uma exceção: quando é Neutro/Neutro, mostra só "N" (não "NN"). No card de Identidade, o valor continua por extenso (ex.: "Caótica Boa").

- Tamanho passou a ser uma lista selecionável (Miúdo, Diminuto, Pequeno, Médio, Grande, Enorme, Colossal) em vez de texto livre.
- Idade e Altura só aceitam números na edição (sem a palavra "anos"/"m" no campo); a unidade aparece fixa ao final, só na visualização (ex.: "24 anos", "1.68 m").

### Refinos de Combate: atributos, CA duplicada, XP e resistências
- Popup de Atributos redesenhado como tabela (nome, base, temp, total + modificador em destaque) em vez de texto corrido — mais fácil de ler.
- Removido o card "Classe de Armadura" da aba Combate, já que a CA já aparece no topo da ficha (quick-stats) e no seu próprio popup detalhado; evita duplicidade.
- Experiência: o interruptor de ativar/desativar deixou de ficar visível na tela — agora só é alternado dentro do popup de edição de XP (aberto pelo lápis do card).
- Popup de Jogadas de Resistência: reestruturado com abas Fortitude/Reflexo/Vontade (mesmo padrão do popup de CA), cada uma com seu detalhamento (base, modificador do atributo, mágico, variado, temporário) e edição própria com botão Salvar.

### Condições ativas removidas; histórico de PV adicionado
- O recurso de "Condições ativas" foi removido do produto (barra na aba Geral, popups de adicionar/remover). Não existe mais na ficha.
- PV temporário: clicar em "+" agora soma 1 (antes somava 5).
- Clicar no card de Pontos de Vida abre um popup de histórico, listando cada ajuste (dano/cura/temp) na ordem em que ocorreu; cada linha tem um botão para remover aquele registro específico, o que desfaz o ajuste correspondente no PV atual — útil para corrigir um clique errado em combate.
- Atributos deixou de ficar dentro da aba Combate e passou a ficar fixo logo abaixo do card de Vida, visível em todas as abas da ficha (Geral, Combate, Perícias etc). CA e Iniciativa saíram do topo fixo e foram para dentro da aba Combate, junto de Jogadas de Resistência e Manobra de Combate.

### Reorganização da aba Combate
- Ordem: Iniciativa (card único) vem antes da Classe de Armadura.
- CA continua ao lado de Iniciativa (mesma linha, 2 colunas); CA de Toque e CA Desprevenido ficam em uma linha própria logo abaixo, no mesmo padrão de card. Todos os três abrem o mesmo popup detalhado com abas.
- BBA, BMC e DMC deixaram de ficar dentro de um único botão-wrapper com 3 colunas internas; agora são cards individuais clicáveis, no mesmo padrão dos cards de Iniciativa/CA.
- Resistência a Magia (RM) saiu da lista de badges de "Redução de dano, imunidades e RM" e passou a ser seu próprio card, posicionado ao lado do card de BBA. A seção de badges foi renomeada para "Redução de dano e imunidades".
- Cards de BBA e RM ganharam ícones (espada cruzando/atingindo para BBA, escudo com check para RM), no mesmo padrão visual dos ícones de CA/Iniciativa.

### Reorganização adicional: Iniciativa antes de CA, títulos de CA uniformizados, Deslocamento sob Identidade
- Iniciativa agora vem antes da Classe de Armadura na primeira linha de cards; CA de Toque e CA Desprevenido continuam na linha seguinte, na mesma ordem relativa.
- Os rótulos dos cards de CA/Toque/Desprevenido deixaram de usar texto colorido em destaque (azul) — agora usam o mesmo estilo neutro e discreto dos rótulos de BBA/BMC/DMC/RM, para consistência visual entre todos os cards de combate.
- Deslocamento deixou de ser um card próprio na aba Combate e passou a viver dentro do card de Identidade (aba Geral), acima de "Classes e níveis".

### Deslocamento como card próprio; espaçamento unificado acima das abas
- Deslocamento saiu de dentro do card de Identidade e voltou a ser um card independente na aba Geral, posicionado entre Identidade/Classes e níveis e Idiomas.
- A área fixa acima das abas (Pontos de Vida, Atributos, barra de abas) passou a usar o mesmo `gap-5` que separa os cards dentro de cada aba — antes usava margens ad-hoc (`mb-3`/`mb-6`) que abriam espaçamentos inconsistentes com o conteúdo das abas.

### Nível efetivo alinhado à esquerda quando quebra linha
- No card de Identidade, o bloco "Nível efetivo: N [Upar de nível]" deixou de usar `ml-auto` (que o empurrava à direita mesmo quebrando linha) e passou a `sm:ml-auto` — fica alinhado à esquerda quando quebra para a linha seguinte (mobile/poucas classes) e à direita da linha das classes em telas maiores.

### CA no padrão de Jogadas de Resistência (teste)
- CA de Toque e CA Desprevenido deixaram de ser cards numéricos próprios; CA (total) continua como card ao lado de Iniciativa, mas agora abre um segundo card no estilo de "Jogadas de resistência" — título + lista de linhas (CA / CA de Toque / CA Desprevenido) com valor à direita — em vez de 2 cards numéricos separados.

### CA card ao lado de Iniciativa substituído por Resistência a Magia
- O card único que ficava ao lado de Iniciativa mostrava CA total; agora mostra Resistência a Magia (mesmo ícone/posição do card de RM que já existia na fileira de BBA), e RM passou a usar a cor azul (sky) em vez de âmbar, consistente com a cor de CA. A comparação de CA completa/Toque/Desprevenido permanece disponível no card em lista, no padrão de Jogadas de Resistência.

### Card de personagem favorito no dashboard: modificadores em vez de descrição
- A linha de subtítulo do `CharCard` deixou de mostrar "· Nível N" ao final — como as classes já trazem seus próprios níveis (ex: "Feiticeira 3 / Clériga 2"), repetir o nível efetivo ali era redundante. Agora mostra só raça · classes.
- `CharCard` ganhou uma prop `mods` opcional: quando presente, substitui a linha de descrição de uma frase pelos modificadores de atributo do personagem (ex: "FOR +0 · DES +3 · CON +2 · INT +1 · SAB +2 · CAR +4"). Usado apenas no card de destaque de favorito no dashboard; a listagem normal de personagens continua mostrando a descrição de uma linha.

### Redução de dano/imunidades: posição e popup de adicionar
- O card "Redução de dano e imunidades" saiu da aba Combate e passou a ficar fixo logo abaixo do card de Vida (mesma área sempre visível que já tinha Vida e Atributos), visível em todas as abas.
- O botão "+" abre um popup: campo de texto livre para o tipo de dano, um interruptor "É imune a este tipo" e, quando não é imunidade, um campo numérico de quantidade de redução (RD). Cada badge da lista agora é clicável para removê-lo.

### Reordenação de Identidade + Peso e Terra Natal
- Ordem definida para visualização e edição de Identidade: Nome do personagem, Tendência, Raça, Sexo, Tamanho, Idade, Altura, Peso, Cabelo, Olhos, Divindade, Terra natal.
- Novos campos: Peso (kg) e Terra natal (texto livre), adicionados à ficha na mesma lógica dos demais campos de identidade.
- Idade, Altura e Peso, no modo de edição, usam um campo numérico colado a uma caixinha não editável com a unidade (ex: "24 | anos", "1,68 | m", "58 | kg") — visualmente uma caixa só dividida ao meio.

- No popup de adicionar redução/imunidade: "É imune a este tipo" renomeado para "Imunidade", "Quantidade de redução (RD)" renomeado para "Redução de dano", e os dois campos (Imunidade / Redução de dano) ficam lado a lado (grid de 2 colunas) em vez de empilhados.

### Vida máxima editável
- O card de Pontos de Vida ganhou um ícone de editar (lápis) ao lado do contador "atual/máximo", que abre um popup simples para editar o valor máximo de PV. Reduzir o máximo abaixo do PV atual ajusta o atual automaticamente para não passar do novo máximo.

### Deslocamento editável
- Deslocamento ganhou um botão de editar (lápis) que abre um popup com campos para Base, Com armadura, Voar (+ manobrabilidade em texto livre), Nadar, Escalar e Cavar, todos em metros. Cada valor com deslocamento > 0 mostra a distância convertida em quadrados (1 quadrado = 1,5 m); tipos zerados aparecem esmaecidos com "—", como já era o padrão para Voar/Nadar/Escalar/Cavar sem valor.

### Ajustes de identidade e deslocamento
- Ordem final de edição de Identidade: Nome, Tendência, Tamanho, Raça, Sexo, Idade, Altura, Peso, Cabelo, Olhos, Divindade, Terra natal — Raça e Sexo passaram a vir depois de Tamanho.
- Popup de editar Deslocamento: Base, Com armadura, Voar, Nadar, Escalar e Cavar agora usam o mesmo padrão de caixa dividida (número + unidade "m" fixa) já usado em Idade/Altura/Peso.

### Deslocamento: 2 por linha
- A grade de Deslocamento passou de "2 colunas no mobile, 4 no desktop" para fixa em 2 colunas em qualquer tela, no mesmo padrão usado nos campos de Identidade.

### Redesenho do card de Pontos de Vida
- O card de Vida ficou mais compacto: mostra só o contador atual/máximo, o badge de PV temporário (sem botão de limpar embutido) e, abaixo da barra, os badges de Redução de dano/imunidades — sem título e sem botão de "+" ali; eles são apenas leitura nessa posição, no lugar onde antes ficavam os botões -1/-5/+1/+5.
- Um ícone de lápis no canto do card abre um popup unificado "Pontos de vida" já em modo de edição; clicar no corpo do card (contador/barra) abre o mesmo popup em modo de leitura.
- O popup tem 3 abas: **Ajustar** (botões -1/-5/+1/+5, adicionar/limpar PV temporário — tudo que antes ficava no card — e, apenas em modo de edição, campos numéricos para Vida atual e Vida máxima), **Histórico** (lista de ajustes; botão de remover por item só aparece em modo de edição) e **Redução** (lista de badges de RD/imunidade; botão de remover por item e botão de "+" para adicionar só aparecem em modo de edição — usa o popup já existente de adicionar redução/imunidade).
- Remover um registro do histórico de PV agora pede confirmação num popup, no mesmo padrão usado para remover idiomas.
- Redução de dano/imunidades só pode ser removida a partir desse popup de Vida (não há mais remoção direta nos badges do card principal).

### Card de Vida: só abre popup em modo leitura; contador na mesma linha do título
- O card de Vida deixou de ter um ícone de lápis próprio; clicar em qualquer parte do card abre o popup de Pontos de Vida sempre em modo de leitura. O botão de editar (lápis) vive só dentro do popup, no cabeçalho.
- O contador "29/38" agora fica na mesma linha do título "Pontos de vida", não mais embaixo dele.

- No card de Vida, o contador "29/38" saiu de perto do título e passou a ficar alinhado à direita, logo ao lado do badge "+N temp".

- O card de Vida inteiro (incluindo os badges de Redução/imunidade) passou a ser um único botão clicável — antes só o contador e a barra abriam o popup.
- Na aba "Ajustar" do popup de Vida, quando não está em modo de edição, Vida atual e Vida máxima aparecem como resumo somente leitura (mesma posição dos campos editáveis), em vez de sumirem completamente fora do modo de edição.

### Popup de atributo redesenhado + dano/dreno de atributo
- Removido o botão "ver cálculo" do card de Atributos e o popup de grade que ele abria (Total/Modificador de todos os atributos numa tabela) — informação redundante com o popup individual de cada atributo.
- Popup individual do atributo (ex: Força): trocada a lista "Base / Temporário" (uma linha cada) por uma grade de 4 caixas iguais — Base, Temporário, Total, **Modificador** (agora sempre visível no corpo do popup, não só no subtítulo do cabeçalho). Base e Temporário viram inputs dentro das mesmas caixas em modo de edição.
- Novo recurso: **Dano e dreno de atributo**. Dano é uma penalidade temporária e recuperável (como dano de PV); Dreno é uma penalidade permanente (não se recupera sozinha). Ambos reduzem o Total/Modificador efetivos do atributo (Total = base + temporário + mods − dano − dreno, mínimo 0) — o que também repercute em tudo que usa aquele modificador na ficha (perícias, JR, CA, etc).
- Cada popup de atributo ganhou uma seção "Dano e dreno de atributo" com dois cartões (Dano recuperável / Dreno permanente), cada um com valor atual e botões +1/-1 para aplicar ou recuperar/restaurar, e um **histórico** de ajustes abaixo — mesmo padrão do histórico de Pontos de Vida. Remover um registro do histórico pede confirmação (mesmo padrão de idiomas/PV) e desfaz o ajuste correspondente; só é possível remover em modo de edição.

### Atributos: abas Resumo/Dano-Dreno/Histórico, com descrição
- O popup de atributo (ex: Força) ganhou 3 abas: **Resumo** (descrição, grade Base/Temp/Total/Modificador, Modificadores variados), **Dano/Dreno** e **Histórico** — antes tudo ficava empilhado numa única rolagem confusa.
- Aba Dano/Dreno: dois cartões mostram o valor atual de Dano (recuperável) e Dreno (permanente). Cada um tem um mini-formulário próprio — quantidade + **descrição livre** (ex: "veneno de aranha gigante", "toque de nível negativo") — com botões para aplicar ou recuperar/restaurar. Isso substituiu os botões simples +1/-1 sem contexto.
- Aba Histórico: lista os registros de dano/dreno já aplicados, cada um mostrando a descrição informada (quando houver); remover um registro exige confirmação e só é possível em modo de edição — mesmo padrão do histórico de PV.
- O Total/Modificador do atributo agora descontam Dano e Dreno automaticamente (Total = base + temporário + mods variados − dano − dreno, mínimo 0), repercutindo em toda a ficha (perícias, JR, CA etc. que dependem desse modificador).

### Identidade, Deslocamento, Idiomas e Experiência: clique abre popup de visualização
- Os cards de Identidade, Deslocamento, Idiomas e Experiência deixaram de ter botão de edição visível no cabeçalho do card. Agora o card inteiro é clicável e abre um **popup de visualização somente leitura**.
- Dentro de cada popup de visualização fica o botão de editar (lápis, abre o popup de edição já existente) e, no caso da Identidade, também o botão "Upar de nível" (sempre disponível ali, não depende do modo de edição).
- Idiomas: o popup de visualização mostra a lista com clique-para-remover (com confirmação) e o botão de adicionar — a mesma interação de antes, só que agora dentro de um popup dedicado em vez de diretamente no card da ficha.

### Pontos de vida: dano letal vs. não letal
- A ficha agora diferencia dano letal (reduz PV atual normalmente) de dano não letal (um contador à parte, não reduz o PV atual diretamente — segue a regra de Pathfinder onde dano não letal se acumula e é curado separadamente).
- Card de Vida: quando há dano não letal acumulado, aparece um indicador "N não letal" ao lado do badge de PV temporário.
- Popup de Vida, aba Ajustar: os botões de ajuste foram divididos em dois grupos rotulados — "Dano letal" (-1/-5/+1/+5, como antes) e "Dano não letal" (+1/+5 para aplicar, -1/-5 para curar), cada um com seu próprio contador.
- O histórico de PV agora identifica cada registro como dano letal (PV) ou não letal, com cores distintas.

### Cores características por atributo
- Cada atributo (FOR, DES, CON, INT, SAB, CAR) ganhou uma cor própria e consistente em toda a ficha: FOR=rosa (rose), DES=verde (emerald), CON=laranja (orange), INT=azul (sky), SAB=violeta (violet), CAR=rosa-choque (pink). Aplicada no modificador de cada card de atributo, no "(Con)/(Des)/(Sab)" das Jogadas de Resistência, e no "(ability)" de cada linha de perícia — permite identificar de relance qual atributo governa cada perícia/JR só pela cor.
- O modificador em destaque no popup individual do atributo também usa essa cor (em vez de âmbar genérico).

### Ajustes no popup de atributo e no de identidade
- Popup de Identidade: "Upar de nível" deixou de ser um botão de texto dentro do corpo e virou um ícone ao lado do lápis de editar, no cabeçalho do popup.
- Popup de atributo: título "Modificadores variados" agora usa o estilo padrão de cabeçalho de seção (uppercase, negrito, cinza) em vez de texto corrido — mais destacado.
- Registrar dano/dreno só é possível em modo de edição (lápis ativo); fora do modo de edição, a aba Dano/Dreno mostra apenas os valores atuais com uma nota "ative o modo de edição para registrar".
- Removido o botão "Restaurar" do Dreno — dreno é permanente e só se resolve aplicando outro registro (não há reversão rápida via botão; só removendo o registro do histórico, se lançado por engano).
- Para não duplicar informação entre abas, a aba **Resumo** passou a mostrar um resumo compacto e clicável de Dano/Dreno (badges com os valores atuais, quando houver) logo abaixo da grade de atributos — clicar nele leva direto para a aba Dano/Dreno, que continua sendo o único lugar com os formulários completos de registro.

### Dano de atributo visível fora do popup; margem e Manobras/RM redesenhados
- Cada card de atributo (FOR, DES, CON, INT, SAB, CAR) agora exibe um badge no canto superior direito quando há Dano e/ou Dreno registrado, sem precisar abrir o popup (ex: "-2" em rosa para dano, "-1 dreno" em violeta quando há dreno).
- Correção de cor: a cor característica de cada atributo passou a colorir o **nome/sigla** (FOR/DES/...) em vez do modificador — o modificador voltou a ser neutro.
- Corrigido bug de HTML (uma `</div>` sobrando fechava o container de flex cedo demais) que fazia os cards de Manobra e o card de Armas ficarem colados sem espaçamento.
- BBA, BMC e DMC agora ficam em uma única linha de 3 colunas, mostrando só a sigla no card; o card de Resistência a Magia duplicado nessa linha foi removido (RM já tem seu próprio card ao lado de Iniciativa).
- Resistência a Magia ganhou popup próprio, no mesmo padrão do de Iniciativa (valor grande, edição com lápis, campo numérico).
- BBA/BMC/DMC passaram a abrir um popup único com abas — cada card abre direto na sua aba correspondente, mostrando o nome completo (Bônus Base de Ataque / Bônus de Manobra de Combate / Defesa de Manobra de Combate) e o detalhamento do cálculo; BBA é editável (lápis), BMC e DMC são derivados automaticamente dele e dos modificadores de Força/Destreza/tamanho.

### Dashboard: sem badge "Ativa"
- O card de ficha em destaque no dashboard não mostra mais o badge "ATIVA" — a tela inicial só lista fichas ativas por definição, então o rótulo era redundante.

### Atributos: "Temp." é a soma dos modificadores variados
- Os modificadores variados de um atributo **são** os seus valores temporários — não existem duas fontes distintas. O campo "Temp." deixou de ser um número editável à parte e passou a ser derivado: mostra a soma dos modificadores variados listados abaixo (com sinal), sempre em leitura, alinhado com a lista que o alimenta.
- Cálculo do total ajustado: Total = Base + soma dos modificadores variados − Dano − Dreno (antes somava um "temp" separado além dos variados, permitindo divergência).

### Tela de perfil do usuário
- Nova tela **Meu perfil**, acessível pelo ícone de perfil na sidebar (desktop) e na bottom bar (mobile) — antes o ícone era decorativo e não navegava.
- Cabeçalho com avatar, nome e @nome-de-usuário. Bloco "Dados da conta" (Nome, Nome de usuário, E-mail e Senha mascarada) em visualização, com lápis para editar inline os três primeiros campos e botão Salvar.
- Bloco "Senha" separado: botão "Alterar senha" abre os três campos (senha atual, nova senha, confirmar), seguindo o padrão de segurança de não editar senha junto dos outros dados.

### Biblioteca compartilhada removida da navegação global
- O item "Biblioteca" saiu da sidebar e da bottom bar. A biblioteca compartilhada é **por sistema**, não global — continua acessível pelo botão de biblioteca dentro da tela de personagens de um sistema (e a partir das áreas da ficha que buscam itens dela). O espaço liberado na navegação foi ocupado pelo item de Perfil.

### Dano/dreno de atributo visível no card
- Refinamento: o valor original riscado foi removido do card — mostra apenas o valor atual (centralizado) com o abatimento (ex: "▾2") posicionado absolutamente à direita dele, sem afetar a largura do card.
- Redesenhado: quando um atributo tem dano ou dreno, o card mostra o **valor atual já reduzido** em cor de alerta (rosa para dano, violeta quando há dreno), a borda do card ganha a mesma cor, e uma linha extra abaixo do modificador mostra o valor original riscado seguido dos abatimentos (ex: "15 ▾2"). Isso substitui o badge no canto, que era pequeno e ambíguo sobre qual número já estava descontado.
- Dado de exemplo: Constituição da personagem passou a ter 2 de dano (veneno de aranha gigante) e um modificador variado (+2 de poção), para o tratamento ficar visível no mockup.

### Card de personagem unificado + correções de compartilhamento
- O `CharCard` (usado na lista de personagens de um sistema) passou a ter o mesmo tratamento visual do card de personagem favorito da tela inicial: avatar maior com anel, nome em fonte display, cantos mais arredondados e mais respiro interno.
- Estado favorito vs. normal: favoritado usa o **degradê âmbar** (`from-amber-950/40 via-neutral-900`) com borda âmbar e anel âmbar no avatar, igual ao card do dashboard; não favoritado usa fundo cinza chapado de uma cor só (`bg-neutral-900`), sem degradê.
- Nessa tela o card mostra a badge Ativo/Inativo e, **apenas quando a ficha já está compartilhada**, o ícone de compartilhamento — que vai direto para o popup de copiar o link (não passa pela etapa de confirmação, que só existe para ativar o compartilhamento pela primeira vez).
- Corrigido bug: o popup de compartilhar não avançava para a tela de copiar o link. A flag `shared` não estava sendo exposta ao template, então nenhuma das duas visões (ativar / copiar link) resolvia corretamente; além disso, confirmar o compartilhamento agora garante a ida para a aba de link.

### CharCard idêntico ao card da tela inicial
- O `CharCard` foi reescrito para ser exatamente o mesmo card usado na tela inicial: avatar 16/20 com anel, nome em display grande, subtítulo com raça · classes — nível, e barra de pontos de vida com contador (mesmos dados). Sobre isso, na lista de personagens de um sistema, ficam a badge Ativo/Inativo e (só para fichas compartilhadas) o ícone de compartilhar que abre direto o popup de copiar link.
- Props simplificadas: `subtitle` (linha única pronta) e `hp-current`/`hp-max`, substituindo os antigos `race`/`cls`/`level`/`desc`/`mods` que geravam layouts divergentes entre as duas telas.
- Corrigido: uma `</div>` sobrando na aba Combate fechava o container de espaçamento antes da hora, colando a linha de BBA/BMC/DMC no card de Armas.

### Armas: munição, detalhamento e "Nova arma"
- Uma arma pode ou não usar munição (interruptor no modo de edição). Quando usa, a linha da arma mostra um badge com `atual/máx mun.` — azul quando há munição, vermelho quando zerada.
- Clicar em uma arma abre o popup de detalhamento: dados em leitura (ataque, crítico, dano, tipo, alcance e descrição personalizada), lápis para editar todos eles inline, e — quando a arma usa munição — uma seção de munição com barra de progresso, botões -1/-5/+1 e "Recarregar" (volta ao máximo).
- Refinamento: o popup de arma passou a ter abas quando a arma usa munição — **Detalhes** (dados e edição), **Munição** (barra, -1/-5/+1, Recarregar) e **Histórico** (registros de uso). Armas sem munição não mostram abas, só os detalhes.
- Histórico de munição: cada uso ou recuperação fica registrado no popup; em modo de edição é possível remover um registro, o que desfaz o ajuste correspondente — mesmo padrão dos históricos de PV e de dano de atributo.
- Puxar da biblioteca agora funciona de verdade: escolher uma arma na busca **adiciona a arma à lista de armas do personagem** (cópia do template, com munição já cheia quando a arma usa munição) e abre o popup de detalhamento dela.
- Cadastrar uma arma nova na biblioteca deixou de usar o formulário genérico (só nome + descrição) e ganhou um formulário completo: nome, bônus de ataque, crítico, dano, alcance, tipo de dano (escolha entre Cortante / Perfurante / Concussão / Cortante-Perfurante), interruptor "usa munição" com munição máxima, e descrição. Ao salvar, a arma entra na biblioteca compartilhada **e** é adicionada à ficha.
- Ajuste: "+ Puxar da biblioteca" foi removido do topo do card de Armas. O botão "+ Nova arma" (canto inferior esquerdo) passou a ser a única entrada e abre o popup de busca de arma na biblioteca compartilhada — de onde também é possível cadastrar uma arma nova, então não faziam sentido duas ações separadas.
- O botão "+" de adicionar arma virou **"+ Nova arma"** e foi para o canto inferior esquerdo do card (antes era só um "+" no topo). "Puxar da biblioteca" permanece no topo à direita — são ações distintas: uma cria do zero, a outra copia um template da biblioteca compartilhada.
- Criar uma nova arma já abre o popup de detalhamento em modo de edição, para preencher os dados na hora.

### História do personagem: card clicável
- O card inteiro de História virou clicável (abre o popup), no mesmo padrão de Identidade/Deslocamento/Idiomas/Experiência.
- O link "Ler mais" saiu do cabeçalho (ao lado do título) e foi para logo abaixo do texto truncado, exatamente onde o corte acontece — leitura mais natural.

### Perícias: popup por perícia, indicadores sem abreviações
- Cada linha de perícia virou clicável e abre um **popup próprio** no padrão das Jogadas de Resistência: total grande no topo, detalhamento do cálculo (modificador do atributo, graduação, perícia de classe, bônus de classe +3) e a lista de modificadores variados.
- Edição só existe dentro do popup (lápis no cabeçalho): graduação, alternar "perícia de classe" (switch), e adicionar/editar/remover modificadores variados com descrição e valor. O bônus de classe (+3) aparece automaticamente quando a perícia é de classe **e** tem ao menos 1 graduação.
- Perícias que exigem treinamento passaram a ter um indicador visual na grid: um ícone de cadeado ao lado do nome — cinza quando sem graduação (não pode ser usada) e verde quando treinada. Quando sem graduação, o popup também mostra um aviso.
- Fim das abreviações na grid: "2 grad." saiu. Agora a graduação aparece com um ícone de níveis + número (tooltip "Graduação") e o modificador variado aparece separado, em âmbar com sinal (tooltip "Modificador variado") — dois indicadores visualmente distintos em vez de texto abreviado. Essa coluna mostra **apenas** a soma dos modificadores variados; o bônus de classe (+3) não entra ali, aparecendo só no detalhamento do popup, para a coluna não mentir sobre o que representa.
- A lista de perícias passou a ser gerada a partir do estado (não mais 12 linhas fixas no template), o que permite os cálculos automáticos e a edição por popup.

### Modificadores condicionais como badges
- O card de Modificadores condicionais deixou de ter campos de texto editáveis direto na ficha. Agora mostra os modificadores como **badges âmbar** (mesmo padrão das reduções de dano/imunidades) e o card inteiro é clicável.
- Adicionar, editar e remover acontece somente dentro do popup, que tem seu próprio botão de edição — consistente com o padrão de edição por componente adotado no resto da ficha.

### Backend real: Postgres (Neon) + Vercel Functions, autenticação e biblioteca normalizada
- A aplicação deixou de ser um mockup client-side (localStorage) e passou a ter backend de verdade: Postgres via Neon, acessado por Serverless Functions da Vercel (`/api`), com Drizzle como ORM. `Character` e `SharedLibrary` continuavam, a princípio, guardados como blob JSONB por linha (uma decisão pragmática, dado que o próprio domínio já os tratava como objetos únicos).
- **Login passou a ser por nome de usuário, não e-mail.** Cadastro deixou de ser público: só um usuário administrador (`users.is_admin`) pode criar novas contas, através de uma tela própria (`/perfil/criar-usuario`, com um botão dedicado na tela de perfil, visível só para admins) — não existe mais tela de "Criar conta" acessível sem estar logado.
- **E-mail foi removido do produto por completo** — não é mais coletado no cadastro nem editável no perfil; a coluna `email` foi apagada da tabela de usuários.
- **Biblioteca compartilhada remodelada**: a tabela única com JSONB (`shared_libraries`) foi substituída por uma tabela por categoria (`library_spells`, `library_weapons`, `library_special_abilities`, `library_feats`, `library_skills`, `library_languages`, `library_creatures`), cada uma ligada ao sistema por uma FK simples (`system_id`) — decisão consciente de não usar uma tabela intermediária aqui, já que a relação sistema→item é um-para-muitos, não muitos-para-muitos. O formato que o front-end consome (`SharedLibrary`, um objeto com uma lista por categoria) não mudou, então nenhuma aba/popup da ficha precisou ser tocada. Todo o conteúdo antigo da biblioteca foi apagado nessa migração.
- **Sistemas**: a listagem foi reduzida a só Pathfinder 1ª Ed. (o único implementado); os demais (Dune, Tormenta20, Vampiro) saíram da seed. Sistemas ganharam favoritar/desfavoritar de verdade (antes só existia o estado visual, sem ação) — botão de estrela no card, endpoint próprio.
- **Foto de perfil do usuário**: agora funciona de verdade — a imagem é redimensionada e comprimida no navegador (256×256, JPEG) e salva como `data:` URL na própria coluna do usuário; não há storage de arquivos provisionado. (A foto do personagem, mencionada em "Edição da identidade e progressão", **continua sendo só um placeholder não funcional**, como definido desde o início — não foi alterada.)
- **Tela de perfil, revisão**: o bloco "Senha" deixou de ser uma seção separada — "Alterar senha" agora é um botão dentro do modo de edição de "Dados da conta", ao lado do próprio campo de senha, e passou a funcionar de verdade (antes era só um formulário decorativo, sem chamada nenhuma ao salvar).
- **Navegação**: o app passou a usar `react-router` com URLs reais (antes era um estado de rota só em memória) — cada tela tem uma URL própria e os botões de voltar/avançar do navegador funcionam nativamente.
- Publicação: a hospedagem migrou do GitHub Pages para a Vercel (deploy automático a cada push em `main`), com o Postgres do Neon conectado como Storage integrado ao projeto Vercel.

### Gap identificado (ainda não resolvido): compartilhamento por link não funciona de fato
- O popup "Compartilhar ficha" (`ShareDialog`) sempre foi só a interface — ativa/desativa a flag `shared` e mostra uma URL (`https://compendio.app/f/:shareSlug`), mas esse domínio nem existe e nunca houve uma rota nem um endpoint público que resolvesse esse link e mostrasse a ficha em modo leitura. Diferente da foto do personagem e do PDF, isso **não** foi marcado como placeholder intencional nas notas originais — o texto descreve um recurso funcional ("qualquer pessoa com o link poderá visualizar esta ficha"). Fica registrado aqui como pendência real a decidir/priorizar.

### Gestão de usuários (admin) e correções no card de conta
- **Alterar senha** deixou de ficar preso ao modo de edição de "Dados da conta" — agora é uma seção própria, sempre visível, independente de estar editando nome/usuário ou não.
- **Nova aba "Usuários" na navbar (`/admin/usuarios`)**, visível só para administradores (ícone próprio na sidebar/bottom bar). Lista todas as contas com: avatar, nome, `@usuário`, badges de Admin/Inativo, e "último acesso" (relativo, ex. "há 2 dias" — ou "Nunca acessou").
- Cada conta na lista tem três ações administrativas: **ativar/desativar** (switch), **tornar/remover admin** (botão) e **redefinir senha** (gera uma senha temporária aleatória, mostrada uma única vez em um popup de confirmação, com botão de copiar). Um admin não pode desativar nem remover o próprio acesso de administrador por essa tela (evita se auto-trancar fora do sistema).
- Redefinir senha e desativar uma conta **encerram todas as sessões ativas dela** (a tabela `sessions` é limpa para aquele usuário) — a pessoa é desconectada de todos os dispositivos imediatamente.
- Login passou a checar `users.active`: uma conta desativada não consegue mais entrar (mensagem própria), mesmo com a senha certa. Todo login bem-sucedido agora grava `users.last_login_at`.
- O botão "Criar usuário" saiu da tela de perfil e foi para dentro da nova tela de Usuários (a tela de criação em si, `/perfil/criar-usuario`, continua a mesma).
- Duas colunas novas em `users`: `active boolean default true` e `last_login_at timestamp`.

### Camada de segurança: admin master, auditoria, rate limiting, troca de senha obrigatória
- **Administrador master**: uma nova coluna `users.is_master` (nunca exposta/editável por nenhum endpoint, só definida direto no banco) marca a conta `ana` como única capaz de conceder ou remover acesso de administrador de outra conta. Um admin comum não consegue promover nem despromover ninguém — só o master pode. A conta master também não pode ser desativada, promovida/despromovida ou ter a senha redefinida por ninguém além dela mesma, por essa tela.
- **Log de auditoria** (`audit_log`): toda ação de gestão de conta (criar usuário, ativar, desativar, promover, despromover, redefinir senha por admin, trocar a própria senha) grava quem fez, em quem, quando. Ainda não tem tela própria — fica registrado no banco para consulta futura, se necessário.
- **Troca de senha obrigatória após reset**: quando um admin redefine a senha de alguém (`users.must_change_password`), a próxima vez que a conta logar cai direto numa tela de troca de senha obrigatória — não dá pra usar o resto do app com a senha temporária.
- **Limite de tentativas (rate limiting)**: login (por usuário e por IP) e troca de senha agora passam por um limitador via Upstash Redis (Vercel Marketplace) antes de tocar no banco. Sem as credenciais do Redis configuradas, o limite fica desativado silenciosamente (não bloqueia o app em desenvolvimento) — plano é o usuário conectar a integração Upstash na Vercel e me passar o nome exato das variáveis de ambiente, do mesmo jeito que aconteceu com o Postgres/Neon.
- **Headers de segurança** (`vercel.json`): CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS passaram a ser enviados em toda resposta.
- **Validação de entrada**: personagem (`POST`/`PATCH /api/characters`) ganhou um teto de tamanho (2MB) e uma checagem de forma via Zod (id/systemId) antes de gravar — o restante do objeto continua indo para a coluna JSONB sem um schema campo-a-campo (a ficha tem ~100 campos espalhados pelas abas; modelar tudo no Zod seria um projeto à parte, então ficou registrado como uma lacuna consciente, não coberta).
- **Nome de usuário com @**: em toda tela (login, criar usuário, perfil, gestão de usuários) o nome de usuário aparece com `@` na frente; nos campos editáveis o `@` é só um prefixo visual dentro do input, não faz parte do valor salvo.

### Deploy quebrado no plano Hobby, alertas de segurança e outros ajustes
- **Limite de 12 funções serverless (Hobby)**: cada arquivo em `/api` vira uma função na Vercel; com 14 rotas o deploy passou a falhar. As rotas relacionadas foram consolidadas em arquivos únicos que despacham por método/caminho (`api/auth/[action].ts`, `api/admin/users/[[...path]].ts`, `api/characters/[[...path]].ts`, `api/user/[[...path]].ts`), sem mudar nenhuma URL usada pelo front-end — caiu para 7 funções.
- **Alerta de segurança persistente**: uma nova tabela `security_alerts` guarda avisos levantados automaticamente quando o número de tentativas de login falhas/bloqueadas na última hora passa de um limite (8). O aviso aparece como uma faixa vermelha fixa em qualquer tela para administradores (não só na tela de Usuários), carregado junto do `/api/bootstrap`, e só some quando removido manualmente (com confirmação) — sobrevive a logout/login.
- **Aba "Atividade recente"**: dentro de Gestão de usuários, mostra os últimos 100 registros de `audit_log` (quem fez o quê, com quem, quando), incluindo tentativas de login (sucesso, falha, bloqueio por limite).
- **Rate limiting: fail-closed em erro de infraestrutura**: se o Redis não estiver configurado, o limite fica desligado (comportamento esperado antes de conectar o Upstash). Mas se estiver configurado e falhar (fora do ar, cota estourada), agora ele **bloqueia** a tentativa em vez de deixar passar — evita que uma falha do Upstash desligue silenciosamente essa proteção.
- **Cookie de sessão reduzido de 30 para 7 dias**, para limitar por quanto tempo um cookie vazado continua válido.
- **Code splitting por rota**: cada página carrega sob demanda (`React.lazy`); o bundle principal caiu de ~860KB para ~590KB, com a ficha de personagem (a maior tela) isolada em seu próprio pedaço, carregado só quando alguém abre uma ficha.
- **`vercel.json` `git.deploymentEnabled` — corrigido**: a primeira tentativa (`{"main": true}`) não fazia nada — confirmado tanto pela documentação-fonte da Vercel (`packages/config/src/types.ts` no repo público `vercel/vercel`: "Any non specified branch is `true` by default") quanto na prática (a branch de desenvolvimento gerou deploy de preview de verdade logo depois do push). O `vercel.com` estava bloqueado por rede neste ambiente, mas o `github.com` não — o schema real veio direto do código-fonte do pacote `@vercel/config` da própria Vercel. Configuração corrigida para `{"*": false, "main": true, "<branch-atual>": false}` (coringa desabilita tudo, `main` reabilita, e a branch de trabalho atual fica listada explicitamente por nome como reforço, já que o suporte a coringa em nomes de branch com `/` não pôde ser confirmado). Cada nova branch de trabalho precisa ser adicionada aqui enquanto o coringa não for confirmado como suficiente sozinho.
- **Pendente, ainda não implementado**: 2FA (TOTP, com QR code + códigos de backup, via lib `otpauth`) e CAPTCHA/bot-detection no login (ideia: Cloudflare Turnstile, gratuito e geralmente invisível). Discutido e adiado a pedido do usuário — não é falta de decisão, é prioridade futura.

### Bug de produção: rotas "base" das APIs consolidadas retornavam 404
- Depois da consolidação de rotas no round anterior (`api/admin/users/[[...path]].ts`, `api/characters/[[...path]].ts`, `api/user/[[...path]].ts`), a tela de Gestão de usuários passou a quebrar sempre ("Algo deu errado" ao carregar a lista), mesmo com a aba "Atividade recente" funcionando normalmente.
- Causa raiz confirmada direto no código-fonte público da Vercel (`packages/fs-detectors` no repo `vercel/vercel`, já que `vercel.com` está bloqueado por rede neste ambiente mas `github.com` não): a sintaxe de colchete duplo `[[...path]].ts` ("catch-all opcional") só tem esse comportamento especial dentro do roteador do Next.js. Para uma Serverless Function comum (sem framework, que é o caso deste projeto), a Vercel trata `[[...path]].ts` exatamente igual a `[...path].ts` — sempre exige pelo menos um segmento no caminho. `GET /api/admin/users/activity` batia certinho (um segmento), mas `GET /api/admin/users` sozinho (zero segmentos) caía direto num 404 genérico da própria Vercel, sem nem chegar no código da função. O mesmo bug afetava `POST /api/characters` e `PATCH /api/user`.
- Corrigido com um rewrite em `vercel.json` para cada uma dessas três rotas "base", redirecionando o caminho sem segmento nenhum para um segmento sintético (`/api/admin/users/__root`, etc.), que cada função trata exatamente como o caso de zero segmentos.

### Vercel Speed Insights e Analytics
- `@vercel/speed-insights` e `@vercel/analytics` instalados; os componentes `<SpeedInsights />` e `<Analytics />` foram adicionados em `src/app/App.tsx`, junto do `BrowserRouter`, seguindo o guia oficial da Vercel. Passam a coletar Web Vitals e visualizações de página assim que o deploy for para produção.
- Não foi preciso mexer na CSP (`vercel.json`): em produção os dois pacotes carregam o script e enviam os dados via caminhos de mesma origem (`/_vercel/insights/script.js`, `/_vercel/speed-insights/script.js`), então `script-src 'self'` já cobre.

### Lote de ajustes de UX na ficha de personagem (a partir de feedback com prints)
- **Personagem novo sem dados pré-preenchidos**: `createBlankCharacter` deixou de criar uma classe placeholder ("Nova classe 1"), um idioma padrão ("Comum") e deslocamento de 9m — tudo isso nasce vazio/zerado agora (`classes: []`, `languages: []`, `speed` todo 0, `hpCurrent`/`hpMax` 0, atributos com base 0 em vez de 10). Onde a UI mostrava "Nova classe 1", agora mostra "Sem classe" quando `classes` está vazio (cabeçalho da ficha, aba Geral, popup de Identidade, card na lista, resumo do dashboard).
- **Separador "·" sobrando**: as linhas resumo (cabeçalho da ficha, card da lista, resumo do dashboard) eram strings concatenadas com "·" fixo entre os campos — com raça/classe vazias, sobravam "·" soltos no início/fim. Criado `joinDot()` (`shared/lib/format.ts`) que só junta os pedaços não-vazios.
- **Nome do personagem só edita por duplo-clique no cabeçalho**: removido o campo "Nome do personagem" do popup de Identidade (única duplicidade que existia) — agora duplo-clique no nome no cabeçalho da ficha abre um input inline com botão salvar/cancelar, e esse é o único lugar de editar o nome. Desabilitado quando o personagem está inativo (a ficha já é somente-leitura nesse estado).
- **Badge de ativo/inativo no card, mesmo favoritado**: o `CharCard` já suportava a prop, mas a tela de Personagens só passava `showStatusBadge` pros cards fora da seção "Favorito" — corrigido em todos os usos (Personagens e Dashboard).
- **"Nenhum personagem ativo" mostrando com um personagem favoritado e ativo**: a lista "Ativos" excluía o favoritado por design (pra não duplicar o card), mas o estado vazio abaixo checava só essa lista filtrada, ignorando que o favoritado podia estar ativo. Agora o estado vazio só aparece quando **nenhum** personagem do sistema está ativo, favoritado ou não.
- **"Ler mais" mesmo com a história vazia**: como `line-clamp-3` é só CSS (não dá pra saber se o texto realmente estourou 3 linhas sem medir o DOM), o "Ler mais" agora só aparece quando o texto passa de um limite de caracteres (220, aproximação de 3 linhas nessa largura de card) — resolve o caso de história vazia mostrando "Ler mais" à toa.
- **Perícias: atributo em badge, cadeado depois**: trocado `(Des)` entre parênteses por uma badge colorida com a abreviação do atributo; o cadeado de "exige treinamento" passou a ficar dentro dessa badge, depois do texto do atributo, em vez de antes do nome da perícia.
- **Múltiplas abas ao abrir fichas**: `CharCard` e o item da lista "Acessados recentemente" (dashboard) eram `<div onClick>`/`<button onClick>` com `navigate()` programático — isso quebra ctrl/cmd/clique-do-meio (não existe link real pra abrir em nova aba). Convertidos para `<Link>` de verdade (react-router), usando a técnica de "stretched link" (link absoluto cobrindo o card, conteúdo visual com `pointer-events-none`, botão de compartilhar com sua própria stacking order) pra manter o botão de compartilhar clicável dentro do card.
- **Limitação de teste**: este ambiente sandbox não tem acesso a um Postgres/Neon real nem à Vercel, então não dá pra fazer login e testar essas mudanças interagindo com a ficha de verdade no navegador — a validação ficou por conta de typecheck, lint, testes automatizados e build de produção. Recomendo conferir visualmente após o deploy.

### Upload de foto do personagem, com validação real
- `PhotoUploadDialog` era só um placeholder visual (clicar não fazia nada). Reaproveitei o mesmo mecanismo já usado no upload de avatar do usuário (`resizeImageToDataUrl`): o arquivo é carregado por um elemento `<img>` do próprio navegador (nunca confia no `file.type`/extensão declarados) e só é aceito se o navegador conseguir de fato decodificá-lo como imagem; em seguida é redesenhado do zero num canvas e reexportado como JPEG — isso by design impede qualquer arquivo adulterado/polyglot de passar, porque a saída só pode conter os pixels que o navegador realmente decodificou. Adicionei também uma lista de extensões aceitas e um limite de 8MB antes mesmo de tentar decodificar (evita travar a aba com um arquivo gigante disfarçado de imagem), além de suporte a arrastar-e-soltar.
- Novo campo `photoUrl: string | null` no tipo `Character` (nasce `null`; nenhuma migração de banco necessária, já que a ficha inteira é um blob JSONB). Aparece em todo lugar que já mostrava o avatar do personagem: cabeçalho da ficha, card na lista de personagens, card de favorito e lista de "Acessados recentemente" do dashboard.

### Padrão de edição unificado nos popups da ficha
- Criado um hook compartilhado (`useEditableSection`) e um novo popup (`UnsavedChangesDialog`), aplicados nos 16 popups de edição de campo da ficha (identidade, deslocamento, XP, história, atributos, CA, iniciativa, manobras, RM, salvaguardas, PV, carga, dinheiro, perícia, modificadores condicionais, detalhes de arma):
  - **Abre direto em modo de edição quando a seção está genuinamente vazia** (ex: nunca definiu nenhum atributo, história em branco, deslocamento todo zerado). Seções onde zero é um valor normal e permanente pro personagem (XP, iniciativa, RM, a maioria das perícias/modificadores variados) não entram nesse comportamento — do contrário abririam sempre em edição.
  - **Fechar com alterações não salvas pergunta antes**: como cada campo desses popups já salva imediatamente a cada mudança (não existe rascunho separado), "alteração não salva" aqui significa "mudou algo desde que entrou no modo de edição, e ainda dá pra desfazer". Ao tentar fechar (X, clique fora, Esc) nessas condições, aparece um diálogo com "Salvar" (só fecha — já está salvo) ou "Sair sem salvar" (restaura a ficha pro estado de quando entrou no modo de edição).
  - **Reabrir sempre volta pro modo de visualização**, nunca retoma o modo de edição, independente de como foi fechado da última vez.

### Bug crítico encontrado: criação de personagem não salvava de verdade
- Descoberto por acaso ao planejar o backend do compartilhamento (verificando o tipo da coluna `characters.id`). `createBlankCharacter` gerava o id como `` `char-${crypto.randomUUID()}` `` — isso nunca foi um UUID válido. A coluna `characters.id` no Postgres é `uuid`, e a validação Zod do endpoint (`characterBodySchema`, `id: z.uuid()`) também exige um UUID de verdade — então todo `POST /api/characters` pra criar um personagem novo vinha sendo rejeitado com 400 desde que essa validação existe.
- Como toda mutação no app é "atualização local otimista + chamada de API disparada e esquecida" (o erro só ia pro `console.error`, nunca aparecia pro usuário), a ficha nova aparecia normalmente na tela — só que nunca era salva no banco de verdade. Um refresh de página, ou qualquer outro dispositivo/sessão, nunca veria esse personagem.
- Corrigido: `createBlankCharacter` agora usa `crypto.randomUUID()` puro, sem prefixo. Único ponto do código que gerava um id de personagem novo, então a correção é isolada.
- **Pendente, fora do escopo desta correção pontual**: o padrão geral de "atualização otimista + erro só no console" existe em todas as mutações do `AppDataProvider` (não só criar personagem), então qualquer falha de rede/servidor em qualquer ação do app fica invisível pro usuário hoje. Vale considerar no futuro mostrar um toast de erro nesses casos, mas mudar isso em todo o provider é um escopo maior do que essa correção pontual.

### Aba Magias: criar grimório
- A aba já tinha os componentes pra mostrar/gerenciar um grimório (`SpellBookCard`, `SpellPickDialog`), mas não existia nenhuma forma de criar um — `character.spellbooks` sempre começava vazio e ficava vazio pra sempre. Agora tem um botão "Adicionar grimório" que abre um popup pra escolher a classe conjuradora, o atributo de conjuração, o tipo (espontânea/preparada) e quantos círculos ela conjura.
- Os espaços de magia por círculo (`max`) começam em 0 (não modelamos as tabelas de progressão de espaços por classe/nível do PF1e) — um botão de editar (lápis) no próprio grimório permite ajustar esse número a qualquer momento, incluindo depois de upar de nível, do mesmo jeito manual que BBA/RM/CA já funcionam nesta ficha. O mesmo modo de edição permite remover o grimório inteiro (com confirmação).
- Estado vazio: quando não há nenhum grimório, habilidade similar a magia, nem escola focada/oposta, aparece uma mensagem explicando que a aba serve pra personagens conjuradores.

## Regra permanente de processo
- **Toda mudança pedida deve ser registrada neste arquivo.** A cada solicitação do usuário, as novas regras e decisões de design devem ser adicionadas ao DESIGN_NOTES.md, incluindo quaisquer regras decididas anteriormente que ainda não tenham sido documentadas aqui. Não é necessário o usuário pedir isso explicitamente a cada vez.

## Dependência externa removida na correção de publicação

Ao preparar o arquivo para publicação como artefato público, o bundler reportou 1 recurso referenciado que não pôde ser resolvido. A causa mais provável era a folha de fontes do Google Fonts carregada via CDN:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Essa folha carregava as fontes **Cinzel** (usada nos títulos, classe `.font-display`) e **Inter** (usada no corpo do texto). Como o processo de publicação não tem acesso a rede para buscar fontes externas de forma confiável, a dependência foi removida e substituída por pilhas de fontes de sistema:
- Títulos (`.font-display`): `Georgia, 'Times New Roman', serif` (mantém o caráter serifado).
- Corpo/UI: `system-ui, -apple-system, sans-serif`.

O script do Tailwind via CDN (`https://cdn.tailwindcss.com`) foi mantido, pois é inlinável diretamente pelo bundler como `<script src>`.
