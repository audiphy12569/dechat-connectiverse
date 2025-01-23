import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { sepolia } from 'viem/chains'
import { createClient } from 'viem'

// Get project ID from environment variable
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'
const forwarderAddress = import.meta.env.VITE_FORWARDER_ADDRESS || '0xB2b5841DBeF766d4b521221732F9B618fCf34A87' // OpenGSN Forwarder on Sepolia

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

// Create a custom client for gasless transactions
export const gaslessClient = createClient({
  chain: sepolia,
  transport: config.transport,
})

createWeb3Modal({ 
  wagmiConfig: config, 
  projectId,
  defaultChain: sepolia,
  themeMode: 'dark'
})