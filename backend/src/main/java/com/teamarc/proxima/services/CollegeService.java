package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.ApplicantDTO;
import com.teamarc.proxima.dto.CollegeDTO;
import com.teamarc.proxima.dto.EmployerDTO;
import com.teamarc.proxima.dto.StudentDTO;
import com.teamarc.proxima.entity.*;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.ApplicantRepository;
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
    private final UserService userService;
    private final StudentService studentService;
    private final ApplicantService applicantService;
    private final EmployerService employerService;

    public College createNewCollege(College college) {
        return collegeRepository.save(college);
    }

    public CollegeDTO getCollegeProfile() {
        return modelMapper.map(getCurrentCollege(), CollegeDTO.class);
    }

    public List<StudentDTO> getStudents() {
        return collegeRepository.findStudentsById(getCurrentCollege().getId())
                .stream()
                .map(student -> modelMapper.map(student, StudentDTO.class)).toList();
    }

    private College getCurrentCollege() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return collegeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "College not associated with user with id: " + user.getId()));
    }

    public StudentDTO getStudentById(Long id) {
        return modelMapper.map(collegeRepository.findStudentsById(getCurrentCollege().getId())
                .stream()
                .filter(student -> student.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id)),
                StudentDTO.class);
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

    public StudentDTO onboardNewStudent(Long userId) {
        User user = userService.getUserById(userId);
        College college = getCurrentCollege();
        Applicant applicant = applicantService.getApplicantByUserId(user);
        Student student = Student.builder()
                        .college(college)
                        .user(user)
                        .applicant(applicant)
                        .build();

        return modelMapper.map(studentService.createNewStudent(student), StudentDTO.class);
    }

    public EmployerDTO allowEmployer(Long userId) {
        User user = userService.getUserById(userId);
        College college = getCurrentCollege();
        Employer employer = employerService.getEmployerByUser(user);
        college.getAllowedEmployers().add(employer);
        return modelMapper.map(employer, EmployerDTO.class);
    }


}
