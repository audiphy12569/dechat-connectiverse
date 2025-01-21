import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { sepolia } from 'viem/chains'

// Get project ID from environment variable
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'

const metadata = {
  name: 'DeChat',
  description: 'Decentralized Web3 Chat Application',
  url: 'https://dechat.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const config = defaultWagmiConfig({
  projectId,
  metadata,
  chains: [sepolia],
})

createWeb3Modal({ 
  wagmiConfig: config, 
  projectId,
  defaultChain: sepolia,
  themeMode: 'dark'
})