package com.teamarc.proxima.controller;

import com.teamarc.proxima.dto.StudentDTO;
import com.teamarc.proxima.repository.CollegeRepository;
import com.teamarc.proxima.services.CollegeService;
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

    @GetMapping("/student")
    public ResponseEntity<List<StudentDTO>> getStudents() {
        return ResponseEntity.ok(collegeService.getStudents());
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(collegeService.getStudentById(id));
    }

    @GetMapping("/student/sttus/{status}")
    public ResponseEntity<List<StudentDTO>> getStudentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(collegeService.getStudentsByStatus(status));
    }
}
