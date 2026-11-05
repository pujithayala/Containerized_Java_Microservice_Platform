package com.platform.userservice.service;

import com.platform.userservice.dto.UpdateProfileRequest;
import com.platform.userservice.dto.UserLoginRequest;
import com.platform.userservice.dto.UserRegistrationRequest;
import com.platform.userservice.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse register(UserRegistrationRequest request);

    UserResponse login(UserLoginRequest request);

    UserResponse getUser(Long id);

    UserResponse getUserByUsername(String username);

    UserResponse updateProfile(Long id, UpdateProfileRequest request);

    void deleteUser(Long id);

    List<UserResponse> getAllUsers();

    long getTotalCount();
}
