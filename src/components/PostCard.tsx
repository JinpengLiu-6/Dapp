import { useEffect, useMemo, useState } from 'react';
import { useLikePost } from '../hooks/useLikePost';
import type { SocialPost } from '../hooks/usePosts';
import { TransactionButton } from './TransactionButton';
import { useTransactionToasts } from '../hooks/useTransactionToasts';
import { LoadingSkeleton } from './LoadingSkeleton';

type PostCardProps = {
  post: SocialPost;
};

type PostContentState = {
  content: string;
  isLoading: boolean;
  error: string | null;
};

type IpfsPostPayload = {
  content?: string;
  createdAt?: string;
};

const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
] as const;

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimestamp(timestamp: bigint) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(Number(timestamp) * 1000);
}

function extractContent(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as IpfsPostPayload;
  return typeof data.content === 'string' ? data.content : null;
}

async function fetchPostContent(cid: string, signal: AbortSignal) {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}${cid}`, { signal });

      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('application/json')) {
        const data = (await response.json()) as unknown;
        const content = extractContent(data);
        if (content) return content;
      }

      const text = await response.text();
      if (text.trim()) return text;
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
    }
  }

  throw new Error('Unable to load post content from IPFS');
}

export function PostCard({ post }: PostCardProps) {
  const [postContent, setPostContent] = useState<PostContentState>({
    content: '',
    isLoading: true,
    error: null,
  });
  const likePostTx = useLikePost();
  useTransactionToasts({
    actionLabel: 'Like transaction',
    explorerUrl: likePostTx.explorerUrl,
    hash: likePostTx.hash,
    errorMessage: likePostTx.errorMessage,
    successMessage: likePostTx.successMessage,
    transactionState: likePostTx.transactionState,
  });

  useEffect(() => {
    const controller = new AbortController();

    setPostContent({
      content: '',
      isLoading: true,
      error: null,
    });

    fetchPostContent(post.cid, controller.signal)
      .then((content) => {
        setPostContent({
          content,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        setPostContent({
          content: '',
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unable to load post content from IPFS',
        });
      });

    return () => controller.abort();
  }, [post.cid]);

  useEffect(() => {
    if (!likePostTx.isSuccess) return;

    const timeout = window.setTimeout(() => {
      likePostTx.reset();
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [likePostTx.isSuccess, likePostTx.reset]);

  const likeUiState = useMemo(() => {
    if (likePostTx.transactionState === 'awaiting_signature') return 'submitting';
    if (likePostTx.transactionState === 'pending') return 'pending';
    if (likePostTx.transactionState === 'success') return 'confirmed';
    return 'idle';
  }, [likePostTx.transactionState]);

  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/20 backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">
            {truncateAddress(post.author)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            {formatTimestamp(post.timestamp)}
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-300">
          {post.likeCount.toString()} likes
        </div>
      </div>

      <div className="mt-5 min-h-24">
        {postContent.isLoading ? (
          <div>
            <div className="mb-3 text-sm text-slate-400">Loading post from IPFS...</div>
            <LoadingSkeleton lines={3} />
          </div>
        ) : postContent.error ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-medium text-amber-50">IPFS content unavailable</p>
            <p className="mt-2 leading-6">
              We could not load this post from IPFS right now. You can still see the onchain metadata and try again later.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-amber-200/80">
              {postContent.error}
            </p>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-base leading-7 text-slate-200">
            {postContent.content}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
          CID: {post.cid.slice(0, 10)}...{post.cid.slice(-6)}
        </div>

        <TransactionButton
          disabled={likeUiState !== 'idle'}
          errorMessage={likePostTx.errorMessage}
          explorerUrl={likePostTx.explorerUrl}
          hash={likePostTx.hash}
          idleLabel="Like post"
          onClick={() => likePostTx.likePost(post.id)}
          pendingLabel="Transaction pending..."
          signatureLabel="Confirm in wallet..."
          state={likePostTx.transactionState}
          successLabel="Like confirmed"
        />
      </div>

      <div className="mt-3 min-h-5 text-sm">
        {likePostTx.statusMessage && likePostTx.transactionState !== 'error' && (
          <p className="text-sky-200">{likePostTx.statusMessage}</p>
        )}
        {likePostTx.errorMessage && likePostTx.transactionState === 'error' && (
          <p className="text-rose-200">{likePostTx.errorMessage}</p>
        )}
      </div>
    </article>
  );
}
