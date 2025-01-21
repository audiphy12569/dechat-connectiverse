import { useContractRead, useContractWrite } from 'wagmi'
import { parseEther } from 'viem'
import DeChatABI from '../contracts/DeChat.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

export function useDeChat() {
  const { data: conversations, refetch: refetchConversations } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'getUserConversations',
    args: [address],
  })

  const { data: messages, refetch: refetchMessages } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'getUserMessages',
    args: [address],
  })

  const { writeContract: sendMessageContract } = useContractWrite()

  const { writeContract: sendEthMessageContract } = useContractWrite()

  const sendTextMessage = async (recipient: string, content: string, isImage: boolean = false) => {
    try {
      if (!address) throw new Error('Wallet not connected')
      if (!recipient) throw new Error('Recipient address required')
      if (!sendMessageContract) throw new Error('Contract write not ready')
      
      const tx = await sendMessageContract({
        abi: DeChatABI.abi,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'sendMessage',
        args: [recipient, content, isImage],
      })
      
      if (tx) {
        await refetchMessages()
        await refetchConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const sendEthMessage = async (recipient: string, content: string, amount: string) => {
    try {
      if (!address) throw new Error('Wallet not connected')
      if (!recipient) throw new Error('Recipient address required')
      if (!sendEthMessageContract) throw new Error('Contract write not ready')
      
      const tx = await sendEthMessageContract({
        abi: DeChatABI.abi,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'sendEthWithMessage',
        args: [recipient, content],
        value: parseEther(amount),
      })
      
      if (tx) {
        await refetchMessages()
        await refetchConversations()
      }
    } catch (error) {
      console.error('Error sending ETH message:', error)
      throw error
    }
  }

  return {
    conversations: (conversations || []) as string[],
    messages: (messages || []) as any[],
    sendTextMessage,
    sendEthMessage,
    refetchMessages,
    refetchConversations,
  }
}