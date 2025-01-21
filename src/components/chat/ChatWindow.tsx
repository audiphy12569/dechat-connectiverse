import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Image, Send } from "lucide-react"
import { truncateAddress } from "@/lib/utils"

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  recipientAddress?: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export function ChatWindow({ recipientAddress, messages, onSendMessage }: ChatWindowProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.elements.namedItem('message') as HTMLInputElement
    if (input.value.trim()) {
      onSendMessage(input.value)
      input.value = ''
    }
  }

  if (!recipientAddress) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Select a chat to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={`https://avatar.vercel.sh/${recipientAddress}.png`} />
          <AvatarFallback>{recipientAddress.slice(2, 4)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{truncateAddress(recipientAddress)}</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.sender === recipientAddress ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[70%] ${
                message.sender === recipientAddress
                  ? 'bg-secondary'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4 flex items-center space-x-2">
        <Button type="button" size="icon" variant="ghost">
          <Image className="h-5 w-5" />
        </Button>
        <Button type="button" size="icon" variant="ghost">
          <DollarSign className="h-5 w-5" />
        </Button>
        <Input
          name="message"
          placeholder="Type a message"
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}