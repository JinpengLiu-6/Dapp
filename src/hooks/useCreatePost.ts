import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  hasSocialAppAddress,
  socialAppAbi,
  socialAppAddress,
} from '../lib/social-app-contract';
import { uploadPostToIpfs } from '../lib/ipfs';
import {
  getReadableTransactionError,
  getSepoliaEtherscanTxUrl,
  getTransactionLifecycleState,
} from '../lib/transaction';

export function useCreatePost() {
  const queryClient = useQueryClient();
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const [uploadedCid, setUploadedCid] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const error = uploadError ?? write.error ?? receipt.error ?? null;
  const errorMessage = error
    ? getReadableTransactionError(error, 'Unable to create post.')
    : null;
  const explorerUrl = getSepoliaEtherscanTxUrl(write.data);
  const statusMessage = isUploading
    ? 'Uploading to IPFS...'
    : transactionState === 'awaiting_signature'
      ? 'Confirm in wallet...'
      : transactionState === 'pending'
        ? 'Transaction pending...'
        : transactionState === 'success'
          ? 'Post created successfully'
          : transactionState === 'error'
            ? errorMessage
            : null;

  useEffect(() => {
    if (!receipt.isSuccess) return;

    void queryClient.invalidateQueries({
      queryKey: ['readContract'],
    });
  }, [queryClient, receipt.isSuccess]);

  const createPost = async (content: string) => {
    if (!hasSocialAppAddress) {
      throw new Error('Missing VITE_SOCIAL_APP_CONTRACT_ADDRESS');
    }

    setUploadError(null);
    setUploadedCid(null);
    setIsUploading(true);

    try {
      const cid = await uploadPostToIpfs({ content });
      setUploadedCid(cid);

      write.writeContract({
        abi: socialAppAbi,
        address: socialAppAddress,
        functionName: 'createPost',
        args: [cid],
      });

      return cid;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error('Failed to upload post content');
      setUploadError(normalizedError);
      throw normalizedError;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setUploadError(null);
    setUploadedCid(null);
    setIsUploading(false);
    write.reset();
  };

  return {
    createPost,
    cid: uploadedCid,
    hash: write.data,
    transactionState,
    statusMessage,
    successMessage: 'Post created successfully',
    explorerUrl,
    error,
    errorMessage,
    isUploading,
    isIdle: transactionState === 'idle' && !isUploading,
    isAwaitingSignature: transactionState === 'awaiting_signature',
    isPending: transactionState === 'pending' || isUploading,
    isSuccess: transactionState === 'success',
    isError: Boolean(uploadError) || transactionState === 'error',
    reset,
  };
}
