import type { ReactNode } from 'react';
import type { TransactionLifecycleState } from '../lib/transaction';

type TransactionButtonProps = {
  disabled?: boolean;
  errorMessage?: string | null;
  explorerUrl?: string | null;
  hash?: `0x${string}` | undefined;
  idleLabel: string;
  onClick: () => void;
  pendingLabel?: string;
  signatureLabel?: string;
  state: TransactionLifecycleState;
  successLabel?: string;
};

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
  );
}

function stateLabel(props: TransactionButtonProps) {
  switch (props.state) {
    case 'awaiting_signature':
      return props.signatureLabel ?? 'Confirm in wallet...';
    case 'pending':
      return props.pendingLabel ?? 'Transaction pending...';
    case 'success':
      return props.successLabel ?? 'Success';
    case 'error':
      return props.idleLabel;
    default:
      return props.idleLabel;
  }
}

function statusText(props: TransactionButtonProps) {
  switch (props.state) {
    case 'awaiting_signature':
      return 'Confirm in wallet...';
    case 'pending':
      return 'Transaction pending...';
    case 'success':
      return props.successLabel ?? 'Transaction confirmed';
    case 'error':
      return props.errorMessage ?? 'Transaction failed';
    default:
      return null;
  }
}

export function TransactionButton(props: TransactionButtonProps) {
  const label = stateLabel(props);
  const status = statusText(props);
  const isBusy =
    props.state === 'awaiting_signature' || props.state === 'pending';

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-slate-300"
        disabled={props.disabled || isBusy}
        onClick={props.onClick}
        type="button"
      >
        {isBusy && <Spinner />}
        <span>{label}</span>
      </button>

      {(status || props.hash) && (
        <div className="text-right text-xs text-slate-400">
          {status && <p>{status}</p>}
          {props.hash && props.explorerUrl && (
            <a
              className="inline-flex items-center gap-1 text-sky-300 transition hover:text-sky-200"
              href={props.explorerUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span>{props.hash.slice(0, 8)}...{props.hash.slice(-6)}</span>
              <ExternalLink />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ExternalLink(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M14 5h5m0 0v5m0-5-8 8M10 7H8a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
