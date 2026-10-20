import type { ChangelogEntry } from './types';

/**
 * Registro de novidades voltado ao usuário final — não confundir com DESIGN_NOTES.md (registro
 * técnico de decisões de produto/arquitetura). Uma entrada aqui corresponde a um **dia** de
 * mudanças que chegaram à produção (não uma por PR) — o usuário faz várias micro-versões ao
 * longo do dia, então o changelog só reflete o resultado consolidado no fim do dia, reescrito em
 * linguagem de jogador, não a descrição técnica de cada PR.
 *
 * Versão: `AAAA.MM.DD-beta` (o sistema ainda está em fase beta, daí o sufixo — tira assim que
 * saírmos dela). Uma entrada por dia — se o dia ainda está em andamento, a entrada do dia vai
 * sendo atualizada/ampliada em vez de ganhar uma nova versão a cada PR. Mais recente primeiro.
 */
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: '2026.10.20-beta',
    date: '2026-10-20',
    title: 'Nova especialização de Conhecimento, e galeria de fotos com corte e foto de perfil',
    changes: [
      'Agora dá para adicionar quantas especializações de Conhecimento quiser na aba Perícias, digitando o nome (ex: "Conhecimento (criaturas das sombras)") — igual já funcionava com Apresentação, Ofícios e Profissão, além das 10 especializações fixas que já existiam.',
      'A galeria de fotos do personagem agora deixa cortar e enquadrar a imagem (com zoom) antes de enviar, e comprime mais as fotos para não pesar no banco de dados.',
      'A galeria e a foto de perfil do personagem se uniram: a galeria tem limite de 3 fotos, e qualquer uma delas pode ser marcada com uma estrela para virar a foto de perfil mostrada em toda a ficha.',
    ],
  },
  {
    version: '2026.10.16-beta',
    date: '2026-10-16',
    title: 'Anotações adicionais na aba Combate, e exclusão de ficha',
    changes: [
      'Nova seção "Anotações adicionais" na aba Combate — um campo de texto livre com suporte a markdown, útil para anotar combos de combate, lembretes de regra ou qualquer outra coisa.',
      'Agora dá para excluir uma ficha de personagem (vira soft delete) pelo botão no cabeçalho da ficha — ela some da sua lista, mas fica guardada numa lixeira por 90 dias, acessível pelo botão de lixeira na tela de personagens do sistema, com opção de restaurar.',
    ],
  },
  {
    version: '2026.10.13-beta',
    date: '2026-10-13',
    title: 'Biblioteca compartilhada, markdown, habilidades similares a magia e novidades',
    changes: [
      'Raça e Tipo de criatura agora podem ser escolhidos a partir da biblioteca compartilhada do sistema, em vez de só digitados à mão. Subtipo de criatura é um campo novo, de texto livre (ex: "fogo", "humano").',
      'Idiomas também podem ser escolhidos da biblioteca compartilhada, além de digitados.',
      'A história do personagem agora aceita formatação em markdown (negrito, itálico, tabelas).',
      'Habilidades similares a magia agora podem ser adicionadas, editadas e removidas pela ficha — antes não existia essa opção.',
      'Talentos e habilidades especiais ganharam um campo de resumo (mostrado no card da lista) e um campo de Fonte, que vira link clicável quando é uma URL. O campo "Origem" de uma habilidade especial (antes "Subtítulo") agora tem esse nome na tela de edição.',
      'Corrigido um bug que permitia adicionar a mesma habilidade especial duas vezes pela biblioteca.',
      'Nova página de Novidades (esta aqui!), acessível pelo botão "Novidades" na tela de Perfil.',
      'Funcionalidades ainda incompletas agora ganham uma tag "Em desenvolvimento" — hoje isso vale para compartilhamento de ficha, galeria de fotos, abas Criaturas e Plano, e as seções de Snapshots/Registro de sessões na aba Histórico.',
      'A navegação entre abas da ficha agora mostra só os ícones; o nome da seção aparece como título acima do conteúdo.',
      'Corrigido um bug no alerta de segurança de tentativas de login: dispensar o alerta agora realmente zera a contagem, em vez de um alerta praticamente idêntico reaparecer logo em seguida.',
    ],
  },
];

export const CURRENT_VERSION = CHANGELOG_ENTRIES[0].version;
