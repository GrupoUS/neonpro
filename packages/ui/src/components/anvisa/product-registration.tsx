/**
 * ANVISA Product Registration Component
 * Component for registering and managing ANVISA-compliant products
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@neonpro/ui/card';
import { Button } from '@neonpro/ui/button';
import { Input } from '@neonpro/ui/input';
import { Label } from '@neonpro/ui/label';
import { Textarea } from '@neonpro/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@neonpro/ui/select';
import { Badge } from '@neonpro/ui/badge';
import { Alert, AlertDescription } from '@neonpro/ui/alert';
import {
  Plus,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@neonpro/utils';

interface Product {
  id: string;
  name: string;
  registration_number: string;
  manufacturer: string;
  category: string;
  status: 'active' | 'pending' | 'expired' | 'suspended';
  expiry_date: string;
  compliance_score: number;
  created_at: string;
}

interface ProductFormData {
  name: string;
  registration_number: string;
  manufacturer: string;
  category: string;
  description: string;
  expiry_date: string;
  batch_number: string;
  lot_size: number;
}

interface ANVISAProductRegistrationProps {
  clinicId: string;
}

export function ANVISAProductRegistration({
  clinicId,
}: ANVISAProductRegistrationProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    registration_number: '',
    manufacturer: '',
    category: '',
    description: '',
    expiry_date: '',
    batch_number: '',
    lot_size: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [clinicId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/anvisa/products?clinic_id=${clinicId}`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
      }
    } catch (error) {
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        clinic_id: clinicId,
        lot_size: Number(formData.lot_size),
      };

      const response = await fetch('/api/anvisa/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('Produto registrado com sucesso!');
        setFormData({
          name: '',
          registration_number: '',
          manufacturer: '',
          category: '',
          description: '',
          expiry_date: '',
          batch_number: '',
          lot_size: 0,
        });
        setShowForm(false);
        fetchProducts();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao registrar produto');
      }
    } catch (error) {
      setError('Erro ao registrar produto');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Ativo</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            Registro de Produtos ANVISA
          </h3>
          <p className="text-muted-foreground">
            Gerencie produtos estéticos e sua conformidade regulatória
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Produto
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Registration Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Produto</CardTitle>
            <CardDescription>
              Registre um novo produto estético com conformidade ANVISA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Ácido Hialurônico Restylane"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">
                    Número de Registro ANVISA
                  </Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_number: e.target.value,
                      })
                    }
                    placeholder="Ex: 12345.678.901-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                    placeholder="Ex: Galderma"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dermal_filler">
                        Preenchedor Dérmico
                      </SelectItem>
                      <SelectItem value="botulinum_toxin">
                        Toxina Botulínica
                      </SelectItem>
                      <SelectItem value="laser_equipment">
                        Equipamento a Laser
                      </SelectItem>
                      <SelectItem value="topical_treatment">
                        Tratamento Tópico
                      </SelectItem>
                      <SelectItem value="medical_device">
                        Dispositivo Médico
                      </SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch_number">Número do Lote</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) =>
                      setFormData({ ...formData, batch_number: e.target.value })
                    }
                    placeholder="Ex: LOT123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Data de Validade</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lot_size">Quantidade no Lote</Label>
                  <Input
                    id="lot_size"
                    type="number"
                    value={formData.lot_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lot_size: Number(e.target.value),
                      })
                    }
                    placeholder="Ex: 50"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição detalhada do produto, indicações e especificações"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Registrar Produto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {product.manufacturer}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(product.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Registro:</span>
                <span className="text-sm font-mono">
                  {product.registration_number}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Conformidade:
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    getComplianceColor(product.compliance_score)
                  )}
                >
                  {product.compliance_score}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Validade:</span>
                <span className="text-sm">
                  {new Date(product.expiry_date).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Categoria: {product.category}
                  </span>
                  <div className="flex space-x-1">
                    {product.status === 'active' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {product.status === 'pending' && (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    {(product.status === 'expired' ||
                      product.status === 'suspended') && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum produto registrado
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece registrando seus produtos estéticos para garantir
              conformidade com a ANVISA
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}