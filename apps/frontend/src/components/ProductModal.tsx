import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, InputNumber, message, Modal } from 'antd';
import { useEffect } from 'react';
import { CreateProductData, Product, productsApi, UpdateProductData } from '../api';

interface ProductModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ open, product, onClose }: ProductModalProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEditing = !!product;

  useEffect(() => {
    if (open) {
      if (product) {
        form.setFieldsValue({
          name: product.name,
          sku: product.sku,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, product, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProductData) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Product created successfully');
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductData) => productsApi.update(product!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Product updated successfully');
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Failed to update product');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing) {
        updateMutation.mutate(values);
      } else {
        createMutation.mutate(values);
      }
    } catch {
      // Validation errors are shown automatically
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Product' : 'Add Product'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      okText={isEditing ? 'Update' : 'Create'}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          name="sku"
          label="SKU"
          rules={[{ required: true, message: 'Please enter SKU' }]}
        >
          <Input placeholder="Enter unique SKU" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Optional description" rows={3} />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="stockQuantity"
            label="Stock Quantity"
            rules={[{ required: true, message: 'Please enter stock' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={0}
              placeholder="0"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
