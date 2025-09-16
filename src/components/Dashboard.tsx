import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuickReplies from "@/components/QuickReplies";
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
  User
} from "lucide-react";

interface DashboardProps {
  userRole?: "attendant" | "manager";
  onLogout?: () => void;
}

const Dashboard = ({ userRole = "attendant", onLogout }: DashboardProps) => {
  const mockConversations = [
    {
      id: 1,
      patient: "Maria Silva",
      channel: "whatsapp",
      lastMessage: "Preciso remarcar minha consulta para amanhã",
      time: "2 min",
      status: "active",
      unread: 2
    },
    {
      id: 2,
      patient: "João Santos",
      channel: "instagram",
      lastMessage: "Qual o horário de funcionamento?",
      time: "5 min",
      status: "waiting",
      unread: 1
    },
    {
      id: 3,
      patient: "Ana Costa",
      channel: "email",
      lastMessage: "Obrigada pelo atendimento!",
      time: "1h",
      status: "resolved",
      unread: 0
    }
  ];

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

  return (
    <div className="min-h-screen bg-medical-light">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">MediConnect</h1>
            <p className="text-muted-foreground">Sistema Omnichannel</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {userRole === "attendant" ? "Atendente" : "Gerente"}
            </Badge>
            <Button variant="outline" onClick={onLogout}>Sair</Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue={userRole === "attendant" ? "inbox" : "dashboard"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox">Caixa de Entrada</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Conversation List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Conversas (3)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mockConversations.map((conv) => (
                      <div 
                        key={conv.id}
                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getChannelIcon(conv.channel)}
                            <div>
                              <p className="font-medium text-sm">{conv.patient}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {conv.lastMessage}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{conv.time}</p>
                            {conv.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(conv.status)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Maria Silva - WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 bg-muted/50 rounded-lg p-4 mb-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex justify-start">
                          <div className="bg-card p-3 rounded-lg max-w-xs shadow-sm">
                            <p className="text-sm">Preciso remarcar minha consulta para amanhã</p>
                            <p className="text-xs text-muted-foreground mt-1">14:30</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                            <p className="text-sm">Claro! Vou verificar a disponibilidade para amanhã.</p>
                            <p className="text-xs opacity-75 mt-1">14:32</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button>Enviar</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Replies */}
              <div className="lg:col-span-1">
                <QuickReplies />
              </div>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">47</p>
                      <p className="text-sm text-muted-foreground">Conversas Hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">32</p>
                      <p className="text-sm text-muted-foreground">Resolvidas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Clock className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2.5min</p>
                      <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-sm text-muted-foreground">Satisfação</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  <CardTitle>Atendentes Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Ana Santos</p>
                          <p className="text-sm text-muted-foreground">12 atendimentos</p>
                        </div>
                      </div>
                      <Badge className="bg-success">Online</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Carlos Lima</p>
                          <p className="text-sm text-muted-foreground">8 atendimentos</p>
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
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Relatórios detalhados estarão disponíveis após conectar ao Supabase</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;