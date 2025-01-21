import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { truncateAddress } from "@/lib/utils"

interface ChatSidebarProps {
  chats: Array<{
    address: string;
    lastMessage?: string;
    timestamp?: string;
  }>;
  onChatSelect: (address: string) => void;
}

export function ChatSidebar({ chats, onChatSelect }: ChatSidebarProps) {
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chats" className="pl-8" />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-muted-foreground">No chats yet</p>
            <p className="text-sm text-muted-foreground">
              Click the + button below to start a new chat
            </p>
          </div>
        ) : (
          chats.map((chat) => (
            <Button
              key={chat.address}
              variant="ghost"
              className="w-full justify-start px-4 py-6 space-x-4"
              onClick={() => onChatSelect(chat.address)}
            >
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${chat.address}.png`} />
                <AvatarFallback>{chat.address.slice(2, 4)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {truncateAddress(chat.address)}
                  </p>
                  {chat.timestamp && (
                    <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                )}
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  )
}