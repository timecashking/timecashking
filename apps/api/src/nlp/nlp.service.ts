import { Injectable } from '@nestjs/common';

@Injectable()
export class NlpService {
  async parseText(text: string) {
    // Implementar processamento NLP em português
    const lowerText = text.toLowerCase();
    
    // Padrões básicos para despesas
    const expensePatterns = [
      { pattern: /gastei (\d+)/, type: 'EXPENSE', amount: '$1' },
      { pattern: /paguei (\d+)/, type: 'EXPENSE', amount: '$1' },
      { pattern: /comprei por (\d+)/, type: 'EXPENSE', amount: '$1' },
      { pattern: /despesa de (\d+)/, type: 'EXPENSE', amount: '$1' },
    ];

    // Padrões básicos para receitas
    const incomePatterns = [
      { pattern: /recebi (\d+)/, type: 'INCOME', amount: '$1' },
      { pattern: /ganhei (\d+)/, type: 'INCOME', amount: '$1' },
      { pattern: /vendi por (\d+)/, type: 'INCOME', amount: '$1' },
      { pattern: /receita de (\d+)/, type: 'INCOME', amount: '$1' },
    ];

    // Verificar padrões de despesa
    for (const pattern of expensePatterns) {
      const match = lowerText.match(pattern.pattern);
      if (match) {
        return {
          type: pattern.type,
          amount: parseInt(match[1]),
          description: text,
          category: 'Geral',
          needs_confirmation: false,
        };
      }
    }

    // Verificar padrões de receita
    for (const pattern of incomePatterns) {
      const match = lowerText.match(pattern.pattern);
      if (match) {
        return {
          type: pattern.type,
          amount: parseInt(match[1]),
          description: text,
          category: 'Geral',
          needs_confirmation: false,
        };
      }
    }

    // Padrão genérico para valores
    const valueMatch = lowerText.match(/(\d+)/);
    if (valueMatch) {
      return {
        type: 'EXPENSE',
        amount: parseInt(valueMatch[1]),
        description: text,
        category: 'Geral',
        needs_confirmation: true,
      };
    }

    return {
      type: 'EXPENSE',
      amount: 0,
      description: text,
      category: 'Geral',
      needs_confirmation: true,
    };
  }
}
