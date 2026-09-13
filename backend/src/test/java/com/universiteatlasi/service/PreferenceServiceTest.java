package com.universiteatlasi.service;

import com.universiteatlasi.model.entity.PreferenceItem;
import com.universiteatlasi.model.entity.PreferenceList;
import com.universiteatlasi.model.entity.User;
import com.universiteatlasi.repository.BachelorProgramRepository;
import com.universiteatlasi.repository.PreferenceListRepository;
import com.universiteatlasi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PreferenceServiceTest {

    private UserRepository userRepository;
    private BachelorProgramRepository bachelorRepository;
    private PreferenceListRepository listRepository;
    private PreferenceService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        bachelorRepository = mock(BachelorProgramRepository.class);
        listRepository = mock(PreferenceListRepository.class);
        service = new PreferenceService(
            userRepository,
            bachelorRepository,
            listRepository
        );
    }

    @Test
    void reorderRejectsMissingItemsWithoutSaving() {
        arrangeList();

        assertThatThrownBy(() -> service.updateOrder("user-1", "list-1", List.of("item-1")))
            .isInstanceOf(IllegalArgumentException.class);

        verify(listRepository, never()).saveAndFlush(any());
    }

    @Test
    void reorderRejectsDuplicateItemsWithoutSaving() {
        arrangeList();

        assertThatThrownBy(() ->
            service.updateOrder("user-1", "list-1", List.of("item-1", "item-1"))
        ).isInstanceOf(IllegalArgumentException.class);

        verify(listRepository, never()).saveAndFlush(any());
    }

    @Test
    void reorderUpdatesEveryRank() {
        PreferenceList list = arrangeList();
        when(listRepository.saveAndFlush(list)).thenReturn(list);
        when(bachelorRepository.findAllById(any())).thenReturn(List.of());

        service.updateOrder("user-1", "list-1", List.of("item-2", "item-1"));

        assertThat(list.getPreferences())
            .extracting(PreferenceItem::getRank)
            .containsExactly(2, 1);
    }

    @Test
    void inactiveUserCannotReadPreferenceLists() {
        User user = User.builder().id("user-1").active(false).build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.getLists("user-1"))
            .isInstanceOf(IllegalArgumentException.class);

        verify(listRepository, never()).findByUser_IdOrderByCreatedAtDesc(any());
    }

    private PreferenceList arrangeList() {
        User user = User.builder().id("user-1").active(true).build();
        PreferenceList list = PreferenceList.builder()
            .id("list-1")
            .user(user)
            .preferences(new ArrayList<>(List.of(
                PreferenceItem.builder().id("item-1").rank(1).build(),
                PreferenceItem.builder().id("item-2").rank(2).build()
            )))
            .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(listRepository.findByIdAndUser_Id("list-1", "user-1")).thenReturn(Optional.of(list));
        return list;
    }
}
