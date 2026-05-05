import { useAccount, useChainId, useDisconnect, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';

function getStatusLabel(args: {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  wrongNetwork: boolean;
}) {
  const { isConnected, isConnecting, isReconnecting, wrongNetwork } = args;

  if (isConnecting || isReconnecting) return 'connecting';
  if (!isConnected) return 'disconnected';
  if (wrongNetwork) return 'wrong network';
  return 'connected';
}

export function WalletStatusCard() {
  const { address, connector, isConnected, isConnecting, isReconnecting } =
    useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();

  const wrongNetwork = isConnected && chainId !== sepolia.id;
  const status = getStatusLabel({
    isConnected,
    isConnecting,
    isReconnecting,
    wrongNetwork,
  });

  const statusTone = {
    disconnected: 'bg-slate-500/15 text-slate-200 ring-slate-400/20',
    connecting: 'bg-sky-500/15 text-sky-200 ring-sky-400/20',
    connected: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20',
    'wrong network': 'bg-amber-500/15 text-amber-200 ring-amber-400/20',
  }[status];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Wallet status
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Current connection state
          </h2>
        </div>

        <span className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ${statusTone}`}>
          {status}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Address</p>
          <p className="mt-2 break-all text-sm text-slate-100">
            {address ?? 'No wallet connected'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Network</p>
          <p className="mt-2 text-sm text-slate-100">
            {isConnected ? `${chainId} (${wrongNetwork ? 'unsupported' : 'Sepolia'})` : 'N/A'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connector</p>
          <p className="mt-2 text-sm text-slate-100">
            {connector?.name ?? 'No active connector'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Required chain</p>
          <p className="mt-2 text-sm text-slate-100">
            {sepolia.name} ({sepolia.id})
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {wrongNetwork && (
          <button
            className="rounded-full border border-amber-400/30 bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSwitchingNetwork}
            onClick={() => switchChain({ chainId: sepolia.id })}
            type="button"
          >
            {isSwitchingNetwork ? 'Switching...' : 'Switch to Sepolia'}
          </button>
        )}

        {isConnected && (
          <button
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
            onClick={() => disconnect()}
            type="button"
          >
            Disconnect
          </button>
        )}
      </div>
    </section>
  );
}
