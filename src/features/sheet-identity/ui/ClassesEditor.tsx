import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { useAppData, useLibrary } from '@/app/providers';
import { TextInput } from '@/shared/ui/atoms/TextField';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { parseNumberInput } from '@/shared/lib/parseNumberInput';
import { addClassAtLevel, removeClassById, renameClass, setClassLevel } from '../model/mutations';

export interface ClassesEditorProps {
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

/** Free-form class editing: add/remove/rename a class, or set its level to anything (up or
 * down) — never wrapped in withLevelUpSnapshot, unlike the deliberate "+1 nível" flow in
 * LevelUpDialog. This is the entry point for bringing in a paper character already leveled up
 * (set the class straight to its current level, no fake history), and for respeccing an
 * existing class at any time (e.g. Mago 4 -> Guerreiro 4) without it reading as a level-up. */
export function ClassesEditor({ character, update }: ClassesEditorProps) {
  const { addLibraryItem } = useAppData();
  const library = useLibrary(character.systemId);
  const libraryClasses = library?.classes ?? [];
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState(1);

  const addNew = () => {
    const name = newName.trim();
    if (!name) return;
    if (!libraryClasses.some((c) => c.name === name)) {
      addLibraryItem(character.systemId, 'classes', { name, desc: '' });
    }
    update((c) => addClassAtLevel(c, name, Math.max(0, newLevel)));
    setNewName('');
    setNewLevel(1);
  };

  return (
    <div className="flex flex-col gap-2">
      {character.classes.map((cls) => (
        <div key={cls.id} className="flex items-center gap-2">
          <TextInput
            value={cls.name}
            onChange={(e) => update((c) => renameClass(c, cls.id, e.target.value))}
            className="min-w-0 flex-1"
          />
          <TextInput
            type="number"
            min={0}
            value={cls.level}
            onChange={(e) => {
              const value = parseNumberInput(e.target.value);
              if (value !== null) update((c) => setClassLevel(c, cls.id, Math.max(0, value)));
            }}
            className="w-16 shrink-0"
          />
          <IconButton
            label="Remover classe"
            variant="danger"
            onClick={() => update((c) => removeClassById(c, cls.id))}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.8} />
          </IconButton>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <TextInput
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nova classe..."
          className="min-w-0 flex-1"
        />
        <TextInput
          type="number"
          min={0}
          value={newLevel}
          onChange={(e) => {
            const value = parseNumberInput(e.target.value);
            if (value !== null) setNewLevel(Math.max(0, value));
          }}
          className="w-16 shrink-0"
        />
        <IconButton label="Adicionar classe" variant="amber" onClick={addNew}>
          <Plus className="h-4 w-4" strokeWidth={2} />
        </IconButton>
      </div>
      <p className="text-[11px] text-neutral-600">
        Edição livre — não gera snapshot. Pra registrar progressão de verdade, use "Upar de nível".
      </p>
    </div>
  );
}
