#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Gerando cliente Prisma local...');

try {
  // Copia o schema local para o schema principal
  const localSchemaPath = path.join(__dirname, '../prisma/schema.local.prisma');
  const mainSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  if (fs.existsSync(localSchemaPath)) {
    fs.copyFileSync(localSchemaPath, mainSchemaPath);
    console.log('✅ Schema local copiado para schema principal');
  } else {
    console.log('❌ Schema local não encontrado');
    process.exit(1);
  }

  // Gera o cliente Prisma
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ Cliente Prisma gerado com sucesso!');
  console.log('📝 Para usar em desenvolvimento, execute: npm run dev:local');
  
} catch (error) {
  console.error('❌ Erro ao gerar cliente Prisma:', error.message);
  process.exit(1);
}
