import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Image, Send, X } from "lucide-react"
import { truncateAddress } from "@/lib/utils"
import { uploadToPinata } from "@/lib/ipfs"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatEther } from 'viem'

interface Message {
  sender: string;
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'eth';
  ethAmount?: string;
}

interface ChatWindowProps {
  recipientAddress?: string;
  messages: Message[];
  onSendMessage: (message: string, type?: 'text' | 'image') => void;
  onSendEth?: (amount: string, message: string) => void;
}

export function ChatWindow({ recipientAddress, messages, onSendMessage, onSendEth }: ChatWindowProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [ethAmount, setEthAmount] = useState("");
  const [ethMessage, setEthMessage] = useState("");
  const [showEthDialog, setShowEthDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.elements.namedItem('message') as HTMLInputElement
    if (input.value.trim()) {
      onSendMessage(input.value, 'text')
      input.value = ''
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      toast({
        title: "Uploading image...",
        description: "Please wait while we upload your image to IPFS",
      });

      const ipfsUrl = await uploadToPinata(selectedImage);
      onSendMessage(ipfsUrl, 'image');

      toast({
        title: "Image uploaded successfully",
        description: "Your image has been uploaded and sent",
      });

      // Clear the selected image
      setSelectedImage(null);
      setSelectedImagePreview(null);
    } catch (error) {
      toast({
        title: "Error uploading image",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendEth = async () => {
    if (!ethAmount || !onSendEth) return;

    try {
      await onSendEth(ethAmount, ethMessage || `Sent ${ethAmount} ETH`);
      setShowEthDialog(false);
      setEthAmount("");
      setEthMessage("");
    } catch (error) {
      toast({
        title: "Error sending ETH",
        description: "Failed to send ETH. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <AvatarFallback>{recipientAddress?.slice(2, 4)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{truncateAddress(recipientAddress || '')}</p>
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
              className={`message-bubble ${
                message.sender === recipientAddress
                  ? 'message-bubble-received'
                  : 'message-bubble-sent'
              }`}
            >
              {message.type === 'image' ? (
                <img 
                  src={message.content} 
                  alt="Sent image" 
                  className="max-w-full h-auto max-h-[300px] object-contain rounded-lg"
                  loading="lazy"
                />
              ) : message.type === 'eth' ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-primary/10 rounded-full p-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">
                      Sent {message.ethAmount ? Number(formatEther(BigInt(message.ethAmount))).toFixed(4) : '0'} ETH
                    </p>
                    <p className="text-xs opacity-70">{message.content}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        {selectedImagePreview && (
          <div className="mb-4 relative inline-block">
            <img 
              src={selectedImagePreview} 
              alt="Selected image" 
              className="h-20 w-20 object-cover rounded-lg"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={() => {
                setSelectedImage(null);
                setSelectedImagePreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              className="mt-2"
              onClick={handleImageUpload}
            >
              Send Image
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <Button 
            type="button" 
            size="icon" 
            variant="ghost"
            onClick={handleImageClick}
          >
            <Image className="h-5 w-5" />
          </Button>
          <Dialog open={showEthDialog} onOpenChange={setShowEthDialog}>
            <DialogTrigger asChild>
              <Button type="button" size="icon" variant="ghost">
                <DollarSign className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send ETH</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (ETH)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message (optional)</label>
                  <Input
                    value={ethMessage}
                    onChange={(e) => setEthMessage(e.target.value)}
                    placeholder="Add a message..."
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSendEth}
                  disabled={!ethAmount}
                >
                  Send ETH
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Input
            name="message"
            placeholder="Type a message"
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
