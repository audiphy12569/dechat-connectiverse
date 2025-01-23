import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { sepolia } from 'viem/chains'
import { createPublicClient, http } from 'viem'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'
export const forwarderAddress = '0x85d4F7d979A3870a7edb81BB3C734d9bC2B24068' // OpenGSN Forwarder on Sepolia
export const CONTRACT_ADDRESS = '0x83863B221d4603334D1D2CfB74c2a9e24EAb55cc'

const metadata = {
  name: 'DeChat',
  description: 'Decentralized Web3 Chat Application',
  url: 'https://dechat.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Configure chains for the Wagmi client
const chains = [sepolia]

// Create the Wagmi config
export const config = defaultWagmiConfig({
  projectId,
  metadata,
  chains,
  transports: {
    [sepolia.id]: http(),
  }
})

// Create a public client for reading from the blockchain
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

createWeb3Modal({ 
  wagmiConfig: config, 
  projectId,
  defaultChain: sepolia,
  themeMode: 'dark'
})