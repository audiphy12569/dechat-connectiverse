import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { useDeChat } from "@/hooks/useDeChat"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

const Index = () => {
  const { isConnected } = useAccount()
  const [selectedChat, setSelectedChat] = useState<string>()
  const [newAddress, setNewAddress] = useState("")
  const { conversations, messages, sendTextMessage } = useDeChat()
  const { toast } = useToast()

  const handleNewChat = async () => {
    if (!newAddress) return
    try {
      await sendTextMessage(newAddress, "👋 Hello!")
      setSelectedChat(newAddress)
      setNewAddress("")
      toast({
        title: "New chat created",
        description: "Message sent successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      })
    }
  }

  const formatChats = () => {
    return conversations.map((address) => {
      const lastMessage = messages
        .filter((msg) => msg.sender === address || msg.recipient === address)
        .sort((a, b) => b.timestamp - a.timestamp)[0]

      return {
        address,
        lastMessage: lastMessage?.content || "",
        timestamp: lastMessage ? new Date(lastMessage.timestamp * 1000).toLocaleTimeString() : "",
      }
    })
  }

  const getSelectedChatMessages = () => {
    if (!selectedChat) return []
    return messages
      .filter(
        (msg) => msg.sender === selectedChat || msg.recipient === selectedChat
      )
      .map((msg) => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: new Date(msg.timestamp * 1000).toLocaleTimeString(),
        type: msg.isImage ? "image" : "text",
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

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
      <div className="relative">
        <ChatSidebar 
          chats={formatChats()} 
          onChatSelect={setSelectedChat} 
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="absolute bottom-4 right-4" 
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter Ethereum address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
              <Button onClick={handleNewChat} className="w-full">
                Start Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <ChatWindow
        recipientAddress={selectedChat}
        messages={getSelectedChatMessages()}
        onSendMessage={async (content, type) => {
          if (!selectedChat) return
          try {
            await sendTextMessage(selectedChat, content, type === "image")
            toast({
              title: "Success",
              description: "Message sent successfully!",
            })
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to send message",
              variant: "destructive",
            })
          }
        }}
      />
    </div>
  )
}

export default Index