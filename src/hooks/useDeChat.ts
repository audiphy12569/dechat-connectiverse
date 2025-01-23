import { useContractRead, useContractWrite, useAccount, useConfig } from 'wagmi'
import { parseEther } from 'viem'
import DeChatABI from '../contracts/DeChat.json'
import { CONTRACT_ADDRESS } from '../lib/web3'

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
    query: {
      enabled: !!address,
    },
  })

  const { data: messages, refetch: refetchMessages } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'getUserMessages',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { writeContractAsync: sendMessageContract } = useContractWrite()
  const { writeContractAsync: sendEthMessageContract } = useContractWrite()

  const sendTextMessage = async (recipient: string, content: string, isImage: boolean = false) => {
    try {
      if (!address) throw new Error('Wallet not connected')
      if (!recipient) throw new Error('Recipient address required')
      
      // Add isVoiceMessage parameter (false for text/image messages)
      const tx = await sendMessageContract({
        abi: DeChatABI.abi,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'sendMessage',
        args: [recipient, content, isImage, false], // Added false for isVoiceMessage
        chain: config.chains[0],
        account: address,
      })

      await tx
      
      await Promise.all([refetchMessages(), refetchConversations()])
      
      return tx
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const sendEthMessage = async (recipient: string, content: string, amount: string) => {
    try {
      if (!address) throw new Error('Wallet not connected')
      if (!recipient) throw new Error('Recipient address required')
      
      const tx = await sendEthMessageContract({
        abi: DeChatABI.abi,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'sendEthWithMessage',
        args: [recipient, content],
        value: parseEther(amount),
        chain: config.chains[0],
        account: address,
      })

      await tx
      
      await Promise.all([refetchMessages(), refetchConversations()])
      
      return tx
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