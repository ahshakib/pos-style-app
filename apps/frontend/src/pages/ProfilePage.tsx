import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Descriptions, Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1>User Profile</h1>
      </div>

      <Card className="content-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <Avatar
            size={100}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#667eea', marginBottom: 16 }}
          />
          <h2 style={{ margin: 0 }}>{user.name || 'User'}</h2>
          <p style={{ color: '#6c757d' }}>{user.email}</p>
        </div>

        <Descriptions
          title="Account Information"
          bordered
          column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label={<span><UserOutlined style={{ marginRight: 8 }} /> Full Name</span>}>
            {user.name || 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label={<span><MailOutlined style={{ marginRight: 8 }} /> Email Address</span>}>
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item label="Account ID">
            <code style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4 }}>{user.id}</code>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
