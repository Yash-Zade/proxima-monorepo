package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.*;
import com.teamarc.proxima.entity.*;
import com.teamarc.proxima.entity.enums.Role;
import com.teamarc.proxima.exceptions.RuntimeConflictException;
import com.teamarc.proxima.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final EmployerService employerService;
    private final MentorService mentorService;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final UserService userService;
    private final OnboardNewEmployerRepository onboardNewEmployerRepository;
    private final OnboardNewMentorRepository onboardNewMentorRepository;
    private final OnBoardNewCollegeRepository onBoardNewCollegeRepository;
    private final CollegeService collegeService;

    @Transactional
    public EmployerDTO onboardNewEmployer(Long userId, OnBoardNewEmployerDTO onBoardNewEmployerDTO) {
        User user = userService.getUserById(userId);
        if (user.getRoles().contains(Role.EMPLOYER)) {
            throw new RuntimeConflictException("user with id: " + userId + " is already a employer");
        }
        Employer createEmployer = Employer.builder()
                .companyName(onBoardNewEmployerDTO.getCompanyName())
                .companyWebsite(onBoardNewEmployerDTO.getCompanyWebsite())
                .user(user)
                .build();
        user.getRoles().add(Role.EMPLOYER);
        userRepository.save(user);
        Employer savedEmployer = employerService.createNewEmployer(createEmployer);
        onboardNewEmployerRepository.delete(modelMapper.map(onBoardNewEmployerDTO, OnboardNewEmployer.class));
        return modelMapper.map(savedEmployer, EmployerDTO.class);
    }


    @Transactional
    public MentorProfileDTO onboardNewMentor(Long userId, OnboardNewMentorDTO onboardNewMentorDTO) {
        User user = userService.getUserById(userId);
        if (user.getRoles().contains(Role.MENTOR)) {
            throw new RuntimeConflictException("User with id: " + userId + " is already a mentor");
        }
        Mentor createMentor = Mentor.builder()
                .expertise(onboardNewMentorDTO.getExpertise())
                .user(user)
                .experience(onboardNewMentorDTO.getExperience())
                .build();
        user.getRoles().add(Role.MENTOR);
        userRepository.save(user);
        Mentor savedMentor = mentorService.createNewMentor(createMentor);

        onboardNewMentorRepository.delete(modelMapper.map(onboardNewMentorDTO, OnboardNewMentor.class));

        return modelMapper.map(savedMentor, MentorProfileDTO.class);
    }

    @Transactional
    public CollegeDTO onboardNewCollege(Long userId, OnBoardNewCollegeDTO onBoardNewCollegeDTO) {
        User user = userService.getUserById(userId);
        if (user.getRoles().contains(Role.COLLEGE)) {
            throw new RuntimeConflictException("User with id: " + userId + " is already a college");
        }
        College createCollege = College.builder()
                .name(onBoardNewCollegeDTO.getName())
                .website(onBoardNewCollegeDTO.getWebsite())
                .address(onBoardNewCollegeDTO.getAddress())
                .email(onBoardNewCollegeDTO.getEmail())
                .build();
        user.getRoles().add(Role.COLLEGE);
        userRepository.save(user);
        College savedCollege = collegeService.createNewCollege(createCollege);

        onBoardNewCollegeRepository.delete(modelMapper.map(onBoardNewCollegeDTO, OnBoardNewCollege.class));
        return modelMapper.map(savedCollege, CollegeDTO.class);
    }

    public Long getTotalUsers() {
        return userRepository.count();
    }

    public Long getTotalEmployers() {
        return userRepository.countByRoles(Role.EMPLOYER);
    }

    public Long getTotalMentors() {
        return userRepository.countByRoles(Role.MENTOR);
    }

    public Page<OnBoardNewEmployerDTO> getEmployerRequests(PageRequest pageRequest ) {
        return onboardNewEmployerRepository.findAll(pageRequest)
                .map(onboardNewEmployer -> modelMapper.map(onboardNewEmployer, OnBoardNewEmployerDTO.class));
    }

    public Page<OnboardNewMentorDTO> getMentorRequests(PageRequest pageRequest) {
        return onboardNewMentorRepository.findAll(pageRequest).map((element) -> modelMapper.map(element, OnboardNewMentorDTO.class));
    }

    public Page<OnBoardNewCollegeDTO> getCollegeRequests(PageRequest pageRequest) {
        return onBoardNewCollegeRepository.findAll(pageRequest).map((element) -> modelMapper.map(element, OnBoardNewCollegeDTO.class));
    }

    public void rejectEmployer(Long userId, OnBoardNewEmployerDTO onBoardNewEmployerDTO) {

        OnboardNewEmployer onBoardNewEmployer = modelMapper.map(onBoardNewEmployerDTO, OnboardNewEmployer.class);
        onboardNewEmployerRepository.deleteById(onBoardNewEmployer.getId());
    }

    public void rejectMentor(Long userId, OnboardNewMentorDTO onboardNewMentorDTO) {
        OnboardNewMentor onboardNewMentor = modelMapper.map(onboardNewMentorDTO, OnboardNewMentor.class);
        onboardNewMentorRepository.deleteById(onboardNewMentor.getId());
    }

    public void rejectCollege(Long collegeId, OnBoardNewCollegeDTO onboardNewCollegeDTO) {
        OnBoardNewCollege onboardNewCollege = modelMapper.map(onboardNewCollegeDTO, OnBoardNewCollege.class);
        onBoardNewCollegeRepository.deleteById(onboardNewCollege.getId());
    }

    public Long getTotalRequests() {
        return onboardNewEmployerRepository.count() + onboardNewMentorRepository.count() + onboardNewMentorRepository.count();
    }
}
