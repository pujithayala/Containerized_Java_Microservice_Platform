package com.platform.userservice;

import com.platform.userservice.dto.UpdateProfileRequest;
import com.platform.userservice.dto.UserLoginRequest;
import com.platform.userservice.dto.UserRegistrationRequest;
import com.platform.userservice.dto.UserResponse;
import com.platform.userservice.entity.User;
import com.platform.userservice.exception.UserAlreadyExistsException;
import com.platform.userservice.exception.UserNotFoundException;
import com.platform.userservice.repository.UserRepository;
import com.platform.userservice.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("$2a$10$hashedpassword")
                .firstName("Test")
                .lastName("User")
                .role("USER")
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void register_success() {
        UserRegistrationRequest request = UserRegistrationRequest.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .firstName("Test")
                .lastName("User")
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UserResponse response = userService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_duplicateUsername_throwsException() {
        UserRegistrationRequest request = UserRegistrationRequest.builder()
                .username("testuser")
                .email("other@example.com")
                .password("password123")
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("testuser");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_success() {
        UserLoginRequest request = UserLoginRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", sampleUser.getPassword())).thenReturn(true);

        UserResponse response = userService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getUsername()).isEqualTo("testuser");
    }

    @Test
    void login_wrongPassword_throwsException() {
        UserLoginRequest request = UserLoginRequest.builder()
                .username("testuser")
                .password("wrongpassword")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", sampleUser.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> userService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void getUser_notFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUser(99L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("99");
    }
}
