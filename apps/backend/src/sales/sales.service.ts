import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { RedisService } from '../redis';
import { CreateSaleDto } from './dto';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Create a new sale with stock validation and atomic deduction
   * Uses Redis locks to prevent race conditions
   */
  async create(userId: string, dto: CreateSaleDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Sale must contain at least one item');
    }

    // Get unique product IDs
    const productIds = [...new Set(dto.items.map((item) => item.productId))];

    // Acquire locks for all products
    const lockKeys = productIds.map((id) => `product-lock:${id}`);
    const acquiredLocks: string[] = [];

    try {
      // Try to acquire all locks
      for (const lockKey of lockKeys) {
        const acquired = await this.redis.acquireLock(lockKey, 10);
        if (!acquired) {
          throw new ConflictException(
            'Products are currently being processed. Please try again.',
          );
        }
        acquiredLocks.push(lockKey);
      }

      // Execute sale in a transaction
      return await this.prisma.$transaction(async (tx) => {
        let total = 0;
        const saleItems: {
          productId: string;
          quantity: number;
          price: number;
        }[] = [];

        // Validate stock and prepare sale items
        for (const item of dto.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new BadRequestException(
              `Product not found: ${item.productId}`,
            );
          }

          if (product.stockQuantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
            );
          }

          // Deduct stock atomically
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });

          const itemTotal = product.price * item.quantity;
          total += itemTotal;

          saleItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          });
        }

        // Create the sale with items
        const sale = await tx.sale.create({
          data: {
            userId,
            total,
            items: {
              create: saleItems,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        });

        return sale;
      });
    } finally {
      // Release all acquired locks
      for (const lockKey of acquiredLocks) {
        await this.redis.releaseLock(lockKey);
      }
    }
  }

  /**
   * Get all sales with items
   */
  async findAll(userId?: string) {
    const where = userId ? { userId } : {};

    return this.prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single sale by ID
   */
  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!sale) {
      throw new BadRequestException('Sale not found');
    }

    return sale;
  }
}
