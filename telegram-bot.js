import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import cron from 'node-cron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Configuração Google Calendar
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Cache de usuários vinculados
const userCache = new Map();

// Comandos básicos
bot.command('start', async (ctx) => {
  const welcomeMessage = `
🎯 *TimeCash King - Bot Oficial*

Olá! Eu sou o assistente do TimeCash King, o Rei do seu Tempo e do seu Dinheiro! 👑

*Comandos disponíveis:*
• /vincular - Vincular sua conta
• /ajuda - Ver todos os comandos
• /resumo - Resumo financeiro
• /estoque - Status do estoque
• /agenda - Próximos eventos

*Lançamentos rápidos:*
• "Gastei R$50 no mercado" → Despesa
• "Recebi R$300 de serviço" → Receita
• "Reunião amanhã às 14h" → Evento

*Lembretes automáticos:*
• Contas a pagar/receber
• Eventos da agenda
• Estoque baixo

Use /vincular para começar! 🚀
  `;
  
  await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
});

bot.command('ajuda', async (ctx) => {
  const helpMessage = `
📚 *Comandos do TimeCash King Bot*

*🔗 Conta:*
• /vincular - Vincular sua conta
• /desvincular - Desvincular conta

*💰 Financeiro:*
• /resumo - Resumo financeiro
• /saldo - Saldo das contas
• /pendentes - Contas pendentes

*📦 Estoque:*
• /estoque - Status geral
• /baixo - Produtos com estoque baixo

*📅 Agenda:*
• /agenda - Próximos eventos
• /hoje - Eventos de hoje

*📝 Lançamentos por texto:*
• "Gastei R$X em [categoria]" → Despesa
• "Recebi R$X de [categoria]" → Receita
• "Reunião [data] às [hora]" → Evento

*🎤 Lançamentos por voz:*
• Envie áudio com o comando
• Ex: "Gastei cinquenta reais no mercado"

*⚙️ Configurações:*
• /config - Configurar empresa padrão
• /notificacoes - Configurar lembretes
  `;
  
  await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
});

// Comando para vincular conta
bot.command('vincular', async (ctx) => {
  const chatId = ctx.chat.id;
  const username = ctx.from.username || ctx.from.first_name;
  
  try {
    // Verificar se já está vinculado
    const existingUser = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() }
    });
    
    if (existingUser) {
      await ctx.reply('✅ Sua conta já está vinculada! Use /resumo para ver seus dados.');
      return;
    }
    
    // Gerar código de vinculação único
    const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Salvar código temporário
    await prisma.telegramLinkCode.create({
      data: {
        code: linkCode,
        chatId: chatId.toString(),
        username: username,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      }
    });
    
    const linkMessage = `
🔗 *Vincular Conta TimeCash King*

Para vincular sua conta:

1️⃣ Acesse: https://timecashking.com/vincular
2️⃣ Digite o código: *${linkCode}*
3️⃣ Faça login na sua conta
4️⃣ Confirme a vinculação

⏰ O código expira em 30 minutos.

*Após vincular, você poderá:*
• Fazer lançamentos por texto/áudio
• Receber lembretes automáticos
• Consultar saldos e estoque
• Gerenciar agenda
    `;
    
    await ctx.reply(linkMessage, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erro ao gerar código de vinculação:', error);
    await ctx.reply('❌ Erro ao gerar código. Tente novamente.');
  }
});

// Comando para desvincular
bot.command('desvincular', async (ctx) => {
  const chatId = ctx.chat.id;
  
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() }
    });
    
    if (!user) {
      await ctx.reply('❌ Sua conta não está vinculada.');
      return;
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: null }
    });
    
    await ctx.reply('✅ Conta desvinculada com sucesso! Use /vincular para vincular novamente.');
    
  } catch (error) {
    console.error('Erro ao desvincular:', error);
    await ctx.reply('❌ Erro ao desvincular. Tente novamente.');
  }
});

// Comando para resumo financeiro
bot.command('resumo', async (ctx) => {
  const chatId = ctx.chat.id;
  
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() },
      include: {
        companyUsers: {
          include: {
            company: true
          }
        }
      }
    });
    
    if (!user) {
      await ctx.reply('❌ Sua conta não está vinculada. Use /vincular primeiro.');
      return;
    }
    
    // Buscar empresa padrão ou primeira empresa
    const company = user.companyUsers[0]?.company;
    if (!company) {
      await ctx.reply('❌ Nenhuma empresa encontrada.');
      return;
    }
    
    // Buscar resumo financeiro
    const summary = await getFinancialSummary(company.id);
    
    const resumoMessage = `
💰 *Resumo Financeiro - ${company.name}*

📈 *Receitas do Mês:* R$ ${summary.monthlyIncome.toFixed(2)}
📉 *Despesas do Mês:* R$ ${summary.monthlyExpense.toFixed(2)}
💵 *Saldo Total:* R$ ${summary.totalBalance.toFixed(2)}
⚠️ *Contas Pendentes:* ${summary.pendingBills}

📊 *Status:*
• Receitas: ${summary.monthlyIncome > 0 ? '✅' : '❌'}
• Despesas: ${summary.monthlyExpense > 0 ? '✅' : '❌'}
• Saldo: ${summary.totalBalance >= 0 ? '✅' : '❌'}

🔗 Ver detalhes: https://timecashking.com/dashboard
    `;
    
    await ctx.reply(resumoMessage, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    await ctx.reply('❌ Erro ao buscar resumo. Tente novamente.');
  }
});

// Comando para ver estoque
bot.command('estoque', async (ctx) => {
  const chatId = ctx.chat.id;
  
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() },
      include: {
        companyUsers: {
          include: {
            company: true
          }
        }
      }
    });
    
    if (!user) {
      await ctx.reply('❌ Sua conta não está vinculada. Use /vincular primeiro.');
      return;
    }
    
    const company = user.companyUsers[0]?.company;
    if (!company) {
      await ctx.reply('❌ Nenhuma empresa encontrada.');
      return;
    }
    
    // Buscar produtos com estoque baixo
    const lowStockProducts = await prisma.product.findMany({
      where: {
        companyId: company.id,
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock
        }
      },
      select: {
        name: true,
        stock: true,
        minStock: true
      }
    });
    
    // Buscar total de produtos
    const totalProducts = await prisma.product.count({
      where: {
        companyId: company.id,
        isActive: true
      }
    });
    
    const estoqueMessage = `
📦 *Status do Estoque - ${company.name}*

📊 *Total de Produtos:* ${totalProducts}
⚠️ *Produtos com Estoque Baixo:* ${lowStockProducts.length}

${lowStockProducts.length > 0 ? '\n*Produtos Críticos:*\n' + 
  lowStockProducts.map(p => `• ${p.name}: ${p.stock}/${p.minStock}`).join('\n') : 
  '✅ Todos os produtos com estoque adequado!'}

🔗 Gerenciar: https://timecashking.com/inventory
    `;
    
    await ctx.reply(estoqueMessage, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    await ctx.reply('❌ Erro ao buscar estoque. Tente novamente.');
  }
});

// Comando para ver agenda
bot.command('agenda', async (ctx) => {
  const chatId = ctx.chat.id;
  
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() },
      include: {
        companyUsers: {
          include: {
            company: true
          }
        }
      }
    });
    
    if (!user) {
      await ctx.reply('❌ Sua conta não está vinculada. Use /vincular primeiro.');
      return;
    }
    
    const company = user.companyUsers[0]?.company;
    if (!company) {
      await ctx.reply('❌ Nenhuma empresa encontrada.');
      return;
    }
    
    // Buscar próximos eventos (próximos 7 dias)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingEvents = await prisma.event.findMany({
      where: {
        companyId: company.id,
        startDate: {
          gte: new Date(),
          lte: nextWeek
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 5
    });
    
    if (upcomingEvents.length === 0) {
      await ctx.reply('📅 Nenhum evento agendado para os próximos 7 dias.');
      return;
    }
    
    const agendaMessage = `
📅 *Próximos Eventos - ${company.name}*

${upcomingEvents.map(event => {
  const date = new Date(event.startDate);
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  
  return `• ${day} às ${time} - ${event.title}`;
}).join('\n')}

🔗 Ver agenda completa: https://timecashking.com/schedule
    `;
    
    await ctx.reply(agendaMessage, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    await ctx.reply('❌ Erro ao buscar agenda. Tente novamente.');
  }
});

// Processar mensagens de texto para lançamentos
bot.on(message('text'), async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;
  
  // Ignorar comandos
  if (text.startsWith('/')) return;
  
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() },
      include: {
        companyUsers: {
          include: {
            company: true
          }
        }
      }
    });
    
    if (!user) {
      await ctx.reply('❌ Sua conta não está vinculada. Use /vincular primeiro.');
      return;
    }
    
    const company = user.companyUsers[0]?.company;
    if (!company) {
      await ctx.reply('❌ Nenhuma empresa encontrada.');
      return;
    }
    
    // Processar lançamento financeiro
    const transaction = await processFinancialTransaction(text, company.id, user.id);
    if (transaction) {
      await ctx.reply(transaction.message, { parse_mode: 'Markdown' });
      return;
    }
    
    // Processar evento/agenda
    const event = await processEventCreation(text, company.id, user.id);
    if (event) {
      await ctx.reply(event.message, { parse_mode: 'Markdown' });
      return;
    }
    
    // Se não conseguiu processar, dar dicas
    await ctx.reply(`
❓ *Não consegui entender o comando*

*Exemplos de lançamentos:*
• "Gastei R$50 no mercado"
• "Recebi R$300 de serviço"
• "Gastei R$200 no cartão, vence dia 10"

*Exemplos de eventos:*
• "Reunião amanhã às 14h"
• "Consulta dia 25 às 9h"

Use /ajuda para ver todos os comandos disponíveis.
    `, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    await ctx.reply('❌ Erro ao processar mensagem. Tente novamente.');
  }
});

// Processar mensagens de áudio
bot.on(message('voice'), async (ctx) => {
  const chatId = ctx.chat.id;
  
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() }
    });
    
    if (!user) {
      await ctx.reply('❌ Sua conta não está vinculada. Use /vincular primeiro.');
      return;
    }
    
    await ctx.reply('🎤 Processando áudio... Aguarde um momento.');
    
    // Baixar arquivo de áudio
    const file = await ctx.telegram.getFile(ctx.message.voice.file_id);
    const audioPath = `./temp/audio_${Date.now()}.ogg`;
    
    // Criar diretório temp se não existir
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }
    
    // Baixar arquivo
    const response = await axios({
      method: 'GET',
      url: `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(audioPath);
    response.data.pipe(writer);
    
    writer.on('finish', async () => {
      try {
        // Processar áudio com Whisper (local ou API)
        const transcription = await processAudioTranscription(audioPath);
        
        if (transcription) {
          // Processar transcrição como texto
          const result = await processFinancialTransaction(transcription, user.companyUsers[0].companyId, user.id);
          
          if (result) {
            await ctx.reply(`🎤 *Áudio processado:* "${transcription}"\n\n${result.message}`, { parse_mode: 'Markdown' });
          } else {
            await ctx.reply(`🎤 *Áudio processado:* "${transcription}"\n\n❌ Não consegui processar este comando.`);
          }
        } else {
          await ctx.reply('❌ Erro ao processar áudio. Tente novamente.');
        }
        
        // Limpar arquivo temporário
        fs.unlinkSync(audioPath);
        
      } catch (error) {
        console.error('Erro ao processar áudio:', error);
        await ctx.reply('❌ Erro ao processar áudio. Tente novamente.');
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    await ctx.reply('❌ Erro ao processar áudio. Tente novamente.');
  }
});

// Função para processar transação financeira
async function processFinancialTransaction(text, companyId, userId) {
  // Padrões para despesas
  const expensePattern = /(?:gastei|paguei|despesa)\s+(?:de\s+)?R?\$?\s*(\d+(?:[.,]\d{2})?)\s+(?:em|no|na|para)\s+(.+)/i;
  
  // Padrões para receitas
  const incomePattern = /(?:recebi|ganhei|entrada)\s+(?:de\s+)?R?\$?\s*(\d+(?:[.,]\d{2})?)\s+(?:de|por|para)\s+(.+)/i;
  
  // Padrões para cartão de crédito
  const creditCardPattern = /(?:gastei|paguei)\s+R?\$?\s*(\d+(?:[.,]\d{2})?)\s+(?:no|em)\s+(?:cartão|cartao)\s+(?:da\s+)?(.+?)(?:,\s*vence\s+(?:dia\s+)?(\d{1,2}))?/i;
  
  let match;
  let transactionData = {};
  
  // Tentar padrão de despesa
  if (match = text.match(expensePattern)) {
    const amount = parseFloat(match[1].replace(',', '.'));
    const description = match[2].trim();
    
    transactionData = {
      type: 'EXPENSE',
      amount: amount,
      description: description,
      date: new Date(),
      isPaid: true
    };
  }
  // Tentar padrão de receita
  else if (match = text.match(incomePattern)) {
    const amount = parseFloat(match[1].replace(',', '.'));
    const description = match[2].trim();
    
    transactionData = {
      type: 'INCOME',
      amount: amount,
      description: description,
      date: new Date(),
      isPaid: true
    };
  }
  // Tentar padrão de cartão de crédito
  else if (match = text.match(creditCardPattern)) {
    const amount = parseFloat(match[1].replace(',', '.'));
    const cardName = match[2].trim();
    const dueDay = match[3] ? parseInt(match[3]) : null;
    
    transactionData = {
      type: 'EXPENSE',
      amount: amount,
      description: `Cartão ${cardName}`,
      date: new Date(),
      isPaid: false,
      dueDay: dueDay
    };
  }
  
  if (Object.keys(transactionData).length === 0) {
    return null;
  }
  
  try {
    // Buscar categoria padrão ou criar
    let category = await prisma.category.findFirst({
      where: {
        companyId: companyId,
        name: {
          contains: transactionData.description,
          mode: 'insensitive'
        }
      }
    });
    
    if (!category) {
      // Criar categoria padrão
      category = await prisma.category.create({
        data: {
          name: transactionData.description,
          type: transactionData.type,
          color: transactionData.type === 'INCOME' ? '#22c55e' : '#ef4444',
          icon: transactionData.type === 'INCOME' ? 'trending-up' : 'trending-down',
          companyId: companyId
        }
      });
    }
    
    // Buscar conta padrão
    const account = await prisma.account.findFirst({
      where: {
        companyId: companyId,
        isActive: true
      }
    });
    
    if (!account) {
      return {
        message: '❌ Nenhuma conta encontrada. Crie uma conta primeiro no sistema.'
      };
    }
    
    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        description: transactionData.description,
        amount: transactionData.amount,
        type: transactionData.type,
        date: transactionData.date,
        categoryId: category.id,
        accountId: account.id,
        companyId: companyId,
        userId: userId,
        isPaid: transactionData.isPaid,
        notes: `Criado via Telegram Bot`
      }
    });
    
    // Se for cartão de crédito, criar bill
    if (transactionData.dueDay && !transactionData.isPaid) {
      const dueDate = new Date();
      dueDate.setDate(transactionData.dueDay);
      if (dueDate < new Date()) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      
      await prisma.bill.create({
        data: {
          description: transactionData.description,
          amount: transactionData.amount,
          type: 'PAYABLE',
          dueDate: dueDate,
          status: 'PENDING',
          companyId: companyId,
          categoryId: category.id,
          accountId: account.id
        }
      });
    }
    
    // Verificar se precisa gerar dízimo (10% das receitas)
    if (transactionData.type === 'INCOME' && transactionData.isPaid) {
      await generateTithe(companyId, transactionData.amount);
    }
    
    const message = `
✅ *${transactionData.type === 'INCOME' ? 'Receita' : 'Despesa'} registrada!*

💰 *Valor:* R$ ${transactionData.amount.toFixed(2)}
📝 *Descrição:* ${transactionData.description}
📅 *Data:* ${transactionData.date.toLocaleDateString('pt-BR')}
🏷️ *Categoria:* ${category.name}

${transactionData.dueDay ? `📅 *Vencimento:* Dia ${transactionData.dueDay}` : ''}

🔗 Ver no sistema: https://timecashking.com/transactions
    `;
    
    return { message, transaction };
    
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return {
      message: '❌ Erro ao registrar transação. Tente novamente.'
    };
  }
}

// Função para processar criação de eventos
async function processEventCreation(text, companyId, userId) {
  // Padrões para eventos
  const eventPattern = /(?:reunião|consulta|evento|encontro)\s+(?:dia\s+)?(\d{1,2})\s+(?:às\s+)?(\d{1,2})[h:]\d{0,2}/i;
  const tomorrowPattern = /(?:reunião|consulta|evento|encontro)\s+(?:amanhã|amanha)\s+(?:às\s+)?(\d{1,2})[h:]\d{0,2}/i;
  const todayPattern = /(?:reunião|consulta|evento|encontro)\s+(?:hoje)\s+(?:às\s+)?(\d{1,2})[h:]\d{0,2}/i;
  
  let match;
  let eventData = {};
  
  // Tentar padrão com data específica
  if (match = text.match(eventPattern)) {
    const day = parseInt(match[1]);
    const hour = parseInt(match[2]);
    
    const startDate = new Date();
    startDate.setDate(day);
    startDate.setHours(hour, 0, 0, 0);
    
    // Se a data já passou, assumir próximo mês
    if (startDate < new Date()) {
      startDate.setMonth(startDate.getMonth() + 1);
    }
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    eventData = {
      title: text.replace(match[0], '').trim() || 'Evento',
      startDate: startDate,
      endDate: endDate
    };
  }
  // Tentar padrão amanhã
  else if (match = text.match(tomorrowPattern)) {
    const hour = parseInt(match[1]);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(hour, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    eventData = {
      title: text.replace(match[0], '').trim() || 'Evento',
      startDate: startDate,
      endDate: endDate
    };
  }
  // Tentar padrão hoje
  else if (match = text.match(todayPattern)) {
    const hour = parseInt(match[1]);
    
    const startDate = new Date();
    startDate.setHours(hour, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    eventData = {
      title: text.replace(match[0], '').trim() || 'Evento',
      startDate: startDate,
      endDate: endDate
    };
  }
  
  if (Object.keys(eventData).length === 0) {
    return null;
  }
  
  try {
    // Criar evento
    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        companyId: companyId,
        userId: userId,
        notes: `Criado via Telegram Bot`
      }
    });
    
    // Tentar criar no Google Calendar se configurado
    try {
      await createGoogleCalendarEvent(event, companyId);
    } catch (error) {
      console.log('Google Calendar não configurado ou erro:', error);
    }
    
    const message = `
📅 *Evento criado com sucesso!*

📝 *Título:* ${eventData.title}
🕐 *Início:* ${eventData.startDate.toLocaleString('pt-BR')}
🕐 *Fim:* ${eventData.endDate.toLocaleString('pt-BR')}

🔗 Ver agenda: https://timecashking.com/schedule
    `;
    
    return { message, event };
    
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return {
      message: '❌ Erro ao criar evento. Tente novamente.'
    };
  }
}

// Função para processar transcrição de áudio
async function processAudioTranscription(audioPath) {
  try {
    // Tentar usar Whisper local se disponível
    if (process.env.USE_WHISPER_LOCAL === 'true') {
      // Implementar Whisper local aqui
      return null;
    }
    
    // Usar API do OpenAI Whisper (requer chave API)
    if (process.env.OPENAI_API_KEY) {
      const FormData = await import('form-data');
      const form = new FormData();
      form.append('file', fs.createReadStream(audioPath));
      form.append('model', 'whisper-1');
      
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
        }
      });
      
      return response.data.text;
    }
    
    // Fallback: usar Google Speech-to-Text
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const speech = require('@google-cloud/speech');
      const client = new speech.SpeechClient();
      
      const audioBytes = fs.readFileSync(audioPath);
      const audio = {
        content: audioBytes.toString('base64')
      };
      
      const config = {
        encoding: 'OGG_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'pt-BR'
      };
      
      const request = {
        audio: audio,
        config: config
      };
      
      const [response] = await client.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      
      return transcription;
    }
    
    return null;
    
  } catch (error) {
    console.error('Erro na transcrição:', error);
    return null;
  }
}

// Função para criar evento no Google Calendar
async function createGoogleCalendarEvent(event, companyId) {
  try {
    // Buscar credenciais da empresa
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { googleAccessToken: true, googleRefreshToken: true }
    });
    
    if (!company?.googleAccessToken) {
      return;
    }
    
    // Configurar OAuth2
    oauth2Client.setCredentials({
      access_token: company.googleAccessToken,
      refresh_token: company.googleRefreshToken
    });
    
    // Criar evento no Google Calendar
    const calendarEvent = {
      summary: event.title,
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: process.env.APP_TZ || 'America/Sao_Paulo'
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: process.env.APP_TZ || 'America/Sao_Paulo'
      },
      description: event.notes || 'Criado via TimeCash King'
    };
    
    await calendar.events.insert({
      calendarId: 'primary',
      resource: calendarEvent
    });
    
    // Atualizar evento com ID do Google
    await prisma.event.update({
      where: { id: event.id },
      data: { googleEventId: calendarEvent.id }
    });
    
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error);
  }
}

// Função para gerar dízimo automático
async function generateTithe(companyId, incomeAmount) {
  try {
    const titheAmount = incomeAmount * 0.1; // 10%
    
    // Buscar categoria de dízimo
    let titheCategory = await prisma.category.findFirst({
      where: {
        companyId: companyId,
        name: 'Dízimo'
      }
    });
    
    if (!titheCategory) {
      titheCategory = await prisma.category.create({
        data: {
          name: 'Dízimo',
          type: 'EXPENSE',
          color: '#8b5cf6',
          icon: 'heart',
          companyId: companyId
        }
      });
    }
    
    // Buscar conta padrão
    const account = await prisma.account.findFirst({
      where: {
        companyId: companyId,
        isActive: true
      }
    });
    
    if (!account) return;
    
    // Criar bill de dízimo
    await prisma.bill.create({
      data: {
        description: 'Dízimo (10% da receita)',
        amount: titheAmount,
        type: 'PAYABLE',
        dueDate: new Date(),
        status: 'PENDING',
        companyId: companyId,
        categoryId: titheCategory.id,
        accountId: account.id
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar dízimo:', error);
  }
}

// Função para buscar resumo financeiro
async function getFinancialSummary(companyId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const [monthlyIncome, monthlyExpense, totalBalance, pendingBills] = await Promise.all([
    // Receitas do mês
    prisma.transaction.aggregate({
      where: {
        companyId: companyId,
        type: 'INCOME',
        date: { gte: startOfMonth, lte: endOfMonth },
        isPaid: true
      },
      _sum: { amount: true }
    }),
    
    // Despesas do mês
    prisma.transaction.aggregate({
      where: {
        companyId: companyId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth },
        isPaid: true
      },
      _sum: { amount: true }
    }),
    
    // Saldo total
    prisma.transaction.aggregate({
      where: {
        companyId: companyId,
        isPaid: true
      },
      _sum: {
        amount: true
      }
    }),
    
    // Contas pendentes
    prisma.bill.count({
      where: {
        companyId: companyId,
        status: 'PENDING'
      }
    })
  ]);
  
  return {
    monthlyIncome: monthlyIncome._sum.amount || 0,
    monthlyExpense: monthlyExpense._sum.amount || 0,
    totalBalance: (totalBalance._sum.amount || 0),
    pendingBills: pendingBills
  };
}

// Configurar lembretes automáticos
function setupAutomaticReminders() {
  // Lembretes diários às 8h
  cron.schedule('0 8 * * *', async () => {
    await sendDailyReminders();
  });
  
  // Lembretes de eventos (D-1 e D0)
  cron.schedule('0 9 * * *', async () => {
    await sendEventReminders();
  });
  
  // Lembretes de contas a pagar (hoje e amanhã)
  cron.schedule('0 10 * * *', async () => {
    await sendBillReminders();
  });
  
  // Lembretes de estoque baixo
  cron.schedule('0 11 * * *', async () => {
    await sendStockReminders();
  });
}

// Função para enviar lembretes diários
async function sendDailyReminders() {
  try {
    const users = await prisma.user.findMany({
      where: { telegramChatId: { not: null } },
      include: {
        companyUsers: {
          include: {
            company: true
          }
        }
      }
    });
    
    for (const user of users) {
      if (user.companyUsers.length === 0) continue;
      
      const company = user.companyUsers[0].company;
      const summary = await getFinancialSummary(company.id);
      
      const reminderMessage = `
🌅 *Bom dia! Lembretes do TimeCash King*

💰 *Resumo do dia:*
• Receitas do mês: R$ ${summary.monthlyIncome.toFixed(2)}
• Despesas do mês: R$ ${summary.monthlyExpense.toFixed(2)}
• Contas pendentes: ${summary.pendingBills}

📅 *Hoje:*
• ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}

🔗 Ver dashboard: https://timecashking.com/dashboard
      `;
      
      await bot.telegram.sendMessage(user.telegramChatId, reminderMessage, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Erro ao enviar lembretes diários:', error);
  }
}

// Função para enviar lembretes de eventos
async function sendEventReminders() {
  try {
    const users = await prisma.user.findMany({
      where: { telegramChatId: { not: null } }
    });
    
    for (const user of users) {
      const events = await prisma.event.findMany({
        where: {
          companyId: { in: user.companyUsers.map(cu => cu.companyId) },
          startDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Próximas 24h
          }
        },
        include: {
          company: true
        }
      });
      
      if (events.length === 0) continue;
      
      const eventsMessage = `
📅 *Lembretes de Eventos*

${events.map(event => {
  const date = new Date(event.startDate);
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
  
  return `• ${day} às ${time} - ${event.title} (${event.company.name})`;
}).join('\n')}

🔗 Ver agenda: https://timecashking.com/schedule
      `;
      
      await bot.telegram.sendMessage(user.telegramChatId, eventsMessage, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Erro ao enviar lembretes de eventos:', error);
  }
}

// Função para enviar lembretes de contas
async function sendBillReminders() {
  try {
    const users = await prisma.user.findMany({
      where: { telegramChatId: { not: null } }
    });
    
    for (const user of users) {
      const bills = await prisma.bill.findMany({
        where: {
          companyId: { in: user.companyUsers.map(cu => cu.companyId) },
          status: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Próximas 24h
          }
        },
        include: {
          company: true,
          category: true
        }
      });
      
      if (bills.length === 0) continue;
      
      const billsMessage = `
💰 *Contas a Pagar/Receber*

${bills.map(bill => {
  const date = new Date(bill.dueDate);
  const day = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
  
  return `• ${day} - ${bill.description} - R$ ${bill.amount.toFixed(2)} (${bill.company.name})`;
}).join('\n')}

🔗 Ver contas: https://timecashking.com/bills
      `;
      
      await bot.telegram.sendMessage(user.telegramChatId, billsMessage, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Erro ao enviar lembretes de contas:', error);
  }
}

// Função para enviar lembretes de estoque
async function sendStockReminders() {
  try {
    const users = await prisma.user.findMany({
      where: { telegramChatId: { not: null } }
    });
    
    for (const user of users) {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          companyId: { in: user.companyUsers.map(cu => cu.companyId) },
          isActive: true,
          stock: {
            lte: prisma.product.fields.minStock
          }
        },
        include: {
          company: true
        }
      });
      
      if (lowStockProducts.length === 0) continue;
      
      const stockMessage = `
⚠️ *Produtos com Estoque Baixo*

${lowStockProducts.map(product => {
  return `• ${product.name}: ${product.stock}/${product.minStock} (${product.company.name})`;
}).join('\n')}

🔗 Gerenciar estoque: https://timecashking.com/inventory
      `;
      
      await bot.telegram.sendMessage(user.telegramChatId, stockMessage, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Erro ao enviar lembretes de estoque:', error);
  }
}

// Inicializar bot
async function initializeBot() {
  try {
    // Configurar lembretes automáticos
    setupAutomaticReminders();
    
    // Iniciar bot
    await bot.launch();
    console.log('🤖 Bot do Telegram iniciado com sucesso!');
    
    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
  } catch (error) {
    console.error('❌ Erro ao iniciar bot:', error);
  }
}

// Exportar funções para uso externo
export {
  bot,
  initializeBot,
  processFinancialTransaction,
  processEventCreation,
  sendDailyReminders,
  sendEventReminders,
  sendBillReminders,
  sendStockReminders
};

// Inicializar se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeBot();
}
