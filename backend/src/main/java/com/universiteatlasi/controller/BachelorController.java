package com.universiteatlasi.controller;

import com.universiteatlasi.model.dto.*;
import com.universiteatlasi.model.enums.ScoreType;
import com.universiteatlasi.service.BachelorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bachelor")
@RequiredArgsConstructor
public class BachelorController {

    private final BachelorService bachelorService;

    /**
     * GET /api/bachelor
     * Filtered and paginated bachelor program list.
     *
     * Query params:
     *   search, city, universityId, universityType,
     *   scoreType, teachingType, minQuota, maxQuota,
     *   minRank, maxRank, minBaseScore, maxBaseScore,
     *   year, sort, page, limit
     */
    @GetMapping
    public ResponseEntity<PagedResultDto<BachelorProgramSummaryDto>> list(
            @Valid @ModelAttribute BachelorFilterDto filter) {
        return ResponseEntity.ok(bachelorService.getPrograms(filter));
    }

    /** GET /api/bachelor/program-names - Distinct lisans program names for selector UIs. */
    @GetMapping("/program-names")
    public ResponseEntity<List<String>> programNames() {
        return ResponseEntity.ok(bachelorService.getProgramNames());
    }

    /**
     * GET /api/bachelor/{id}
     * Full details of a single program (with historical year data).
     */
    @GetMapping("/{id}")
    public ResponseEntity<BachelorProgramDetailDto> detail(@PathVariable Long id) {
        return ResponseEntity.ok(bachelorService.getProgramDetail(id));
    }

    /**
     * GET /api/bachelor/wizard
     * Matches programs based on user's rank.
     * Results are categorized as "CERTAIN / RISKY / DIFFICULT".
     *
     * Query params: scoreType (required), rank (required), year (optional)
     */
    @GetMapping("/wizard")
    public ResponseEntity<List<PreferenceMatchDto>> wizard(
            @RequestParam ScoreType scoreType,
            @RequestParam int rank,
            @RequestParam(defaultValue = "2025") int year) {
        return ResponseEntity.ok(bachelorService.wizardMatch(scoreType, rank, year));
    }

    /** Kept temporarily so older clients receive an explicit deprecation response. */
    @GetMapping("/calculate-score")
    public ResponseEntity<Map<String, String>> calculateScore() {
        return ResponseEntity.status(HttpStatus.GONE).body(Map.of(
            "message", "Doğrulanmış bir puan modeli bulunmadığı için tahmini puan hesabı kullanımdan kaldırıldı."
        ));
    }
}


