package com.universiteatlasi.service;

import com.universiteatlasi.exception.ResourceNotFoundException;
import com.universiteatlasi.model.dto.PreferenceDto.*;
import com.universiteatlasi.model.entity.*;
import com.universiteatlasi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional
public class PreferenceService {

    private final UserRepository            userRepo;
    private final BachelorProgramRepository bachelorRepo;
    private final PreferenceListRepository  preferenceListRepo;
    // Get lists
    @Transactional(readOnly = true)
    public List<PreferenceListDto> getLists(String userId) {
        ensureUserExists(userId);
        return preferenceListRepo.findByUser_IdOrderByCreatedAtDesc(userId).stream()
            .map(this::toListDto)
            .toList();
    }
    // Create new list
    public PreferenceListDto createList(String userId, CreateListRequestDto request) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        PreferenceList list = PreferenceList.builder()
            .user(user)
            .name(normalizeListName(request.name()))
            .educationLevel("LISANS")
            .enteredScore(request.enteredScore())
            .enteredRank(request.enteredRank())
            .build();

        return toListDto(preferenceListRepo.saveAndFlush(list));
    }
    // Add item to list
    public PreferenceListDto addItem(String userId, String listId, AddItemRequestDto request) {
        PreferenceList list = getList(userId, listId);

        if (list.getPreferences().size() >= 24) {
            throw new IllegalArgumentException("Maximum 24 preferences allowed.");
        }
        if (list.getPreferences().stream().anyMatch(item -> Objects.equals(item.getBachelorProgramId(), request.programId()))) {
            throw new IllegalArgumentException("Bu program listede zaten var.");
        }

        int newRank = list.getPreferences().size() + 1;

        PreferenceItem item = PreferenceItem.builder()
            .list(list)
            .rank(newRank)
            .notes(request.notes())
            .build();

        if (!bachelorRepo.existsById(request.programId())) {
            throw new ResourceNotFoundException("Bachelor program not found: " + request.programId());
        }
        item.setBachelorProgramId(request.programId());

        list.getPreferences().add(item);
        return toListDto(preferenceListRepo.saveAndFlush(list));
    }
    // Remove item from list
    public void removeItem(String userId, String listId, String itemId) {
        PreferenceList list = getList(userId, listId);
        list.getPreferences().removeIf(i -> i.getId().equals(itemId));
        IntStream.range(0, list.getPreferences().size())
            .forEach(i -> list.getPreferences().get(i).setRank(i + 1));
        preferenceListRepo.save(list);
    }
    // Update order after drag-and-drop
    public PreferenceListDto updateOrder(String userId, String listId, List<String> itemIdOrder) {
        PreferenceList list = getList(userId, listId);

        Map<String, PreferenceItem> itemMap = list.getPreferences().stream()
            .collect(Collectors.toMap(PreferenceItem::getId, i -> i));

        IntStream.range(0, itemIdOrder.size()).forEach(i -> {
            PreferenceItem item = itemMap.get(itemIdOrder.get(i));
            if (item != null) item.setRank(i + 1);
        });

        return toListDto(preferenceListRepo.saveAndFlush(list));
    }
    // Helpers
    private PreferenceList getList(String userId, String listId) {
        ensureUserExists(userId);
        return preferenceListRepo.findByIdAndUser_Id(listId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Preference list not found: " + listId));
    }

    private void ensureUserExists(String userId) {
        if (!userRepo.existsById(userId)) {
            throw new ResourceNotFoundException("User not found.");
        }
    }

    private String normalizeListName(String name) {
        if (name == null || name.isBlank()) return "Tercih Listem";
        return name.trim();
    }

    private PreferenceListDto toListDto(PreferenceList list) {
        Map<Long, BachelorProgram> programs = bachelorRepo.findAllById(
                list.getPreferences().stream()
                    .map(PreferenceItem::getBachelorProgramId)
                    .filter(Objects::nonNull)
                    .toList()
            ).stream()
            .collect(Collectors.toMap(BachelorProgram::getId, program -> program));

        List<PreferenceItemDto> items = list.getPreferences().stream()
            .sorted(Comparator.comparingInt(PreferenceItem::getRank))
            .map(i -> {
                BachelorProgram program = programs.get(i.getBachelorProgramId());
                return new PreferenceItemDto(
                    i.getId(), i.getRank(), i.getBachelorProgramId(),
                    program == null ? null : program.getProgramName(),
                    program == null ? null : program.getUniversity().getName(),
                    program == null ? null : program.getUniversity().getCity(),
                    program == null ? null : program.getScoreType().name(),
                    "LISANS", i.getNotes()
                );
            })
            .toList();

        return new PreferenceListDto(
            list.getId(), list.getName(), list.getEducationLevel(),
            list.getEnteredScore(), list.getEnteredRank(), items
        );
    }
}


