import React, { useMemo } from 'react';
import { Transaction, Group, TransactionType, PaymentMethod, Member, MemberInstallments, Installment, FundTransfer, FundTransferType, InternalTransfer } from '../types';

interface AccountsPanelProps {
  transactions: Transaction[];
  groups: Group[];
  members: Member[];
  fundTransfers: FundTransfer[];
  internalTransfers: InternalTransfer[];
  groupFundManagerId: string | null;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

const AccountsPanel: React.FC<AccountsPanelProps> = ({ transactions, groups, members, fundTransfers, internalTransfers, groupFundManagerId }) => {

  const overallSummary = useMemo(() => {
    let totalIncome = 0, totalExpenses = 0, cashBalance = 0, bankBalance = 0;
    let cashIncome = 0, bankIncome = 0, cashExpenses = 0, bankExpenses = 0;

    // Process generic transactions
    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        totalIncome += t.amount;
        if (t.paymentMethod === PaymentMethod.CASH) {
          cashIncome += t.amount;
          cashBalance += t.amount;
        } else {
          bankIncome += t.amount;
          bankBalance += t.amount;
        }
      } else { // EXPENSE
        totalExpenses += t.amount;
        if (t.paymentMethod === PaymentMethod.CASH) {
          cashExpenses += t.amount;
          cashBalance -= t.amount;
        } else {
          bankExpenses += t.amount;
          bankBalance -= t.amount;
        }
      }
    });

    // Process member installment payments as income
    members.forEach(member => {
        Object.values(member.installments).forEach((installment) => {
            if (installment.amount > 0 && installment.paymentMethod) {
                totalIncome += installment.amount;

                if (installment.paymentMethod === PaymentMethod.CASH) {
                    cashIncome += installment.amount;
                    cashBalance += installment.amount; 
                } else { 
                    bankIncome += installment.amount;
                    bankBalance += installment.amount;
                }
            }
        });
    });
    
    // Fund transfers and internal transfers are zero-sum for the overall balance,
    // so they don't affect totalIncome or totalExpenses.
    // They are handled within group-specific calculations.

    return { 
        totalIncome, totalExpenses, balance: cashBalance + bankBalance,
        cashBalance, bankBalance, cashIncome, bankIncome, cashExpenses, bankExpenses
    };
  }, [transactions, members]);

  const quoteSummary = useMemo(() => {
    let actualCensimentoCollected = 0;
    let actualBpParkFeeCollected = 0;
    let actualGroupFeeCollected = 0;
    let groupFeeByCash = 0;
    let groupFeeByBank = 0;
    let actualPreCampCollected = 0;
    let firstInstallmentCount = 0;

    const groupMap = new Map(groups.map(g => [g.id, g]));

    members.forEach(member => {
      const group = groupMap.get(member.groupId);
      if (!group) return;

      const firstInstallment = member.installments.first;
      if (firstInstallment.amount > 0) {
        if (firstInstallment.allocations?.censimento) {
          actualCensimentoCollected += group.quoteSettings.censimento || 0;
          firstInstallmentCount++;
        }
        if (firstInstallment.allocations?.bpParkFee) {
          actualBpParkFeeCollected += group.quoteSettings.bpParkFee || 0;
        }
        if (firstInstallment.allocations?.preCamp) {
          actualPreCampCollected += group.quoteSettings.preCamp || 0;
        }
      }
      
      const installmentsToCheck: (keyof MemberInstallments)[] = ['first', 'second', 'third'];
      installmentsToCheck.forEach(key => {
        const installment = member.installments[key];
        // Check groupFee based on its own allocation if it's the first installment, or normally for others.
        const groupFeeIsPaid = (key === 'first' && installment.allocations?.groupFee) || (key !== 'first' && installment.amount > 0);
        
        if (groupFeeIsPaid && installment.paymentMethod) {
          const groupFee = group.quoteSettings.groupFee || 0;
          if (groupFee > 0) {
            actualGroupFeeCollected += groupFee;
            if (installment.paymentMethod === PaymentMethod.CASH) {
                groupFeeByCash += groupFee;
            } else {
                groupFeeByBank += groupFee;
            }
          }
        }
      });
    });

    return { 
      totalCensimento: actualCensimentoCollected, 
      totalBpParkFee: actualBpParkFeeCollected, 
      totalGroupFee: actualGroupFeeCollected,
      groupFeeByCash,
      groupFeeByBank,
      totalPreCamp: actualPreCampCollected,
      firstInstallmentCount,
    };
  }, [groups, members]);

  const groupSummaries = useMemo(() => {
    const summaries = new Map<string, { 
        balance: number, cashBalance: number, bankBalance: number,
        cashIncome: number, bankIncome: number, cashExpenses: number, bankExpenses: number,
        preCampCash: number, preCampBank: number,
        fundTransferCash: number, fundTransferBank: number,
        internalTransferCash: number, internalTransferBank: number,
    }>();

    // Step 1: Initialize with transactions and installments
    groups.forEach(group => {
      const groupTransactions = transactions.filter(t => t.groupId === group.id);
      const groupMembers = members.filter(m => m.groupId === group.id);
      let cashBalance = 0, bankBalance = 0;
      let cashIncome = 0, bankIncome = 0, cashExpenses = 0, bankExpenses = 0;
      let preCampCash = 0, preCampBank = 0;

      groupTransactions.forEach(t => {
        const amount = t.type === TransactionType.INCOME ? t.amount : -t.amount;
        if (t.paymentMethod === PaymentMethod.CASH) cashBalance += amount;
        else bankBalance += amount;
        
        if (t.type === TransactionType.INCOME) {
          if (t.paymentMethod === PaymentMethod.CASH) cashIncome += t.amount;
          else bankIncome += t.amount;
        } else { // EXPENSE
          if (t.paymentMethod === PaymentMethod.CASH) cashExpenses += t.amount;
          else bankExpenses += t.amount;
        }
      });

      const groupSettings = group.quoteSettings;
      groupMembers.forEach(member => {
        Object.entries(member.installments).forEach(([key, installment]) => {
            const installmentKey = key as keyof MemberInstallments;
            if (installment.amount > 0 && installment.paymentMethod) {
                let amountForGroup = installment.amount;
                
                // For first, second, and third installments, subtract fees that go to the central fund
                if (installmentKey === 'first' || installmentKey === 'second' || installmentKey === 'third') {
                    const groupFeeIsPaid = (installmentKey === 'first' && installment.allocations?.groupFee) || (installmentKey !== 'first' && installment.amount > 0);
                    if(groupFeeIsPaid) {
                        amountForGroup -= (groupSettings.groupFee || 0);
                    }
                    
                    if (groupSettings.preCamp > 0) {
                        // Subtract pre-camp only if allocated in the first installment
                        if (installmentKey === 'first' && installment.allocations?.preCamp) {
                             amountForGroup -= groupSettings.preCamp;
                             if (installment.paymentMethod === PaymentMethod.CASH) preCampCash += groupSettings.preCamp;
                             else preCampBank += groupSettings.preCamp;
                        }
                    }
                }
                // For the first installment, also subtract other central fees if they were paid
                if (installmentKey === 'first') {
                    if(installment.allocations?.censimento) amountForGroup -= (groupSettings.censimento || 0);
                    if(installment.allocations?.bpParkFee) amountForGroup -= (groupSettings.bpParkFee || 0);
                }

                amountForGroup = Math.max(0, amountForGroup);
                if (installment.paymentMethod === PaymentMethod.CASH) {
                    cashIncome += amountForGroup;
                    cashBalance += amountForGroup;
                } else {
                    bankIncome += amountForGroup;
                    bankBalance += amountForGroup;
                }
            }
        });
      });

      summaries.set(group.id, { 
          balance: cashBalance + bankBalance, cashBalance, bankBalance,
          cashIncome, bankIncome, cashExpenses, bankExpenses,
          preCampCash, preCampBank,
          fundTransferCash: 0, fundTransferBank: 0,
          internalTransferCash: 0, internalTransferBank: 0,
      });
    });

    // Step 2: Process fund transfers (Giroconti)
    fundTransfers.forEach(ft => {
        const managerSummary = groupFundManagerId ? summaries.get(groupFundManagerId) : null;
        if (managerSummary) {
            const amount = ft.type === FundTransferType.WITHDRAWAL ? -ft.totalAmount : ft.totalAmount;
            managerSummary.bankBalance += amount;
            managerSummary.fundTransferBank += amount;
        }
        Object.entries(ft.distribution).forEach(([groupId, amount]) => {
            const groupSummary = summaries.get(groupId);
            if (groupSummary) {
                const cashAmount = ft.type === FundTransferType.WITHDRAWAL ? amount : -amount;
                groupSummary.cashBalance += cashAmount;
                groupSummary.fundTransferCash += cashAmount;
            }
        });
    });

    // Step 3: Process internal transfers (Loans/Repayments)
    internalTransfers.forEach(it => {
        const fromSummary = summaries.get(it.fromGroupId);
        const toSummary = summaries.get(it.toGroupId);
        if (fromSummary && toSummary) {
            if (it.paymentMethod === PaymentMethod.CASH) {
                fromSummary.cashBalance -= it.amount;
                fromSummary.internalTransferCash -= it.amount;
                toSummary.cashBalance += it.amount;
                toSummary.internalTransferCash += it.amount;
            } else { // BANK
                fromSummary.bankBalance -= it.amount;
                fromSummary.internalTransferBank -= it.amount;
                toSummary.bankBalance += it.amount;
                toSummary.internalTransferBank += it.amount;
            }
        }
    });

    // Step 4: Transfer collected group fees to the managing group
    if (groupFundManagerId) {
        const managerSummary = summaries.get(groupFundManagerId);
        const { groupFeeByCash, groupFeeByBank } = quoteSummary;
        if (managerSummary) {
            managerSummary.cashIncome += groupFeeByCash;
            managerSummary.bankIncome += groupFeeByBank;
            managerSummary.cashBalance += groupFeeByCash;
            managerSummary.bankBalance += groupFeeByBank;
        }
    }

    // Step 5: Recalculate final balances
    summaries.forEach(summary => {
        summary.balance = summary.cashBalance + summary.bankBalance;
    });

    return summaries;
  }, [transactions, groups, members, fundTransfers, internalTransfers, groupFundManagerId, quoteSummary]);

  const groupFundSummary = useMemo(() => {
    const income = quoteSummary.totalGroupFee;
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.groupId === groupFundManagerId)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  }, [transactions, quoteSummary, groupFundManagerId]);


  return (
    <div className="space-y-8">
      {/* Overall Summary Panel */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Cassa di Gruppo</h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-slate-100 p-6 rounded-lg text-center flex flex-col justify-center h-full">
                <p className="text-lg font-medium text-slate-500">Saldo Complessivo</p>
                <p className={`text-5xl font-bold ${overallSummary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(overallSummary.balance)}
                </p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-600 border-b border-green-200 pb-2 mb-2">Entrate</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Contanti:</span> <span className="font-medium">{formatCurrency(overallSummary.cashIncome)}</span></div>
                        <div className="flex justify-between"><span>Banca:</span> <span className="font-medium">{formatCurrency(overallSummary.bankIncome)}</span></div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 mt-1"><span className="font-semibold">Totale:</span> <span className="font-bold">{formatCurrency(overallSummary.totalIncome)}</span></div>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-600 border-b border-red-200 pb-2 mb-2">Uscite</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Contanti:</span> <span className="font-medium">{formatCurrency(overallSummary.cashExpenses)}</span></div>
                        <div className="flex justify-between"><span>Banca:</span> <span className="font-medium">{formatCurrency(overallSummary.bankExpenses)}</span></div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 mt-1"><span className="font-semibold">Totale:</span> <span className="font-bold">{formatCurrency(overallSummary.totalExpenses)}</span></div>
                    </div>
                </div>
                 <div className="bg-slate-50 p-4 rounded-lg col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
                     <div>
                        <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Saldo Contanti Tot.</h3>
                        <p className={`text-2xl font-bold ${overallSummary.cashBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(overallSummary.cashBalance)}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Saldo Banca Tot.</h3>
                        <p className={`text-2xl font-bold ${overallSummary.bankBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(overallSummary.bankBalance)}</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Censimenti</h3>
                <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(quoteSummary.totalCensimento)}</p>
                    <p className="text-sm font-medium text-slate-500">({quoteSummary.firstInstallmentCount} ragazzi)</p>
                </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Quote B.P. Park</h3>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(quoteSummary.totalBpParkFee)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Pre-Campo</h3>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(quoteSummary.totalPreCamp)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Cassa di Gruppo</h3>
                <p className={`text-2xl font-bold ${groupFundSummary.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(groupFundSummary.balance)}</p>
                <div className="text-xs mt-1 space-y-0.5">
                    <div className="flex justify-between text-green-600"><span>Entrate:</span> <span>+{formatCurrency(groupFundSummary.income)}</span></div>
                    <div className="flex justify-between text-red-600"><span>Uscite:</span> <span>-{formatCurrency(groupFundSummary.expenses)}</span></div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Group Summaries */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Riepilogo per Gruppo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map(group => {
            const summary = groupSummaries.get(group.id);
            if (!summary) return null;
            return (
              <div key={group.id} className="bg-white p-4 rounded-lg shadow-lg border-t-4" style={{ borderTopColor: group.color.replace('bg-', '').replace('-500', '') }}>
                <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-xl font-bold">{group.name}</h3>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Saldo Totale</p>
                        <p className={`text-2xl font-semibold ${summary.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                            {formatCurrency(summary.balance)}
                        </p>
                    </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-md">
                      <div className="flex justify-between items-baseline">
                          <h4 className="font-semibold text-slate-600 text-sm mb-1">Contanti</h4>
                          <span className={`font-bold text-lg ${summary.cashBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                            {formatCurrency(summary.cashBalance)}
                          </span>
                      </div>
                      <div className="mt-1 pt-2 border-t border-slate-200 space-y-1">
                          <div className="flex justify-between text-sm"><span className="text-slate-500">Entrate:</span> <span className="font-medium text-green-600">+{formatCurrency(summary.cashIncome)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-500">Uscite:</span> <span className="font-medium text-red-600">-{formatCurrency(summary.cashExpenses)}</span></div>
                          {summary.fundTransferCash !== 0 && (
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Giroconti:</span><span className={`font-medium ${summary.fundTransferCash > 0 ? 'text-blue-600' : 'text-orange-600'}`}>{summary.fundTransferCash > 0 ? '+' : ''}{formatCurrency(summary.fundTransferCash)}</span></div>
                          )}
                           {summary.internalTransferCash !== 0 && (
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Trasf. Interni:</span><span className={`font-medium ${summary.internalTransferCash > 0 ? 'text-blue-600' : 'text-orange-600'}`}>{summary.internalTransferCash > 0 ? '+' : ''}{formatCurrency(summary.internalTransferCash)}</span></div>
                          )}
                      </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md">
                      <div className="flex justify-between items-baseline">
                          <h4 className="font-semibold text-slate-600 text-sm mb-1">Banca</h4>
                           <span className={`font-bold text-lg ${summary.bankBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                            {formatCurrency(summary.bankBalance)}
                          </span>
                      </div>
                      <div className="mt-1 pt-2 border-t border-slate-200 space-y-1">
                          <div className="flex justify-between text-sm"><span className="text-slate-500">Entrate:</span> <span className="font-medium text-green-600">+{formatCurrency(summary.bankIncome)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-500">Uscite:</span> <span className="font-medium text-red-600">-{formatCurrency(summary.bankExpenses)}</span></div>
                           {summary.fundTransferBank !== 0 && (
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Giroconti:</span><span className={`font-medium ${summary.fundTransferBank > 0 ? 'text-blue-600' : 'text-orange-600'}`}>{summary.fundTransferBank > 0 ? '+' : ''}{formatCurrency(summary.fundTransferBank)}</span></div>
                          )}
                          {summary.internalTransferBank !== 0 && (
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Trasf. Interni:</span><span className={`font-medium ${summary.internalTransferBank > 0 ? 'text-blue-600' : 'text-orange-600'}`}>{summary.internalTransferBank > 0 ? '+' : ''}{formatCurrency(summary.internalTransferBank)}</span></div>
                          )}
                      </div>
                  </div>
                   <div className="bg-slate-50 p-3 rounded-md">
                      <h4 className="font-semibold text-slate-600 text-sm mb-1">Cassa Pre-Campo</h4>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Contanti:</span> <span className="font-medium text-slate-700">{formatCurrency(summary.preCampCash)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Banca:</span> <span className="font-medium text-slate-700">{formatCurrency(summary.preCampBank)}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AccountsPanel;