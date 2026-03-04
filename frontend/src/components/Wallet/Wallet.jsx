import React, { useState, useEffect } from "react";
import { Wallet, X, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import apiClient from "../Auth/ApiClient";

const WalletModal = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState("0.00");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
    }
  }, [isOpen]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/wallet');
      // ApiResponse wrapper: { data: { balance, transactions, ... } }
      const walletData = res.data?.data;
      if (walletData) {
        setBalance(Number(walletData.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setTransactions(walletData.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch wallet contents", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 hover:bg-zinc-900 text-zinc-400 rounded-lg"
        >
          <X className="w-5 h-5" />
        </Button>
        <CardHeader className="border-b border-zinc-800 pb-5">
          <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-zinc-400" />
            Ledger Balance
          </CardTitle>
          <CardDescription className="text-zinc-500">Current available node operational funds.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Total Assets</p>
            {loading ? (
              <div className="w-6 h-6 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mt-2"></div>
            ) : (
              <p className="text-4xl font-bold tracking-tighter text-zinc-100 font-mono">
                <span className="text-zinc-600 font-sans mr-1">$</span>
                {balance}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-1">Recent Transfers</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {transactions.length > 0 ? (
                transactions.map((tx, i) => (
                  <div key={tx.id || i} className="flex justify-between items-center text-sm p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${tx.transactionType === 'CREDIT' ? 'bg-zinc-800 text-zinc-300' : 'bg-red-950/30 text-red-500 border border-red-900/20'}`}>
                        {tx.transactionType === 'CREDIT' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-200">{tx.remarks || "Wallet Transaction"}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 font-mono mt-0.5">
                          {tx.timeStamp ? new Date(tx.timeStamp).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    <p className={`font-mono font-medium ${tx.transactionType === 'CREDIT' ? "text-zinc-300" : "text-red-400"}`}>
                      {tx.transactionType === 'CREDIT' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-500 text-sm py-4">No recent transfers detected.</p>
              )}
            </div>

            <Button className="w-full mt-6 bg-zinc-100 hover:bg-zinc-300 text-zinc-900 font-semibold" onClick={onClose}>
              Deposit Funds
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function WalletComponent() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  return (
    <>
      <Button
        variant="outline" size="icon"
        onClick={() => setShowWalletModal(true)}
        className="w-11 h-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition-colors rounded-lg"
      >
        <Wallet className="w-5 h-5" />
      </Button>
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}

export default WalletComponent;
