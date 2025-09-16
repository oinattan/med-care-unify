import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, MessageSquare, Star } from "lucide-react";

const QuickReplies = () => {
  const quickReplies = [
    {
      id: 1,
      title: "Saudação",
      message: "Olá! Como posso ajudá-lo hoje?",
      category: "Geral",
      usage: 45
    },
    {
      id: 2,
      title: "Agendamento",
      message: "Para agendar uma consulta, preciso verificar nossa agenda. Qual especialidade você procura?",
      category: "Agendamento",
      usage: 32
    },
    {
      id: 3,
      title: "Horário Funcionamento",
      message: "Nosso horário de funcionamento é de segunda a sexta das 8h às 18h, e aos sábados das 8h às 12h.",
      category: "Informações",
      usage: 28
    },
    {
      id: 4,
      title: "Documentos Necessários",
      message: "Para sua consulta, traga: RG, CPF, cartão do convênio (se houver) e exames anteriores relacionados.",
      category: "Consulta",
      usage: 21
    },
    {
      id: 5,
      title: "Reagendamento",
      message: "Entendo que precisa reagendar. Vou verificar as próximas datas disponíveis para você.",
      category: "Agendamento",
      usage: 19
    }
  ];

  const categories = ["Geral", "Agendamento", "Informações", "Consulta"];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Geral": return "bg-primary/10 text-primary";
      case "Agendamento": return "bg-success/10 text-success";
      case "Informações": return "bg-warning/10 text-warning";
      case "Consulta": return "bg-accent/10 text-accent";
      default: return "bg-muted";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Respostas Rápidas
          </CardTitle>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="cursor-pointer">Todas</Badge>
            {categories.map((category) => (
              <Badge 
                key={category}
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10"
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Quick Reply List */}
          <div className="space-y-3">
            {quickReplies.map((reply) => (
              <div 
                key={reply.id}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{reply.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(reply.category)}
                    >
                      {reply.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-3 h-3" />
                    {reply.usage}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {reply.message}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    Usar
                  </Button>
                  <Button size="sm" variant="ghost">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickReplies;