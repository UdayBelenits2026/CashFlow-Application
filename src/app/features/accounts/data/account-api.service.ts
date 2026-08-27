import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { UserContextService } from '../../../core/services/user-context.service';
import {
  Account,
  AccountCategory,
  CreateAccountCategoryRequest,
  CreateAccountRequest,
  CurrencyOption,
  Transaction,
} from '../models/accounts.model';
import {
  ACCOUNT_TYPE_CODE_BY_LABEL,
  ACCOUNT_TYPE_ID_BY_CODE,
  AccountApiResponse,
  AccountDetailDto,
  AccountOverviewDto,
  AccountSubtypeDto,
  AccountTypeCode,
  AccountTypeCountDto,
  AccountTypeDto,
  AccountTypeSpecificDetails,
  BankTypeDetails,
  CreateAccountApiRequest,
  CreatedAccountDto,
  CreditCardTypeDetails,
  InstitutionDto,
  InvestmentTypeDetails,
  LoanTypeDetails,
  SensitiveDetailsDto,
} from '../models/account-api.model';

// Encapsulates every HTTP call to the Cashflow Account service. Backend responses use the
// { success, data, ... } envelope; this service unwraps `.data`. Legacy method names used by
// the store/effects are kept as adapters that map the live API onto the app's existing shapes.
@Injectable({
  providedIn: 'root'
})
export class AccountApiService {
  private readonly http = inject(HttpClient);
  private readonly userContext = inject(UserContextService);
  private readonly baseUrl = environment.accountsApiBaseUrl;

  private get userId(): number {
    return this.userContext.getUserId();
  }

  // --- Typed backend endpoints ---

  // GET /account-types/type-names
  getAccountTypeNames(): Observable<AccountTypeDto[]> {
    return this.http
      .get<AccountApiResponse<AccountTypeDto[]>>(`${this.baseUrl}/account-types/type-names`)
      .pipe(map((res) => res.data ?? []));
  }

  // GET /account-types/subtypes?accountTypeId
  getSubtypes(accountTypeId: number): Observable<AccountSubtypeDto[]> {
    const params = new HttpParams().set('accountTypeId', accountTypeId);
    return this.http
      .get<AccountApiResponse<AccountSubtypeDto[]>>(`${this.baseUrl}/account-types/subtypes`, { params })
      .pipe(map((res) => res.data ?? []));
  }

  // GET /account-types/institutions?accountTypeId
  getInstitutions(accountTypeId: number): Observable<InstitutionDto[]> {
    const params = new HttpParams().set('accountTypeId', accountTypeId);
    return this.http
      .get<AccountApiResponse<InstitutionDto[]>>(`${this.baseUrl}/account-types/institutions`, { params })
      .pipe(map((res) => res.data ?? []));
  }

  // GET /account-types/{userId}/counts
  getAccountTypeCounts(): Observable<AccountTypeCountDto[]> {
    return this.http
      .get<AccountApiResponse<AccountTypeCountDto[]>>(`${this.baseUrl}/account-types/${this.userId}/counts`)
      .pipe(map((res) => res.data ?? []));
  }

  // GET /accounts/{userId}/overview
  getAccountOverview(): Observable<AccountOverviewDto> {
    return this.http
      .get<AccountApiResponse<AccountOverviewDto>>(`${this.baseUrl}/accounts/${this.userId}/overview`)
      .pipe(map((res) => res.data));
  }

  // GET /accounts/{accountId}?userId
  getAccountDetail(accountId: number | string): Observable<AccountDetailDto> {
    const params = new HttpParams().set('userId', this.userId);
    return this.http
      .get<AccountApiResponse<AccountDetailDto>>(`${this.baseUrl}/accounts/${accountId}`, { params })
      .pipe(map((res) => res.data));
  }

  // GET /accounts/{accountId}/sensitive-details
  getSensitiveDetails(accountId: number | string): Observable<SensitiveDetailsDto> {
    return this.http
      .get<AccountApiResponse<SensitiveDetailsDto>>(`${this.baseUrl}/accounts/${accountId}/sensitive-details`)
      .pipe(map((res) => res.data));
  }

  // POST /accounts (typed create).
  createAccountTyped(request: CreateAccountApiRequest): Observable<CreatedAccountDto> {
    return this.http
      .post<AccountApiResponse<CreatedAccountDto>>(`${this.baseUrl}/accounts`, request)
      .pipe(map((res) => res.data));
  }

  // --- Legacy adapters mapping the live API onto the app's existing shapes ---

  // Full account collection for the list page (mapped from the overview endpoint).
  getAccounts(): Observable<Account[]> {
    return this.getAccountOverview().pipe(
      map((overview) =>
        (overview?.accounts ?? []).map((item) => ({
          id: String(item.accountId),
          accountName: item.accountName,
          accountType: item.accountTypeName,
          accountNumber: item.maskedIdentifier ?? '',
          balance: Number(item.balance) || 0,
          availableBalance: Number(item.balance) || 0,
          currency: 'INR',
          openDate: '',
          status: item.status,
        })),
      ),
    );
  }

  // Single account for the detail page (mapped from the detail endpoint).
  getAccountById(id: string): Observable<Account> {
    return this.getAccountDetail(id).pipe(map((detail) => this.mapDetailToAccount(detail)));
  }

  // Creates an account by mapping the form request to the typed backend payload.
  createAccount(payload: CreateAccountRequest): Observable<Account> {
    const code = ACCOUNT_TYPE_CODE_BY_LABEL[payload.accountType] ?? 'BANK';
    const accountTypeId = ACCOUNT_TYPE_ID_BY_CODE[code];

    return forkJoin({
      subtypes: this.getSubtypes(accountTypeId),
      institutions: code === 'CASH_WALLET' ? of([] as InstitutionDto[]) : this.getInstitutions(accountTypeId),
    }).pipe(
      map(({ subtypes, institutions }) => {
        const subtypeId =
          subtypes.find((s) => s.subtypeName === payload.accountSubType)?.account_subtype_id ??
          subtypes[0]?.account_subtype_id ??
          0;
        const institutionName = payload.bankName || payload.institutionName;
        const institutionId = institutions.find((i) => i.institutionName === institutionName)?.institution_id;
        return this.buildCreateRequest(payload, code, accountTypeId, subtypeId, institutionId);
      }),
      switchMap((request) => this.createAccountTyped(request)),
      map((created) => this.mapCreatedToAccount(created)),
    );
  }

  // Update endpoint is not yet documented; issues a REST-style PUT best-effort.
  updateAccount(account: Account): Observable<Account> {
    const params = new HttpParams().set('userId', this.userId);
    return this.http
      .put<AccountApiResponse<CreatedAccountDto>>(`${this.baseUrl}/accounts/${account.id}`, account, { params })
      .pipe(map((res) => (res.data ? this.mapCreatedToAccount(res.data) : account)));
  }

  // Delete endpoint is not yet documented; issues a REST-style DELETE best-effort.
  deleteAccount(id: string): Observable<void> {
    const params = new HttpParams().set('userId', this.userId);
    return this.http
      .delete<AccountApiResponse<unknown>>(`${this.baseUrl}/accounts/${id}`, { params })
      .pipe(map(() => undefined));
  }

  // Recent transactions for the selected account (mapped from the detail endpoint).
  getTransactionsByAccountId(accountId: string): Observable<Transaction[]> {
    return this.getAccountDetail(accountId).pipe(
      map((detail) =>
        (detail?.recentTransactions ?? []).map((tx, index) => ({
          id: `${accountId}-${index}`,
          accountId,
          date: tx.date,
          description: tx.description,
          amount: Number(tx.amount) || 0,
          currency: detail.currencyCode || 'INR',
        })),
      ),
    );
  }

  // Selectable account type names for the form dropdown.
  getAccountTypes(): Observable<string[]> {
    return this.getAccountTypeNames().pipe(map((types) => types.map((t) => t.typeName)));
  }

  // Banks are the institutions available for the Bank account type.
  getBanks(): Observable<string[]> {
    return this.getInstitutions(ACCOUNT_TYPE_ID_BY_CODE.BANK).pipe(
      map((list) => list.map((i) => i.institutionName)),
    );
  }

  // The backend operates in INR; expose it as the single currency option.
  getCurrencies(): Observable<CurrencyOption[]> {
    return of([{ code: 'INR', label: 'INR' }]);
  }

  // Sub-type names for the selected account type label.
  getAccountSubTypes(accountType: string): Observable<string[]> {
    const code = ACCOUNT_TYPE_CODE_BY_LABEL[accountType] ?? 'BANK';
    return this.getSubtypes(ACCOUNT_TYPE_ID_BY_CODE[code]).pipe(
      map((list) => list.map((s) => s.subtypeName)),
    );
  }

  // Every account sub-type across all types, flattened for the categories page.
  getAccountCategories(): Observable<AccountCategory[]> {
    return this.getAccountTypeNames().pipe(
      switchMap((types) =>
        types.length
          ? forkJoin(
              types.map((type) =>
                this.getSubtypes(type.account_type_id).pipe(
                  map((subtypes) =>
                    subtypes.map((s) => ({
                      id: String(s.account_subtype_id),
                      accountType: type.typeName,
                      name: s.subtypeName,
                    })),
                  ),
                ),
              ),
            ).pipe(map((lists) => lists.flat()))
          : of([] as AccountCategory[]),
      ),
    );
  }

  // Category creation is not exposed by the backend; kept as a passthrough.
  createAccountCategory(payload: CreateAccountCategoryRequest): Observable<AccountCategory> {
    return of({ id: '', accountType: payload.accountType, name: payload.name });
  }

  // --- Mappers ---

  private mapDetailToAccount(detail: AccountDetailDto): Account {
    const account: Account = {
      id: String(detail.accountId),
      accountName: detail.accountName,
      accountType: detail.accountTypeName,
      accountNumber: '',
      balance: Number(detail.currentBalance) || 0,
      availableBalance: Number(detail.availableBalance ?? detail.currentBalance) || 0,
      currency: detail.currencyCode || 'INR',
      openDate: '',
      status: detail.status,
      institutionName: detail.institutionName,
    };
    this.applyTypeDetails(account, detail.typeCode, detail.typeSpecificDetails);
    return account;
  }

  private mapCreatedToAccount(created: CreatedAccountDto): Account {
    const account: Account = {
      id: String(created.accountId),
      accountName: created.accountName,
      accountType: created.accountTypeName,
      accountSubType: created.accountSubtypeName,
      accountNumber: '',
      balance: Number(created.currentBalance) || 0,
      availableBalance: Number(created.availableBalance ?? created.currentBalance) || 0,
      currency: created.currencyCode || 'INR',
      openDate: '',
      status: created.status,
      institutionName: created.institutionName ?? undefined,
    };
    this.applyTypeDetails(account, created.accountTypeCode, created.details);
    return account;
  }

  // Copies type-specific fields from the backend detail union onto the flat Account shape.
  private applyTypeDetails(
    account: Account,
    code: AccountTypeCode,
    details: AccountTypeSpecificDetails,
  ): void {
    switch (code) {
      case 'BANK': {
        const d = details as BankTypeDetails;
        account.accountNumber = d.accountNumberLast4 ?? '';
        account.ifscCode = d.ifscCode;
        break;
      }
      case 'CREDIT_CARD': {
        const d = details as CreditCardTypeDetails;
        account.accountNumber = d.cardNumberLast4 ?? '';
        account.creditLimit = d.creditLimit;
        break;
      }
      case 'INVESTMENT': {
        const d = details as InvestmentTypeDetails;
        account.institutionName = d.platformName ?? account.institutionName;
        break;
      }
      case 'LOAN': {
        const d = details as LoanTypeDetails;
        account.accountNumber = d.loanAccountNumberLast4 ?? '';
        account.interestRate = d.interestRate;
        account.loanBalance = d.loanAmount;
        break;
      }
      case 'CASH_WALLET':
      default:
        break;
    }
  }

  // Assembles the typed create payload from the form request.
  private buildCreateRequest(
    payload: CreateAccountRequest,
    code: AccountTypeCode,
    accountTypeId: number,
    accountSubtypeId: number,
    institutionId: number | undefined,
  ): CreateAccountApiRequest {
    const request: CreateAccountApiRequest = {
      accountTypeId,
      accountSubtypeId,
      accountName: payload.accountName,
      openingBalance: Number(payload.balance) || 0,
      currencyCode: payload.currency || 'INR',
    };
    if (institutionId != null) {
      request.institutionId = institutionId;
    }
    switch (code) {
      case 'BANK':
        request.bankDetails = {
          accountNumber: payload.accountNumber,
          ifscCode: payload.ifscCode ?? '',
        };
        break;
      case 'CREDIT_CARD':
        request.creditCardDetails = {
          cardNumber: payload.accountNumber,
          creditLimit: Number(payload.creditLimit) || 0,
          billingCycleDay: 1,
          paymentDueDay: 1,
        };
        break;
      case 'CASH_WALLET':
        request.cashWalletDetails = {
          providerName: payload.institutionName ?? payload.bankName ?? '',
          walletIdentifier: payload.accountNumber ?? '',
        };
        break;
      case 'INVESTMENT':
        request.investmentDetails = {
          platformName: payload.institutionName ?? payload.bankName ?? '',
          investedAmount: Number(payload.balance) || 0,
        };
        break;
      case 'LOAN':
        request.loanDetails = {
          loanAccountNumber: payload.accountNumber,
          originalLoanAmount: Number(payload.loanBalance ?? payload.balance) || 0,
          interestRate: Number(payload.interestRate) || 0,
          emiAmount: 0,
          emiDueDay: 1,
        };
        break;
    }
    return request;
  }
}
