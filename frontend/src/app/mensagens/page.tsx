'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Send, Search, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { mensagensService, Mensagem, Conversation } from '@/services/mensagens.service';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MensagensPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch conversations
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: mensagensService.getConversations,
  });

  // Fetch messages for selected conversation
  const { data: messages } = useQuery({
    queryKey: ['conversation-messages', selectedConversation],
    queryFn: () => mensagensService.getConversation(selectedConversation!),
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: mensagensService.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedConversation] });
      setMessageText('');
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    },
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: (userId: string) => mensagensService.markConversationAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Connect to WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      mensagensService.connect(token);

      // Listen for new messages
      const handleNewMessage = (mensagem: Mensagem) => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });

        if (
          selectedConversation === mensagem.remetenteId ||
          selectedConversation === mensagem.destinatarioId
        ) {
          queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedConversation] });
        }

        // Show toast if not in active conversation
        if (selectedConversation !== mensagem.remetenteId) {
          toast({
            title: 'Nova mensagem',
            description: `De: ${mensagem.remetente?.nome || 'Usuário'}`,
          });
        }
      };

      const handleMessagesRead = () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      };

      const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
        setIsTyping(prev => ({ ...prev, [data.userId]: data.isTyping }));
      };

      mensagensService.on('newMessage', handleNewMessage);
      mensagensService.on('messagesRead', handleMessagesRead);
      mensagensService.on('userTyping', handleUserTyping);

      return () => {
        mensagensService.off('newMessage', handleNewMessage);
        mensagensService.off('messagesRead', handleMessagesRead);
        mensagensService.off('userTyping', handleUserTyping);
        mensagensService.disconnect();
      };
    }
  }, [selectedConversation, queryClient, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (selectedConversation) {
      markReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMutation.mutate({
      destinatarioId: selectedConversation,
      conteudo: messageText,
    });
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    if (selectedConversation) {
      // Send typing indicator
      mensagensService.sendTypingIndicator(selectedConversation, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        mensagensService.sendTypingIndicator(selectedConversation, false);
      }, 2000);
    }
  };

  const filteredConversations = conversations?.filter((conv: Conversation) =>
    conv.user?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="p-8 h-[calc(100vh-100px)]">
      <PageHeader
        title="Mensagens"
        description="Chat interno da equipe"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Mensagens' },
        ]}
      />

      <div className="grid grid-cols-12 gap-4 h-[calc(100%-80px)]">
        {/* Conversations Sidebar */}
        <Card className="col-span-4 flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredConversations?.map((conv: Conversation) => (
                <button
                  key={conv.userId}
                  className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                    selectedConversation === conv.userId ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv.userId)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {conv.user?.nome?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">
                          {conv.user?.nome || 'Usuário'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.conteudo}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.lastMessage?.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredConversations?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma conversa encontrada
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-8 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {conversations
                        ?.find((c: Conversation) => c.userId === selectedConversation)
                        ?.user?.nome?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {conversations?.find((c: Conversation) => c.userId === selectedConversation)
                        ?.user?.nome || 'Usuário'}
                    </h3>
                    {isTyping[selectedConversation] && (
                      <span className="text-xs text-muted-foreground">digitando...</span>
                    )}
                  </div>
                </div>

                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages?.map((msg: Mensagem) => {
                    const isOwn = msg.remetenteId === currentUser.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.conteudo}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {formatDistanceToNow(new Date(msg.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={messageText}
                    onChange={(e) => handleTyping(e.target.value)}
                    disabled={sendMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim() || sendMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecione uma conversa para começar
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
