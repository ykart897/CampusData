package com.universiteatlasi.service;

import com.universiteatlasi.model.dto.BachelorFilterDto;
import com.universiteatlasi.model.entity.BachelorProgram;
import com.universiteatlasi.model.entity.BachelorYearData;
import com.universiteatlasi.model.entity.University;
import com.universiteatlasi.model.enums.ScoreType;
import com.universiteatlasi.model.enums.TeachingType;
import com.universiteatlasi.model.enums.UniversityType;
import com.universiteatlasi.repository.BachelorProgramRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BachelorServiceTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    @DisplayName("Wizard should return nearby programs from all three status groups")
    void wizardReturnsAllStatusGroups() {
        BachelorProgramRepository repository = mock(BachelorProgramRepository.class);
        when(repository.findWizardMatches(ScoreType.SAY, 2025)).thenReturn(List.of(
            program(1L, 100_000),
            program(2L, 50_000),
            program(3L, 20_000)
        ));

        BachelorService service = new BachelorService(repository);

        assertThat(service.wizardMatch(ScoreType.SAY, 50_000, 2025))
            .extracting(result -> result.status())
            .containsExactly("CERTAIN", "RISKY", "DIFFICULT");
    }

    @Test
    @DisplayName("Wizard should reject a non-positive rank")
    void wizardRejectsInvalidRank() {
        BachelorService service = new BachelorService(mock(BachelorProgramRepository.class));

        assertThatThrownBy(() -> service.wizardMatch(ScoreType.SAY, 0, 2025))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Bachelor filter should reject inverted ranges")
    void bachelorFilterRejectsInvertedRanges() {
        BachelorFilterDto filter = new BachelorFilterDto(
            null, null, null, null, null, null,
            80, 20,
            100_000, 50_000,
            null, null,
            2025, "baseRank_asc", 1, 20
        );

        assertThat(validator.validate(filter))
            .extracting(violation -> violation.getPropertyPath().toString())
            .contains("quotaRangeValid", "baseRankRangeValid");
    }

    @Test
    @DisplayName("Bachelor filter should default to 2025 base rank sorting")
    void bachelorFilterDefaults() {
        BachelorFilterDto filter = new BachelorFilterDto(
            null, null, null, null, null, null,
            null, null,
            null, null,
            null, null,
            null, null, null, null
        );

        assertThat(filter.year()).isEqualTo(2025);
        assertThat(filter.sort()).isEqualTo("baseRank_asc");
        assertThat(filter.page()).isEqualTo(1);
        assertThat(filter.limit()).isEqualTo(20);
    }

    private BachelorProgram program(long id, int baseRank) {
        University university = University.builder()
            .id(id)
            .name("Test Üniversitesi")
            .city("Ankara")
            .type(UniversityType.DEVLET)
            .build();
        BachelorProgram program = BachelorProgram.builder()
            .id(id)
            .university(university)
            .faculty("Test Fakültesi")
            .programName("Test Programı " + id)
            .scoreType(ScoreType.SAY)
            .teachingType(TeachingType.ORGUNLU)
            .quota(10)
            .scholarshipRate(0)
            .build();
        program.setYearlyData(List.of(BachelorYearData.builder()
            .program(program)
            .year(2025)
            .baseRank(baseRank)
            .build()));
        return program;
    }
}
