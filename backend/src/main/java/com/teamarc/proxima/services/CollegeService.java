package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.CollegeDTO;
import com.teamarc.proxima.dto.EmployerDTO;
import com.teamarc.proxima.dto.MassHiringRequestDTO;
import com.teamarc.proxima.dto.StudentDTO;
import com.teamarc.proxima.entity.*;
import com.teamarc.proxima.entity.enums.MassHiringStatus;
import com.teamarc.proxima.entity.enums.Role;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.CollegeRepository;
import com.teamarc.proxima.repository.MassHiringRequestRepository;
import com.teamarc.proxima.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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
    private final UserRepository userRepository;
    private final MassHiringRequestRepository massHiringRequestRepository;

    @CacheEvict(value = "colleges", allEntries = true)
    public College createNewCollege(College college) {
        return collegeRepository.save(college);
    }

    public CollegeDTO getCollegeProfile() {
        return modelMapper.map(getCurrentCollege(), CollegeDTO.class);
    }

    public List<StudentDTO> getStudents() {
        return studentService.getStudentsByCollegeId(getCurrentCollege().getId())
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
        return modelMapper.map(studentService.getStudentsByCollegeId(getCurrentCollege().getId())
                .stream()
                .filter(student -> student.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id)),
                StudentDTO.class);
    }

    public List<StudentDTO> getStudentsByStatus(String status) {
        return studentService.getStudentsByCollegeId(getCurrentCollege().getId())
                .stream()
                .filter(student -> student.getApplicant()
                        .getJobApplications()
                        .stream()
                        .anyMatch(jobApplication -> jobApplication.getApplicationStatus().name().equals(status)))
                .toList().stream().map(student -> modelMapper.map(student, StudentDTO.class)).toList();
    }

    @Caching(evict = {
        @CacheEvict(value = "colleges", allEntries = true),
        @CacheEvict(value = "userProfile", key = "#userId")
    })
    public StudentDTO onboardNewStudent(Long userId) {
        User user = userService.getUserById(userId);
        College college = getCurrentCollege();
        Applicant applicant = applicantService.getApplicantByUserId(user);
        Student student = Student.builder()
                .college(college)
                .user(user)
                .applicant(applicant)
                .build();
        user.getRoles().add(Role.STUDENT);
        userRepository.save(user);
        studentService.deleteOnboardRequest(userId, college.getId());

        return modelMapper.map(studentService.createNewStudent(student), StudentDTO.class);
    }

    @CacheEvict(value = "userProfile", key = "#userId")
    public Void rejectOnboardNewStudent(Long userId) {
        User user = userService.getUserById(userId);
        College college = getCurrentCollege();
        studentService.deleteOnboardRequest(userId, college.getId());
        return null;
    }

    public EmployerDTO allowEmployer(Long userId) {
        User user = userService.getUserById(userId);
        College college = getCurrentCollege();
        Employer employer = employerService.getEmployerByUser(user);
        college.getAllowedEmployers().add(employer);
        return modelMapper.map(employer, EmployerDTO.class);
    }

    public List<CollegeDTO> getAllColleges() {
        return collegeRepository.findAll().stream()
                .map(college -> {
                    com.teamarc.proxima.dto.CollegeDTO dto = new CollegeDTO();
                    dto.setId(college.getId());
                    dto.setName(college.getName());
                    dto.setAddress(college.getAddress());
                    dto.setEmail(college.getEmail());
                    dto.setWebsite(college.getWebsite());
                    return dto;
                }).toList();
    }


    public List<MassHiringRequestDTO> getMassHiringRequests() {
        College college = getCurrentCollege();
        List<MassHiringRequest> requests = massHiringRequestRepository.findByCollegeId(college.getId());
        return requests
                .stream()
                .map(this::toMassHiringDTO)
                .toList();
    }

    public MassHiringRequestDTO approveMassHiringRequest(Long requestId) {
        College college = getCurrentCollege();
        MassHiringRequest request = massHiringRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mass hiring request not found with id: " + requestId));
        if (!request.getCollege().getId().equals(college.getId())) {
            throw new ResourceNotFoundException("Mass hiring request does not belong to this college");
        }
        request.setStatus(MassHiringStatus.APPROVED);
        return toMassHiringDTO(massHiringRequestRepository.save(request));
    }

    public MassHiringRequestDTO rejectMassHiringRequest(Long requestId) {
        College college = getCurrentCollege();
        MassHiringRequest request = massHiringRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mass hiring request not found with id: " + requestId));
        if (!request.getCollege().getId().equals(college.getId())) {
            throw new ResourceNotFoundException("Mass hiring request does not belong to this college");
        }
        request.setStatus(MassHiringStatus.REJECTED);
        return toMassHiringDTO(massHiringRequestRepository.save(request));
    }

    private MassHiringRequestDTO toMassHiringDTO(MassHiringRequest req) {
        MassHiringRequestDTO dto = new MassHiringRequestDTO();
        dto.setId(req.getId());
        dto.setDescription(req.getDescription());
        dto.setRequiredStudents(req.getRequiredStudents());
        dto.setStatus(req.getStatus() != null ? req.getStatus().name() : null);
        dto.setCollege(req.getCollege() != null ? req.getCollege().getId() : null);
        dto.setEmployer(req.getEmployer() != null ? req.getEmployer().getEmployerId() : null);
        return dto;
    }
}
