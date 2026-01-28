import { DeleteOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Empty, Input, InputNumber, message, Spin } from 'antd';
import { useState } from 'react';
import { CreateSaleData, Product, productsApi, salesApi } from '../api';

interface CartItem {
  product: Product;
  quantity: number;
}

export function SalesPage() {
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const saleMutation = useMutation({
    mutationFn: (data: CreateSaleData) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setCart([]);
      message.success('Sale completed successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Failed to complete sale');
    },
  });

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchText.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stockQuantity === 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          message.warning('Cannot add more than available stock');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    if (quantity > item.product.stockQuantity) {
      message.warning('Cannot exceed available stock');
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      message.warning('Cart is empty');
      return;
    }

    const saleData: CreateSaleData = {
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    saleMutation.mutate(saleData);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pos-container">
      <div className="pos-products">
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%' }}
            size="large"
          />
        </div>

        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`product-item ${product.stockQuantity === 0 ? 'out-of-stock' : ''}`}
                onClick={() => addToCart(product)}
              >
                <div className="name">{product.name}</div>
                <div className="sku">{product.sku}</div>
                <div className="price">${product.price.toFixed(2)}</div>
                <div className="stock">
                  {product.stockQuantity === 0
                    ? 'Out of stock'
                    : `${product.stockQuantity} in stock`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="No products found" />
        )}
      </div>

      <div className="pos-cart">
        <div className="cart-header">
          <h3>
            <ShoppingCartOutlined style={{ marginRight: 8 }} />
            Cart ({cart.length} items)
          </h3>
        </div>

        <div className="cart-items">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.product.id} className="cart-item">
                <div className="info">
                  <div className="name">{item.product.name}</div>
                  <div className="price">${item.product.price.toFixed(2)} each</div>
                </div>
                <InputNumber
                  min={1}
                  max={item.product.stockQuantity}
                  value={item.quantity}
                  onChange={(val) => updateQuantity(item.product.id, val || 1)}
                  size="small"
                  style={{ width: 60 }}
                />
                <div className="subtotal">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeFromCart(item.product.id)}
                />
              </div>
            ))
          ) : (
            <div className="cart-empty">
              <ShoppingCartOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
              <p>Your cart is empty</p>
              <p style={{ fontSize: 12 }}>Click on products to add them</p>
            </div>
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <strong>${getTotal().toFixed(2)}</strong>
          </div>
          <Button
            type="primary"
            size="large"
            block
            disabled={cart.length === 0}
            loading={saleMutation.isPending}
            onClick={handleCheckout}
            style={{ height: 48 }}
          >
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
