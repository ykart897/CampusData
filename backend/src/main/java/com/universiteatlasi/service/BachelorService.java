package com.universiteatlasi.service;

import com.universiteatlasi.exception.ResourceNotFoundException;
import com.universiteatlasi.model.dto.*;
import com.universiteatlasi.model.entity.BachelorProgram;
import com.universiteatlasi.model.entity.BachelorYearData;
import com.universiteatlasi.model.enums.TeachingType;
import com.universiteatlasi.model.enums.ScoreType;
import com.universiteatlasi.model.enums.UniversityType;
import com.universiteatlasi.repository.BachelorProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BachelorService {

    private final BachelorProgramRepository repo;
    // Program list
    @Cacheable("bachelorPrograms")
    public PagedResultDto<BachelorProgramSummaryDto> getPrograms(BachelorFilterDto filter) {

        UniversityType uniType   = parseEnum(UniversityType.class, filter.universityType());
        ScoreType      scoreType = filter.scoreType();
        TeachingType   teachingType = filter.teachingType();

        Specification<BachelorProgram> spec = BachelorProgramRepository.buildSpecification(
            filter.search(), filter.city(), filter.universityId(),
            uniType, scoreType, teachingType,
            filter.minQuota(), filter.maxQuota(),
            filter.minRank(), filter.maxRank(),
            filter.minBaseScore(), filter.maxBaseScore(),
            2025,
            filter.sort()
        );

        // Rank bazlı sıralama Specification içinde yapılıyor; diğerleri Sort ile
        Sort sort = buildSort(filter.sort());
        Pageable pageable = PageRequest.of(filter.page() - 1, filter.limit(), sort);

        Page<BachelorProgram> page = repo.findAll(spec, pageable);

        List<BachelorProgramSummaryDto> data = page.getContent().stream()
            .map(p -> toSummaryDto(p, 2025))
            .toList();

        return new PagedResultDto<>(data, new MetaDto(
            page.getTotalElements(),
            filter.page(),
            filter.limit(),
            page.getTotalPages()
        ));
    }
    // Program detail
    @Cacheable(value = "bachelorProgramDetail", key = "#id")
    public BachelorProgramDetailDto getProgramDetail(Long id) {
        BachelorProgram program = repo.findByIdWithDetails(id)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found: " + id));
        return toDetailDto(program);
    }

    @Cacheable("bachelorProgramNames")
    public List<String> getProgramNames() {
        return repo.findDistinctProgramNames();
    }
    // Preference wizard matching
    public List<PreferenceMatchDto> wizardMatch(ScoreType scoreType, int rank, int year) {
        if (rank < 1) {
            throw new IllegalArgumentException("Başarı sırası pozitif olmalıdır.");
        }
        List<BachelorProgram> programs = repo.findWizardMatches(scoreType, year);

        List<PreferenceMatchDto> matches = programs.stream()
            .map(p -> {
                Integer baseRank = p.getYearlyData().stream()
                    .filter(yd -> yd.getYear() == year)
                    .findFirst()
                    .map(BachelorYearData::getBaseRank)
                    .orElse(null);

                String status = determineStatus(rank, baseRank);
                return new PreferenceMatchDto(toSummaryDto(p, year), status);
            })
            .toList();

        Comparator<PreferenceMatchDto> proximity = Comparator.comparingLong(match ->
            Math.abs((long) match.program().latestYearData().baseRank() - rank));

        return Stream.of("CERTAIN", "RISKY", "DIFFICULT")
            .flatMap(status -> matches.stream()
                .filter(match -> status.equals(match.status()))
                .sorted(proximity)
                .limit(60))
            .toList();
    }
    // Helper methods

    private String determineStatus(int userRank, Integer baseRank) {
        if (baseRank == null) return "UNKNOWN";
        double ratio = (double) userRank / baseRank;
        if (ratio <= 0.8)  return "CERTAIN";
        if (ratio <= 1.2)  return "RISKY";
        return "DIFFICULT";
    }

    private Sort buildSort(String sort) {
        if (sort == null) return Sort.by("programName").ascending();
        return switch (sort) {
            case "baseRank_asc", "baseRank_desc" -> Sort.unsorted();
            case "quota_asc" -> Sort.by("quota").ascending();
            case "quota_desc" -> Sort.by("quota").descending();
            case "programName_desc" -> Sort.by("programName").descending();
            default -> Sort.by("programName").ascending();
        };
    }

    private BachelorProgramSummaryDto toSummaryDto(BachelorProgram p, int year) {
        BachelorYearData yd = p.getYearlyData().stream()
            .filter(v -> v.getYear() == year)
            .findFirst().orElse(null);

        return new BachelorProgramSummaryDto(
            p.getId(), p.getProgramName(), p.getFaculty(),
            p.getScoreType(), p.getTeachingType(), p.getQuota(), p.getScholarshipRate(),
            p.getProgramCode(), p.getLanguage(), p.getEducationDurationYears(), p.getDetailUrl(),
            p.getProgramGroupName(), p.getUnitTypeName(), p.getEducationTypeName(), p.getScholarshipRateName(),
            new UniversitySummaryDto(
                p.getUniversity().getId(), p.getUniversity().getName(),
                p.getUniversity().getCity(), p.getUniversity().getType().name()
            ),
            yd == null ? null : new YearDataDto(
                yd.getYear(), yd.getBaseScore(), yd.getBaseRank(),
                yd.getCeilingScore(), yd.getCeilingRank(), yd.getPlaced(), yd.getRemaining(),
                yd.getYearQuota(), yd.getRegistered(), yd.getAdditionalPlaced(), yd.getAdditionalRegistered()
            )
        );
    }

    private BachelorProgramDetailDto toDetailDto(BachelorProgram p) {
        List<YearDataDto> yearlyData = p.getYearlyData().stream()
            .sorted(Comparator.comparingInt(BachelorYearData::getYear).reversed())
            .map(yd -> new YearDataDto(
                yd.getYear(), yd.getBaseScore(), yd.getBaseRank(),
                yd.getCeilingScore(), yd.getCeilingRank(), yd.getPlaced(), yd.getRemaining(),
                yd.getYearQuota(), yd.getRegistered(), yd.getAdditionalPlaced(), yd.getAdditionalRegistered()
            ))
            .toList();

        return new BachelorProgramDetailDto(
            p.getId(), p.getProgramName(), p.getFaculty(),
            p.getScoreType(), p.getTeachingType(), p.getQuota(), p.getScholarshipRate(),
            p.getTuitionFee(),
            p.getProgramCode(), p.getLanguage(), p.getEducationDurationYears(), p.getDetailUrl(),
            p.getYokatlasUniversityId(), p.getYokatlasCityCode(), p.getYokatlasProgramGroupId(),
            p.getProgramGroupName(), p.getUnitTypeId(), p.getUnitTypeName(),
            p.getEducationTypeId(), p.getEducationTypeName(),
            p.getScholarshipRateId(), p.getScholarshipRateName(),
            p.getOsymGuideId(), p.getPreviousGuideCode(), p.getPreviousUnitId(),
            p.getFymkId(), p.getFymkCityName(), p.getFymkDistrictName(), p.getDistrictName(),
            p.getAccreditation(), p.getAccreditationDescription(), p.getUniversityAccreditation(),
            p.getConditions(), p.getMinimumSuccessRank(), p.getMinimumSuccessRankCondition(),
            p.getQuotaY34(), p.getQuotaDep(), p.getQuotaMeb(), p.getQuotaObs(), p.getQuotaSgy(),
            rawInt(p, "y34Y", "y34"), rawInt(p, "dprmY"), rawInt(p, "obkY"), rawInt(p, "sgyY"),
            rawString(p, "tyc"), rawString(p, "uygulamaliEgitimModeli"),
            rawInt(p, "female_count"), rawInt(p, "male_count"),
            rawInt(p, "new_grad_count"), rawInt(p, "old_grad_count"),
            rawListOfMaps(p, "net_ortalamalari"),
            p.getProfessorCount(), p.getAssociateProfessorCount(), p.getDoctorFacultyMemberCount(),
            p.getLecturerCount(), p.getResearchAssistantCount(),
            new UniversitySummaryDto(
                p.getUniversity().getId(), p.getUniversity().getName(),
                p.getUniversity().getCity(), p.getUniversity().getType().name()
            ),
            yearlyData
        );
    }

    private Integer rawInt(BachelorProgram program, String... keys) {
        Object value = rawValue(program, keys);
        if (value == null) return null;
        if (value instanceof Number number) return number.intValue();
        String text = String.valueOf(value).trim();
        if (text.isBlank() || "-".equals(text)) return null;
        try {
            return Integer.valueOf(text.replaceAll("\\D", ""));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String rawString(BachelorProgram program, String... keys) {
        Object value = rawValue(program, keys);
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        return text.isBlank() || "*".equals(text) ? null : text;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> rawListOfMaps(BachelorProgram program, String key) {
        Object value = rawValue(program, key);
        if (!(value instanceof List<?> list)) return List.of();
        return list.stream()
            .filter(Map.class::isInstance)
            .map(item -> (Map<String, Object>) item)
            .toList();
    }

    private Object rawValue(BachelorProgram program, String... keys) {
        Map<String, Object> raw = program.getYokatlasRaw();
        if (raw == null) return null;
        for (String key : keys) {
            Object value = raw.get(key);
            if (value != null) return value;
        }
        return null;
    }

    private <E extends Enum<E>> E parseEnum(Class<E> clazz, String value) {
        if (value == null || value.isBlank()) return null;
        try { return Enum.valueOf(clazz, value.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }
}





