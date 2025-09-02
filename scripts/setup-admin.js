#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    console.log('🔧 Configurando empresa padrão e usuário administrador...');

    // 1. Criar empresa padrão
    let company = await prisma.company.findFirst({
      where: { name: 'TimeCash King Admin' }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'TimeCash King Admin',
          description: 'Empresa administradora do sistema TimeCash King',
          email: 'admin@timecashking.com',
          status: 'ACTIVE'
        }
      });
    }

    console.log('✅ Empresa criada:', company.name);

    // 2. Criar usuário administrador
    let adminUser = await prisma.user.findUnique({
      where: { email: 'adrianokinng@gmail.com' }
    });

    if (!adminUser) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash('play22', salt);

      adminUser = await prisma.user.create({
        data: {
          email: 'adrianokinng@gmail.com',
          password: hashedPassword,
          salt: salt,
          name: 'Adriano King - Administrador Geral'
        }
      });
    } else {
      // Atualizar senha se usuário já existe
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash('play22', salt);

      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          password: hashedPassword,
          salt: salt,
          name: 'Adriano King - Administrador Geral'
        }
      });
    }

    console.log('✅ Usuário administrador criado:', adminUser.email);

    // 3. Vincular usuário à empresa como OWNER
    let companyUser = await prisma.companyUser.findFirst({
      where: {
        companyId: company.id,
        userId: adminUser.id
      }
    });

    if (!companyUser) {
      await prisma.companyUser.create({
        data: {
          companyId: company.id,
          userId: adminUser.id,
          role: 'OWNER'
        }
      });
    } else {
      await prisma.companyUser.update({
        where: { id: companyUser.id },
        data: { role: 'OWNER' }
      });
    }

    console.log('✅ Usuário vinculado à empresa como OWNER');

    // 4. Criar algumas contas padrão
    const defaultAccounts = [
      { name: 'Caixa', type: 'CASH', balance: 0, description: 'Caixa da empresa' },
      { name: 'Banco Principal', type: 'BANK', balance: 0, description: 'Conta bancária principal' },
      { name: 'Cartão de Crédito', type: 'CREDIT_CARD', balance: 0, description: 'Cartão de crédito corporativo' }
    ];

    for (const accountData of defaultAccounts) {
      let account = await prisma.account.findFirst({
        where: {
          companyId: company.id,
          name: accountData.name
        }
      });

      if (!account) {
        await prisma.account.create({
          data: {
            ...accountData,
            companyId: company.id
          }
        });
      }
    }

    console.log('✅ Contas padrão criadas');

    // 5. Criar categorias padrão
    const defaultCategories = [
      { name: 'Receitas', type: 'INCOME', color: '#10B981', icon: 'trending-up' },
      { name: 'Despesas', type: 'EXPENSE', color: '#EF4444', icon: 'trending-down' },
      { name: 'Transferências', type: 'TRANSFER', color: '#3B82F6', icon: 'repeat' },
      { name: 'Alimentação', type: 'EXPENSE', color: '#F59E0B', icon: 'utensils' },
      { name: 'Transporte', type: 'EXPENSE', color: '#8B5CF6', icon: 'car' },
      { name: 'Saúde', type: 'EXPENSE', color: '#EC4899', icon: 'heart' },
      { name: 'Educação', type: 'EXPENSE', color: '#06B6D4', icon: 'book' }
    ];

    for (const categoryData of defaultCategories) {
      let category = await prisma.category.findFirst({
        where: {
          companyId: company.id,
          name: categoryData.name
        }
      });

      if (!category) {
        await prisma.category.create({
          data: {
            ...categoryData,
            companyId: company.id
          }
        });
      }
    }

    console.log('✅ Categorias padrão criadas');

    // 6. Gerar código de ativação
    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    let activationCodeRecord = await prisma.activationCode.findFirst({
      where: { companyId: company.id }
    });

    if (!activationCodeRecord) {
      await prisma.activationCode.create({
        data: {
          companyId: company.id,
          code: activationCode,
          expiresAt,
          isUsed: false
        }
      });
    } else {
      await prisma.activationCode.update({
        where: { id: activationCodeRecord.id },
        data: {
          code: activationCode,
          expiresAt,
          isUsed: false
        }
      });
    }

    console.log('✅ Código de ativação gerado:', activationCode);

    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 Resumo da configuração:');
    console.log(`🏢 Empresa: ${company.name}`);
    console.log(`👤 Administrador: ${adminUser.name} (${adminUser.email})`);
    console.log(`🔑 Senha: play22`);
    console.log(`🔢 Código de Ativação: ${activationCode}`);
    console.log('\n💡 Use estas credenciais para acessar o sistema como administrador.');

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
