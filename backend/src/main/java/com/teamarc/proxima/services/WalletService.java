package com.teamarc.proxima.services;

import com.teamarc.proxima.entity.Session;
import com.teamarc.proxima.entity.User;
import com.teamarc.proxima.entity.Wallet;
import com.teamarc.proxima.entity.WalletTransaction;
import com.teamarc.proxima.entity.enums.TransactionType;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionService walletTransactionService;


    @Transactional
    public Wallet addMoneyToWallet(User user, BigDecimal amount, String transactionId, Session session) {
        Wallet wallet = findByUser(user);
        wallet.setBalance(wallet.getBalance().add(amount));
        WalletTransaction walletTransaction = WalletTransaction.builder()
                .transactionId(transactionId)
                .session(session)
                .wallet(wallet)
                .transactionType(TransactionType.CREDIT)
                .amount(amount)
                .build();

        walletTransactionService.createNewWalletTransaction(walletTransaction);

        return walletRepository.save(wallet);
    }

    @Transactional
    public Wallet deductMoneyToWallet(User user, BigDecimal amount, String transactionId, Session session) {
        Wallet wallet = findByUser(user);
        wallet.setBalance(wallet.getBalance().subtract(amount));
        WalletTransaction walletTransaction = WalletTransaction.builder()
                .transactionId(transactionId)
                .session(session)
                .wallet(wallet)
                .transactionType(TransactionType.DEBIT)
                .amount(amount)
                .build();

        wallet.getTransactions().add(walletTransaction);

        return walletRepository.save(wallet);

    }

    public void withdrawAllMyMoneyFromWallet() {

    }

    public Wallet findWalletById(Long walletId) {
        return walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found with id: " + walletId));
    }

    public Wallet createNewWallet(User user) {
        Wallet wallet = Wallet.builder()
                .balance(BigDecimal.ZERO)
                .user(user)
                .transactions(null)
                .build();
        return walletRepository.save(wallet);
    }

    public Wallet findByUser(User user) {
        return walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found with id: " + user.getId()));
    }

    public Wallet getWalletByUserId(long id) {
        return walletRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found with id: " + id));
    }
}
