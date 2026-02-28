package com.teamarc.proxima.services;

import com.teamarc.proxima.entity.WalletTransaction;
import com.teamarc.proxima.repository.WalletTransactionsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class WalletTransactionService {

    private final WalletTransactionsRepository walletTransactionsRepository;

    public void createNewWalletTransaction(WalletTransaction walletTransaction) {
        walletTransactionsRepository.save(walletTransaction);
    }

    public Optional<WalletTransaction> findByTransactionId(String transactionId) {
        return walletTransactionsRepository.findByTransactionId(transactionId);
    }
}
