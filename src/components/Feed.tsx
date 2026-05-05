import { PostCard } from './PostCard';
import { usePosts } from '../hooks/usePosts';
import { LoadingSkeleton } from './LoadingSkeleton';

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-xl shadow-slate-950/20"
          key={index}
        >
          <LoadingSkeleton
            className="space-y-4"
            lineClassName="h-4 rounded-full bg-white/10 animate-pulse"
            lines={2}
          />
          <LoadingSkeleton className="mt-6 space-y-3" lines={3} />
          <div className="mt-6">
            <LoadingSkeleton
              className="space-y-0"
              lineClassName="h-10 w-32 rounded-full bg-white/10 animate-pulse"
              lines={1}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Feed() {
  const postsQuery = usePosts();

  if (!postsQuery.isConfigured) {
    return (
      <section className="rounded-[2rem] border border-amber-400/25 bg-amber-500/10 p-6 text-amber-100">
        Add <code>VITE_SOCIAL_APP_CONTRACT_ADDRESS</code> to load the social feed.
      </section>
    );
  }

  if (postsQuery.isLoading) {
    return <FeedSkeleton />;
  }

  if (postsQuery.isError) {
    return (
      <section className="rounded-[2rem] border border-rose-400/25 bg-rose-500/10 p-6 text-rose-100">
        {postsQuery.error instanceof Error
          ? postsQuery.error.message
          : 'Failed to load posts from the contract'}
      </section>
    );
  }

  if (postsQuery.posts.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-10 text-center text-slate-300 shadow-xl shadow-slate-950/20">
        <h2 className="text-2xl font-semibold text-white">No posts yet</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your feed is empty. Publish the first post and start the conversation on Sepolia.
        </p>
      </section>
    );
  }

  const sortedPosts = [...postsQuery.posts].sort((left, right) =>
    left.timestamp === right.timestamp
      ? right.id - left.id
      : Number(right.timestamp - left.timestamp),
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Social feed
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Latest posts from Sepolia
          </h2>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          {sortedPosts.length} posts
        </div>
      </div>

      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
