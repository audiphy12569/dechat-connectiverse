import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatWindow } from "@/components/chat/ChatWindow"

const Index = () => {
  const { isConnected } = useAccount()
  const [selectedChat, setSelectedChat] = useState<string>()
  
  // Temporary mock data
  const mockChats = [
    {
      address: "0x1234567890123456789012345678901234567890",
      lastMessage: "Hey there!",
      timestamp: "12:30",
    },
    {
      address: "0x9876543210987654321098765432109876543210",
      lastMessage: "Got your message",
      timestamp: "11:45",
    },
  ]

  const mockMessages = [
    {
      sender: "0x1234567890123456789012345678901234567890",
      content: "Hey there!",
      timestamp: "12:30",
    },
    {
      sender: "me",
      content: "Hi! How are you?",
      timestamp: "12:31",
    },
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-background p-4">
        <h1 className="text-4xl font-bold mb-8">Welcome to DeChat</h1>
        <p className="text-xl text-muted-foreground mb-8 text-center max-w-md">
          Connect your wallet to start sending messages to any Ethereum address
        </p>
        <w3m-button />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar chats={mockChats} onChatSelect={setSelectedChat} />
      <ChatWindow
        recipientAddress={selectedChat}
        messages={mockMessages}
        onSendMessage={console.log}
      />
    </div>
  )
}

export default Index