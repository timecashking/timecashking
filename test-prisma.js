import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('🔌 Testando conexão com Prisma...');
    await prisma.$connect();
    console.log('✅ Prisma conectado com sucesso');
    
    // Testar uma consulta simples
    const userCount = await prisma.user.count();
    console.log('👥 Total de usuários:', userCount);
    
    await prisma.$disconnect();
    console.log('✅ Prisma desconectado');
  } catch (error) {
    console.error('❌ Erro Prisma:', error);
  }
}

testPrisma();
