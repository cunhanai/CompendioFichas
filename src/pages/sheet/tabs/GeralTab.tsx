import { useState } from 'react';
import { useCharacter } from '@/app/providers';
import { effectiveLevel, formatSpeed, xpProgress } from '@/entities/character/model/calculations';
import {
  IdentityDialog,
  LanguagesDialog,
  LevelUpDialog,
  SpeedDialog,
  StoryDialog,
  XpDialog,
} from '@/features/sheet-identity';
import { SectionCardButton } from '@/shared/ui/molecules/SectionCard';

type Popup = 'identity' | 'levelUp' | 'speed' | 'languages' | 'xp' | 'story' | null;

// Rough character count at which a 3-line clamp (`line-clamp-3`) actually truncates the text at
// this card's width — "Ler mais" only makes sense to show when there's more to read.
const STORY_PREVIEW_THRESHOLD = 220;

export function GeralTab({ characterId }: { characterId: string }) {
  const { character, update } = useCharacter(characterId);
  const [popup, setPopup] = useState<Popup>(null);
  const close = () => setPopup(null);

  const swimClimbDig = [
    character.speed.swim > 0 ? formatSpeed(character.speed.swim) : null,
    character.speed.climb > 0 ? formatSpeed(character.speed.climb) : null,
    character.speed.dig > 0 ? formatSpeed(character.speed.dig) : null,
  ]
    .filter(Boolean)
    .join(' / ');
  const { pct, remaining } = xpProgress(character.xpCurrent, character.xpMax);

  return (
    <div className="flex flex-col gap-5">
      <SectionCardButton onClick={() => setPopup('identity')}>
        <h3 className="mb-4 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Identidade
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
          <Field
            label="Tendência"
            value={`${character.alignmentLaw} / ${character.alignmentMoral}`}
          />
          <Field label="Raça" value={character.identity.raca} />
          <Field label="Sexo" value={character.identity.sexo} />
          <Field label="Tamanho" value={character.identity.tamanho} />
          <Field label="Idade" value={`${character.identity.idadeNum} anos`} />
          <Field
            label="Altura"
            value={`${String(character.identity.alturaNum).replace('.', ',')} m`}
          />
          <Field
            label="Peso"
            value={`${String(character.identity.pesoNum).replace('.', ',')} kg`}
          />
          <Field label="Cabelo" value={character.identity.cabelo} />
          <Field label="Olhos" value={character.identity.olhos} />
          <Field label="Divindade" value={character.identity.divindade} />
          <Field label="Terra natal" value={character.identity.terraNatal} />
        </div>
        <div className="mt-5 border-t border-neutral-800/70 pt-5">
          <span className="mb-2 block text-[11px] tracking-wider text-neutral-500 uppercase">
            Classes e níveis
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {character.classes.length === 0 ? (
              <span className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm text-neutral-500">
                Sem classe
              </span>
            ) : (
              character.classes.map((cls) => (
                <span
                  key={cls.id}
                  className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200"
                >
                  {cls.name} <b className="text-amber-400">{cls.level}</b>
                </span>
              ))
            )}
            <span className="flex items-center gap-2 text-sm text-neutral-400 sm:ml-auto">
              Nível efetivo:{' '}
              <b className="text-base text-neutral-100">{effectiveLevel(character.classes)}</b>
            </span>
          </div>
        </div>
      </SectionCardButton>

      <SectionCardButton onClick={() => setPopup('speed')}>
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Deslocamento
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Base" value={formatSpeed(character.speed.base)} inCard />
          <Field label="Com armadura" value={formatSpeed(character.speed.armor)} inCard />
          <Field
            label="Voar"
            value={character.speed.fly > 0 ? formatSpeed(character.speed.fly) : '—'}
            inCard
            dimmed={character.speed.fly <= 0}
          />
          <Field
            label="Nadar / Escalar / Cavar"
            value={swimClimbDig || '—'}
            inCard
            dimmed={!swimClimbDig}
          />
        </div>
      </SectionCardButton>

      <SectionCardButton onClick={() => setPopup('languages')}>
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Idiomas
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {character.languages.map((lang) => (
            <span
              key={lang.id}
              className="rounded-full bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300"
            >
              {lang.name}
            </span>
          ))}
        </div>
      </SectionCardButton>

      <SectionCardButton onClick={() => setPopup('xp')}>
        <h3 className="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Experiência
        </h3>
        {character.xpEnabled ? (
          <>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-neutral-300">
                {character.xpCurrent.toLocaleString('pt-BR')} XP
              </span>
              <span className="text-neutral-500">
                faltam {remaining.toLocaleString('pt-BR')} para o próximo nível
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
              <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <div className="opacity-40">
            <div className="mb-1.5 text-sm text-neutral-400">0 XP</div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
              <div className="h-full w-0 bg-neutral-600" />
            </div>
          </div>
        )}
      </SectionCardButton>

      <SectionCardButton onClick={() => setPopup('story')}>
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          História do personagem
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-neutral-300">{character.story}</p>
        {character.story.length > STORY_PREVIEW_THRESHOLD && (
          <span className="mt-1.5 inline-block text-xs font-medium text-amber-500">Ler mais</span>
        )}
      </SectionCardButton>

      <IdentityDialog
        open={popup === 'identity'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
        onOpenLevelUp={() => setPopup('levelUp')}
      />
      <LevelUpDialog
        open={popup === 'levelUp'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
      <SpeedDialog
        open={popup === 'speed'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
      <LanguagesDialog
        open={popup === 'languages'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
      <XpDialog
        open={popup === 'xp'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
      <StoryDialog
        open={popup === 'story'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
    </div>
  );
}

function Field({
  label,
  value,
  inCard,
  dimmed,
}: {
  label: string;
  value: string;
  inCard?: boolean;
  dimmed?: boolean;
}) {
  if (inCard) {
    return (
      <div className="rounded-lg bg-neutral-950 px-3 py-2.5">
        <p className="text-[10px] text-neutral-500">{label}</p>
        <p className={`text-sm font-medium ${dimmed ? 'text-neutral-400' : 'text-neutral-100'}`}>
          {value}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] tracking-wide text-neutral-500 uppercase">{label}</span>
      <span className="text-sm text-neutral-200">{value}</span>
    </div>
  );
}
