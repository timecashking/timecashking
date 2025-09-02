import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthSystem {
  /**
   * Registra um novo usuário com email/senha
   */
  static async registerUser(userData) {
    try {
      const { email, password, name } = userData;

      // Verifica se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Usuário já existe com este email');
      }

      // Gera salt e hash da senha
      const salt = await bcryptjs.genSalt(12);
      const hashedPassword = await bcryptjs.hash(password, salt);

      // Cria o usuário
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          salt,
          name: name || email.split('@')[0]
        }
      });

      // Remove senha e salt do retorno
      const { password: _, salt: __, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword,
        message: 'Usuário registrado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Autentica usuário com email/senha
   */
  static async loginUser(credentials) {
    try {
      const { email, password } = credentials;

      // Busca o usuário
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          companyUsers: {
            include: {
              company: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica se tem senha (usuários Google não têm)
      if (!user.password) {
        throw new Error('Este email está vinculado ao Google. Use o login do Google.');
      }

      // Verifica a senha
      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Senha incorreta');
      }

      // Gera JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          companies: user.companyUsers.map(cu => ({
            companyId: cu.company.id,
            role: cu.role
          }))
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove senha e salt do retorno
      const { password: _, salt: __, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Login realizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Altera a senha do usuário
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.password) {
        throw new Error('Usuário não encontrado ou não tem senha');
      }

      // Verifica senha atual
      const isValidPassword = await bcryptjs.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Senha atual incorreta');
      }

      // Gera nova senha
      const newSalt = await bcryptjs.genSalt(12);
      const newHashedPassword = await bcryptjs.hash(newPassword, newSalt);

      // Atualiza a senha
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: newHashedPassword,
          salt: newSalt
        }
      });

      return {
        success: true,
        message: 'Senha alterada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Redefine a senha (esqueci minha senha)
   */
  static async resetPassword(email, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Gera nova senha
      const newSalt = await bcryptjs.genSalt(12);
      const newHashedPassword = await bcryptjs.hash(newPassword, newSalt);

      // Atualiza a senha
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: newHashedPassword,
          salt: newSalt
        }
      });

      return {
        success: true,
        message: 'Senha redefinida com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica se o token JWT é válido
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Busca o usuário para garantir que ainda existe
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          companyUsers: {
            include: {
              company: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companies: user.companyUsers.map(cu => ({
            companyId: cu.company.id,
            companyName: cu.company.name,
            role: cu.role
          }))
        },
        decoded
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Vincula conta Google a usuário existente
   */
  static async linkGoogleAccount(userId, googleId, googleData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica se o Google ID já está em uso
      const existingGoogleUser = await prisma.user.findUnique({
        where: { googleId }
      });

      if (existingGoogleUser && existingGoogleUser.id !== userId) {
        throw new Error('Esta conta Google já está vinculada a outro usuário');
      }

      // Atualiza o usuário com dados do Google
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          googleId,
          name: googleData.name || user.name,
          avatarUrl: googleData.picture || user.avatarUrl
        }
      });

      return {
        success: true,
        user: updatedUser,
        message: 'Conta Google vinculada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Desvincula conta Google
   */
  static async unlinkGoogleAccount(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.googleId) {
        throw new Error('Usuário não tem conta Google vinculada');
      }

      // Verifica se o usuário tem senha para não ficar sem forma de login
      if (!user.password) {
        throw new Error('Não é possível desvincular conta Google sem ter senha definida');
      }

      // Remove vínculo com Google
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          googleId: null,
          avatarUrl: null
        }
      });

      return {
        success: true,
        user: updatedUser,
        message: 'Conta Google desvinculada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
