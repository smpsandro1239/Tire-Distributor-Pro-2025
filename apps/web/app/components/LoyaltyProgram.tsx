'use client';

import { Button } from '@repo/ui';
import { useEffect, useState } from 'react';

interface LoyaltyCustomer {
  id: string;
  email: string;
  name: string;
  totalPoints: number;
  availablePoints: number;
  currentTier: 'BRONZE' | 'SILVER' | 'GOLD';
  joinedAt: string;
}

interface LoyaltyProgramProps {
  tenantId: string;
  enableLoyalty: boolean;
  customerEmail?: string;
}

export function LoyaltyProgram({ tenantId, enableLoyalty, customerEmail }: LoyaltyProgramProps) {
  const [customer, setCustomer] = useState<LoyaltyCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinForm, setJoinForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
  });

  useEffect(() => {
    if (enableLoyalty && customerEmail) {
      fetchCustomerData();
    } else {
      setLoading(false);
    }
  }, [tenantId, enableLoyalty, customerEmail]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/loyalty/${tenantId}/customer?email=${customerEmail}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de fidelidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/loyalty/${tenantId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinForm),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
        setShowJoinForm(false);
        alert('Parabéns! Você foi cadastrado no programa de fidelidade!');
      }
    } catch (error) {
      console.error('Erro ao cadastrar no programa:', error);
      alert('Erro ao cadastrar. Tente novamente.');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'text-orange-600 bg-orange-100';
      case 'SILVER': return 'text-gray-600 bg-gray-100';
      case 'GOLD': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return ['1 ponto por R$ gasto', 'Desconto de 5% em compras', 'Frete grátis acima de R$ 500'];
      case 'SILVER':
        return ['1.5 pontos por R$ gasto', 'Desconto de 8% em compras', 'Frete grátis acima de R$ 300', 'Acesso a promoções exclusivas'];
      case 'GOLD':
        return ['2 pontos por R$ gasto', 'Desconto de 12% em compras', 'Frete grátis em todas as compras', 'Suporte prioritário', 'Produtos exclusivos'];
      default:
        return [];
    }
  };

  const getNextTierProgress = () => {
    if (!customer) return { nextTier: '', progress: 0, pointsNeeded: 0 };

    const thresholds = { BRONZE: 0, SILVER: 1000, GOLD: 5000 };

    if (customer.currentTier === 'GOLD') {
      return { nextTier: '', progress: 100, pointsNeeded: 0 };
    }

    const nextTier = customer.currentTier === 'BRONZE' ? 'SILVER' : 'GOLD';
    const currentPoints = customer.totalPoints;
    const nextThreshold = thresholds[nextTier as keyof typeof thresholds];
    const currentThreshold = thresholds[customer.currentTier];

    const progress = ((currentPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    const pointsNeeded = nextThreshold - currentPoints;

    return { nextTier, progress: Math.min(progress, 100), pointsNeeded: Math.max(pointsNeeded, 0) };
  };

  if (!enableLoyalty) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customer && !showJoinForm) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              Programa de Fidelidade
            </h3>
            <p className="text-blue-100">
              Ganhe pontos a cada compra e troque por descontos exclusivos!
            </p>
          </div>
          <Button
            onClick={() => setShowJoinForm(true)}
            variant="outline"
            className="bg-white text-blue-600 border-white hover:bg-blue-50"
          >
            Participar
          </Button>
        </div>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Cadastre-se no Programa de Fidelidade
        </h3>
        <form onSubmit={handleJoinProgram} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={joinForm.name}
                onChange={(e) => setJoinForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={joinForm.email}
                onChange={(e) => setJoinForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={joinForm.phone}
                onChange={(e) => setJoinForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={joinForm.birthday}
                onChange={(e) => setJoinForm(prev => ({ ...prev, birthday: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowJoinForm(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (customer) {
    const { nextTier, progress, pointsNeeded } = getNextTierProgress();

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Programa de Fidelidade
            </h3>
            <p className="text-gray-600">
              Olá, {customer.name}! Você é membro desde {new Date(customer.joinedAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTierColor(customer.currentTier)}`}>
            {customer.currentTier}
          </span>
        </div>

        {/* Points Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {customer.availablePoints}
            </div>
            <div className="text-sm text-gray-600">Pontos Disponíveis</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {customer.totalPoints}
            </div>
            <div className="text-sm text-gray-600">Total de Pontos</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              R$ {(customer.availablePoints * 0.01).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Valor em Desconto</div>
          </div>
        </div>

        {/* Next Tier Progress */}
        {nextTier && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progresso para {nextTier}
              </span>
              <span className="text-sm text-gray-600">
                {pointsNeeded} pontos restantes
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current Tier Benefits */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">
            Seus Benefícios {customer.currentTier}
          </h4>
          <ul className="space-y-2">
            {getTierBenefits(customer.currentTier).map((benefit, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return null;
}
