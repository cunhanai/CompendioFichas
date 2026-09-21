import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/shared/lib/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

/** Bare styled input, matching the mock's dark inputs with amber focus ring. */
export function TextInput({ className, ref, ...props }: TextInputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        'rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 transition outline-none placeholder:text-neutral-600 focus:border-amber-500',
        className,
      )}
      {...props}
    />
  );
}

/** Labeled field: small uppercase-ish label above a TextInput, with optional error text. */
export function TextField({ label, error, className, id, ref, ...props }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      {label && <span className="text-xs font-medium text-neutral-400">{label}</span>}
      <TextInput ref={ref} id={id} className={className} {...props} />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}
