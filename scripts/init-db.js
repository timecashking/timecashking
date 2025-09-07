const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando inicialização do banco de dados...');

  try {
    // Criar usuário admin padrão
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@timecashking.com' },
      update: {},
      create: {
        email: 'admin@timecashking.com',
        name: 'Administrador',
        password: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        company: {
          create: {
            name: 'TimeCash King',
            cnpj: '00.000.000/0001-00',
            address: 'São Paulo, SP',
            phone: '(11) 99999-9999',
            email: 'contato@timecashking.com',
            status: 'ACTIVE',
          },
        },
      },
    });

    console.log('✅ Usuário admin criado:', adminUser.email);

    // Criar categorias padrão
    const defaultCategories = [
      // Categorias de Entradas
      { name: 'Vendas', type: 'INCOME', color: '#10B981', icon: '💰' },
      { name: 'Investimentos', type: 'INCOME', color: '#3B82F6', icon: '📈' },
      { name: 'Freelance', type: 'INCOME', color: '#8B5CF6', icon: '💼' },
      { name: 'Outros', type: 'INCOME', color: '#6B7280', icon: '📊' },

      // Categorias de Despesas
      { name: 'Alimentação', type: 'EXPENSE', color: '#EF4444', icon: '🍽️' },
      { name: 'Transporte', type: 'EXPENSE', color: '#F59E0B', icon: '🚗' },
      { name: 'Moradia', type: 'EXPENSE', color: '#8B5CF6', icon: '🏠' },
      { name: 'Saúde', type: 'EXPENSE', color: '#EC4899', icon: '🏥' },
      { name: 'Educação', type: 'EXPENSE', color: '#06B6D4', icon: '📚' },
      { name: 'Lazer', type: 'EXPENSE', color: '#10B981', icon: '🎮' },
      { name: 'Vestuário', type: 'EXPENSE', color: '#F97316', icon: '👕' },
      { name: 'Serviços', type: 'EXPENSE', color: '#6B7280', icon: '🔧' },

      // Categorias de Produtos
      { name: 'Eletrônicos', type: 'PRODUCT', color: '#3B82F6', icon: '📱' },
      { name: 'Vestuário', type: 'PRODUCT', color: '#8B5CF6', icon: '👕' },
      { name: 'Alimentos', type: 'PRODUCT', color: '#10B981', icon: '🍎' },
      { name: 'Livros', type: 'PRODUCT', color: '#F59E0B', icon: '📚' },
      { name: 'Casa', type: 'PRODUCT', color: '#EF4444', icon: '🏠' },
      { name: 'Esportes', type: 'PRODUCT', color: '#06B6D4', icon: '⚽' },
    ];

    for (const category of defaultCategories) {
      await prisma.category.upsert({
        where: { 
          name_type: { 
            name: category.name, 
            type: category.type 
          } 
        },
        update: {},
        create: category,
      });
    }

    console.log('✅ Categorias padrão criadas');

    // Criar conta padrão
    const defaultAccount = await prisma.account.upsert({
      where: { 
        name_userId: { 
          name: 'Conta Principal', 
          userId: adminUser.id 
        } 
      },
      update: {},
      create: {
        name: 'Conta Principal',
        type: 'CHECKING',
        balance: 0,
        currency: 'BRL',
        status: 'ACTIVE',
        userId: adminUser.id,
      },
    });

    console.log('✅ Conta padrão criada:', defaultAccount.name);

    // Criar produtos de exemplo
    const sampleProducts = [
      {
        name: 'Produto Exemplo 1',
        description: 'Descrição do produto exemplo',
        price: 29.99,
        cost: 20.00,
        stock: 100,
        minStock: 10,
        categoryId: (await prisma.category.findFirst({ where: { type: 'PRODUCT' } })).id,
        userId: adminUser.id,
      },
      {
        name: 'Produto Exemplo 2',
        description: 'Outro produto de exemplo',
        price: 49.99,
        cost: 35.00,
        stock: 50,
        minStock: 5,
        categoryId: (await prisma.category.findFirst({ where: { type: 'PRODUCT' } })).id,
        userId: adminUser.id,
      },
    ];

    for (const product of sampleProducts) {
      await prisma.product.create({
        data: product,
      });
    }

    console.log('✅ Produtos de exemplo criados');

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('📧 Login: admin@timecashking.com');
    console.log('🔑 Senha: admin123');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
