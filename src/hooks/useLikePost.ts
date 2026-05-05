import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  hasSocialAppAddress,
  socialAppAbi,
  socialAppAddress,
} from '../lib/social-app-contract';
import {
  getReadableTransactionError,
  getSepoliaEtherscanTxUrl,
  getTransactionLifecycleState,
} from '../lib/transaction';

export function useLikePost() {
  const queryClient = useQueryClient();
  const write = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash: write.data,
    query: {
      enabled: Boolean(write.data),
    },
  });

  const transactionState = useMemo(
    () =>
      getTransactionLifecycleState({
        awaitingSignature: write.isPending,
        pending: receipt.isLoading,
        success: receipt.isSuccess,
        error: Boolean(write.error || receipt.error),
      }),
    [receipt.error, receipt.isLoading, receipt.isSuccess, write.error, write.isPending],
  );

  useEffect(() => {
    if (!receipt.isSuccess) return;

    void queryClient.invalidateQueries({
      queryKey: ['readContract'],
    });
  }, [queryClient, receipt.isSuccess]);

  const error = write.error ?? receipt.error ?? null;
  const errorMessage = error
    ? getReadableTransactionError(error, 'Unable to like post.')
    : null;
  const explorerUrl = getSepoliaEtherscanTxUrl(write.data);
  const statusMessage =
    transactionState === 'awaiting_signature'
      ? 'Confirm in wallet...'
      : transactionState === 'pending'
        ? 'Transaction pending...'
        : transactionState === 'success'
          ? 'Like confirmed successfully'
          : transactionState === 'error'
            ? errorMessage
            : null;

  const likePost = (postId: number | bigint) => {
    if (!hasSocialAppAddress) {
      throw new Error('Missing VITE_SOCIAL_APP_CONTRACT_ADDRESS');
    }

    return write.writeContract({
      abi: socialAppAbi,
      address: socialAppAddress,
      functionName: 'likePost',
      args: [BigInt(postId)],
    });
  };

  return {
    likePost,
    hash: write.data,
    transactionState,
    statusMessage,
    successMessage: 'Like confirmed successfully',
    explorerUrl,
    error,
    errorMessage,
    isIdle: transactionState === 'idle',
    isAwaitingSignature: transactionState === 'awaiting_signature',
    isPending: transactionState === 'pending',
    isSuccess: transactionState === 'success',
    isError: transactionState === 'error',
    reset: write.reset,
  };
}
