import { useEffect, useRef } from 'react';
import { useToast } from '../providers/toast-provider';

type UseTransactionToastsArgs = {
  actionLabel: string;
  explorerUrl?: string | null;
  hash?: `0x${string}` | undefined;
  errorMessage?: string | null;
  successMessage: string;
  transactionState:
    | 'idle'
    | 'awaiting_signature'
    | 'pending'
    | 'success'
    | 'error';
};

export function useTransactionToasts(args: UseTransactionToastsArgs) {
  const { showToast } = useToast();
  const lastSuccessHashRef = useRef<string | undefined>(undefined);
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (args.transactionState !== 'success' || !args.hash) return;
    if (lastSuccessHashRef.current === args.hash) return;

    lastSuccessHashRef.current = args.hash;
    lastErrorRef.current = null;

    showToast({
      title: args.successMessage,
      description: `${args.actionLabel} confirmed on Sepolia.`,
      tone: 'success',
      actionHref: args.explorerUrl,
      actionLabel: args.explorerUrl ? 'View on Etherscan' : undefined,
    });
  }, [args.actionLabel, args.explorerUrl, args.hash, args.successMessage, args.transactionState, showToast]);

  useEffect(() => {
    if (args.transactionState !== 'error' || !args.errorMessage) return;
    if (lastErrorRef.current === args.errorMessage) return;

    lastErrorRef.current = args.errorMessage;

    showToast({
      title: `${args.actionLabel} failed`,
      description: args.errorMessage,
      tone: 'error',
      actionHref: args.explorerUrl,
      actionLabel: args.explorerUrl ? 'View on Etherscan' : undefined,
    });
  }, [args.actionLabel, args.errorMessage, args.explorerUrl, args.transactionState, showToast]);
}
