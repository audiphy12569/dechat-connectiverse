import { useContractRead, useContractWrite, useAccount, useConfig } from 'wagmi'
import { parseEther } from 'viem'
import DeChatABI from '../contracts/DeChat.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

export function useDeChat() {
  const { address } = useAccount()
  const config = useConfig()

  const { data: conversations, refetch: refetchConversations } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'getUserConversations',
    args: address ? [address] : undefined,
    watch: true, // This will make it update automatically when new messages arrive
  })

  const { data: messages, refetch: refetchMessages } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'getUserMessages',
    args: address ? [address] : undefined,
    watch: true, // This will make it update automatically when new messages arrive
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

      // Wait for the transaction to be mined
      await result.wait()
      
      // Refetch the data
      await Promise.all([refetchMessages(), refetchConversations()])
      
      return result
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

      // Wait for the transaction to be mined
      await result.wait()
      
      // Refetch the data
      await Promise.all([refetchMessages(), refetchConversations()])
      
      return result
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