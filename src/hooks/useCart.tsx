import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const stock = await api.get(`/stock/${productId}`).then(response => response.data) as Stock
      let listCart = [...cart] as Product[]
      const verifyProductInCart = cart.find((item) => item.id === productId)
      const amount = !verifyProductInCart ? 0 : verifyProductInCart.amount 
      
      if (stock.amount > amount) {
        if(!verifyProductInCart) {
          const product = await api.get(`/products/${productId}`).then(response => response.data)
          product.amount = 1
          listCart.push(product)
        } else {
          verifyProductInCart.amount = amount + 1
        }
        setCart(listCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(listCart))
      } else {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }
    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const newListCart = [...cart]
      const productIndex = newListCart.findIndex((item) => item.id === productId)
      if(productIndex >= 0) {
        newListCart.splice(productIndex, 1)
        setCart(newListCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newListCart))
      } else {
        throw Error()
      }
    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <=0 ) {
        return
      }

      const stock = await api.get(`/stock/${productId}`).then(response => response.data) as Stock
      const newListCart = [...cart]
      const product = newListCart.find((item) => item.id === productId)

      if (stock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      } else {
        if(product) {
          product.amount = amount
          setCart(newListCart)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newListCart))
        }
      }

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
