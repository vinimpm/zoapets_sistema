'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  configuracoesService,
  type UpdateConfiguracaoDto,
} from '@/services/configuracoes.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Building2, Mail, Phone, Globe, Clock, Bell, Facebook, Instagram, MessageCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConfiguracoesSistemaPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateConfiguracaoDto>({
    nomeClinica: '',
    endereco: '',
    telefone: '',
    email: '',
    horarioAtendimento: '',
    cnpj: '',
    siteUrl: '',
    whatsapp: '',
    facebookUrl: '',
    instagramUrl: '',
    notificacoesEmail: true,
    notificacoesSms: false,
    notificacoesWhatsapp: true,
  });

  // Query para buscar configurações
  const { data: configuracao, isLoading } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: () => configuracoesService.get(),
  });

  // Atualizar formulário quando os dados chegarem
  useEffect(() => {
    if (configuracao) {
      setFormData({
        nomeClinica: configuracao.nomeClinica,
        endereco: configuracao.endereco || '',
        telefone: configuracao.telefone || '',
        email: configuracao.email || '',
        horarioAtendimento: configuracao.horarioAtendimento || '',
        cnpj: configuracao.cnpj || '',
        siteUrl: configuracao.siteUrl || '',
        whatsapp: configuracao.whatsapp || '',
        facebookUrl: configuracao.facebookUrl || '',
        instagramUrl: configuracao.instagramUrl || '',
        notificacoesEmail: configuracao.notificacoesEmail,
        notificacoesSms: configuracao.notificacoesSms,
        notificacoesWhatsapp: configuracao.notificacoesWhatsapp,
      });
    }
  }, [configuracao]);

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: (data: UpdateConfiguracaoDto) => configuracoesService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configurações');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie as informações e preferências do sistema
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
            <TabsTrigger value="contato">Contato & Redes Sociais</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          </TabsList>

          {/* Tab: Informações Gerais */}
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <CardTitle>Informações da Clínica</CardTitle>
                </div>
                <CardDescription>
                  Dados básicos sobre a clínica veterinária
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeClinica">Nome da Clínica *</Label>
                    <Input
                      id="nomeClinica"
                      value={formData.nomeClinica}
                      onChange={(e) =>
                        setFormData({ ...formData, nomeClinica: e.target.value })
                      }
                      required
                      placeholder="Ex: Zoa Pets Hospital Veterinário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Textarea
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    rows={3}
                    placeholder="Rua, número, bairro, cidade, estado, CEP"
                  />
                </div>

                <div>
                  <Label htmlFor="horarioAtendimento">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Horário de Atendimento
                  </Label>
                  <Textarea
                    id="horarioAtendimento"
                    value={formData.horarioAtendimento}
                    onChange={(e) =>
                      setFormData({ ...formData, horarioAtendimento: e.target.value })
                    }
                    rows={2}
                    placeholder="Ex: Segunda a Sexta: 8h às 18h&#10;Sábado: 8h às 12h"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Contato & Redes Sociais */}
          <TabsContent value="contato">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <CardTitle>Informações de Contato</CardTitle>
                </div>
                <CardDescription>
                  Canais de comunicação com os clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">
                      <MessageCircle className="h-4 w-4 inline mr-1" />
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-1" />
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@zoapets.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteUrl">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Website
                    </Label>
                    <Input
                      id="siteUrl"
                      value={formData.siteUrl}
                      onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                      placeholder="https://www.zoapets.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Links para perfis nas redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebookUrl">
                    <Facebook className="h-4 w-4 inline mr-1" />
                    Facebook
                  </Label>
                  <Input
                    id="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, facebookUrl: e.target.value })
                    }
                    placeholder="https://facebook.com/zoapets"
                  />
                </div>
                <div>
                  <Label htmlFor="instagramUrl">
                    <Instagram className="h-4 w-4 inline mr-1" />
                    Instagram
                  </Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, instagramUrl: e.target.value })
                    }
                    placeholder="https://instagram.com/zoapets"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Notificações */}
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Preferências de Notificações</CardTitle>
                </div>
                <CardDescription>
                  Configure como o sistema deve enviar notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacoesEmail" className="text-base">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Notificações por E-mail
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações de agendamentos e lembretes por e-mail
                    </p>
                  </div>
                  <Switch
                    id="notificacoesEmail"
                    checked={formData.notificacoesEmail}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notificacoesEmail: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacoesSms" className="text-base">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Notificações por SMS
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações urgentes por SMS
                    </p>
                  </div>
                  <Switch
                    id="notificacoesSms"
                    checked={formData.notificacoesSms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notificacoesSms: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacoesWhatsapp" className="text-base">
                      <MessageCircle className="h-4 w-4 inline mr-2" />
                      Notificações por WhatsApp
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes e confirmações via WhatsApp
                    </p>
                  </div>
                  <Switch
                    id="notificacoesWhatsapp"
                    checked={formData.notificacoesWhatsapp}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notificacoesWhatsapp: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button type="submit" size="lg" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
