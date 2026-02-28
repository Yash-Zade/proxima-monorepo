package com.teamarc.proxima.dto;

import com.teamarc.proxima.entity.WalletTransaction;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class WalletDTO {
    private Long id;
    private UserDTO user;
    private BigDecimal balance;
    private List<WalletTransaction> transactions;
}
