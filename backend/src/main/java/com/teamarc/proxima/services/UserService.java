package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.*;
import com.teamarc.proxima.entity.*;
import com.teamarc.proxima.entity.enums.Role;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

        private final OnboardNewEmployerRepository onboardNewEmployerRepository;
//        private final OnboardNewMentorRepository onboardNewMentorRepository;
        private final UserRepository userRepository;
        private final ModelMapper modelMapper;
        private final OnBoardNewCollegeRepository onBoardNewCollegeRepository;
        private final ApplicantRepository applicantRepository;
        private final CollegeRepository collegeRepository;
        private final StudentRepository studentRepository;
//        private final WalletRepository walletRepository;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                return userRepository.findByEmail(username).orElse(null);
        }

        public java.util.List<UserDTO> getAllUsers() {
                return userRepository.findAll().stream()
                                .map(user -> modelMapper.map(user, UserDTO.class))
                                .collect(java.util.stream.Collectors.toList());
        }

        public User getUserById(Long userId) {
                return userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        }

        public void requestEmployerOnboard(OnBoardNewEmployerDTO onboardNewEmployerDTO) {
                User user = (User) org.springframework.security.core.context.SecurityContextHolder.getContext()
                                .getAuthentication().getPrincipal();
                onboardNewEmployerDTO.setUserId(user.getId());
                onboardNewEmployerRepository.save(modelMapper.map(onboardNewEmployerDTO, OnboardNewEmployer.class));
        }

//        public void requestMentorOnboard(OnboardNewMentorDTO onboardNewMentorDTO) {
//                User user = (User) org.springframework.security.core.context.SecurityContextHolder.getContext()
//                                .getAuthentication().getPrincipal();
//                onboardNewMentorDTO.setUserId(user.getId());
//                onboardNewMentorRepository.save(modelMapper.map(onboardNewMentorDTO, OnboardNewMentor.class));
//        }

        public User loadUserByRole(Role role) {
                return userRepository.findByRoles(role);
        }

        public Applicant requestApplicantOnboard(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

                Applicant applicant = applicantRepository.findByUser(user).orElse(null);
                if (applicant == null) {
                        applicant = Applicant.builder()
                                        .user(user)
                                        .build();
                        applicant = applicantRepository.save(applicant);
                }

                user.getRoles().add(Role.APPLICANT);
                userRepository.save(user);
                return applicant;
        }

        public void requestCollegeOnboard(OnBoardNewCollegeDTO collegeRequestDTO) {
                onBoardNewCollegeRepository.save(modelMapper.map(collegeRequestDTO, OnBoardNewCollege.class));
        }

        public StudentDTO requestStudentOnboard(Long userId, String collegeName) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                Student student = Student.builder()
                                .user(user)
                                .college(collegeRepository.findByName(collegeName)
                                                .orElseThrow(
                                                                () -> new ResourceNotFoundException(
                                                                                "College not found with name: "
                                                                                                + collegeName)))
                                .build();

                Applicant applicant = Applicant.builder()
                                .user(user)
                                .jobApplications(null)
                                .resume(null)
                                .build();

                user.getRoles().add(Role.STUDENT);
                user.getRoles().add(Role.APPLICANT);
                userRepository.save(user);
                applicantRepository.save(applicant);
                studentRepository.save(student);
                student.setApplicant(applicant);
                return modelMapper.map(student, StudentDTO.class);
        }

//        public WalletDTO getUserWallet() {
//                User user = (User) org.springframework.security.core.context.SecurityContextHolder.getContext()
//                                .getAuthentication().getPrincipal();
//                Wallet wallet = walletRepository.findByUser(user)
//                                .orElseGet(() -> {
//                                        Wallet newWallet = Wallet.builder()
//                                                        .user(user)
//                                                        .balance(java.math.BigDecimal.ZERO)
//                                                        .build();
//                                        return walletRepository.save(newWallet);
//                                });
//                return modelMapper.map(wallet, WalletDTO.class);
//        }
}
