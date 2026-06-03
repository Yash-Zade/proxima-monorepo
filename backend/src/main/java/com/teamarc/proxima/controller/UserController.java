package com.teamarc.proxima.controller;

import com.teamarc.proxima.dto.*;
import com.teamarc.proxima.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "https://proxima-main.vercel.app")
@RestController
@RequestMapping(path = "/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping(path = "/all")
    public ResponseEntity<java.util.List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping(path = "/me")
    public ResponseEntity<UserDTO> getMyProfile() {
        com.teamarc.proxima.entity.User user = (com.teamarc.proxima.entity.User) org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(userService.getMyProfile(user.getId()));
    }

    // @PostMapping(path = "/request/mentor")
    // public ResponseEntity<MentorProfileDTO> requestToBeAMentor(@RequestBody OnboardNewMentorDTO mentorRequestDTO) {
    //     userService.requestMentorOnboard(mentorRequestDTO);
    //     return ResponseEntity.ok().build();
    // }

    @PostMapping(path = "/request/employer")
    public ResponseEntity<EmployerDTO> requestToBeAEmployer(@RequestBody OnBoardNewEmployerDTO employerRequestDTO) {
        userService.requestEmployerOnboard(employerRequestDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping(path = "/request/college")
    public ResponseEntity<CollegeDTO> requestToBeACollege(@RequestBody OnBoardNewCollegeDTO collegeRequestDTO) {
        userService.requestCollegeOnboard(collegeRequestDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping(path = "/request/applicant/{userId}")
    public ResponseEntity<ApplicantDTO> requestToBeAApplicant(@PathVariable Long userId) {
        userService.requestApplicantOnboard(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(path = "/request/student")
    public ResponseEntity<StudentDTO> requestToBeAStudent(@RequestBody OnBoardNewStudentDTO onBoardNewStudentDTO) {
        userService.requestStudentOnboard(onBoardNewStudentDTO);
        return ResponseEntity.ok().build();
    }

    // @GetMapping(path = "/wallet")
    // public ResponseEntity<WalletDTO> getUserWallet() {
    //     return ResponseEntity.ok(userService.getUserWallet());
    // }

    @GetMapping(path = "/active-chats/{userId}")
    public ResponseEntity<java.util.List<UserDTO>> getActiveChats(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getActiveChatUsers(userId));
    }

    @GetMapping(path = "/search")
    public ResponseEntity<java.util.List<UserDTO>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}

