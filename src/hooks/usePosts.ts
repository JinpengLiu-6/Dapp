import { useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import {
  hasSocialAppAddress,
  socialAppAbi,
  socialAppAddress,
  type ContractPost,
} from '../lib/social-app-contract';

export type SocialPost = {
  id: number;
  author: `0x${string}`;
  cid: string;
  timestamp: bigint;
  likeCount: bigint;
};

export function usePosts() {
  const queryClient = useQueryClient();
  const lastInvalidationAtRef = useRef(0);

  const invalidatePosts = useCallback(() => {
    const now = Date.now();

    // Prevent back-to-back event bursts from spamming the same query invalidation.
    if (now - lastInvalidationAtRef.current < 500) return;
    lastInvalidationAtRef.current = now;

    void queryClient.invalidateQueries({
      queryKey: ['readContract'],
    });
  }, [queryClient]);

  const query = useReadContract({
    abi: socialAppAbi,
    address: socialAppAddress,
    functionName: 'getPosts',
    query: {
      enabled: hasSocialAppAddress,
      refetchInterval: 30_000,
    },
  });

  useWatchContractEvent({
    abi: socialAppAbi,
    address: socialAppAddress,
    chainId: sepolia.id,
    enabled: hasSocialAppAddress,
    eventName: 'PostCreated',
    onLogs(logs) {
      if (logs.length > 0) invalidatePosts();
    },
  });

  useWatchContractEvent({
    abi: socialAppAbi,
    address: socialAppAddress,
    chainId: sepolia.id,
    enabled: hasSocialAppAddress,
    eventName: 'PostLiked',
    onLogs(logs) {
      if (logs.length > 0) invalidatePosts();
    },
  });

  const posts = useMemo(() => {
    const result = (query.data ?? []) as readonly ContractPost[];

    return result.map((post, index) => ({
      id: index,
      author: post.author,
      cid: post.cid,
      timestamp: post.timestamp,
      likeCount: post.likeCount,
    }));
  }, [query.data]);

  return {
    ...query,
    posts,
    status: query.status,
    isConfigured: hasSocialAppAddress,
  };
}
