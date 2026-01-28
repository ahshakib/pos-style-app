import { EyeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal, Spin, Table, Tag } from 'antd';
import { useState } from 'react';
import { Sale, salesApi } from '../api';

export function SalesHistoryPage() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: salesApi.getAll,
  });

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: Sale, b: Sale) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: Sale['items']) => (
        <Tag color="blue">{items.length} item{items.length !== 1 ? 's' : ''}</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <span style={{ fontWeight: 600, color: '#667eea' }}>
          ${total.toFixed(2)}
        </span>
      ),
      sorter: (a: Sale, b: Sale) => a.total - b.total,
    },
    {
      title: 'Sold By',
      dataIndex: 'user',
      key: 'user',
      render: (user: Sale['user']) => user.name || user.email,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Sale) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => setSelectedSale(record)}
        >
          View
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Sales History</h1>
      </div>

      <div className="content-card">
        <Table
          columns={columns}
          dataSource={sales}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} sales`,
          }}
        />
      </div>

      <Modal
        title="Sale Details"
        open={!!selectedSale}
        onCancel={() => setSelectedSale(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedSale(null)}>
            Close
          </Button>,
        ]}
        width={500}
      >
        {selectedSale && (
          <div className="sale-details-modal">
            <div style={{ marginBottom: 16, color: '#6c757d', fontSize: 12 }}>
              {new Date(selectedSale.createdAt).toLocaleString()} • Sold by{' '}
              {selectedSale.user.name || selectedSale.user.email}
            </div>

            <div style={{ marginBottom: 16 }}>
              {selectedSale.items.map((item) => (
                <div key={item.id} className="sale-item">
                  <div>
                    <strong>{item.product.name}</strong>
                    <div style={{ fontSize: 12, color: '#6c757d' }}>
                      {item.product.sku} • ${item.price.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '2px solid #f0f0f0',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              <span>Total</span>
              <span style={{ color: '#667eea' }}>
                ${selectedSale.total.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
