
import React, { useState, useContext, useMemo } from 'react';
import { CartContext } from '../contexts/CartContext';
import { StoreInfo, Stock, CartItem, Promotion } from '../types';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon, WhatsAppIcon, PhotoIcon, SiteSeguroIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';
import CheckoutModal from './CheckoutModal';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  storeInfo: StoreInfo | null;
  stock: Stock[];
  promotions: Promotion[];
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, storeInfo, stock, promotions }) => {
  const cartContext = useContext(CartContext);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!cartContext) return null;
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, cartNumericId } = cartContext;

  const handleWhatsAppCheckout = () => {
    if (!storeInfo || !storeInfo.telefone) return;

    let message = `Olá! Quero finalizar meu pedido na *${storeInfo.nome_loja || 'sua loja'}*:\n\n`;
    if (cartNumericId) {
      message += `*N° do Pedido:* #${cartNumericId}\n\n`;
    }
    cartItems.forEach(item => {
      let attrString = '';
      if (item.atributos) {
        attrString = Object.entries(item.atributos)
          .map(([k, v]) => ` — ${k}: ${v}`)
          .join('');
      }

      message += `• ${item.nome} — Ref: ${item.produto_id}${attrString} — Qtd: ${item.quantidade} — R$ ${item.preco_unitario.toFixed(2).replace('.', ',')}\n`;
    });
    message += `\n*Total: R$ ${getCartTotal().toFixed(2).replace('.', ',')}*`;

    const encodedMessage = encodeURIComponent(message);
    let phoneNumber = storeInfo.telefone.replace(/\D/g, ''); // Remove non-numeric characters

    if (phoneNumber.length === 10 || phoneNumber.length === 11) {
      phoneNumber = `55${phoneNumber}`;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAttemptRemove = (item: CartItem) => {
    setItemToDelete(item);
  };

  const handleConfirmRemove = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  // Helper to verify stock availability for dynamic attributes
  const getStockLimit = (item: CartItem) => {
    const stockItem = stock.find(s => {
      if (s.produto_id !== item.produto_id) return false;
      // Compare attributes
      const stockAttrs = s.atributos || {};
      const itemAttrs = item.atributos || {};
      const keys = Object.keys(itemAttrs);
      if (Object.keys(stockAttrs).length !== keys.length) return false;
      return keys.every(k => stockAttrs[k] === itemAttrs[k]);
    });
    return stockItem?.quantidade || 0;
  };

  // Find the BEST automatic free shipping promotion (closest to goal)
  const freeShippingPromo = useMemo(() => {
    const candidates = promotions.filter(p => 
      p.ativo && 
      (!p.codigo_cupom || p.codigo_cupom.trim() === '') && // No coupon code required
      ['shipping', 'frete_gratis', 'frete'].includes(p.tipo_desconto || '')
    );

    if (candidates.length === 0) return undefined;

    // Calculate status for each candidate to find the "best" one to show
    const statuses = candidates.map(promo => {
        const goal = Number(promo.valor_minimo) || 0;
        let eligible = 0;
        const isGeneral = !promo.categorias || promo.categorias.length === 0 || promo.categorias.includes('Todas');

        if (isGeneral) {
            eligible = getCartTotal();
        } else {
            eligible = cartItems.reduce((acc, item) => {
                if (item.categoria && promo.categorias?.includes(item.categoria)) {
                    return acc + (item.preco_unitario * item.quantidade);
                }
                return acc;
            }, 0);
        }
        
        return {
            promo,
            remaining: Math.max(0, goal - eligible),
            isGeneral
        };
    });

    // Sort Logic:
    // 1. If achieved (remaining <= 0), it goes to top.
    // 2. If both unachieved, prefer "General" rules if the difference is acceptable to avoid confusion.
    statuses.sort((a, b) => {
        // Priority 1: Already Achieved
        if (a.remaining <= 0 && b.remaining > 0) return -1;
        if (b.remaining <= 0 && a.remaining > 0) return 1;

        // Priority 2: General Rule Preference (UX Improvement)
        // If the difference in remaining amount is small (e.g., < R$ 50), prefer the General rule.
        // This prevents showing "Add R$ 20 of T-Shirts" when "Add R$ 25 of Anything" is available.
        const diff = Math.abs(a.remaining - b.remaining);
        if (a.remaining > 0 && b.remaining > 0 && diff < 50) {
            if (a.isGeneral && !b.isGeneral) return -1; // A (General) wins
            if (!a.isGeneral && b.isGeneral) return 1;  // B (General) wins
        }

        // Priority 3: Lowest Remaining Amount
        return a.remaining - b.remaining;
    });
    
    return statuses[0].promo;
  }, [promotions, cartItems, getCartTotal]);

  // Check if store allows WhatsApp checkout (Hidden for 'start' plan)
  const showWhatsAppCheckout = storeInfo?.plano !== 'start';

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-gray-50 dark:bg-gray-950 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Meu Carrinho</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
              <ShoppingCartIcon className="w-24 h-24 text-gray-200 dark:text-gray-800 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Seu carrinho está vazio</h3>
              <p className="text-gray-500 dark:text-gray-500 mt-2">Adicione produtos para vê-los aqui.</p>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress Bar */}
              {freeShippingPromo && (
                <div className="p-4 bg-primary/5 dark:bg-primary/10 border-b border-gray-100 dark:border-gray-800">
                  {(() => {
                    const goal = Number(freeShippingPromo.valor_minimo) || 0;
                    
                    // Re-calculate eligible total for the SELECTED promo to display correct progress
                    let eligibleTotal = 0;
                    const isGeneral = !freeShippingPromo.categorias || 
                                      freeShippingPromo.categorias.length === 0 || 
                                      freeShippingPromo.categorias.includes('Todas');

                    if (isGeneral) {
                        eligibleTotal = getCartTotal();
                    } else {
                        eligibleTotal = cartItems.reduce((acc, item) => {
                            if (item.categoria && freeShippingPromo.categorias?.includes(item.categoria)) {
                                return acc + (item.preco_unitario * item.quantidade);
                            }
                            return acc;
                        }, 0);
                    }

                    const percent = Math.min((eligibleTotal / goal) * 100, 100);
                    const remaining = Math.max(0, goal - eligibleTotal);
                    
                    return (
                      <div>
                        <div className="flex justify-between items-center text-sm font-medium mb-2">
                          {remaining > 0 ? (
                            <span className="text-gray-700 dark:text-gray-300">
                              Faltam <span className="font-bold text-primary">R$ {remaining.toFixed(2).replace('.', ',')}</span> para <span className="text-green-600 dark:text-green-400 font-bold">Frete Grátis</span>
                              {!isGeneral && (
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-500 block mt-0.5"> (em {freeShippingPromo.categorias?.join(', ')})</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                              <SiteSeguroIcon className="w-4 h-4" />
                              Parabéns! Você ganhou Frete Grátis!
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-500">{Math.round(percent)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${remaining <= 0 ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
                {cartItems.map(item => {
                  const maxStock = getStockLimit(item);

                  return (
                    <div key={item.id} className="flex items-start space-x-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                        {item.imagem ? (
                          <img src={item.imagem} alt={item.nome} className="w-full h-full object-contain" />
                        ) : (
                          <PhotoIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-800 dark:text-white leading-tight">{item.nome}</h4>
                        {item.categoria && <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">{item.categoria}</p>}
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                          {item.atributos && Object.entries(item.atributos).map(([key, value]) => (
                            <p key={key} className="capitalize">{key}: {value}</p>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
                            <button onClick={() => updateQuantity(item.id, item.quantidade - 1)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 transition-colors"><MinusIcon className="w-4 h-4" /></button>
                            <span className="px-3 text-sm font-medium text-gray-800 dark:text-white">{item.quantidade}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantidade + 1)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 transition-colors" disabled={item.quantidade >= maxStock}><PlusIcon className="w-4 h-4" /></button>
                          </div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white">R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}</p>
                        </div>
                      </div>
                      <button onClick={() => handleAttemptRemove(item)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md space-y-3 flex-shrink-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Subtotal</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
              </div>

              {/* Botão de Checkout Web */}
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-gray-900 dark:bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-black dark:hover:bg-primary-dark transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
              >
                <SiteSeguroIcon className="w-6 h-6 text-green-400" />
                Finalizar agora
              </button>

              {/* Botão WhatsApp - Só exibe se NÃO for plano Start */}
              {showWhatsAppCheckout && (
                <button
                  onClick={handleWhatsAppCheckout}
                  disabled={!storeInfo?.telefone}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 shadow-md">
                  <WhatsAppIcon className="w-6 h-6 flex-shrink-0" />
                  Finalizar no WhatsApp
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmRemove}
        title="Remover item do carrinho"
        confirmText="Sim, remover"
        cancelText="Cancelar"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Tem certeza que deseja remover o item <br />
          <strong className="font-semibold text-gray-700 dark:text-white">{itemToDelete?.nome}</strong> do seu carrinho?
        </p>
      </ConfirmationModal>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        total={getCartTotal()}
        storeInfo={storeInfo}
        cartId={cartNumericId}
      />
    </>
  );
};

export default CartSidebar;
