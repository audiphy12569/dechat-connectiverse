import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { sepolia } from 'viem/chains'
import { createPublicClient, http, createWalletClient, custom } from 'viem'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'
const forwarderAddress = import.meta.env.VITE_FORWARDER_ADDRESS || '0xB2b5841DBeF766d4b521221732F9B618fCf34A87' // OpenGSN Forwarder on Sepolia
const CONTRACT_ADDRESS = '0xb503B14e272e8Fa8C0F6470be100D4703c2be3C7'

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

// Create a gasless client using OpenGSN forwarder
export const gaslessClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum),
  account: forwarderAddress as `0x${string}`,
})

createWeb3Modal({ 
  wagmiConfig: config, 
  projectId,
  defaultChain: sepolia,
  themeMode: 'dark'
})

export { CONTRACT_ADDRESS, forwarderAddress }