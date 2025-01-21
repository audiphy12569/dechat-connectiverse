import { useContractRead, useContractWrite, useAccount, useConfig } from 'wagmi'
import { parseEther } from 'viem'
import DeChatABI from '../contracts/DeChat.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

interface BlockchainMessage {
  sender: string;
  recipient: string;
  content: string;
  timestamp: bigint;
  isImage: boolean;
  isEthTransfer: boolean;
  ethAmount: bigint;
}

export function useDeChat() {
  const { address } = useAccount()
  const config = useConfig()

  const { data: conversations, refetch: refetchConversations } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'getUserConversations',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  const { data: messages, refetch: refetchMessages } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'getUserMessages',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  const { writeContract: sendMessageContract } = useContractWrite()
  const { writeContract: sendEthMessageContract } = useContractWrite()

  const sendTextMessage = async (recipient: string, content: string, isImage: boolean = false) => {
    try {
      if (!address) throw new Error('Wallet not connected')
      if (!recipient) throw new Error('Recipient address required')
      
      const result = await sendMessageContract({
        abi: DeChatABI.abi,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'sendMessage',
        args: [recipient, content, isImage],
        chain: config.chains[0],
        account: address,
      })

      // Wait for the transaction to be confirmed
      const receipt = await result.wait()
      
      // Refetch the data
      await Promise.all([refetchMessages(), refetchConversations()])
      
      return receipt
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const sendEthMessage = async (recipient: string, content: string, amount: string) => {
    try {
      if (!address) throw new Error('Wallet not connected')
      if (!recipient) throw new Error('Recipient address required')
      
      const result = await sendEthMessageContract({
        abi: DeChatABI.abi,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'sendEthWithMessage',
        args: [recipient, content],
        value: parseEther(amount),
        chain: config.chains[0],
        account: address,
      })

      // Wait for the transaction to be confirmed
      const receipt = await result.wait()
      
      // Refetch the data
      await Promise.all([refetchMessages(), refetchConversations()])
      
      return receipt
    } catch (error) {
      console.error('Error sending ETH message:', error)
      throw error
    }
  }

  return {
    conversations: (conversations || []) as string[],
    messages: (messages || []) as BlockchainMessage[],
    sendTextMessage,
    sendEthMessage,
    refetchMessages,
    refetchConversations,
  }
}