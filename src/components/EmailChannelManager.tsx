import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailChannel {
  id: string;
  name: string;
  email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  use_tls: boolean;
  is_active: boolean;
}

export const EmailChannelManager = () => {
  const [channels, setChannels] = useState<EmailChannel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<EmailChannel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    use_tls: true,
    is_active: true,
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from("email_channels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os canais de email",
        variant: "destructive",
      });
      return;
    }

    setChannels(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingChannel) {
      const { error } = await supabase
        .from("email_channels")
        .update(formData)
        .eq("id", editingChannel.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o canal",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Canal atualizado com sucesso",
      });
    } else {
      const { error } = await supabase
        .from("email_channels")
        .insert([formData]);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o canal",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Canal criado com sucesso",
      });
    }

    setIsDialogOpen(false);
    resetForm();
    fetchChannels();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("email_channels")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o canal",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Canal excluído com sucesso",
    });
    fetchChannels();
  };

  const handleEdit = (channel: EmailChannel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      email: channel.email,
      smtp_host: channel.smtp_host,
      smtp_port: channel.smtp_port,
      smtp_username: channel.smtp_username,
      smtp_password: channel.smtp_password,
      use_tls: channel.use_tls,
      is_active: channel.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingChannel(null);
    setFormData({
      name: "",
      email: "",
      smtp_host: "",
      smtp_port: 587,
      smtp_username: "",
      smtp_password: "",
      use_tls: true,
      is_active: true,
    });
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Canais de Email (SMTP)</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Canal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingChannel ? "Editar Canal" : "Novo Canal de Email"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Canal</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Servidor SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={formData.smtp_host}
                    onChange={(e) =>
                      setFormData({ ...formData, smtp_host: e.target.value })
                    }
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Porta SMTP</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={formData.smtp_port}
                    onChange={(e) =>
                      setFormData({ ...formData, smtp_port: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">Usuário SMTP</Label>
                  <Input
                    id="smtp_username"
                    value={formData.smtp_username}
                    onChange={(e) =>
                      setFormData({ ...formData, smtp_username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">Senha SMTP</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={formData.smtp_password}
                    onChange={(e) =>
                      setFormData({ ...formData, smtp_password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use_tls"
                    checked={formData.use_tls}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, use_tls: checked })
                    }
                  />
                  <Label htmlFor="use_tls">Usar TLS/SSL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Canal Ativo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingChannel ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Servidor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum canal cadastrado
                </TableCell>
              </TableRow>
            ) : (
              channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="font-medium">{channel.name}</TableCell>
                  <TableCell>{channel.email}</TableCell>
                  <TableCell>{channel.smtp_host}:{channel.smtp_port}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        channel.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {channel.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(channel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(channel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
