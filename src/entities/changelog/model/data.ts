import type { ChangelogEntry } from './types';

/**
 * Registro de novidades voltado ao usuário final — não confundir com DESIGN_NOTES.md (registro
 * técnico de decisões de produto/arquitetura). Uma entrada aqui corresponde a uma leva de
 * mudanças que chegou à produção (tipicamente uma PR mesclada), reescrita em linguagem de
 * jogador, não a descrição técnica da PR.
 *
 * Versão: `AAAA.MM.DD-beta.N`, onde N incrementa a cada entrada lançada no mesmo dia (o sistema
 * ainda está em beta, daí o sufixo — tira assim que saírmos dessa fase). Mais recente primeiro.
 */
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: '2026.10.13-beta.2',
    date: '2026-10-13',
    title: 'Markdown na história, habilidades similares a magia, e talentos mais completos',
    changes: [
      'A história do personagem agora aceita formatação em markdown (negrito, itálico, tabelas).',
      'Habilidades similares a magia agora podem ser adicionadas, editadas e removidas pela ficha — antes não existia essa opção.',
      'Talentos e habilidades especiais ganharam um campo de resumo (mostrado no card da lista) e um campo de Fonte, que vira link clicável quando é uma URL.',
      'O campo "Origem" de uma habilidade especial (antes "Subtítulo") agora tem esse nome na tela de edição.',
      'Corrigido um bug que permitia adicionar a mesma habilidade especial duas vezes pela biblioteca.',
    ],
  },
  {
    version: '2026.10.13-beta.1',
    date: '2026-10-13',
    title: 'Raça, tipo de criatura e idiomas agora vêm da biblioteca compartilhada',
    changes: [
      'Raça e Tipo de criatura agora podem ser escolhidos a partir da biblioteca compartilhada do sistema, em vez de só digitados à mão.',
      'Subtipo de criatura é um campo novo, de texto livre (ex: "fogo", "humano").',
      'Idiomas também podem ser escolhidos da biblioteca compartilhada, além de digitados.',
    ],
  },
];

export const CURRENT_VERSION = CHANGELOG_ENTRIES[0].version;
