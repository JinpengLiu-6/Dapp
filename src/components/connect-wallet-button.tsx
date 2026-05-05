import { ConnectButton } from '@rainbow-me/rainbowkit';

function baseButtonClasses(tone: 'primary' | 'neutral' | 'warning') {
  const palette = {
    primary:
      'border-indigo-400/40 bg-indigo-500 text-white hover:bg-indigo-400',
    neutral:
      'border-white/10 bg-white/10 text-slate-100 hover:bg-white/15',
    warning:
      'border-amber-400/40 bg-amber-500 text-slate-950 hover:bg-amber-400',
  };

  return `inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${palette[tone]}`;
}

export function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        authenticationStatus,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account !== undefined &&
          chain !== undefined &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        if (!ready) {
          return (
            <button className={baseButtonClasses('neutral')} disabled type="button">
              Loading...
            </button>
          );
        }

        if (!connected) {
          return (
            <button
              className={baseButtonClasses('primary')}
              onClick={openConnectModal}
              type="button"
            >
              Connect wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              className={baseButtonClasses('warning')}
              onClick={openChainModal}
              type="button"
            >
              Wrong network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-3">
            <button
              className={baseButtonClasses('neutral')}
              onClick={openChainModal}
              type="button"
            >
              {chain.name}
            </button>
            <button
              className={baseButtonClasses('primary')}
              onClick={openAccountModal}
              type="button"
            >
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

