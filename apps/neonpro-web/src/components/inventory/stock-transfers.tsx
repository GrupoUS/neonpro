"use client";

/**
 * Story 11.3: Stock Transfers Component
 * Internal stock transfer management interface
 */

import React, { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Icons } from "@/components/ui/icons";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StockOutputManager, type StockTransfer, type TransferRequest } from "@/lib/inventory";
import type { useToast } from "@/hooks/use-toast";

interface StockTransfersProps {
  onRefresh: () => void;
  className?: string;
}

interface TransferFormData {
  produto_id: string;
  centro_custo_origem: string;
  centro_custo_destino: string;
  quantidade: number;
  observacoes: string;
  prioridade: "baixa" | "media" | "alta";
}

export function StockTransfers({ onRefresh, className }: StockTransfersProps) {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<StockTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("pendente");
  const [formData, setFormData] = useState<TransferFormData>({
    produto_id: "",
    centro_custo_origem: "",
    centro_custo_destino: "",
    quantidade: 1,
    observacoes: "",
    prioridade: "media",
  });
  const { toast } = useToast();

  const stockOutputManager = new StockOutputManager();

  useEffect(() => {
    loadTransfers();
  }, [selectedStatus]);

  const loadTransfers = async () => {
    try {
      setIsLoading(true);

      // Get transfers by status
      const { data: transfersData, error: transfersError } =
        await stockOutputManager.getTransfersByStatus(selectedStatus as any);

      if (transfersError) {
        throw new Error(transfersError);
      }

      if (selectedStatus === "pendente") {
        setPendingTransfers(transfersData || []);
        setTransfers([]);
      } else {
        setTransfers(transfersData || []);
        setPendingTransfers([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao carregar transferências";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.produto_id || !formData.centro_custo_origem || !formData.centro_custo_destino) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (formData.centro_custo_origem === formData.centro_custo_destino) {
      toast({
        title: "Erro",
        description: "Centro de custo origem deve ser diferente do destino",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const transferRequest: TransferRequest = {
        produto_id: formData.produto_id,
        centro_custo_origem: formData.centro_custo_origem,
        centro_custo_destino: formData.centro_custo_destino,
        quantidade: formData.quantidade,
        observacoes: formData.observacoes || null,
        prioridade: formData.prioridade,
      };

      const { data, error } = await stockOutputManager.createTransferRequest(transferRequest);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Sucesso",
        description: "Solicitação de transferência criada com sucesso",
      });

      setFormData({
        produto_id: "",
        centro_custo_origem: "",
        centro_custo_destino: "",
        quantidade: 1,
        observacoes: "",
        prioridade: "media",
      });

      setIsDialogOpen(false);
      loadTransfers();
      onRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar transferência";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    try {
      setIsApproving(transferId);

      const { error } = await stockOutputManager.approveTransfer(transferId, "user-123");

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Sucesso",
        description: "Transferência aprovada com sucesso",
      });

      loadTransfers();
      onRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao aprovar transferência";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsApproving(null);
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    try {
      setIsRejecting(transferId);

      const { error } = await stockOutputManager.rejectTransfer(
        transferId,
        "user-123",
        "Rejeitado via interface",
      );

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Sucesso",
        description: "Transferência rejeitada",
      });

      loadTransfers();
      onRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao rejeitar transferência";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRejecting(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: "bg-yellow-100 text-yellow-800",
      aprovado: "bg-green-100 text-green-800",
      rejeitado: "bg-red-100 text-red-800",
      concluido: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      baixa: "bg-gray-100 text-gray-800",
      media: "bg-orange-100 text-orange-800",
      alta: "bg-red-100 text-red-800",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Transferências de Estoque</h2>
            <p className="text-muted-foreground">Gestão de transferências internas</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayTransfers = selectedStatus === "pendente" ? pendingTransfers : transfers;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transferências de Estoque</h2>
          <p className="text-muted-foreground">
            Gestão de transferências internas entre centros de custo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTransfers}>
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Nova Transferência
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleSubmitTransfer}>
                <DialogHeader>
                  <DialogTitle>Solicitar Transferência</DialogTitle>
                  <DialogDescription>
                    Crie uma nova solicitação de transferência entre centros de custo
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="produto_id">Produto *</Label>
                    <Select
                      value={formData.produto_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, produto_id: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROD001">Seringa 10ml</SelectItem>
                        <SelectItem value="PROD002">Luva Nitrilo M</SelectItem>
                        <SelectItem value="PROD003">Máscara N95</SelectItem>
                        <SelectItem value="PROD004">Álcool 70%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="centro_custo_origem">Centro de Custo Origem *</Label>
                    <Select
                      value={formData.centro_custo_origem}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, centro_custo_origem: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cc001">Consultório 1</SelectItem>
                        <SelectItem value="cc002">Consultório 2</SelectItem>
                        <SelectItem value="cc003">Sala de Cirurgia</SelectItem>
                        <SelectItem value="cc004">Recepção</SelectItem>
                        <SelectItem value="cc005">Estoque Central</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="centro_custo_destino">Centro de Custo Destino *</Label>
                    <Select
                      value={formData.centro_custo_destino}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, centro_custo_destino: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o destino" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cc001">Consultório 1</SelectItem>
                        <SelectItem value="cc002">Consultório 2</SelectItem>
                        <SelectItem value="cc003">Sala de Cirurgia</SelectItem>
                        <SelectItem value="cc004">Recepção</SelectItem>
                        <SelectItem value="cc005">Estoque Central</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={formData.quantidade}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          quantidade: parseInt(e.target.value) || 1,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select
                      value={formData.prioridade}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, prioridade: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          observacoes: e.target.value,
                        }))
                      }
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Solicitação"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Status da Transferência</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.ArrowRightLeft className="h-5 w-5" />
            Transferências ({selectedStatus})
          </CardTitle>
          <CardDescription>
            {displayTransfers.length} transferência(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayTransfers.length === 0 ? (
            <div className="text-center py-8">
              <Icons.ArrowRightLeft className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma transferência encontrada
              </h3>
              <p className="text-gray-500">
                Não há transferências com status "{selectedStatus}" no momento.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-mono text-sm">{transfer.id.slice(-8)}</TableCell>
                    <TableCell className="font-medium">
                      {transfer.nome_produto}
                      {transfer.observacoes && (
                        <p className="text-sm text-muted-foreground">{transfer.observacoes}</p>
                      )}
                    </TableCell>
                    <TableCell>{transfer.centro_custo_origem}</TableCell>
                    <TableCell>{transfer.centro_custo_destino}</TableCell>
                    <TableCell>{transfer.quantidade}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(transfer.prioridade)}>
                        {transfer.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transfer.status)}>{transfer.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(transfer.data_solicitacao)}
                      {transfer.data_aprovacao && (
                        <p className="text-muted-foreground">
                          Aprovado: {formatDateTime(transfer.data_aprovacao)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {transfer.status === "pendente" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveTransfer(transfer.id)}
                            disabled={isApproving === transfer.id}
                            className="text-green-600 hover:text-green-700"
                          >
                            {isApproving === transfer.id ? (
                              <Icons.Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Icons.Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectTransfer(transfer.id)}
                            disabled={isRejecting === transfer.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isRejecting === transfer.id ? (
                              <Icons.Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Icons.X className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                      {transfer.status === "aprovado" && (
                        <Badge variant="outline">Aguardando execução</Badge>
                      )}
                      {transfer.status === "concluido" && (
                        <Badge variant="secondary">Concluído</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
