import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const GMproducts = await AsyncStorage.getItem('@GoMarketplace:products');

      if (GMproducts) {
        setProducts([...JSON.parse(GMproducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {

    const existProduct = products.find(prod => prod.id === product.id);

    const refreshProducts = existProduct ?
      products.map(prod => prod.id === product.id ? { ...product, quantity: prod.quantity + 1 } : prod) :
      [...products, { ...product, quantity: 1 }];

    setProducts(refreshProducts);

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(refreshProducts));

  }, [products]);

  const increment = useCallback(async id => {
    const incrementProduct = products.map(prod => prod.id === id ?
      { ...prod, quantity: prod.quantity + 1 } :
      prod
    );

    setProducts(incrementProduct);

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(incrementProduct));

  }, [products]);

  const decrement = useCallback(async id => {
    const decrementProduct = products.map(prod => prod.id === id ?
      { ...prod, quantity: prod.quantity - 1 } :
      prod
    );

    setProducts(decrementProduct);

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(decrementProduct));

  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
