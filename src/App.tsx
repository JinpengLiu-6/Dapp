import { CreatePost } from './components/CreatePost';
import { Feed } from './components/Feed';
import { WalletButton } from './components/WalletButton';

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#020617_100%)] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-lg font-semibold text-indigo-100 shadow-lg shadow-indigo-500/10">
              S
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-200/80">
                SocialApp
              </p>
              <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
                Decentralized social feed
              </h1>
            </div>
          </div>

          <WalletButton variant="compact" />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,680px)_280px] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-slate-950/20 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Network
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">Sepolia</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Publish posts to IPFS, store CIDs onchain, and interact directly from
              your wallet.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <CreatePost />
          <Feed />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-slate-950/20 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Wallet
              </p>
              <h2 className="mt-3 text-xl font-semibold text-white">
                Connected experience
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Your wallet state stays visible in the header, and posting is enabled
                only when you are connected on Sepolia.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-slate-950/20 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Feed
              </p>
              <h2 className="mt-3 text-xl font-semibold text-white">Timeline</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Posts load from the contract, resolve content from IPFS, and update
                with onchain likes.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
