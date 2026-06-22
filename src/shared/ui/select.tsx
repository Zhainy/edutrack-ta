import {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Item,
  ItemText,
  ItemIndicator,
} from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Select({
  id,
  label,
  placeholder = 'Seleccionar...',
  value,
  onValueChange,
  options,
  error,
  disabled,
  required,
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-400">
          {label}
          {required && (
            <span className="text-rose-400 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <Trigger
          id={selectId}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm',
            'bg-slate-800/50 border text-slate-100 transition-colors',
            'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'data-[placeholder]:text-slate-500',
            error ? 'border-rose-500' : 'border-slate-700 hover:border-slate-600'
          )}
        >
          <Value placeholder={placeholder} />
          <Icon asChild>
            <ChevronDown size={16} strokeWidth={1.5} className="text-slate-500 flex-shrink-0" />
          </Icon>
        </Trigger>
        <Portal>
          <Content
            className="z-50 min-w-[8rem] overflow-hidden rounded-lg bg-slate-800 border border-slate-700 shadow-xl shadow-black/40 animate-fade-in"
            position="popper"
            sideOffset={4}
          >
            <Viewport className="p-1">
              {options.map((option) => (
                <Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none',
                    'text-slate-200 hover:bg-slate-700 focus:bg-slate-700',
                    'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
                    'data-[state=checked]:text-indigo-400'
                  )}
                >
                  <ItemText>{option.label}</ItemText>
                  <ItemIndicator className="absolute right-2">
                    <Check size={14} strokeWidth={1.5} />
                  </ItemIndicator>
                </Item>
              ))}
            </Viewport>
          </Content>
        </Portal>
      </Root>
      {error && (
        <p role="alert" className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
