import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Truck,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/inventory/")({
  component: InventoryDashboard,
});

interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  expiringSoonCount: number;
  pendingOrdersCount: number;
  totalValue: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category_name: string;
  current_stock: number;
  min_stock_level: number;
  unit_of_measure: string;
  expiry_date?: string;
  requires_refrigeration: boolean;
  is_controlled_substance: boolean;
  status: "normal" | "low_stock" | "expiring_soon" | "out_of_stock";
}

function InventoryDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    pendingOrdersCount: 0,
    totalValue: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      const [statsResponse, productsResponse] = await Promise.all([
        api.inventory.getInventoryStats.query(),
        api.inventory.getProducts.query(),
      ]);
      
      setStats(statsResponse);
      setProducts(productsResponse);
    } catch (error) {
      console.error("Error loading inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "low_stock": return "bg-yellow-100 text-yellow-800";
      case "expiring_soon": return "bg-orange-100 text-orange-800";
      case "out_of_stock": return "bg-red-100 text-red-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getStatusText = (status: Product["status"]) => {
    switch (status) {
      case "low_stock": return "Estoque Baixo";
      case "expiring_soon": return "Vencendo em Breve";
      case "out_of_stock": return "Sem Estoque";
      default: return "Normal";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total de Produtos
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.totalProducts}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Estoque Baixo
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.lowStockCount}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Vencendo em Breve
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.expiringSoonCount}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pedidos Pendentes
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.pendingOrdersCount}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          <Link
            to="/inventory/new-product"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Estoque
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Package className="h-4 w-4 mr-2" />
            Movimentação
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Truck className="h-4 w-4 mr-2" />
            Novo Pedido
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Ver Alertas
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Produtos</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Todas Categorias</option>
                  <option value="Preenchimento">Preenchimento</option>
                  <option value="Toxina Botulínica">Toxina Botulínica</option>
                  <option value="Fios">Fios</option>
                  <option value="Bioestimuladores">Bioestimuladores</option>
                  <option value="Laser">Laser</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredProducts.map((product) => (
            <div key={product.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sku}</p>
                    <p className="text-sm text-gray-500">{product.category_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                    {product.requires_refrigeration && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Refrigeração
                      </span>
                    )}
                    {product.is_controlled_substance && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Controlado
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {product.current_stock} {product.unit_of_measure}
                    </p>
                    <p className="text-sm text-gray-500">
                      Mín: {product.min_stock_level} {product.unit_of_measure}
                    </p>
                    {product.expiry_date && (
                      <p className="text-sm text-gray-500">
                        Validade: {new Date(product.expiry_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/inventory/product/${product.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/inventory/product/${product.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}