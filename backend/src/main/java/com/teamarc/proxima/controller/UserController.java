package com.teamarc.proxima.controller;


import com.teamarc.proxima.dto.*;
import com.teamarc.proxima.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping(path = "/request/mentor")
    public ResponseEntity<MentorProfileDTO> requestToBeAMentor(@RequestBody OnboardNewMentorDTO mentorRequestDTO) {
        userService.requestMentorOnboard(mentorRequestDTO);
        return ResponseEntity.ok().build();
    }

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

    @PostMapping(path = "/request/student/{userId}")
    public ResponseEntity<StudentDTO> requestToBeAStudent(@PathVariable Long userId,@RequestBody String collegeName) {
        return ResponseEntity.ok(userService.requestStudentOnboard(userId,collegeName));
    }

}
