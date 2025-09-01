import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionCard } from '@/components/TransactionCard';

// Mock the transaction data
const mockTransaction = {
  id: 'test-transaction-id',
  userId: 'test-user-id',
  categoryId: 'test-category-id',
  type: 'EXPENSE' as const,
  amount: 100.00,
  description: 'Test transaction',
  date: '2024-01-15T00:00:00.000Z',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

const mockCategory = {
  id: 'test-category-id',
  userId: 'test-user-id',
  name: 'Test Category',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('TransactionCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render transaction information correctly', () => {
    render(
      <TransactionCard
        transaction={mockTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test transaction')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('15/01/2024')).toBeInTheDocument();
  });

  it('should display expense amount in red', () => {
    render(
      <TransactionCard
        transaction={mockTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const amountElement = screen.getByText('R$ 100,00');
    expect(amountElement).toHaveClass('text-red-600');
  });

  it('should display income amount in green', () => {
    const incomeTransaction = {
      ...mockTransaction,
      type: 'INCOME' as const,
    };

    render(
      <TransactionCard
        transaction={incomeTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const amountElement = screen.getByText('R$ 100,00');
    expect(amountElement).toHaveClass('text-green-600');
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <TransactionCard
        transaction={mockTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTestId('edit-icon').closest('button');
    fireEvent.click(editButton!);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTransaction);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <TransactionCard
        transaction={mockTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    fireEvent.click(deleteButton!);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTransaction.id);
  });

  it('should show confirmation dialog before deleting', () => {
    render(
      <TransactionCard
        transaction={mockTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    fireEvent.click(deleteButton!);

    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza que deseja excluir esta transação?')).toBeInTheDocument();
  });

  it('should handle missing category gracefully', () => {
    render(
      <TransactionCard
        transaction={mockTransaction}
        category={null}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Sem categoria')).toBeInTheDocument();
  });

  it('should format large amounts correctly', () => {
    const largeAmountTransaction = {
      ...mockTransaction,
      amount: 1234567.89,
    };

    render(
      <TransactionCard
        transaction={largeAmountTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('R$ 1.234.567,89')).toBeInTheDocument();
  });

  it('should display today\'s date as "Hoje"', () => {
    const today = new Date().toISOString();
    const todayTransaction = {
      ...mockTransaction,
      date: today,
    };

    render(
      <TransactionCard
        transaction={todayTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Hoje')).toBeInTheDocument();
  });

  it('should display yesterday\'s date as "Ontem"', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const yesterdayTransaction = {
      ...mockTransaction,
      date: yesterday,
    };

    render(
      <TransactionCard
        transaction={yesterdayTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Ontem')).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(
      <TransactionCard
        transaction={mockTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTestId('edit-icon').closest('button');
    const deleteButton = screen.getByTestId('trash-icon').closest('button');

    expect(editButton).toHaveAttribute('aria-label', 'Editar transação');
    expect(deleteButton).toHaveAttribute('aria-label', 'Excluir transação');
  });

  it('should handle long descriptions with truncation', () => {
    const longDescriptionTransaction = {
      ...mockTransaction,
      description: 'This is a very long description that should be truncated when it exceeds the maximum length allowed in the component',
    };

    render(
      <TransactionCard
        transaction={longDescriptionTransaction}
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const descriptionElement = screen.getByText(longDescriptionTransaction.description);
    expect(descriptionElement).toHaveClass('truncate');
  });
});
