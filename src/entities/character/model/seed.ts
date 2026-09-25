import { PATHFINDER_SYSTEM_ID } from '@/entities/system/model/seed';
import { SKILL_CATALOG } from './skillCatalog';
import type { Character, Skill } from './types';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();

function skillsFrom(overrides: Record<string, Partial<Skill>>): Skill[] {
  return SKILL_CATALOG.map((tpl) => ({
    key: tpl.key,
    name: tpl.name,
    ability: tpl.ability,
    trainedOnly: tpl.trainedOnly,
    classSkill: false,
    ranks: 0,
    mods: [],
    ...overrides[tpl.key],
  }));
}

const ELYNDRA: Character = {
  id: 'elyndra',
  systemId: PATHFINDER_SYSTEM_ID,
  name: 'Elyndra Duskwhisper',
  photoUrl: null,
  favorited: true,
  active: true,

  identity: {
    raca: 'Meio-Elfa',
    tamanho: 'Médio',
    sexo: 'Feminino',
    idadeNum: 24,
    alturaNum: 1.68,
    pesoNum: 58,
    cabelo: 'Prateado',
    olhos: 'Violeta',
    divindade: 'Desna',
    terraNatal: 'Kyonin',
  },
  alignmentLaw: 'Caótico',
  alignmentMoral: 'Bom',
  classes: [
    { id: 'cls-feiticeira', name: 'Feiticeira', level: 3 },
    { id: 'cls-clériga', name: 'Clériga', level: 2 },
  ],
  speed: { base: 9, armor: 9, fly: 0, flyManeuverability: '', swim: 0, climb: 0, dig: 0 },
  languages: [
    { id: 'lang-1', name: 'Comum' },
    { id: 'lang-2', name: 'Élfico' },
    { id: 'lang-3', name: 'Celestial' },
  ],
  story:
    'Filha de uma feiticeira élfica e de um mercador humano, Elyndra cresceu entre duas culturas sem pertencer inteiramente a nenhuma. Seus poderes arcanos despertaram cedo e de forma instável, o que a levou a buscar refúgio nos templos de Desna, onde aprendeu a canalizar parte de seu dom também pela fé. Hoje viaja em busca de respostas sobre a linhagem feérica que corre em seu sangue.',

  xpEnabled: true,
  xpCurrent: 12500,
  xpMax: 15000,

  hpCurrent: 29,
  hpMax: 38,
  tempHp: 5,
  hpNonLethal: 0,
  hpLog: [],
  drItems: [
    { id: 'dr-1', type: 'Frio', immune: false, amount: 5 },
    { id: 'dr-2', type: 'Sono', immune: true, amount: 0 },
  ],

  abilities: {
    str: { base: 10, mods: [], damage: 0, drain: 0, log: [] },
    dex: { base: 16, mods: [], damage: 0, drain: 0, log: [] },
    con: {
      base: 13,
      mods: [{ id: 'con-mod-1', label: 'Vigor arcano (poção)', value: 2 }],
      damage: 2,
      drain: 0,
      log: [{ id: 'con-log-1', type: 'dano', delta: 2, desc: 'Veneno de aranha gigante' }],
    },
    int: { base: 12, mods: [], damage: 0, drain: 0, log: [] },
    wis: { base: 14, mods: [], damage: 0, drain: 0, log: [] },
    cha: { base: 18, mods: [], damage: 0, drain: 0, log: [] },
  },

  acArmor: 2,
  acShield: 0,
  acNatural: 0,
  acDeflection: 0,
  acVariedMods: [{ id: 'ac-mod-1', label: 'Talento de Esquiva', value: 2 }],
  initVariedMods: [{ id: 'init-mod-1', label: 'Iniciativa Aprimorada', value: 4 }],
  saves: {
    fort: { base: 1, magic: 0, misc: 0, temp: 0 },
    ref: { base: 1, magic: 0, misc: 0, temp: 0 },
    will: { base: 4, magic: 0, misc: 0, temp: 0 },
  },
  bbaValue: 3,
  rmValue: 0,

  favoredSchool: 'Evocação',
  opposedSchools: ['Necromancia', 'Ilusão'],
  spellbooks: [
    {
      className: 'Feiticeira',
      abilityLabel: 'Carisma',
      kind: 'espontânea',
      cantrips: {
        label: 'Truques (nível 0)',
        spells: ['Luz', 'Mãos Flamejantes*', 'Detectar Magia'],
      },
      circles: [
        {
          label: '1º círculo',
          used: 2,
          max: 5,
          spells: ['Mãos Flamejantes', 'Escudo', 'Enfeitiçar Pessoa'],
        },
        { label: '2º círculo', used: 1, max: 3, spells: ['Flecha Ácida Persistente'] },
      ],
    },
    {
      className: 'Clériga',
      abilityLabel: 'Sabedoria',
      kind: 'preparada',
      cantrips: { label: 'Orações (nível 0)', spells: ['Consertar', 'Orientação'] },
      circles: [
        { label: '1º círculo', used: 1, max: 3, spells: ['Curar Ferimentos Leves ×2', 'Bênção'] },
      ],
    },
  ],
  spellLikeAbilities: [
    {
      id: 'sla-1',
      name: 'Sangue Feérico: Enfeitiçar Pessoa',
      subtitle: 'Habilidade similar a magia · NC 5',
      uses: '0/1 usado',
      desc: 'Concedida pela linhagem feérica de Elyndra. Funciona como a magia Enfeitiçar Pessoa, exceto pela quantidade limitada de usos diários.',
    },
  ],

  skills: skillsFrom({
    acrobacia: { classSkill: true, ranks: 2 },
    artefuga: { ranks: 0 },
    conhecarcano: { classSkill: true, ranks: 3 },
    conhecreligiao: { classSkill: true, ranks: 2 },
    cura: { classSkill: true, ranks: 1 },
    diplomacia: { classSkill: true, ranks: 3 },
    enganacao: { classSkill: true, ranks: 2 },
    furtividade: { ranks: 0, conditional: 'Com armadura pesada −5' },
    intimidacao: { classSkill: true, ranks: 0 },
    percepcao: { ranks: 2 },
    oficio: { name: 'Ofício (alquimia)', ranks: 1 },
    atuacao: {
      name: 'Atuação (canto)',
      ranks: 2,
      mods: [{ id: 'sk-mod-1', label: 'Instrumento superior', value: 2 }],
    },
  }),
  conditionalMods: [{ id: 'cond-1', text: 'Furtividade com armadura pesada −5' }],

  weapons: [
    {
      id: 'w-rapiete',
      name: 'Rapiete',
      atk: '+4',
      crit: '19-20/x2',
      dmg: '1d6',
      type: 'Perfurante',
      range: '—',
      desc: '',
      hasAmmo: false,
      ammoCurrent: 0,
      ammoMax: 0,
      ammoLog: [],
    },
    {
      id: 'w-funda',
      name: 'Funda',
      atk: '+3',
      crit: 'x2',
      dmg: '1d4',
      type: 'Concussão',
      range: '15 m',
      desc: '',
      hasAmmo: true,
      ammoCurrent: 14,
      ammoMax: 20,
      ammoLog: [{ id: 'ammo-1', delta: -6 }],
    },
  ],

  feats: [
    {
      id: 'f-1',
      name: 'Foco em Magia (Evocação)',
      tag: 'Talento geral',
      desc: '+1 na CD de resistência de magias da escola de Evocação.',
    },
    {
      id: 'f-2',
      name: 'Iniciativa Aprimorada',
      tag: 'Talento de combate',
      desc: '+4 nos testes de iniciativa.',
    },
    {
      id: 'f-3',
      name: 'Conjuração Extra (magia 1º círc.)',
      tag: 'Talento de metamagia',
      desc: 'Pré-requisito: Feiticeira nível 1. Ganha um espaço extra de 1º círculo.',
    },
  ],
  specials: [
    {
      id: 's-1',
      name: 'Imunidade a Sono',
      subtitle: 'Traço racial de meio-elfo',
      uses: '',
      desc: 'Meio-elfos não dormem magicamente e são imunes a efeitos de sono.',
    },
    {
      id: 's-2',
      name: 'Canalizar Energia (positiva)',
      subtitle: '2d6, CD 14',
      uses: '3/5 usos',
      desc: 'Emite uma onda de energia positiva que cura aliados ou fere mortos-vivos em um raio de 9 m. Uso padrão de clériga.',
    },
  ],

  money: { pc: 34, pp: 12, po: 280, pl: 2 },
  load: { light: 33, medium: 66, heavy: 100, overhead: 100, ground: 200, drag: 300 },
  equipment: [
    { id: 'eq-1', name: 'Corda de cânhamo (15 m)', qty: 1, unitWeight: 4.5 },
    { id: 'eq-2', name: 'Kit de curandeiro', qty: 1, unitWeight: 0.5 },
    { id: 'eq-3', name: 'Rações de viagem', qty: 5, unitWeight: 0.5 },
    { id: 'eq-4', name: 'Balas de chumbo (funda)', qty: 10, unitWeight: 0.05 },
  ],
  armorItems: [
    {
      id: 'ac-item-1',
      name: 'Cota de malha',
      bonus: 2,
      checkPenalty: -2,
      arcaneFailure: 20,
      weight: 6.8,
    },
  ],

  levelSnapshots: [
    { id: 'lv-1', level: 1, label: 'Ficha criada — nascimento do personagem', date: '2025-02-03' },
    { id: 'lv-2', level: 2, label: 'Subiu para Feiticeira 2', date: '2025-02-21' },
    { id: 'lv-3', level: 3, label: 'Multiclasse: 1º nível de Clériga', date: '2025-03-18' },
    { id: 'lv-4', level: 4, label: 'Feiticeira 3', date: '2025-05-02' },
    { id: 'lv-5', level: 5, label: 'Clériga 2 — nível atual', date: '2025-06-14' },
  ],
  sessionLog: [
    {
      id: 'sess-8',
      title: 'Sessão 8 — A Torre Silenciosa',
      date: '2025-06-14',
      summary:
        'O grupo invadiu a torre do necromante, Elyndra usou Enfeitiçar Pessoa para neutralizar o guarda e Borin quase caiu em uma armadilha de gás.',
    },
    {
      id: 'sess-7',
      title: 'Sessão 7 — Negociações em Porto Fero',
      date: '2025-05-31',
      summary: 'Diplomacia intensa com o cartel local, sem combate. Ganhou um contato novo.',
    },
  ],

  lastAccessedAt: hoursAgo(2),
};

const BORIN: Character = {
  id: 'borin',
  systemId: PATHFINDER_SYSTEM_ID,
  name: 'Boris Ironchest',
  photoUrl: null,
  favorited: false,
  active: true,

  identity: {
    raca: 'Anão da Colina',
    tamanho: 'Médio',
    sexo: 'Masculino',
    idadeNum: 87,
    alturaNum: 1.32,
    pesoNum: 79,
    cabelo: 'Ruivo',
    olhos: 'Castanhos',
    divindade: 'Torag',
    terraNatal: 'Kraggodan',
  },
  alignmentLaw: 'Ordeiro',
  alignmentMoral: 'Bom',
  classes: [{ id: 'cls-guerreiro', name: 'Guerreiro', level: 5 }],
  speed: { base: 6, armor: 6, fly: 0, flyManeuverability: '', swim: 0, climb: 0, dig: 0 },
  languages: [
    { id: 'lang-1', name: 'Comum' },
    { id: 'lang-2', name: 'Anão' },
  ],
  story:
    'Filho de uma linhagem de ferreiros de Kraggodan, Boris trocou a forja pela espada após o clã ser atacado por goblins. Carrega o martelo de seu avô e um rancor duradouro contra tudo que rasteja em cavernas.',

  xpEnabled: true,
  xpCurrent: 15200,
  xpMax: 23000,

  hpCurrent: 52,
  hpMax: 58,
  tempHp: 0,
  hpNonLethal: 0,
  hpLog: [],
  drItems: [],

  abilities: {
    str: { base: 18, mods: [], damage: 0, drain: 0, log: [] },
    dex: { base: 12, mods: [], damage: 0, drain: 0, log: [] },
    con: { base: 16, mods: [], damage: 0, drain: 0, log: [] },
    int: { base: 10, mods: [], damage: 0, drain: 0, log: [] },
    wis: { base: 13, mods: [], damage: 0, drain: 0, log: [] },
    cha: { base: 8, mods: [], damage: 0, drain: 0, log: [] },
  },

  acArmor: 8,
  acShield: 2,
  acNatural: 0,
  acDeflection: 0,
  acVariedMods: [],
  initVariedMods: [],
  saves: {
    fort: { base: 4, magic: 0, misc: 0, temp: 0 },
    ref: { base: 1, magic: 0, misc: 0, temp: 0 },
    will: { base: 1, magic: 0, misc: 0, temp: 0 },
  },
  bbaValue: 5,
  rmValue: 0,

  favoredSchool: '',
  opposedSchools: [],
  spellbooks: [],
  spellLikeAbilities: [],

  skills: skillsFrom({
    intimidacao: { classSkill: true, ranks: 5 },
    escalar: { classSkill: true, ranks: 3 },
    percepcao: { ranks: 2 },
    sobrevivencia: { classSkill: true, ranks: 2 },
  }),
  conditionalMods: [],

  weapons: [
    {
      id: 'w-martelo',
      name: 'Martelo de Guerra Anão',
      atk: '+9/+4',
      crit: 'x3',
      dmg: '1d10+5',
      type: 'Concussão',
      range: '—',
      desc: 'Herdado do avô ferreiro; ganha +1 contra orcs e goblinoides.',
      hasAmmo: false,
      ammoCurrent: 0,
      ammoMax: 0,
      ammoLog: [],
    },
  ],

  feats: [
    {
      id: 'f-1',
      name: 'Foco em Arma (Martelo de Guerra Anão)',
      tag: 'Talento de combate',
      desc: '+1 nas jogadas de ataque com martelos de guerra anões.',
    },
    {
      id: 'f-2',
      name: 'Ataque Poderoso',
      tag: 'Talento de combate',
      desc: 'Troca precisão por dano corpo a corpo.',
    },
  ],
  specials: [
    {
      id: 's-1',
      name: 'Ódio',
      subtitle: 'Traço racial',
      uses: '',
      desc: '+1 nas jogadas de ataque contra orcs e goblinoides.',
    },
  ],

  money: { pc: 10, pp: 40, po: 95, pl: 0 },
  load: { light: 100, medium: 200, heavy: 300, overhead: 300, ground: 600, drag: 900 },
  equipment: [{ id: 'eq-1', name: 'Rações de viagem', qty: 8, unitWeight: 0.5 }],
  armorItems: [
    {
      id: 'ac-item-1',
      name: 'Cota de escamas',
      bonus: 8,
      checkPenalty: -3,
      arcaneFailure: 25,
      weight: 22.5,
    },
  ],

  levelSnapshots: [
    { id: 'lv-1', level: 5, label: 'Ficha criada — nível atual', date: '2025-01-10' },
  ],
  sessionLog: [],

  lastAccessedAt: daysAgo(1),
};

const SABLE: Character = {
  id: 'sable',
  systemId: PATHFINDER_SYSTEM_ID,
  name: 'Sable Vantry',
  photoUrl: null,
  favorited: false,
  active: true,

  identity: {
    raca: 'Humana',
    tamanho: 'Médio',
    sexo: 'Feminino',
    idadeNum: 21,
    alturaNum: 1.7,
    pesoNum: 61,
    cabelo: 'Preto',
    olhos: 'Cinzentos',
    divindade: '',
    terraNatal: 'Porto Fero',
  },
  alignmentLaw: 'Caótico',
  alignmentMoral: 'Neutro',
  classes: [{ id: 'cls-ladina', name: 'Ladina', level: 4 }],
  speed: { base: 9, armor: 9, fly: 0, flyManeuverability: '', swim: 0, climb: 0, dig: 0 },
  languages: [
    { id: 'lang-1', name: 'Comum' },
    { id: 'lang-2', name: 'Órquico' },
  ],
  story:
    'Criada nos becos de Porto Fero, Sable aprendeu a sobreviver muito antes de aprender a ler. Hoje usa a lâmina e a lábia em partes iguais, sempre de olho na próxima oportunidade.',

  xpEnabled: true,
  xpCurrent: 6100,
  xpMax: 10000,

  hpCurrent: 24,
  hpMax: 31,
  tempHp: 0,
  hpNonLethal: 0,
  hpLog: [],
  drItems: [],

  abilities: {
    str: { base: 11, mods: [], damage: 0, drain: 0, log: [] },
    dex: { base: 18, mods: [], damage: 0, drain: 0, log: [] },
    con: { base: 12, mods: [], damage: 0, drain: 0, log: [] },
    int: { base: 13, mods: [], damage: 0, drain: 0, log: [] },
    wis: { base: 10, mods: [], damage: 0, drain: 0, log: [] },
    cha: { base: 14, mods: [], damage: 0, drain: 0, log: [] },
  },

  acArmor: 3,
  acShield: 0,
  acNatural: 0,
  acDeflection: 0,
  acVariedMods: [],
  initVariedMods: [{ id: 'init-mod-1', label: 'Reflexos Rápidos', value: 2 }],
  saves: {
    fort: { base: 1, magic: 0, misc: 0, temp: 0 },
    ref: { base: 4, magic: 0, misc: 0, temp: 0 },
    will: { base: 1, magic: 0, misc: 0, temp: 0 },
  },
  bbaValue: 3,
  rmValue: 0,

  favoredSchool: '',
  opposedSchools: [],
  spellbooks: [],
  spellLikeAbilities: [],

  skills: skillsFrom({
    acrobacia: { classSkill: true, ranks: 4 },
    artefuga: { classSkill: true, ranks: 4 },
    furtividade: { classSkill: true, ranks: 4 },
    percepcao: { classSkill: true, ranks: 3 },
    enganacao: { classSkill: true, ranks: 2 },
    disfarce: { classSkill: true, ranks: 1 },
  }),
  conditionalMods: [],

  weapons: [
    {
      id: 'w-adagas',
      name: 'Par de Adagas',
      atk: '+7/+7',
      crit: '19-20/x2',
      dmg: '1d4',
      type: 'Perfurante',
      range: '3 m',
      desc: 'Ataque duplo com armas leves.',
      hasAmmo: false,
      ammoCurrent: 0,
      ammoMax: 0,
      ammoLog: [],
    },
  ],

  feats: [
    {
      id: 'f-1',
      name: 'Combater com Duas Armas',
      tag: 'Talento de combate',
      desc: 'Reduz a penalidade por atacar com duas armas.',
    },
  ],
  specials: [
    {
      id: 's-1',
      name: 'Ataque Furtivo',
      subtitle: '+2d6',
      uses: '',
      desc: 'Dano extra quando o alvo está desprevenido ou flanqueado.',
    },
  ],

  money: { pc: 55, pp: 22, po: 40, pl: 0 },
  load: { light: 43, medium: 86, heavy: 130, overhead: 130, ground: 260, drag: 390 },
  equipment: [{ id: 'eq-1', name: 'Kit de arrombamento', qty: 1, unitWeight: 1 }],
  armorItems: [
    {
      id: 'ac-item-1',
      name: 'Couro batido',
      bonus: 3,
      checkPenalty: -1,
      arcaneFailure: 10,
      weight: 9.5,
    },
  ],

  levelSnapshots: [
    { id: 'lv-1', level: 4, label: 'Ficha criada — nível atual', date: '2025-04-02' },
  ],
  sessionLog: [],

  lastAccessedAt: daysAgo(3),
};

const KAELEN: Character = {
  id: 'kaelen',
  systemId: PATHFINDER_SYSTEM_ID,
  name: 'Kaelen Bravent',
  photoUrl: null,
  favorited: false,
  active: false,

  identity: {
    raca: 'Elfo',
    tamanho: 'Médio',
    sexo: 'Masculino',
    idadeNum: 112,
    alturaNum: 1.82,
    pesoNum: 65,
    cabelo: 'Loiro',
    olhos: 'Verdes',
    divindade: 'Nethys',
    terraNatal: 'Kyonin',
  },
  alignmentLaw: 'Neutro',
  alignmentMoral: 'Bom',
  classes: [{ id: 'cls-mago', name: 'Mago', level: 2 }],
  speed: { base: 9, armor: 9, fly: 0, flyManeuverability: '', swim: 0, climb: 0, dig: 0 },
  languages: [
    { id: 'lang-1', name: 'Comum' },
    { id: 'lang-2', name: 'Élfico' },
    { id: 'lang-3', name: 'Dracônico' },
  ],
  story:
    'Estudioso reservado da Academia Arcana de Kyonin, Kaelen se afastou temporariamente do grupo para pesquisar um manuscrito raro — por isso a ficha está marcada como inativa.',

  xpEnabled: true,
  xpCurrent: 1800,
  xpMax: 3000,

  hpCurrent: 11,
  hpMax: 14,
  tempHp: 0,
  hpNonLethal: 0,
  hpLog: [],
  drItems: [],

  abilities: {
    str: { base: 8, mods: [], damage: 0, drain: 0, log: [] },
    dex: { base: 14, mods: [], damage: 0, drain: 0, log: [] },
    con: { base: 12, mods: [], damage: 0, drain: 0, log: [] },
    int: { base: 18, mods: [], damage: 0, drain: 0, log: [] },
    wis: { base: 12, mods: [], damage: 0, drain: 0, log: [] },
    cha: { base: 10, mods: [], damage: 0, drain: 0, log: [] },
  },

  acArmor: 0,
  acShield: 0,
  acNatural: 0,
  acDeflection: 0,
  acVariedMods: [],
  initVariedMods: [],
  saves: {
    fort: { base: 0, magic: 0, misc: 0, temp: 0 },
    ref: { base: 0, magic: 0, misc: 0, temp: 0 },
    will: { base: 3, magic: 0, misc: 0, temp: 0 },
  },
  bbaValue: 1,
  rmValue: 0,

  favoredSchool: 'Evocação',
  opposedSchools: ['Encantamento'],
  spellbooks: [
    {
      className: 'Mago',
      abilityLabel: 'Inteligência',
      kind: 'preparada',
      cantrips: { label: 'Truques (nível 0)', spells: ['Luz', 'Mão Mágica', 'Detectar Magia'] },
      circles: [{ label: '1º círculo', used: 1, max: 3, spells: ['Mísseis Mágicos', 'Escudo'] }],
    },
  ],
  spellLikeAbilities: [],

  skills: skillsFrom({
    conhecarcano: { classSkill: true, ranks: 2 },
    conhecreligiao: { classSkill: true, ranks: 1 },
    percepcao: { ranks: 1 },
  }),
  conditionalMods: [],

  weapons: [
    {
      id: 'w-cajado',
      name: 'Bordão',
      atk: '+0',
      crit: 'x2',
      dmg: '1d6',
      type: 'Concussão',
      range: '—',
      desc: '',
      hasAmmo: false,
      ammoCurrent: 0,
      ammoMax: 0,
      ammoLog: [],
    },
  ],

  feats: [
    {
      id: 'f-1',
      name: 'Fascínio por Magia',
      tag: 'Talento geral',
      desc: '+2 em Conhecimento (arcano).',
    },
  ],
  specials: [],

  money: { pc: 5, pp: 8, po: 60, pl: 0 },
  load: { light: 26, medium: 53, heavy: 80, overhead: 80, ground: 160, drag: 240 },
  equipment: [{ id: 'eq-1', name: 'Grimório', qty: 1, unitWeight: 1.5 }],
  armorItems: [],

  levelSnapshots: [
    { id: 'lv-1', level: 2, label: 'Ficha criada — nível atual', date: '2025-03-01' },
  ],
  sessionLog: [],

  lastAccessedAt: daysAgo(9),
};

export const SEED_CHARACTERS: Character[] = [ELYNDRA, BORIN, SABLE, KAELEN];

export const FAVORITE_CHARACTER_ID = ELYNDRA.id;
