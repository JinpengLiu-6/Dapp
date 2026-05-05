import { useEffect, useRef, useState } from 'react';
import {
  useAccount,
  useAccountEffect,
  useChainId,
  useDisconnect,
  useEnsName,
  useSwitchChain,
} from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useToast } from '../providers/toast-provider';

type WalletButtonProps = {
  variant?: 'panel' | 'compact';
};

function truncateAddress(address?: string) {
  if (!address) return 'No wallet connected';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getReadableError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;

  const message = error.message.toLowerCase();
  if (
    message.includes('rejected') ||
    message.includes('denied') ||
    message.includes('declined') ||
    message.includes('user closed')
  ) {
    return 'The wallet request was rejected. Please approve it in your wallet to continue.';
  }

  return error.message || fallback;
}

function getSepoliaAddressUrl(address?: string) {
  if (!address) return null;
  return `https://sepolia.etherscan.io/address/${address}`;
}

function buttonClasses(tone: 'primary' | 'neutral' | 'warning') {
  const tones = {
    primary:
      'border-indigo-400/40 bg-indigo-500 text-white hover:bg-indigo-400',
    neutral:
      'border-white/10 bg-white/10 text-slate-100 hover:bg-white/15',
    warning:
      'border-amber-400/40 bg-amber-500 text-slate-950 hover:bg-amber-400',
  };

  return `inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${tones[tone]}`;
}

export function WalletButton({ variant = 'panel' }: WalletButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [didOpenConnectModal, setDidOpenConnectModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const {
    address,
    chain,
    connector,
    isConnected,
    isConnecting,
    isReconnecting,
  } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { data: ensName } = useEnsName({
    address,
    chainId: sepolia.id,
    query: {
      enabled: Boolean(address),
    },
  });

  const wrongNetwork = isConnected && chainId !== sepolia.id;
  const isBusy = isConnecting || isReconnecting || isSwitchingChain;
  const visibleChain = chainId === sepolia.id ? sepolia.name : chain?.name ?? 'Unsupported';
  const displayName = ensName ?? truncateAddress(address);
  const addressUrl = getSepoliaAddressUrl(address);

  useAccountEffect({
    onConnect() {
      setFeedback(null);
      setDidOpenConnectModal(false);
    },
  });

  useEffect(() => {
    if (!didOpenConnectModal) return;
    if (connectModalOpen) return;
    if (isConnected) return;

    setFeedback(
      'The wallet connection was cancelled or rejected. Please try again and approve the request in your wallet.',
    );
    setDidOpenConnectModal(false);
  }, [connectModalOpen, didOpenConnectModal, isConnected]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  const handleOpenConnect = () => {
    setFeedback(null);
    setDidOpenConnectModal(true);
    if (!openConnectModal) {
      setFeedback('RainbowKit connect modal is unavailable right now. Refresh and try again.');
      setDidOpenConnectModal(false);
      return;
    }

    openConnectModal();
  };

  const handleSwitchNetwork = async () => {
    setFeedback(null);

    try {
      await switchChainAsync({ chainId: sepolia.id });
    } catch (error) {
      setFeedback(
        getReadableError(
          error,
          'Unable to switch networks right now. Please try again from your wallet.',
        ),
      );
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setMenuOpen(false);
      showToast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard.',
        tone: 'success',
      });
    } catch {
      showToast({
        title: 'Copy failed',
        description: 'Unable to copy the wallet address.',
        tone: 'error',
      });
    }
  };

  const connectionState = isBusy
    ? 'connecting'
    : !isConnected
      ? 'disconnected'
      : wrongNetwork
        ? 'wrong network'
        : 'connected';

  const accountMenu = isConnected && !wrongNetwork && (
    <div className="relative" ref={menuRef}>
      <button
        className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.14]"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="max-w-36 truncate">{displayName}</span>
        <svg
          aria-hidden="true"
          className="ml-2 h-4 w-4 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-60 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="border-b border-white/8 px-3 py-2">
            <p className="truncate text-sm font-semibold text-white">
              {ensName ?? truncateAddress(address)}
            </p>
            <p className="mt-1 truncate text-xs text-slate-400">{address}</p>
          </div>

          <button
            className="mt-2 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/[0.06]"
            onClick={handleCopyAddress}
            type="button"
          >
            Copy address
          </button>

          {addressUrl && (
            <a
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.06]"
              href={addressUrl}
              onClick={() => setMenuOpen(false)}
              rel="noreferrer"
              target="_blank"
            >
              View on Etherscan
            </a>
          )}

          <button
            className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-white/[0.06]"
            onClick={() => {
              setMenuOpen(false);
              setFeedback(null);
              disconnect();
            }}
            type="button"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        {wrongNetwork && (
          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100 md:block">
              Wrong network, switch to Sepolia
            </div>
            <button
              className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25"
              disabled={isSwitchingChain}
              onClick={handleSwitchNetwork}
              type="button"
            >
              {isSwitchingChain ? 'Switching...' : 'Switch Network'}
            </button>
          </div>
        )}

        {!isConnected && (
          <button
            className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            onClick={handleOpenConnect}
            type="button"
          >
            {isBusy ? 'Connecting...' : 'Connect wallet'}
          </button>
        )}

        {isConnected && !wrongNetwork && (
          <>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 md:inline-flex">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {visibleChain}
            </div>

            <button
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.14]"
              onClick={handleCopyAddress}
              type="button"
            >
              {truncateAddress(address)}
              <svg
                aria-hidden="true"
                className="ml-2 h-4 w-4 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 9h8v8H9zM7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>

            {accountMenu}
          </>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Wallet
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Connection control
          </h2>
        </div>

        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
          {connectionState}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Address</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-100">{displayName}</p>
              {address && <p className="mt-1 text-xs text-slate-400">{truncateAddress(address)}</p>}
            </div>
            {address && (
              <button
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/15"
                onClick={handleCopyAddress}
                type="button"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current chain</p>
          <p className="mt-2 text-sm text-slate-100">
            {isConnected ? visibleChain : 'Not connected'}
          </p>
        </div>
      </div>

      {wrongNetwork && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p>Wrong network, switch to Sepolia</p>
          <button
            className={buttonClasses('warning')}
            disabled={isSwitchingChain}
            onClick={handleSwitchNetwork}
            type="button"
          >
            {isSwitchingChain ? 'Switching...' : 'Switch Network'}
          </button>
        </div>
      )}

      {feedback && (
        <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
          {feedback}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {!isConnected && (
          <button
            className={buttonClasses('primary')}
            onClick={handleOpenConnect}
            type="button"
          >
            {isBusy ? 'Connecting...' : 'Connect wallet'}
          </button>
        )}

        {isConnected && !wrongNetwork && (
          <>
            <button className={buttonClasses('neutral')} onClick={handleCopyAddress} type="button">
              Copy address
            </button>

            {addressUrl && (
              <a
                className={buttonClasses('neutral')}
                href={addressUrl}
                rel="noreferrer"
                target="_blank"
              >
                View on Etherscan
              </a>
            )}

            <button
              className={buttonClasses('neutral')}
              onClick={() => {
                setFeedback(null);
                disconnect();
              }}
              type="button"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      <div className="mt-5 text-sm text-slate-400">
        Connector: {connector?.name ?? 'No active connector'}
      </div>
    </section>
  );
}
