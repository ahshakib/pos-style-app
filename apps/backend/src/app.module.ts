import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { PrismaModule } from './prisma';
import { ProductsModule } from './products';
import { RedisModule } from './redis';
import { SalesModule } from './sales';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    ProductsModule,
    SalesModule,
  ],
})
export class AppModule {}
