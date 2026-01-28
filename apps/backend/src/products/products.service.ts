import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    // Check if SKU already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    return this.prisma.product.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    // Check if product exists
    await this.findOne(id);

    // If updating SKU, check for conflicts
    if (dto.sku) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          sku: dto.sku,
          NOT: { id },
        },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    // Check if product exists
    await this.findOne(id);

    // Check if product has any sale items
    const saleItems = await this.prisma.saleItem.findFirst({
      where: { productId: id },
    });

    if (saleItems) {
      throw new ConflictException('Cannot delete product with existing sales');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
