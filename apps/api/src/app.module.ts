import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { EntriesModule } from './entries/entries.module';
import { AccountsModule } from './accounts/accounts.module';
import { SalesModule } from './sales/sales.module';
import { CustomersModule } from './customers/customers.module';
import { MeetingsModule } from './meetings/meetings.module';
import { OauthModule } from './oauth/oauth.module';
import { NlpModule } from './nlp/nlp.module';
import { InfraModule } from './infra/infra.module';
import { LegacyModule } from './legacy/legacy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    EntriesModule,
    AccountsModule,
    SalesModule,
    CustomersModule,
    MeetingsModule,
    OauthModule,
    NlpModule,
    InfraModule,
    LegacyModule,
  ],
})
export class AppModule {}
