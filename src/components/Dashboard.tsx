import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import QuickReplies from "@/components/QuickReplies";
import { EmailChannelManager } from "@/components/EmailChannelManager";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Settings
} from "lucide-react";

interface Conversation {
  id: string;
  patient: {
    name: string;
    email?: string;
    phone?: string;
  };
  channel: {
    name: string;
    type: string;
  };
  status: string;
  priority: number;
  subject?: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  unread_count: number;
}

interface DashboardStats {
  total_conversations: number;
  resolved_conversations: number;
  avg_response_time: string;
  satisfaction_rate: number;
}

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(profile?.role === "attendant" ? "inbox" : "dashboard");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_conversations: 0,
    resolved_conversations: 0,
    avg_response_time: "0min",
    satisfaction_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load conversations with patient and channel data
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          patients!inner(name, email, phone),
          channels!inner(name, type)
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (conversationsError) throw conversationsError;

      // Transform data for UI
      const transformedConversations: Conversation[] = conversationsData?.map(conv => ({
        id: conv.id,
        patient: {
          name: conv.patients.name,
          email: conv.patients.email,
          phone: conv.patients.phone
        },
        channel: {
          name: conv.channels.name,
          type: conv.channels.type
        },
        status: conv.status,
        priority: conv.priority,
        subject: conv.subject,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        assigned_to: conv.assigned_to,
        unread_count: 0 // TODO: Calculate from messages
      })) || [];

      setConversations(transformedConversations);

      // Calculate stats
      const totalConversations = transformedConversations.length;
      const resolvedConversations = transformedConversations.filter(c => c.status === 'resolved').length;
      
      setStats({
        total_conversations: totalConversations,
        resolved_conversations: resolvedConversations,
        avg_response_time: "2.5min",
        satisfaction_rate: Math.round((resolvedConversations / totalConversations) * 100) || 0
      });

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          content: newMessage,
          sender_id: profile?.id,
          is_from_patient: false,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
      
      toast({
        title: "Mensagem enviada",
        description: "A mensagem foi enviada com sucesso.",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'email': return <Mail className="w-4 h-4 text-gray-600" />;
      case 'phone': return <Phone className="w-4 h-4 text-primary" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-primary">Ativo</Badge>;
      case 'waiting': return <Badge variant="secondary">Aguardando</Badge>;
      case 'resolved': return <Badge className="bg-success">Resolvido</Badge>;
      default: return <Badge variant="outline">Novo</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-medical-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-light">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">MediConnect</h1>
            <p className="text-muted-foreground">Sistema Omnichannel</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {profile?.full_name || "Usuário"}
            </Badge>
            <Badge className="bg-primary">
              {profile?.role === "attendant" ? "Atendente" : 
               profile?.role === "manager" ? "Gerente" : "Admin"}
            </Badge>
            <Button variant="outline" onClick={signOut}>Sair</Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${profile?.role === 'manager' || profile?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-3'} sticky top-0 z-10`}>
            <TabsTrigger value="inbox">Caixa de Entrada</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            {(profile?.role === 'manager' || profile?.role === 'admin') && (
              <TabsTrigger value="smtp">
                <Settings className="w-4 h-4 mr-2" />
                Canais SMTP
              </TabsTrigger>
            )}
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-4 lg:grid-cols-3">
              {/* Conversation List */}
              <div className="xl:col-span-1 lg:col-span-1">
                <Card className="h-[calc(100vh-200px)]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Conversas ({conversations.length})
                      </CardTitle>
                      <Button size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar conversas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
                    {filteredConversations.map((conv) => (
                      <div 
                        key={conv.id}
                        className={`p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                          selectedConversation?.id === conv.id ? 'bg-primary/10 border-primary' : ''
                        }`}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getChannelIcon(conv.channel.type)}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{conv.patient.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {conv.subject || "Sem assunto"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {new Date(conv.updated_at).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {conv.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          {getStatusBadge(conv.status)}
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              conv.priority === 1 ? 'bg-destructive' : 
                              conv.priority === 2 ? 'bg-warning' : 'bg-success'
                            }`} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredConversations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma conversa encontrada</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Area */}
              <div className="xl:col-span-2 lg:col-span-2">
                <Card className="h-[calc(100vh-200px)] flex flex-col">
                  <CardHeader className="pb-4">
                    {selectedConversation ? (
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getChannelIcon(selectedConversation.channel.type)}
                          {selectedConversation.patient.name} - {selectedConversation.channel.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedConversation.status)}
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <CardTitle className="text-center text-muted-foreground">
                        Selecione uma conversa
                      </CardTitle>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {selectedConversation ? (
                      <>
                        <div className="flex-1 bg-muted/50 rounded-lg p-4 mb-4 overflow-y-auto">
                          <div className="space-y-4">
                            {/* Mock messages - replace with real data */}
                            <div className="flex justify-start">
                              <div className="bg-card p-3 rounded-lg max-w-xs shadow-sm">
                                <p className="text-sm">Olá, preciso de ajuda com meu agendamento</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(selectedConversation.created_at).toLocaleTimeString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                                <p className="text-sm">Olá! Claro, como posso ajudá-lo?</p>
                                <p className="text-xs opacity-75 mt-1">
                                  {new Date(selectedConversation.updated_at).toLocaleTimeString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Digite sua mensagem..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1"
                          />
                          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Selecione uma conversa para começar</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Replies & Info */}
              <div className="xl:col-span-1 hidden xl:block">
                <div className="space-y-4">
                  <QuickReplies />
                  {selectedConversation && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Informações do Paciente</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Nome</p>
                          <p className="text-sm font-medium">{selectedConversation.patient.name}</p>
                        </div>
                        {selectedConversation.patient.email && (
                          <div>
                            <p className="text-xs text-muted-foreground">E-mail</p>
                            <p className="text-sm">{selectedConversation.patient.email}</p>
                          </div>
                        )}
                        {selectedConversation.patient.phone && (
                          <div>
                            <p className="text-xs text-muted-foreground">Telefone</p>
                            <p className="text-sm">{selectedConversation.patient.phone}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Canal</p>
                          <p className="text-sm capitalize">{selectedConversation.channel.name}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{stats.total_conversations}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Conversas Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{stats.resolved_conversations}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Resolvidas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{stats.avg_response_time}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Tempo Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">{stats.satisfaction_rate}%</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Satisfação</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversations Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle>Conversas Recentes</CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar conversas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <Button size="sm" variant="outline">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead className="hidden sm:table-cell">Canal</TableHead>
                        <TableHead className="hidden md:table-cell">Assunto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Atribuído</TableHead>
                        <TableHead className="hidden sm:table-cell">Atualizado</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConversations.slice(0, 10).map((conv) => (
                        <TableRow key={conv.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{conv.patient.name}</p>
                              <p className="text-xs text-muted-foreground">{conv.patient.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              {getChannelIcon(conv.channel.type)}
                              <span className="capitalize">{conv.channel.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="truncate max-w-[200px]">{conv.subject || "Sem assunto"}</p>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(conv.status)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {conv.assigned_to ? (
                              <Badge variant="outline">Atribuído</Badge>
                            ) : (
                              <Badge variant="secondary">Não atribuído</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <p className="text-sm text-muted-foreground">
                              {new Date(conv.updated_at).toLocaleDateString('pt-BR')}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma conversa encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Atendimentos por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span>WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span>Instagram</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-pink-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span>Email</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-gray-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipe Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{profile?.full_name || "Usuário"}</p>
                          <p className="text-sm text-muted-foreground">{conversations.length} conversas</p>
                        </div>
                      </div>
                      <Badge className="bg-success">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.total_conversations}</p>
                          <p className="text-sm text-muted-foreground">Total de Conversas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-success/10 rounded-lg">
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.resolved_conversations}</p>
                          <p className="text-sm text-muted-foreground">Conversas Resolvidas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-warning/10 rounded-lg">
                          <Clock className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.avg_response_time}</p>
                          <p className="text-sm text-muted-foreground">Tempo Médio de Resposta</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversas por Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['open', 'resolved', 'pending'].map((status) => {
                          const count = conversations.filter(c => c.status === status).length;
                          const percentage = conversations.length > 0 ? Math.round((count / conversations.length) * 100) : 0;
                          
                          return (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(status)}
                                <span className="capitalize">{status === 'open' ? 'Abertas' : status === 'resolved' ? 'Resolvidas' : 'Pendentes'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-muted rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      status === 'open' ? 'bg-primary' : 
                                      status === 'resolved' ? 'bg-success' : 'bg-warning'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMTP Channels Tab */}
          {(profile?.role === 'manager' || profile?.role === 'admin') && (
            <TabsContent value="smtp" className="space-y-6">
              <EmailChannelManager />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;