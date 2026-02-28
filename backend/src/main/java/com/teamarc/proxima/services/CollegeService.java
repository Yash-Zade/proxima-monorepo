package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.StudentDTO;
import com.teamarc.proxima.entity.College;
import com.teamarc.proxima.entity.User;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.CollegeRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CollegeService {
    private final CollegeRepository collegeRepository;
    private final ModelMapper modelMapper;

    public College createNewCollege(College college) {
        return collegeRepository.save(college);
    }

    public List<StudentDTO> getStudents() {
        return collegeRepository.findStudentsById(getCurrentCollege().getId())
                .stream()
                .map(student -> modelMapper.map(student, StudentDTO.class)).toList();
    }

    private College getCurrentCollege() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return collegeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("College not associated with user with id: " + user.getId()));
    }

    public StudentDTO getStudentById(Long id) {
        return modelMapper.map(collegeRepository.findStudentsById(getCurrentCollege().getId())
                .stream()
                .filter(student -> student.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id)), StudentDTO.class);
    }

    public List<StudentDTO> getStudentsByStatus(String status) {
        return collegeRepository.findStudentsById(getCurrentCollege().getId())
                .stream()
                .filter(student -> student.getApplicant()
                        .getJobApplications()
                        .stream()
                        .anyMatch(jobApplication -> jobApplication.getApplicationStatus().name().equals(status)))
                .toList().stream().map(student -> modelMapper.map(student, StudentDTO.class)).toList();
    }
}
