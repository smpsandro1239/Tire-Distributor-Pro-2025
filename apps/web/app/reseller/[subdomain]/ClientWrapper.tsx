'use client';

import { ReactNode } from 'react';
import { CartSidebar } from '../../components/CartSidebar';
import { ChatSupport } from '../../components/ChatSupport';
import { NotificationSystem, useNotifications } from '../../components/NotificationSystem';
import { CartProvider } from '../../contexts/CartContext';

interface ClientWrapperProps {
  children: ReactNode;
  reseller: {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    enableChat: boolean;
    enableLoyalty: boolean;
    currency: string;
  };
}

function NotificationWrapper({ children }: { children: ReactNode }) {
  const { notifications, removeNotification } = useNotifications();

  return (
    <>
      {children}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </>
  );
}

export function ClientWrapper({ children, reseller }: ClientWrapperProps) {
  return (
    <NotificationWrapper>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          {children}

          {/* Cart Sidebar */}
          <CartSidebar reseller={reseller} />

          {/* Chat Support */}
          <ChatSupport
            tenantId={reseller.id}
            enableChat={reseller.enableChat}
          />
        </div>
      </CartProvider>
    </NotificationWrapper>
  );
}
