import { useState } from 'react';
import { Sparkles, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useAiNoteFormat } from '../hooks/use-ai-note-format';
import { isAIAvailable } from '@/shared/config/feature-flags';

interface AiNoteFormatButtonProps {
  content: string;
  onApplyFormatted: (formatted: string) => void;
}

export function AiNoteFormatButton({ content, onApplyFormatted }: AiNoteFormatButtonProps) {
  const { formattedContent, isLoading, error, format, reset } = useAiNoteFormat();
  const [showPreview, setShowPreview] = useState(false);

  const available = isAIAvailable();
  if (!available) return null;

  const handleFormat = async () => {
    setShowPreview(false);
    reset();
    await format(content);
    setShowPreview(true);
  };

  const handleApply = () => {
    if (formattedContent) {
      onApplyFormatted(formattedContent);
      setShowPreview(false);
      reset();
    }
  };

  const handleDismiss = () => {
    setShowPreview(false);
    reset();
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFormat}
        isLoading={isLoading}
        leftIcon={isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
        className="self-end"
        disabled={!content.trim()}
        type="button"
      >
        {isLoading ? 'Formateando...' : 'Formatear con IA'}
      </Button>

      {showPreview && formattedContent && (
        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-400 flex items-center gap-1">
              <Sparkles size={12} />
              Vista previa formateada
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleApply}>
                <Check size={14} className="mr-1" />
                Aplicar
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Descartar
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-300">{formattedContent}</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <AlertCircle size={12} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
