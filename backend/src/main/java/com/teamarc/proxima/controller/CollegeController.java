package com.teamarc.proxima.controller;

import com.teamarc.proxima.dto.CollegeDTO;
import com.teamarc.proxima.dto.EmployerDTO;
import com.teamarc.proxima.dto.OnBoardNewStudentDTO;
import com.teamarc.proxima.dto.StudentDTO;
import com.teamarc.proxima.repository.CollegeRepository;
import com.teamarc.proxima.services.CollegeService;
import com.teamarc.proxima.services.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RestController
@RequestMapping("/college")
public class CollegeController {

    private final CollegeRepository collegeRepository;
    private final CollegeService collegeService;
    private final StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<CollegeDTO> getCollegeProfile() {
        return ResponseEntity.ok(collegeService.getCollegeProfile());
    }

    @GetMapping("/student")
    public ResponseEntity<List<StudentDTO>> getStudents() {
        return ResponseEntity.ok(collegeService.getStudents());
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(collegeService.getStudentById(id));
    }

    @GetMapping("/student/status/{status}")
    public ResponseEntity<List<StudentDTO>> getStudentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(collegeService.getStudentsByStatus(status));
    }

    @PostMapping("onboard/student/{userId}")
    public ResponseEntity<StudentDTO> onboardNewStudent(@PathVariable Long userId) {
        return ResponseEntity.ok(collegeService.onboardNewStudent(userId));
    }

    @PostMapping("reject/student/{userId}")
    public ResponseEntity<Void> rejectOnboardNewStudent(@PathVariable Long userId) {
        return ResponseEntity.ok(collegeService.rejectOnboardNewStudent(userId));
    }

    @PostMapping("allow/employer/{userId}")
    public ResponseEntity<EmployerDTO> allowEmployer(@PathVariable Long userId) {
        return ResponseEntity.ok(collegeService.allowEmployer(userId));
    }
}