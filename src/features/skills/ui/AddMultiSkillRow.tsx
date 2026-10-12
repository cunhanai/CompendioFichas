import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { MultiSkillCategory } from '@/entities/character/model/skillCatalog';
import { TextInput } from '@/shared/ui/atoms/TextField';
import { IconButton } from '@/shared/ui/atoms/IconButton';

export interface AddMultiSkillRowProps {
  category: MultiSkillCategory;
  onAdd: (specialization: string) => void;
}

/** One row of the "add a specialization" controls for Apresentação/Ofícios/Profissão — a skill
 * category covering multiple named instances instead of one fixed row (see
 * MULTI_SKILL_CATEGORIES). */
export function AddMultiSkillRow({ category, onAdd }: AddMultiSkillRowProps) {
  const [text, setText] = useState('');

  const add = () => {
    const specialization = text.trim();
    if (!specialization) return;
    onAdd(specialization);
    setText('');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-neutral-500">{category.label}</span>
      <TextInput
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
        placeholder="Especialização..."
        className="min-w-0 flex-1"
      />
      <IconButton label={`Adicionar ${category.label.toLowerCase()}`} variant="amber" onClick={add}>
        <Plus className="h-4 w-4" strokeWidth={2} />
      </IconButton>
    </div>
  );
}
