import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useCreatePost } from '../hooks/useCreatePost';
import { TransactionButton } from './TransactionButton';
import { useTransactionToasts } from '../hooks/useTransactionToasts';

const MAX_POST_LENGTH = 280;

function truncateAddress(address?: string) {
  if (!address) return 'Guest';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function CreatePost() {
  const [content, setContent] = useState('');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const createPostTx = useCreatePost();

  useTransactionToasts({
    actionLabel: 'Post creation',
    explorerUrl: createPostTx.explorerUrl,
    hash: createPostTx.hash,
    errorMessage: createPostTx.errorMessage,
    successMessage: createPostTx.successMessage,
    transactionState: createPostTx.transactionState,
  });

  const remainingChars = MAX_POST_LENGTH - content.length;
  const wrongNetwork = isConnected && chainId !== sepolia.id;
  const isDisabled =
    !isConnected ||
    wrongNetwork ||
    !content.trim() ||
    content.length > MAX_POST_LENGTH ||
    createPostTx.isUploading ||
    createPostTx.isAwaitingSignature ||
    createPostTx.isPending;

  useEffect(() => {
    if (!createPostTx.isSuccess) return;
    setContent('');
  }, [createPostTx.isSuccess]);

  const statusLabel = useMemo(() => createPostTx.statusMessage, [createPostTx.statusMessage]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="border-b border-white/8 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Create post
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Share something with the network
            </h2>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
            {isConnected ? truncateAddress(address) : 'Wallet not connected'}
          </div>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <textarea
          className="min-h-36 w-full resize-none rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/[0.05]"
          maxLength={MAX_POST_LENGTH}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What's happening?"
          value={content}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-100">
              Network: Sepolia
            </span>
            {wrongNetwork && (
              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-amber-100">
                Switch wallet to Sepolia to post
              </span>
            )}
            {!isConnected && (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-slate-300">
                Connect wallet to post
              </span>
            )}
          </div>

          <div
            className={`text-sm font-medium ${
              remainingChars < 0 ? 'text-rose-300' : 'text-slate-400'
            }`}
          >
            {remainingChars} left
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="min-h-5 text-sm">
            {statusLabel && !createPostTx.isError && (
              <p className={createPostTx.isSuccess ? 'text-emerald-200' : 'text-sky-200'}>
                {statusLabel}
              </p>
            )}
            {createPostTx.isError && (
              <p className="text-rose-200">{createPostTx.errorMessage ?? 'Unable to publish post'}</p>
            )}
          </div>

          <TransactionButton
            disabled={isDisabled}
            errorMessage={createPostTx.errorMessage}
            explorerUrl={createPostTx.explorerUrl}
            hash={createPostTx.hash}
            idleLabel="Post"
            onClick={() => void createPostTx.createPost(content)}
            pendingLabel="Transaction pending..."
            signatureLabel={
              createPostTx.isUploading ? 'Uploading to IPFS...' : 'Confirm in wallet...'
            }
            state={
              createPostTx.isUploading
                ? 'awaiting_signature'
                : createPostTx.transactionState
            }
            successLabel="Post created successfully"
          />
        </div>
      </div>
    </section>
  );
}
