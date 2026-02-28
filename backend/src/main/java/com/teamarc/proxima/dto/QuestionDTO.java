package com.teamarc.proxima.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuestionDTO {
    private String difficulty;
    private String story;
    private String question;
    private List<OptionDTO> options;
}
