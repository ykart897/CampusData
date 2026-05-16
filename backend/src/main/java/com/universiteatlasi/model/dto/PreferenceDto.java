package com.universiteatlasi.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class PreferenceDto {

    public record PreferenceListDto(
        String id,
        String name,
        String educationLevel,
        BigDecimal enteredScore,
        Integer enteredRank,
        List<PreferenceItemDto> preferences
    ) {}

    public record PreferenceItemDto(
        String id,
        int rank,
        Long programId,
        String programName,
        String universityName,
        String city,
        String scoreType,
        String type,
        String notes
    ) {}

    public record CreateListRequestDto(
        @NotBlank String name,
        BigDecimal enteredScore,
        Integer enteredRank
    ) {}

    public record AddItemRequestDto(
        @NotNull Long programId,
        String notes
    ) {}
}
