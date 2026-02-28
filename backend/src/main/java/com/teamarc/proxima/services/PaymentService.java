package com.teamarc.proxima.services;


import com.teamarc.proxima.entity.Payment;
import com.teamarc.proxima.entity.Session;
import com.teamarc.proxima.entity.enums.PaymentStatus;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.PaymentRepository;
import com.teamarc.proxima.strategies.WalletPaymentStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PaymentService {
    private final WalletPaymentStrategy walletPaymentStrategy;
    private final PaymentRepository paymentRepository;

    public void processPayment(Session session) {
        Payment payment = paymentRepository.findBySession(session)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for session with id: " + session.getSessionId()));
        walletPaymentStrategy.processPayment(payment);
    }


    public Payment createNewPayment(Session session) {
        Payment payment = Payment.builder()
                .session(session)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(session.getSessionFee())
                .build();
        return paymentRepository.save(payment);
    }

    public void refundPayment(Session session) {
        Payment payment = paymentRepository.findBySession(session)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for session with id: " + session.getSessionId()));
        walletPaymentStrategy.refundPayment(payment);
    }
}