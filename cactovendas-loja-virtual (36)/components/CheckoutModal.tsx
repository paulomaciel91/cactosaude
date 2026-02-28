
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CartItem, Customer, Address, DeliveryFee, Promotion, StoreInfo } from '../types';
import { XMarkIcon, SiteSeguroIcon, CheckIcon } from './icons';
import { createPaymentPreference } from '../services/paymentService';
import supabaseService from '../services/supabaseService';
import { getCoordinates, haversine } from '../utils/geo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  storeInfo: StoreInfo | null;
  cartId?: number | null;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cartItems, total, storeInfo, cartId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Data State
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFee[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  
  // Calculation State
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingMethodName, setShippingMethodName] = useState<string>('A calcular');
  const [isCalculatingFreight, setIsCalculatingFreight] = useState(false);
  const [freightError, setFreightError] = useState<string | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Promotion | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address State
  const [zip, setZip] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [complement, setComplement] = useState('');

  // Refs for debouncing
  const calculationTimeoutRef = useRef<number | null>(null);

  // Fetch Delivery Fees and Promotions
  useEffect(() => {
    if (isOpen && storeInfo?.slug) {
        const fetchData = async () => {
            const [fees, promos] = await Promise.all([
                supabaseService.getDeliveryFees(storeInfo.slug!),
                supabaseService.getPromotions(storeInfo.slug!)
            ]);
            setDeliveryFees(fees);
            setPromotions(promos);
        };
        fetchData();
    }
  }, [isOpen, storeInfo]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
        setIsLoading(false);
        setRedirecting(false);
        setShippingCost(0);
        setShippingMethodName('A calcular');
        setFreightError(null);
        setIsCalculatingFreight(false);
        setCheckoutError(null);
        // Reset Coupon
        setCouponCode('');
        setAppliedCoupon(null);
        setCouponMessage(null);
    }
  }, [isOpen]);

  // --- Helper to Calculate Eligible Total for a Promotion ---
  const getEligibleTotal = useCallback((promo: Promotion) => {
      // If categories array is missing, empty, or contains "Todas", use the full cart total
      if (!promo.categorias || promo.categorias.length === 0 || promo.categorias.includes('Todas')) {
          return total;
      }

      // Otherwise, sum only items that belong to the promotion's categories
      return cartItems.reduce((acc, item) => {
          if (item.categoria && promo.categorias?.includes(item.categoria)) {
              return acc + (item.preco_unitario * item.quantidade);
          }
          return acc;
      }, 0);
  }, [cartItems, total]);

  // --- Coupon Logic ---
  const handleApplyCoupon = () => {
      setCouponMessage(null);
      const code = couponCode.trim().toUpperCase();
      
      if (!code) {
          setCouponMessage({ type: 'error', text: 'Digite um código.' });
          return;
      }

      // Find coupon in fetched promotions
      // Logic: Must have matching code AND be active
      const promo = promotions.find(p => 
          p.ativo && 
          p.codigo_cupom && 
          p.codigo_cupom.toUpperCase() === code
      );

      if (!promo) {
          setCouponMessage({ type: 'error', text: 'Cupom inválido ou expirado.' });
          setAppliedCoupon(null);
          return;
      }

      // Validate Minimum Value using Eligible Total
      const minValue = Number(promo.valor_minimo || 0);
      const eligibleTotal = getEligibleTotal(promo);

      if (eligibleTotal < minValue) {
          setCouponMessage({ type: 'error', text: `Cupom válido para pedidos acima de R$ ${minValue.toFixed(2).replace('.', ',')}` });
          if(promo.categorias && !promo.categorias.includes('Todas')) {
             setCouponMessage({ type: 'error', text: `Mínimo de R$ ${minValue} em produtos da categoria: ${promo.categorias.join(', ')}` });
          }
          setAppliedCoupon(null);
          return;
      }

      setAppliedCoupon(promo);
      setCouponMessage({ type: 'success', text: `Cupom "${promo.nome || code}" aplicado!` });
  };
  
  const handleCouponKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (!appliedCoupon) {
        handleApplyCoupon();
      }
    }
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponMessage(null);
  };

  // Robust Discount Calculation
  const discountValue = useMemo(() => {
      if (!appliedCoupon) return 0;

      const type = (appliedCoupon.tipo_desconto || '').toLowerCase();
      const value = Number(appliedCoupon.valor_desconto || 0);

      // Safety check for NaN
      if (isNaN(value)) return 0;

      // Handle Free Shipping Coupon separately (it affects shippingCost, not product total directly)
      if (['frete_gratis', 'shipping', 'frete'].includes(type)) {
          return 0; 
      }

      const eligibleTotal = getEligibleTotal(appliedCoupon);

      if (type === 'percentual') {
          return eligibleTotal * (value / 100);
      }
      if (type === 'fixo') {
          // Fixed discount shouldn't exceed eligible total
          return Math.min(value, eligibleTotal);
      }
      return 0;
  }, [appliedCoupon, getEligibleTotal]);

  // --- Shipping Logic ---
  const calculateShipping = useCallback(async () => {
      // Clear any previous error
      setFreightError(null);

      // Check for Coupon Free Shipping first (User applied coupon explicitly)
      if (appliedCoupon) {
           const type = (appliedCoupon.tipo_desconto || '').toLowerCase();
           if (['frete_gratis', 'shipping', 'frete'].includes(type)) {
                setShippingCost(0);
                setShippingMethodName(`Frete Grátis (Cupom: ${appliedCoupon.codigo_cupom})`);
                setIsCalculatingFreight(false);
                return;
           }
      }

      // Check for Automatic Free Shipping Promotion (Automatic based on eligible value)
      // We look for active promos without code, type shipping, where eligible total >= min value
      const freeShippingPromo = promotions.find(p => {
          if (!p.ativo) return false;
          // Check if it's strictly an automatic promotion (no code)
          if (p.codigo_cupom && p.codigo_cupom.trim() !== '') return false;
          
          const type = (p.tipo_desconto || '').toLowerCase();
          const isShippingType = ['shipping', 'frete_gratis', 'frete'].includes(type);
          
          if (!isShippingType) return false;

          const threshold = Number(p.valor_minimo || 0);
          const eligibleTotal = getEligibleTotal(p);
          
          return eligibleTotal >= threshold;
      });

      if (freeShippingPromo) {
          setShippingCost(0);
          setShippingMethodName(freeShippingPromo.nome ? `Frete Grátis (${freeShippingPromo.nome})` : 'Frete Grátis');
          setIsCalculatingFreight(false);
          return;
      }

      // If we don't have minimal address info, we can't calculate either method
      if (!neighborhood || !city) {
          setShippingCost(0);
          setShippingMethodName('A calcular');
          setIsCalculatingFreight(false);
          return;
      }

      // --- Distance-Based Shipping (Logistica Config) ---
      const logistica = storeInfo?.logistica_config?.frete;
      
      if (logistica?.tipo === 'por_distancia') {
          if (!state) { // Need state for accurate geocoding
              setIsCalculatingFreight(false);
              return;
          }

          setIsCalculatingFreight(true);
          try {
              // Get Customer Coords
              const customerAddress = `${street}, ${number}, ${neighborhood}, ${city}, ${state}, Brasil`;
              const customerCoords = await getCoordinates(customerAddress);
              
              if (!customerCoords) {
                  setFreightError('Endereço de entrega não localizado.');
                  setShippingCost(0);
                  setShippingMethodName('Endereço não encontrado');
                  return;
              }

              // Get Store Coords - Robust Strategy
              let storeCoords = null;
              const storeCityState = `${storeInfo.cidade || ''}, ${storeInfo.estado || ''}`;
              
              if (storeInfo.endereco) {
                  let query = storeInfo.endereco;
                  if (storeInfo.cidade && !query.toLowerCase().includes(storeInfo.cidade.toLowerCase())) {
                      query += `, ${storeCityState}`;
                  }
                  storeCoords = await getCoordinates(query);

                  if (!storeCoords) {
                      const cleanAddress = storeInfo.endereco.split(' - ')[0]; 
                      if (cleanAddress && cleanAddress !== storeInfo.endereco) {
                          const cleanQuery = `${cleanAddress}, ${storeCityState}`;
                          storeCoords = await getCoordinates(cleanQuery);
                      }
                  }
              }

              if (!storeCoords && (storeInfo.cidade || storeInfo.estado)) {
                  storeCoords = await getCoordinates(storeCityState);
              }

              if (!storeCoords) {
                  setFreightError('Erro na configuração de endereço da loja.');
                  setShippingCost(0);
                  return;
              }

              // Calculate Distance
              const distanceKm = haversine(
                  customerCoords.lat, 
                  customerCoords.lon, 
                  storeCoords.lat, 
                  storeCoords.lon
              );

              // Check Radius
              if (logistica.raio_maximo_km && distanceKm > logistica.raio_maximo_km) {
                  setFreightError(`Fora da área de entrega (${distanceKm.toFixed(1)}km).`);
                  setShippingCost(0);
                  setShippingMethodName('Fora da área de entrega');
                  return;
              }

              // Calculate Price
              const pricePerKm = logistica.valor_por_km || 0;
              const minPrice = logistica.frete_minimo || 0;
              const calculatedPrice = distanceKm * pricePerKm;
              
              const finalPrice = Math.max(calculatedPrice, minPrice);

              setShippingCost(finalPrice);
              setShippingMethodName(`Entrega (${distanceKm.toFixed(1)}km)`);
              
          } catch (err) {
              console.error(err);
              setFreightError('Erro ao calcular distância.');
          } finally {
              setIsCalculatingFreight(false);
          }

          return; 
      }

      // --- Fixed Table Logic (Região/Bairro) ---
      const normalizedNeighborhood = neighborhood.trim().toLowerCase();
      const normalizedCity = city.trim().toLowerCase();

      let match = deliveryFees.find(fee => fee.regiao.toLowerCase() === normalizedNeighborhood);
      if (!match) {
        match = deliveryFees.find(fee => fee.regiao.toLowerCase() === normalizedCity);
      }

      if (match) {
          setShippingCost(match.custo);
          setShippingMethodName('Entrega Local');
      } else {
          setShippingCost(0);
          setShippingMethodName('A combinar / Retirada');
      }
      setIsCalculatingFreight(false);

  }, [neighborhood, city, state, street, number, deliveryFees, promotions, total, storeInfo, appliedCoupon, getEligibleTotal]);

  // Debounced Effect for shipping calculation
  useEffect(() => {
      if (calculationTimeoutRef.current) {
          clearTimeout(calculationTimeoutRef.current);
      }

      // Only debounce if we have enough data to actually try
      // Re-run if appliedCoupon changes to recalculate (e.g. Free Shipping applied/removed)
      if ((neighborhood && city) || promotions.length > 0 || appliedCoupon !== undefined) {
          // If distance based, give more time for typing (1.5s), otherwise fast (300ms)
          const delay = storeInfo?.logistica_config?.frete?.tipo === 'por_distancia' ? 1500 : 300;
          
          calculationTimeoutRef.current = window.setTimeout(() => {
              calculateShipping();
          }, delay);
      } else {
          // Reset if fields cleared and no coupon implies free shipping logic
          setShippingCost(0);
          setShippingMethodName('A calcular');
          setFreightError(null);
      }

      return () => {
          if (calculationTimeoutRef.current) {
              clearTimeout(calculationTimeoutRef.current);
          }
      };
  }, [neighborhood, city, state, number, street, total, calculateShipping, storeInfo, promotions, appliedCoupon]);


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Máscara (XX) XXXXX-XXXX
    if (value.length > 10) {
       value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 5) {
       value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
       value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d{0,2})/, '($1');
    }
    setPhone(value);
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    // Máscara XXXXX-XXX
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{1,3}).*/, '$1-$2');
    }
    setZip(value);
  };

  const handleZipBlur = async () => {
    const cleanZip = zip.replace(/\D/g, '');
    if (cleanZip.length === 8) {
        try {
            const response = await fetch(`https://opencep.com/v1/${cleanZip}`);
            if (response.ok) {
                const data = await response.json();
                if (!data.erro) {
                    setStreet(data.logradouro || '');
                    setNeighborhood(data.bairro || '');
                    setCity(data.localidade || '');
                    setState(data.uf || '');
                    document.getElementById('address-number')?.focus();
                }
            }
        } catch (error) {
            console.error("Erro ao buscar CEP", error);
        }
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeInfo?.slug) return;
    
    if (freightError) {
        setCheckoutError("Não é possível prosseguir: " + freightError);
        return;
    }

    setCheckoutError(null);
    setIsLoading(true);
    setRedirecting(false);

    const addressData: Address = {
        zip, street, number, neighborhood, city, state, complement
    };

    const customerData: Customer = {
        nome: name,
        telefone: phone,
        endereco: addressData
    };

    const finalTotal = Math.max(0, total + shippingCost - discountValue);

    try {
        const paymentUrl = await createPaymentPreference(
            storeInfo.slug, 
            cartItems, 
            finalTotal, 
            customerData, 
            cartId || null, 
            shippingCost,
            appliedCoupon // Pass the applied coupon object (or null)
        );

        if (paymentUrl) {
            setRedirecting(true);
            window.location.href = paymentUrl;
        } else {
            throw new Error("Link de pagamento não retornado pelo servidor.");
        }

    } catch (error: any) {
        console.error("Checkout error:", error);
        
        let errorMessage = "Ocorreu um erro ao processar o checkout. Por favor, tente novamente.";
        
        // Trata erro específico de timeout/cancelamento do RPC (XX000)
        if (error?.code === 'XX000' || error?.message?.includes('HTTP request cancelled') || error?.message?.includes('timeout')) {
            errorMessage = "O processamento demorou muito para responder (Timeout). O servidor de pagamentos pode estar lento. Tente novamente.";
        } else if (error?.message) {
             errorMessage = error.message;
        }

        setCheckoutError(errorMessage);
        setIsLoading(false);
        setRedirecting(false);
    }
  };

  if (!isOpen) return null;

  const inputBaseClass = "w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary focus:ring-primary py-2 px-3 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300";
  const finalTotal = Math.max(0, total + shippingCost - discountValue);
  const estimatedTime = storeInfo?.logistica_config?.entregas?.tempo_estimado;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-end sm:items-center transition-opacity animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-xl h-[90dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn rounded-t-xl sm:rounded-xl transition-colors duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <SiteSeguroIcon className="w-5 h-5 text-green-500"/>
                Checkout Seguro
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-900">
            
            <form id="checkout-form" onSubmit={handleSubmitDetails} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm text-blue-800 dark:text-blue-300 mb-4">
                    Preencha seus dados para calcular o frete e finalizar.
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputBaseClass} placeholder="Seu nome" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Celular (WhatsApp)</label>
                    <input required type="tel" value={phone} onChange={handlePhoneChange} className={inputBaseClass} placeholder="(00) 00000-0000" />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Endereço de Entrega</h3>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
                            <input required type="text" value={zip} onChange={handleZipChange} onBlur={handleZipBlur} className={inputBaseClass} placeholder="00000-000" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade/UF</label>
                            <input disabled type="text" value={city && state ? `${city}/${state}` : ''} className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-2 px-3 border cursor-not-allowed" />
                        </div>
                    </div>

                    <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rua / Logradouro</label>
                            <input required type="text" value={street} onChange={e => setStreet(e.target.value)} className={inputBaseClass} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                            <input id="address-number" required type="text" value={number} onChange={e => setNumber(e.target.value)} className={inputBaseClass} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bairro</label>
                            <input required type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className={inputBaseClass} placeholder="Ex: Centro" />
                        </div>
                    </div>
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complemento (Opcional)</label>
                            <input type="text" value={complement} onChange={e => setComplement(e.target.value)} className={inputBaseClass} placeholder="Apto, Bloco, etc" />
                    </div>
                </div>
            </form>

            <div className="mt-6 mb-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cupom de Desconto</label>
                 <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={couponCode} 
                        onChange={e => {
                            setCouponCode(e.target.value);
                            setCouponMessage(null); // Clear message on typing
                        }}
                        onKeyDown={handleCouponKeyDown}
                        disabled={!!appliedCoupon}
                        className={`${inputBaseClass} uppercase`}
                        placeholder="Insira seu código"
                     />
                     {appliedCoupon ? (
                         <button 
                            type="button" 
                            onClick={removeCoupon} 
                            className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-colors"
                         >
                            Remover
                         </button>
                     ) : (
                        <button 
                            type="button" 
                            onClick={handleApplyCoupon} 
                            className="bg-gray-800 dark:bg-primary text-white px-4 py-2 rounded-lg hover:bg-black dark:hover:bg-primary-dark font-medium transition-colors"
                        >
                            Aplicar
                        </button>
                     )}
                 </div>
                 {couponMessage && (
                     <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                         {couponMessage.type === 'success' && <CheckIcon className="w-3 h-3" />}
                         {couponMessage.text}
                     </p>
                 )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg mt-4">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                        <span>Subtotal</span>
                        <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>

                    {estimatedTime && (
                         <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                             <span>Tempo estimado</span>
                             <span>{estimatedTime} min</span>
                         </div>
                    )}

                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                        <span className="flex items-center gap-2">
                            Frete ({shippingMethodName})
                            {isCalculatingFreight && <span className="animate-pulse text-primary text-xs font-bold">Calculando...</span>}
                        </span>
                        <span className={shippingCost === 0 && (shippingMethodName.includes('Frete Grátis') || shippingMethodName.includes('A combinar')) ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                             {isCalculatingFreight ? '...' : (
                                 shippingCost === 0 && shippingMethodName.includes('Frete Grátis') ? 'R$ 0,00' : 
                                 shippingCost === 0 && !freightError ? 'A calcular / Combinar' : 
                                 shippingCost === 0 && freightError ? 'N/A' :
                                 `R$ ${shippingCost.toFixed(2).replace('.', ',')}`
                             )}
                        </span>
                    </div>

                    {discountValue > 0 && (
                         <div className="flex justify-between text-green-600 dark:text-green-400 text-sm font-medium">
                             <span>Desconto</span>
                             <span>- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
                         </div>
                    )}

                    {freightError && (
                        <div className="text-red-500 text-xs text-right mt-1 font-medium">{freightError}</div>
                    )}
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-3">
                    <p className="text-gray-900 dark:text-white font-semibold">Total a pagar</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {finalTotal.toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex-shrink-0">
            {checkoutError && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2 animate-fadeIn">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{checkoutError}</span>
                </div>
            )}
            <button 
                type="submit" 
                form="checkout-form"
                disabled={isLoading || isCalculatingFreight || !!freightError}
                className="w-full bg-gray-900 dark:bg-primary text-white py-3.5 rounded-lg font-bold text-lg hover:bg-black dark:hover:bg-primary-dark transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {redirecting ? 'Redirecionando...' : 'Processando...'}
                    </span>
                ) : `Pagar R$ ${finalTotal.toFixed(2).replace('.', ',')}`}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
