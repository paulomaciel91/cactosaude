
import { Product, Promotion } from '../types';

const isPromotionApplicable = (product: Product, promo: Promotion): boolean => {
  // Safety check: Ignore promotions that are clearly for shipping
  if (['frete_gratis', 'shipping', 'frete'].includes(promo.tipo_desconto)) return false;
  
  // Ignore promotions that require a coupon code (these are applied at checkout only)
  if (promo.codigo_cupom && promo.codigo_cupom.trim() !== '') return false;
  
  // Legacy check for names just in case old data persists
  if (promo.nome && promo.nome.toLowerCase().includes('frete grátis')) return false;

  // Check Categories (supports "Todas" or specific category match)
  const hasCategories = promo.categorias && promo.categorias.length > 0;
  const isAllCategories = hasCategories && promo.categorias!.includes('Todas');
  const categoryMatch = isAllCategories || (product.categoria && promo.categorias?.includes(product.categoria)) || false;

  const productMatch = promo.produtos_ids?.includes(product.produto_id) || false;
  
  return promo.ativo && (categoryMatch || productMatch);
};

export const getBestPromotion = (product: Product, promotions: Promotion[]): Promotion | null => {
  let bestPromo: Promotion | null = null;
  let highestDiscount = 0;

  const applicablePromotions = promotions.filter(promo => isPromotionApplicable(product, promo));

  if (applicablePromotions.length === 0) {
    return null;
  }

  // Apply the best promotion for the user
  for (const promo of applicablePromotions) {
    let currentDiscount = 0;
    if (promo.tipo_desconto === 'percentual') {
      currentDiscount = product.preco * (promo.valor_desconto / 100);
    } else if (promo.tipo_desconto === 'fixo') {
      currentDiscount = promo.valor_desconto;
    }

    if (currentDiscount > highestDiscount) {
      highestDiscount = currentDiscount;
      bestPromo = promo;
    }
  }

  return bestPromo;
};

export const calculateDiscountedPrice = (product: Product, promotions: Promotion[]): number => {
  const bestPromo = getBestPromotion(product, promotions);
  
  if (!bestPromo) {
    return product.preco;
  }

  let discount = 0;
  if (bestPromo.tipo_desconto === 'percentual') {
    discount = product.preco * (bestPromo.valor_desconto / 100);
  } else if (bestPromo.tipo_desconto === 'fixo') {
    discount = bestPromo.valor_desconto;
  }

  const finalPrice = product.preco - discount;
  return finalPrice > 0 ? finalPrice : 0;
};
