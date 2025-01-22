import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { useDeChat } from "@/hooks/useDeChat"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, ArrowLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

const Index = () => {
  const { isConnected } = useAccount()
  const [selectedChat, setSelectedChat] = useState<string>()
  const [newAddress, setNewAddress] = useState("")
  const { conversations, messages, sendTextMessage, sendEthMessage } = useDeChat()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [showChat, setShowChat] = useState(false)

  const handleNewChat = () => {
    if (!newAddress) return
    
    if (!conversations.includes(newAddress)) {
      setSelectedChat(newAddress)
      setNewAddress("")
      setShowChat(true)
      toast({
        title: "New chat created",
        description: "You can now start sending messages!",
      })
    } else {
      toast({
        title: "Chat exists",
        description: "This chat already exists in your conversations.",
        variant: "destructive",
      })
    }
  }

  const handleChatSelect = (address: string) => {
    setSelectedChat(address)
    setShowChat(true)
  }

  const formatChats = () => {
    const allAddresses = [...new Set([...conversations, ...(selectedChat ? [selectedChat] : [])])]
    
    return allAddresses.map((address) => {
      const chatMessages = messages
        .filter((msg) => msg.sender === address || msg.recipient === address)
        .sort((a, b) => Number(b.timestamp - a.timestamp))

      const lastMessage = chatMessages[0]

      return {
        address,
        lastMessage: lastMessage?.content || "",
        timestamp: lastMessage ? new Date(Number(lastMessage.timestamp) * 1000).toLocaleTimeString() : "",
      }
    })
  }

  const getSelectedChatMessages = () => {
    if (!selectedChat) return []
    
    return messages
      .filter(msg => 
        (msg.sender === selectedChat || msg.recipient === selectedChat)
      )
      .map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: new Date(Number(msg.timestamp) * 1000).toLocaleTimeString(),
        type: msg.isEthTransfer ? "eth" as const : msg.isImage ? "image" as const : "text" as const,
        ethAmount: msg.isEthTransfer ? msg.ethAmount.toString() : undefined,
      }))
      .sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
  }

  const handleSendEth = async (amount: string, message: string) => {
    if (!selectedChat) return
    try {
      await sendEthMessage(selectedChat, message, amount)
      toast({
        title: "Success",
        description: `Successfully sent ${amount} ETH!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send ETH",
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-background p-4">
        <img 
          src="/dechat-logo.png" 
          alt="DeChat Logo" 
          className="w-32 h-32 mb-6 animate-bounce hover:scale-110 transition-transform duration-300"
        />
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
      {(!showChat || !isMobile) && (
        <div className="relative w-full md:w-80">
          <ChatSidebar 
            chats={formatChats()} 
            onChatSelect={handleChatSelect} 
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
      )}
      {(showChat || !isMobile) && (
        <div className="flex-1 relative">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 z-10"
              onClick={() => setShowChat(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {!selectedChat ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <img 
                src="/dechat-logo.png" 
                alt="DeChat Logo" 
                className="w-40 h-40 mb-6 animate-pulse hover:animate-bounce transition-all duration-300"
              />
              <p className="text-xl text-muted-foreground text-center">
                Select a chat to start messaging
              </p>
            </div>
          ) : (
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
              onSendEth={handleSendEth}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Index