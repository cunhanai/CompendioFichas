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
      'Funcionalidades ainda incompletas agora ganham uma tag "Em desenvolvimento" — hoje isso vale para compartilhamento de ficha e galeria de fotos.',
      'A navegação entre abas da ficha agora mostra só os ícones; o nome da seção aparece como título acima do conteúdo.',
    ],
  },
];

export const CURRENT_VERSION = CHANGELOG_ENTRIES[0].version;
