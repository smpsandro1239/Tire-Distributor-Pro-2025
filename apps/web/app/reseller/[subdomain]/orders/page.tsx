'use client';

import { Button } from '@tire-distributor/ui';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

interface OrderItem {
  id: string;
  tireBrand: string;
  tireModel: string;
  tireSize: string;
  quantity: number;
  price: number;
}

interface OrdersPageProps {
  params: { subdomain: string };
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [params.subdomain, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('resellerId', params.subdomain);
      if (filter !== 'all') {
        queryParams.append('status', filter);
      }

      const response = await fetch(`/api/orders?${queryParams}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Meus Pedidos
        </h1>
        <p className="text-gray-600">
          Acompanhe o status dos seus pedidos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">📦</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 text-yellow-600">⏳</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">🚚</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enviados</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entregues</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'processing' ? 'primary' : 'outline'}
            onClick={() => setFilter('processing')}
          >
            Processando
          </Button>
          <Button
            variant={filter === 'shipped' ? 'primary' : 'outline'}
            onClick={() => setFilter('shipped')}
          >
            Enviados
          </Button>
          <Button
            variant={filter === 'delivered' ? 'primary' : 'outline'}
            onClick={() => setFilter('delivered')}
          >
            Entregues
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pedido #{order.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')} • {order.customerEmail}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    R$ {order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Itens do Pedido
                </h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.tireBrand} {item.tireModel}
                        </p>
                        <p className="text-xs text-gray-600">
                          Tamanho: {item.tireSize} • Quantidade: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        R$ {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-600">
            Seus pedidos aparecerão aqui após a compra
          </p>
        </div>
      )}
    </div>
  );
}
