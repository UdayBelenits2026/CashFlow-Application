import {
  CreateExpenseTransactionRequest,
  CreateIncomeTransactionRequest,
  CreateTransactionRequest,
  UpdateTransactionRequest
} from '../models/transaction-api.model';
import { TransactionFormModel, UpdateFormModel } from '../models/models.transaction';

const CURRENCY = 'INR';

// Converts an ISO yyyy-MM-dd date (HTML date input) to the backend CREATE format MM/DD/YYYY.
export function toApiDate(isoDate: string): string {
  const [year, month, day] = (isoDate || '').split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${month}/${day}/${year}`;
}

// Maps the user-friendly form model to the typed backend create DTO.
// Includes only fields relevant to the selected type; notes only when entered.
export function mapTransactionFormToRequest(model: TransactionFormModel): CreateTransactionRequest {
  const notes = model.notes?.trim();

  if (model.type === 'Income') {
    const income: CreateIncomeTransactionRequest = {
      accountId: Number(model.accountId),
      transactionType: 'INCOME',
      transactionDate: toApiDate(model.date),
      amount: Number(model.amount),
      currency: CURRENCY,
      incomeSourceId: Number(model.incomeSourceId),
      categoryId: Number(model.categoryId),
      description: model.description.trim()
    };
    if (notes) {
      income.notes = notes;
    }
    return income;
  }

  const expense: CreateExpenseTransactionRequest = {
    accountId: Number(model.accountId),
    transactionType: 'EXPENSE',
    transactionDate: toApiDate(model.date),
    amount: Number(model.amount),
    currency: CURRENCY,
    merchantId: Number(model.merchantId),
    categoryId: Number(model.categoryId),
    paymentMethod: model.paymentMethod,
    description: model.description.trim()
  };
  if (notes) {
    expense.notes = notes;
  }
  return expense;
}

// Maps the edit form to the PUT contract. The date is sent as yyyy-MM-dd (unchanged),
// NOT MM/DD/YYYY - the update contract differs from create here.
export function mapFormToUpdateRequest(model: UpdateFormModel, updatedBy: number): UpdateTransactionRequest {
  const request: UpdateTransactionRequest = {
    transactionDate: model.date,
    accountId: Number(model.accountId),
    description: model.description.trim(),
    categoryId: Number(model.categoryId),
    paymentMethod: model.paymentMethod,
    tagIds: model.tagIds ?? [],
    updatedBy
  };
  const reference = model.referenceNumber?.trim();
  if (reference) {
    request.referenceNumber = reference;
  }
  const notes = model.notes?.trim();
  if (notes) {
    request.notes = notes;
  }
  const attachmentUrl = model.attachmentUrl?.trim();
  if (attachmentUrl) {
    request.attachmentUrl = attachmentUrl;
  }
  return request;
}