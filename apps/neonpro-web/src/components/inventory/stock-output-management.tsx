"use client";

/**
 * Story 11.3: Stock Output Management Component
 * Comprehensive stock output creation and management interface
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
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type { Icons } from "@/components/ui/icons";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import type { StockOutputManager, type StockOutput, type StockRequest } from "@/lib/inventory";
import type { useToast } from "@/hooks/use-toast";

interface StockOutputManagementProps {
  onRefresh: () => void;
  className?: string;
}

interface NewStockOutputData {
  centro_custo_id: string;
  solicitante: string;
  motivo: string;
  urgente: boolean;
  items: Array<{
    produto_id: string;
    nome_produto: string;
    quantidade_solicitada: number;
    observacoes?: string;
  }>;
}

export function StockOutputManagement({ onRefresh, className }: StockOutputManagementProps) {
  const [stockOutputs, setStockOutputs] = useState<StockOutput[]>([]);
  const [pendingRequests, setPendingRequests] = useState<StockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOutputData, setNewOutputData] = useState<NewStockOutputData>({
    centro_custo_id: "",
    solicitante: "",
    motivo: "",
    urgente: false,
    items: [],
  });
  const { toast } = useToast();

  const stockOutputManager = new StockOutputManager();

  useEffect(() => {
    loadStockOutputs();
  }, []);

  const loadStockOutputs = async () => {
    try {
      setIsLoading(true);

      // Get recent stock outputs
      const { data: outputs, error: outputsError } = await stockOutputManager.getStockOutputs({
        limit: 50,
        status: undefined,
      });

      if (outputsError) {
        throw new Error(outputsError);
      }

      setStockOutputs(outputs || []);

      // Get pending requests
      const { data: requests, error: requestsError } = await stockOutputManager.getStockRequests({
        status: "pendente",
      });

      if (requestsError) {
        throw new Error(requestsError);
      }

      setPendingRequests(requests || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao carregar saídas de estoque";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStockOutput = async () => {
    try {
      setIsCreating(true);

      if (
        !newOutputData.centro_custo_id ||
        !newOutputData.solicitante ||
        newOutputData.items.length === 0
      ) {
        toast({
          title: "Erro de Validação",
          description: "Preencha todos os campos obrigatórios e adicione pelo menos um item",
          variant: "destructive",
        });
        return;
      }

      const { data: output, error } = await stockOutputManager.createStockOutput({
        centro_custo_id: newOutputData.centro_custo_id,
        solicitante: newOutputData.solicitante,
        motivo: newOutputData.motivo,
        urgente: newOutputData.urgente,
        items: newOutputData.items.map((item) => ({
          produto_id: item.produto_id,
          quantidade_solicitada: item.quantidade_solicitada,
          observacoes: item.observacoes,
        })),
      });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Sucesso",
        description: `Saída de estoque ${output?.numero_saida} criada com sucesso`,
      });

      setShowCreateDialog(false);
      setNewOutputData({
        centro_custo_id: "",
        solicitante: "",
        motivo: "",
        urgente: false,
        items: [],
      });

      loadStockOutputs();
      onRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar saída de estoque";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { success, error } = await stockOutputManager.approveStockRequest(requestId, "Sistema");

      if (!success) {
        throw new Error(error || "Erro ao aprovar solicitação");
      }

      toast({
        title: "Sucesso",
        description: "Solicitação aprovada com sucesso",
      });

      loadStockOutputs();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao aprovar solicitação";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const addItemToOutput = () => {
    setNewOutputData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          produto_id: "",
          nome_produto: "",
          quantidade_solicitada: 0,
          observacoes: "",
        },
      ],
    }));
  };

  const removeItemFromOutput = (index: number) => {
    setNewOutputData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateOutputItem = (index: number, field: string, value: any) => {
    setNewOutputData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      rascunho: "bg-gray-100 text-gray-800",
      pendente: "bg-yellow-100 text-yellow-800",
      aprovada: "bg-blue-100 text-blue-800",
      em_processamento: "bg-purple-100 text-purple-800",
      concluida: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Saídas de Estoque</h2>
            <p className="text-muted-foreground">Gerenciar saídas e solicitações</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saídas de Estoque</h2>
          <p className="text-muted-foreground">Gerenciar saídas e solicitações de materiais</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Nova Saída
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Saída de Estoque</DialogTitle>
              <DialogDescription>
                Preencha as informações para criar uma nova saída de estoque
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="centro_custo">Centro de Custo</Label>
                  <Select
                    value={newOutputData.centro_custo_id}
                    onValueChange={(value) =>
                      setNewOutputData((prev) => ({ ...prev, centro_custo_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cc001">Consultório 1</SelectItem>
                      <SelectItem value="cc002">Consultório 2</SelectItem>
                      <SelectItem value="cc003">Sala de Cirurgia</SelectItem>
                      <SelectItem value="cc004">Recepção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solicitante">Solicitante</Label>
                  <Input
                    id="solicitante"
                    value={newOutputData.solicitante}
                    onChange={(e) =>
                      setNewOutputData((prev) => ({ ...prev, solicitante: e.target.value }))
                    }
                    placeholder="Nome do solicitante"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo da Saída</Label>
                <Textarea
                  id="motivo"
                  value={newOutputData.motivo}
                  onChange={(e) =>
                    setNewOutputData((prev) => ({ ...prev, motivo: e.target.value }))
                  }
                  placeholder="Descreva o motivo da saída"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgente"
                  checked={newOutputData.urgente}
                  onChange={(e) =>
                    setNewOutputData((prev) => ({ ...prev, urgente: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="urgente">Solicitação urgente</Label>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Itens Solicitados</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItemToOutput}>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {newOutputData.items.length === 0 ? (
                  <Alert>
                    <Icons.Info className="h-4 w-4" />
                    <AlertDescription>
                      Adicione pelo menos um item para criar a saída de estoque
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {newOutputData.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Item {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemFromOutput(index)}
                          >
                            <Icons.Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Produto</Label>
                            <Select
                              value={item.produto_id}
                              onValueChange={(value) => {
                                updateOutputItem(index, "produto_id", value);
                                // In real implementation, would fetch product name
                                updateOutputItem(index, "nome_produto", "Nome do Produto");
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o produto" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="prod001">Luvas de Procedimento</SelectItem>
                                <SelectItem value="prod002">Máscaras Cirúrgicas</SelectItem>
                                <SelectItem value="prod003">Soro Fisiológico</SelectItem>
                                <SelectItem value="prod004">Gaze Estéril</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              value={item.quantidade_solicitada}
                              onChange={(e) =>
                                updateOutputItem(
                                  index,
                                  "quantidade_solicitada",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              placeholder="0"
                              min="1"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Observações</Label>
                            <Input
                              value={item.observacoes || ""}
                              onChange={(e) =>
                                updateOutputItem(index, "observacoes", e.target.value)
                              }
                              placeholder="Observações opcionais"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateStockOutput}
                  disabled={isCreating || newOutputData.items.length === 0}
                >
                  {isCreating ? (
                    <>
                      <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Saída"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saídas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                stockOutputs.filter((output) => {
                  const today = new Date().toDateString();
                  return new Date(output.data_saida).toDateString() === today;
                }).length
              }
            </div>
            <p className="text-sm text-muted-foreground">Processadas hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <p className="text-sm text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                stockOutputs
                  .filter((output) => {
                    const outputDate = new Date(output.data_saida);
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    return (
                      outputDate.getMonth() === currentMonth &&
                      outputDate.getFullYear() === currentYear
                    );
                  })
                  .reduce((sum, output) => sum + (output.valor_total || 0), 0),
              )}
            </div>
            <p className="text-sm text-muted-foreground">Consumido este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Clock className="h-5 w-5" />
              Solicitações Pendentes
            </CardTitle>
            <CardDescription>Solicitações aguardando aprovação</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.solicitante}</TableCell>
                    <TableCell>{request.centro_custo_id}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.motivo}</TableCell>
                    <TableCell>
                      {new Date(request.data_solicitacao).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                          <Icons.Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icons.Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Stock Outputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Package className="h-5 w-5" />
            Saídas Recentes
          </CardTitle>
          <CardDescription>Últimas saídas de estoque processadas</CardDescription>
        </CardHeader>
        <CardContent>
          {stockOutputs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockOutputs.slice(0, 10).map((output) => (
                  <TableRow key={output.id}>
                    <TableCell className="font-medium">{output.numero_saida}</TableCell>
                    <TableCell>{output.solicitante}</TableCell>
                    <TableCell>{output.centro_custo_id}</TableCell>
                    <TableCell>{new Date(output.data_saida).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{formatCurrency(output.valor_total || 0)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(output.status)}>{output.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Icons.Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Icons.Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma saída de estoque encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
