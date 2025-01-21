import { useContractRead, useContractWrite, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import DeChatABI from '../contracts/DeChat.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

export function useDeChat() {
  const { address } = useAccount()

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

  const { writeAsync: write } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'sendMessage',
  })

  const { writeAsync: writeEth } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeChatABI.abi,
    functionName: 'sendEthWithMessage',
  })

  const sendTextMessage = async (recipient: string, content: string, isImage: boolean = false) => {
    try {
      const tx = await write({
        args: [recipient, content, isImage],
      })
      await tx.wait()
      await refetchMessages()
      await refetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const sendEthMessage = async (recipient: string, content: string, amount: string) => {
    try {
      const tx = await writeEth({
        args: [recipient, content],
        value: parseEther(amount),
      })
      await tx.wait()
      await refetchMessages()
      await refetchConversations()
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