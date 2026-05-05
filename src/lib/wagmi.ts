import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ?? '';
export const hasWalletConnectProjectId = walletConnectProjectId.length > 0;

export const supportedChains = [sepolia] as const;

export const wagmiConfig = hasWalletConnectProjectId
  ? getDefaultConfig({
      appName: 'SocialApp',
      projectId: walletConnectProjectId,
      chains: supportedChains,
      transports: {
        [sepolia.id]: http(),
      },
      ssr: false,
    })
  : null;
