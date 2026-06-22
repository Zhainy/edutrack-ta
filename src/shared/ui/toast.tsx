import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        classNames: {
          toast: 'bg-slate-800 border border-slate-700 text-slate-100',
          description: 'text-slate-400',
          actionButton: 'bg-indigo-500 text-white',
          cancelButton: 'bg-slate-700 text-slate-300',
        },
      }}
    />
  );
}

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),
  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),
  loading: (message: string) => sonnerToast.loading(message),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};
