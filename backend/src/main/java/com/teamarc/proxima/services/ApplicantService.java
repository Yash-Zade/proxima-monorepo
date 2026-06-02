package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.*;
import com.teamarc.proxima.entity.*;
import com.teamarc.proxima.entity.enums.ApplicationStatus;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.ApplicantRepository;
import com.teamarc.proxima.repository.JobApplicationRepository;
import com.teamarc.proxima.utils.FileService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.ReflectionUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApplicantService {

    private final ApplicantRepository applicantRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ModelMapper modelMapper;
    private final JobService jobService;
//    private final SessionService sessionService;
//    private final RatingService ratingService;
//    private final SessionManagementService sessionManagementService;
//    private final WalletService walletService;
    private final InterviewQuestionService interviewQuestionService;
    private final FileService fileService;

    @Transactional
    public List<QuestionDTO> applyJobRequest(Long jobId, JobApplicationDTO jobApplicationDTO) {

        Job job = modelMapper.map(jobService.getJobById(jobId), Job.class);
        if (job.getJobStatus().toString().equals("CLOSED")) {
            throw new RuntimeException("Job is closed");
        }

        if (jobApplicationDTO == null || jobApplicationDTO.getJobId() == null) {
            throw new IllegalArgumentException("Invalid job application data");
        }

        Applicant applicant = getCurrentApplicant();

        java.util.Optional<JobApplication> existingApplication = jobApplicationRepository.findByJob_JobIdAndApplicant_ApplicantId(jobId, applicant.getApplicantId());
        if (existingApplication.isPresent()) {
            throw new RuntimeException("You have already applied to this job.");
        }

        JobApplication jobApplication = new JobApplication();
        jobApplication.setJob(job);
        jobApplication.setApplicant(applicant);
        jobApplication.setApplicationStatus(ApplicationStatus.APPLIED);
        jobApplication.setAppliedDate(java.time.LocalDateTime.now());

        jobApplication = jobApplicationRepository.save(jobApplication);

        return interviewQuestionService.generateQuestions(jobApplication);

    }

    @Transactional
    public JobApplicationDTO withdrawApplication(Long applicationId) {
        JobApplication jobApplication = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
        jobApplication.setApplicationStatus(ApplicationStatus.WITHDRAWN);
        JobApplicationDTO jobApplicationDTO = modelMapper.map(jobApplication, JobApplicationDTO.class);
        jobApplicationRepository.delete(jobApplication);

        return jobApplicationDTO;
    }

    public ApplicantDTO getApplicantProfile() {
        Applicant applicant = getCurrentApplicant();
        return modelMapper.map(applicant, ApplicantDTO.class);

    }

    public Page<JobApplicationDTO> getAllJobApplications(PageRequest pageRequest, Pageable pageable) {
        Page<JobApplication> jobApplications = jobApplicationRepository.findByApplicant(getCurrentApplicant(),
                pageRequest, pageable);
        return jobApplications.map(jobApplication -> modelMapper.map(jobApplication, JobApplicationDTO.class));
    }

    public Applicant getCurrentApplicant() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return applicantRepository.findByUser(user)
                .orElseGet(() -> {
                    Applicant applicant = Applicant.builder()
                            .user(user)
                            .build();
                    return applicantRepository.save(applicant);
                });
    }

    public ApplicantDTO updateProfile(Long applicantId, Map<String, Object> updates) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found with id: " + applicantId));
        updates.forEach((field, value) -> {
            Field fieldToBeUpdated = ReflectionUtils.findRequiredField(Applicant.class, field);
            fieldToBeUpdated.setAccessible(true);
            ReflectionUtils.setField(fieldToBeUpdated, applicant, value);
        });
        return modelMapper.map(applicantRepository.save(applicant), ApplicantDTO.class);
    }

    public void uploadResume(MultipartFile file) {
        Applicant applicant = getCurrentApplicant();
        String fileUrl = fileService.uploadFile(file);
        applicant.setResume(fileUrl);
        applicantRepository.save(applicant);
    }

    public String checkApplicationStatus(Long applicationId) {
        JobApplication jobApplication = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
        return jobApplication.getApplicationStatus().name();
    }

    public ApplicantDTO getApplicantById(Long applicantId) {
        return modelMapper.map(applicantRepository.findById(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found with id: " + applicantId)),
                ApplicantDTO.class);
    }

//

    public JobApplication getApplicationById(Long applicationId) {
        return jobApplicationRepository.findById(applicationId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Job application not found with id: " + applicationId));
    }

    public boolean isOwnerOfApplication(Long applicationId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JobApplication jobApplication = getApplicationById(applicationId);
        return user.getId() == jobApplication.getApplicant().getUser().getId();
     }

//    public boolean isOwnerOfSession(Long sessionId) {
//        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        SessionDTO session = sessionService.getSessionById(sessionId);
//        ApplicantDTO applicant = getApplicantById(session.getApplicantId());
//        User sessionUser = modelMapper.map(applicant.getUser(), User.class);
//        return user.equals(sessionUser);
//    }

    public boolean isOwnerOfProfile(Long applicantId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        ApplicantDTO applicant = getApplicantById(applicantId);
        return user.getId() == applicant.getUser().getId();
    }

//    public SessionDTO cancelSession(Long sessionId) {
//        return sessionManagementService.cancelSession(sessionId);
//    }
//
//    public WalletDTO getWallet() {
//        Wallet wallet = walletService.getWalletByUserId(getCurrentApplicant().getUser().getId());
//        return modelMapper.map(wallet, WalletDTO.class);
//    }

    public JobApplicationDTO acceptJobApplication(Long jobApplicationId, JobApplicationDTO jobApplicationDTO,
            List<String> certifiedSkills) {
        JobApplication jobApplication = jobApplicationRepository.findById(jobApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found"));
        Applicant applicant = applicantRepository.getReferenceById(jobApplicationDTO.getApplicant().getApplicantId());
        applicant.setCertifiedSkills(certifiedSkills);
        applicantRepository.save(applicant);
        jobApplication.setApplicationStatus(ApplicationStatus.APPLIED);
        jobApplication.setJob(modelMapper.map(jobService.getJobById(jobApplicationDTO.getJobId()), Job.class));
        JobApplication savedJobApplication = jobApplicationRepository.save(jobApplication);
        return modelMapper.map(savedJobApplication, JobApplicationDTO.class);
    }

    public Applicant getApplicantByUserId(User user) {
        return applicantRepository.findByUser(user).orElseThrow(() -> new ResourceNotFoundException("Applicant Not fopund with user Id: "+ user.getId()));
    }
}