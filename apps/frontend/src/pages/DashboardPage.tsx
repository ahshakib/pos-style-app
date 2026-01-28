import {
    DollarOutlined,
    InboxOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Spin } from 'antd';
import { productsApi, salesApi } from '../api';

export function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: salesApi.getAll,
  });

  if (productsLoading || salesLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalProducts = products?.length || 0;
  const totalStock = products?.reduce((sum, p) => sum + p.stockQuantity, 0) || 0;
  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((sum, s) => sum + s.total, 0) || 0;

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: <ShoppingOutlined />,
      color: '#667eea',
      bgColor: '#eef2ff',
    },
    {
      title: 'Total Stock',
      value: totalStock,
      icon: <InboxOutlined />,
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      title: 'Total Sales',
      value: totalSales,
      icon: <ShoppingCartOutlined />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: <DollarOutlined />,
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
  ];

  return (
    <div>
      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <div
              className="icon"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <Card title="Recent Sales" style={{ borderRadius: 12 }}>
          {sales && sales.length > 0 ? (
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6c757d', fontSize: 12 }}>
                  <th style={{ padding: '8px 0' }}>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 0' }}>
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td>{sale.items.length}</td>
                    <td style={{ fontWeight: 600 }}>${sale.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#6c757d', textAlign: 'center', padding: 20 }}>
              No sales yet
            </p>
          )}
        </Card>

        <Card title="Low Stock Products" style={{ borderRadius: 12 }}>
          {products && products.filter(p => p.stockQuantity < 10).length > 0 ? (
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6c757d', fontSize: 12 }}>
                  <th style={{ padding: '8px 0' }}>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(p => p.stockQuantity < 10)
                  .slice(0, 5)
                  .map((product) => (
                    <tr key={product.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 0' }}>{product.name}</td>
                      <td style={{ color: '#6c757d' }}>{product.sku}</td>
                      <td style={{ fontWeight: 600, color: product.stockQuantity < 5 ? '#ef4444' : '#f59e0b' }}>
                        {product.stockQuantity}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#6c757d', textAlign: 'center', padding: 20 }}>
              All products are well stocked
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
