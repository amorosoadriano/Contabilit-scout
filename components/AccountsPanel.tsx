import React, { useMemo } from 'react';
import { Transaction, Group, TransactionType, PaymentMethod, Member, MemberInstallments } from '../types';

interface AccountsPanelProps {
  transactions: Transaction[];
  groups: Group[];
  members: Member[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

const AccountsPanel: React.FC<AccountsPanelProps> = ({ transactions, groups, members }) => {

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
                    cashBalance += installment.amount; // The overall physical balance increases by the full amount
                } else { // TRANSFER or CARD
                    bankIncome += installment.amount;
                    bankBalance += installment.amount; // The overall physical balance increases by the full amount
                }
            }
        });
    });

    return { 
        totalIncome, totalExpenses, balance: cashBalance + bankBalance,
        cashBalance, bankBalance, cashIncome, bankIncome, cashExpenses, bankExpenses
    };
  }, [transactions, members]);

  const groupSummaries = useMemo(() => {
    const summaries = new Map<string, { 
        balance: number, cashBalance: number, bankBalance: number,
        cashIncome: number, bankIncome: number, cashExpenses: number, bankExpenses: number,
        preCampCash: number, preCampBank: number 
    }>();
    groups.forEach(group => {
      const groupTransactions = transactions.filter(t => t.groupId === group.id);
      const groupMembers = members.filter(m => m.groupId === group.id);
      let cashBalance = 0, bankBalance = 0;
      let cashIncome = 0, bankIncome = 0, cashExpenses = 0, bankExpenses = 0;
      let preCampCash = 0, preCampBank = 0;

      // Process generic transactions for the group
      groupTransactions.forEach(t => {
        if (t.type === TransactionType.INCOME) {
            if (t.paymentMethod === PaymentMethod.CASH) {
                cashIncome += t.amount;
                cashBalance += t.amount;
            } else {
                bankIncome += t.amount;
                bankBalance += t.amount;
            }
        } else { // EXPENSE
            if (t.paymentMethod === PaymentMethod.CASH) {
                cashExpenses += t.amount;
                cashBalance -= t.amount;
            } else {
                bankExpenses += t.amount;
                bankBalance -= t.amount;
            }
        }
      });

      // Process member installment payments for the group
      const groupSettings = group.quoteSettings;
      groupMembers.forEach(member => {
        Object.entries(member.installments).forEach(([key, installment]) => {
            const installmentKey = key as keyof MemberInstallments;
            if (installment.amount > 0 && installment.paymentMethod) {

                let amountForGroup = installment.amount;

                if (installmentKey === 'first' || installmentKey === 'second' || installmentKey === 'third') {
                    amountForGroup -= (groupSettings.groupFee || 0);
                    amountForGroup -= (groupSettings.preCamp || 0);
                    
                    if (installmentKey === 'first') {
                        amountForGroup -= (groupSettings.censimento || 0);
                        amountForGroup -= (groupSettings.bpParkFee || 0);
                    }
                    
                    // Add the collected pre-camp fee to the dedicated fund
                    if (groupSettings.preCamp > 0) {
                        if (installment.paymentMethod === PaymentMethod.CASH) {
                            preCampCash += groupSettings.preCamp;
                        } else {
                            preCampBank += groupSettings.preCamp;
                        }
                    }
                }
                
                amountForGroup = Math.max(0, amountForGroup);

                if (installment.paymentMethod === PaymentMethod.CASH) {
                    cashIncome += amountForGroup; // Group income is the net amount
                    cashBalance += amountForGroup;
                } else {
                    bankIncome += amountForGroup; // Group income is the net amount
                    bankBalance += amountForGroup;
                }
            }
        });
      });

      summaries.set(group.id, { 
          balance: cashBalance + bankBalance, cashBalance, bankBalance,
          cashIncome, bankIncome, cashExpenses, bankExpenses,
          preCampCash, preCampBank
      });
    });
    return summaries;
  }, [transactions, groups, members]);

  const quoteSummary = useMemo(() => {
    let actualCensimentoCollected = 0;
    let actualBpParkFeeCollected = 0;
    let actualGroupFeeCollected = 0;
    let actualPreCampCollected = 0;
    let firstInstallmentCount = 0;

    const groupMap = new Map(groups.map(g => [g.id, g]));

    members.forEach(member => {
      const group = groupMap.get(member.groupId);
      if (!group) return;

      const firstInstallmentPaid = member.installments.first.amount > 0;
      const secondInstallmentPaid = member.installments.second.amount > 0;
      const thirdInstallmentPaid = member.installments.third.amount > 0;

      if (firstInstallmentPaid) {
        firstInstallmentCount++;
        actualCensimentoCollected += group.quoteSettings.censimento || 0;
        actualBpParkFeeCollected += group.quoteSettings.bpParkFee || 0;
      }

      if (firstInstallmentPaid) {
        actualGroupFeeCollected += group.quoteSettings.groupFee || 0;
      }
      if (secondInstallmentPaid) {
        actualGroupFeeCollected += group.quoteSettings.groupFee || 0;
      }
      if (thirdInstallmentPaid) {
        actualGroupFeeCollected += group.quoteSettings.groupFee || 0;
      }

      if (group.quoteSettings.preCamp > 0) {
        if (firstInstallmentPaid) {
            actualPreCampCollected += group.quoteSettings.preCamp;
        }
        if (secondInstallmentPaid) {
            actualPreCampCollected += group.quoteSettings.preCamp;
        }
        if (thirdInstallmentPaid) {
            actualPreCampCollected += group.quoteSettings.preCamp;
        }
      }
    });

    return { 
      totalCensimento: actualCensimentoCollected, 
      totalBpParkFee: actualBpParkFeeCollected, 
      totalInstallments: actualGroupFeeCollected,
      totalPreCamp: actualPreCampCollected,
      firstInstallmentCount,
    };
  }, [groups, members]);


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
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Saldo Contanti</h3>
                    <p className={`text-2xl font-bold ${overallSummary.cashBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(overallSummary.cashBalance)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Saldo Banca</h3>
                    <p className={`text-2xl font-bold ${overallSummary.bankBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(overallSummary.bankBalance)}</p>
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
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(quoteSummary.totalInstallments)}</p>
            </div>
        </div>
      </div>

      {/* Group Summaries Grid */}
      <div>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Riepilogo per Gruppo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => {
            const summary = groupSummaries.get(group.id) || { balance: 0, cashBalance: 0, bankBalance: 0, cashIncome: 0, bankIncome: 0, cashExpenses: 0, bankExpenses: 0, preCampCash: 0, preCampBank: 0 };
            const borderColorClass = group.color.replace('bg-', 'border-');
            return (
              <div key={group.id} className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${borderColorClass}`}>
                <div className="p-5">
                    <div className="flex justify-between items-baseline">
                        <h4 className="text-lg font-bold text-slate-800">{group.name}</h4>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">Saldo Totale</p>
                            <p className={`font-bold text-xl ${summary.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                                {formatCurrency(summary.balance)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 px-5 py-4 space-y-3 text-sm">
                    <div className="p-2 rounded-md bg-white/50 border border-slate-200/80">
                        <div className="flex justify-between items-center font-semibold mb-1">
                            <p className="text-slate-700">Contanti</p>
                            <p className={`${summary.cashBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(summary.cashBalance)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <p>Entrate:</p>
                            <p className="text-green-600 font-medium">+{formatCurrency(summary.cashIncome)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <p>Uscite:</p>
                            <p className="text-red-600 font-medium">-{formatCurrency(summary.cashExpenses)}</p>
                        </div>
                    </div>
                    
                    <div className="p-2 rounded-md bg-white/50 border border-slate-200/80">
                        <div className="flex justify-between items-center font-semibold mb-1">
                            <p className="text-slate-700">Banca</p>
                            <p className={`${summary.bankBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(summary.bankBalance)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <p>Entrate:</p>
                            <p className="text-green-600 font-medium">+{formatCurrency(summary.bankIncome)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <p>Uscite:</p>
                            <p className="text-red-600 font-medium">-{formatCurrency(summary.bankExpenses)}</p>
                        </div>
                    </div>

                    <div className="p-2 rounded-md bg-white/50 border border-slate-200/80">
                        <div className="flex justify-between items-center font-semibold mb-1">
                            <p className="text-slate-700">Cassa Pre-Campo</p>
                            <p className="text-slate-800 font-semibold">{formatCurrency(summary.preCampCash + summary.preCampBank)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <p>Contanti:</p>
                            <p className="font-medium text-slate-600">{formatCurrency(summary.preCampCash)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <p>Banca:</p>
                            <p className="font-medium text-slate-600">{formatCurrency(summary.preCampBank)}</p>
                        </div>
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