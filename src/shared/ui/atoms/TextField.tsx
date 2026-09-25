import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/shared/lib/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
  /** Content pinned inside the input's left edge, e.g. the "@" prefix on username fields. */
  startAdornment?: ReactNode;
  /** Content pinned inside the input's right edge, e.g. a show/hide password button. */
  endAdornment?: ReactNode;
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
        'w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 transition outline-none placeholder:text-neutral-600 focus:border-amber-500',
        className,
      )}
      {...props}
    />
  );
}

/** Labeled field: small uppercase-ish label above a TextInput, with optional error text. */
export function TextField({
  label,
  error,
  className,
  id,
  ref,
  startAdornment,
  endAdornment,
  ...props
}: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      {label && <span className="text-xs font-medium text-neutral-400">{label}</span>}
      <div className="relative">
        {startAdornment && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-neutral-500">
            {startAdornment}
          </div>
        )}
        <TextInput
          ref={ref}
          id={id}
          className={cn(startAdornment && 'pl-7', endAdornment && 'pr-10', className)}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">{endAdornment}</div>
        )}
      </div>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}
