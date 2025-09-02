import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class ActivationSystem {
  // Gerar código de ativação para uma empresa
  static async generateActivationCode(companyId) {
    try {
      const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      await prisma.activationCode.upsert({
        where: { companyId },
        update: {
          code: activationCode,
          expiresAt,
          isUsed: false
        },
        create: {
          companyId,
          code: activationCode,
          expiresAt,
          isUsed: false
        }
      });

      return activationCode;
    } catch (error) {
      throw new Error('Erro ao gerar código de ativação');
    }
  }

  // Verificar código de ativação
  static async verifyActivationCode(code) {
    try {
      const activation = await prisma.activationCode.findFirst({
        where: {
          code: code.toUpperCase(),
          isUsed: false,
          expiresAt: { gt: new Date() }
        },
        include: {
          company: true
        }
      });

      if (!activation) {
        throw new Error('Código de ativação inválido ou expirado');
      }

      return activation;
    } catch (error) {
      throw error;
    }
  }

  // Ativar conta com código
  static async activateAccount(activationData) {
    try {
      const { code, email, password, name } = activationData;
      
      // Verificar código
      const activation = await this.verifyActivationCode(code);
      
      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Criar usuário
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          salt,
          name
        }
      });

      // Vincular usuário à empresa como OWNER
      await prisma.companyUser.create({
        data: {
          companyId: activation.companyId,
          userId: user.id,
          role: 'OWNER'
        }
      });

      // Marcar código como usado
      await prisma.activationCode.update({
        where: { id: activation.id },
        data: { isUsed: true }
      });

      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        company: activation.company,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Listar códigos de ativação de uma empresa
  static async listActivationCodes(companyId) {
    try {
      return await prisma.activationCode.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw new Error('Erro ao listar códigos de ativação');
    }
  }

  // Revogar código de ativação
  static async revokeActivationCode(codeId) {
    try {
      await prisma.activationCode.update({
        where: { id: codeId },
        data: { isUsed: true }
      });
      return true;
    } catch (error) {
      throw new Error('Erro ao revogar código de ativação');
    }
  }
}
