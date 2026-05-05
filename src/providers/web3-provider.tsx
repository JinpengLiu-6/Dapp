import { ReactNode } from 'react';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ToastProvider } from './toast-provider';
import { wagmiConfig } from '../lib/wagmi';

const queryClient = new QueryClient();

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  if (!wagmiConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12 text-slate-100">
        <div className="w-full max-w-2xl rounded-3xl border border-amber-400/30 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">
            Configuration required
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Missing WalletConnect project ID
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Add <code>VITE_WALLETCONNECT_PROJECT_ID</code> to your
            <code> .env.local</code> file, then restart the Vite dev server.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 font-mono text-sm text-slate-200">
            VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
          </div>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#4f46e5',
              accentColorForeground: '#ffffff',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
          >
            {children}
          </RainbowKitProvider>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
