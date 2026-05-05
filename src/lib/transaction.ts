export type TransactionLifecycleState =
  | 'idle'
  | 'awaiting_signature'
  | 'pending'
  | 'success'
  | 'error';

export function getTransactionLifecycleState(args: {
  awaitingSignature: boolean;
  pending: boolean;
  success: boolean;
  error: boolean;
}): TransactionLifecycleState {
  const { awaitingSignature, pending, success, error } = args;

  if (error) return 'error';
  if (success) return 'success';
  if (pending) return 'pending';
  if (awaitingSignature) return 'awaiting_signature';
  return 'idle';
}

export function getReadableTransactionError(
  error: unknown,
  fallback = 'Something went wrong while submitting the transaction.',
) {
  if (!(error instanceof Error)) return fallback;

  const message = error.message.toLowerCase();

  if (
    message.includes('rejected') ||
    message.includes('denied') ||
    message.includes('declined') ||
    message.includes('user closed') ||
    message.includes('user rejected')
  ) {
    return 'Request rejected in wallet.';
  }

  if (message.includes('insufficient funds')) {
    return 'Insufficient funds to pay gas.';
  }

  if (message.includes('network') && message.includes('switch')) {
    return 'Switch your wallet to Sepolia and try again.';
  }

  return error.message || fallback;
}

export function getSepoliaEtherscanTxUrl(hash?: `0x${string}` | string | null) {
  if (!hash) return null;
  return `https://sepolia.etherscan.io/tx/${hash}`;
}
