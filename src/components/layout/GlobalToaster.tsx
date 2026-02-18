import { Toaster } from 'sonner';

export default function GlobalToaster() {
    return (
        <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            theme="system"
            toastOptions={{
                style: {
                    borderRadius: '1.25rem',
                    padding: '1rem 1.25rem',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(16px)',
                },
                className: 'glass-panel shadow-2xl',
            }}
        />
    );
}
