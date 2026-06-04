package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.*;
import com.teamarc.proxima.entity.*;
import com.teamarc.proxima.entity.enums.ApplicationStatus;
import com.teamarc.proxima.entity.enums.JobStatus;
import com.teamarc.proxima.entity.enums.MassHiringStatus;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.ReflectionUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmployerService {


    private final EmployerRepository employerRepository;
    private final ModelMapper modelMapper;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final ApplicantService applicantService;
    private final CollegeRepository collegeRepository;
    private final MassHiringRequestRepository massHiringRequestRepository;

    public Employer createNewEmployer(Employer employer) {
        return employerRepository.save(employer);
    }

    public EmployerDTO getEmployerProfileById() {
        Employer employer = getCurrentEmployer();
        return modelMapper.map(employer, EmployerDTO.class);
    }

    private Employer getCurrentEmployer() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return employerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not associated with user with id: " + user.getId()));

    }

    public Page<JobApplicationDTO> getAllApplications(Long jobId, PageRequest pageRequest, Pageable pageable) {
        return jobApplicationRepository.findByJob_JobId(jobId, pageRequest, pageable)
                .map(jobApplication -> modelMapper.map(jobApplication, JobApplicationDTO.class));
    }


    @CacheEvict(value = "jobs", allEntries = true)
    public JobDTO createJob(JobDTO job) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Employer employer = employerRepository.findByUser(user).orElseThrow(
                () -> new ResourceNotFoundException("Employer not associated with user with id: " + user.getId())
        );
        Job newJob = modelMapper.map(job, Job.class);
        newJob.setPostedBy(employer);
        newJob.setJobStatus(JobStatus.OPEN);
        Job savedJob = jobRepository.save(newJob);
        return modelMapper.map(savedJob, JobDTO.class);
    }

    @Caching(evict = {
        @CacheEvict(value = "job", key = "#jobId"),
        @CacheEvict(value = "jobs", allEntries = true)
    })
    public JobDTO updateJob(Long jobId, Map<String, Object> updates) {
        checkApplicantExistsById(jobId);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        updates.forEach((field, value) -> {
            Field fieldToBeUpdated = ReflectionUtils.findRequiredField(Applicant.class, field);
            fieldToBeUpdated.setAccessible(true);
            ReflectionUtils.setField(fieldToBeUpdated, job, value);
        });
        return modelMapper.map(jobRepository.save(job), JobDTO.class);
    }


    public void checkApplicantExistsById(Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            throw new ResourceNotFoundException("Job not found with id: " + jobId);
        }
    }

    @Caching(evict = {
        @CacheEvict(value = "job", key = "#jobId"),
        @CacheEvict(value = "jobs", allEntries = true)
    })
    public JobDTO deleteJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        jobRepository.delete(job);
        return modelMapper.map(job, JobDTO.class);
    }

    public JobDTO getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        return modelMapper.map(job, JobDTO.class);
    }


    public ApplicationStatus checkApplicationStatus(Long applicationId) {
        JobApplication jobApplication = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found with id: " + applicationId));
        return jobApplication.getApplicationStatus();
    }

    public ApplicantDTO getApplicantById(Long applicantId) {
        return applicantService.getApplicantById(applicantId);
    }


    public Page<ApplicantDTO> getApplicantsByJobId(Long jobId, PageRequest pageRequest, Pageable pageable) {
        return jobApplicationRepository.findByJob_JobId(jobId, pageRequest, pageable)
                .map(jobApplication -> modelMapper.map(jobApplication.getApplicant(), ApplicantDTO.class));
    }

    public JobApplicationDTO getJobApplicationByApplicantId(Long jobId, Long applicantId) {
        JobApplication jobApplication = jobApplicationRepository.findByJob_JobIdAndApplicant_ApplicantId(jobId, applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found"));
        return modelMapper.map(jobApplication, JobApplicationDTO.class);
    }


    public JobApplicationDTO changeApplicationStatus(Long applicationId, String status) {
        JobApplication jobApplication = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found"));
        jobApplication.setApplicationStatus(ApplicationStatus.valueOf(status));
        return modelMapper.map(jobApplicationRepository.save(jobApplication), JobApplicationDTO.class);
    }

    public JobApplicationDTO getAllApplicantOfJobApplication(Long applicationId) {
        JobApplication jobApplication = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found"));
        return modelMapper.map(jobApplication, JobApplicationDTO.class);
    }

    @CacheEvict(value = "employers", key = "#id")
    public EmployerDTO updateEmployerProfile(Long id, Map<String, Object> object) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with id: " + id));
        object.forEach((field, value) -> {
            Field fieldToBeUpdated = ReflectionUtils.findRequiredField(Employer.class, field);
            fieldToBeUpdated.setAccessible(true);
            ReflectionUtils.setField(fieldToBeUpdated, employer, value);
        });
        return modelMapper.map(employerRepository.save(employer), EmployerDTO.class);
    }

    public Page<JobApplicationDTO> getApplicationsByStatus(Long jobId, String status, PageRequest pageRequest, Pageable pageable) {
        return jobApplicationRepository.findByApplicationStatus(jobId, ApplicationStatus.valueOf(status), pageRequest, pageable)
                .map(jobApplication -> modelMapper.map(jobApplication, JobApplicationDTO.class));
    }

    @Caching(evict = {
        @CacheEvict(value = "job", key = "#jobId"),
        @CacheEvict(value = "jobs", allEntries = true)
    })
    public JobDTO closeJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        job.setJobStatus(JobStatus.CLOSED);
        return modelMapper.map(jobRepository.save(job), JobDTO.class);
    }

    @Cacheable(value = "employers", key = "#id")
    public EmployerDTO getEmployerProfileById(Long id) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with id: " + id));
        return modelMapper.map(employer, EmployerDTO.class);
    }

    public boolean isOwnerOfJob(Long jobId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        return user.getId() == job.getPostedBy().getUser().getId();
    }

    public boolean isOwnerOfJobByApplicationId(Long applicationId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JobApplication jobApplication = getApplicationById(applicationId);
        return user.getId() == jobApplication.getJob().getPostedBy().getUser().getId();
    }

    public boolean isOwnerOfProfile(Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        EmployerDTO employerDTO = getEmployerProfileById(id);
        return user.getId() == employerDTO.getUser().getId();
    }

    private JobApplication getApplicationById(Long applicationId) {
        return jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found with id: " + applicationId));
    }

    public Page<JobDTO> getAllJobsOfEmployer(Long employerId, PageRequest pageRequest, Pageable pageable) {
        return jobRepository.findByPostedBy_EmployerId(employerId, pageRequest, pageable)
                .map(job -> modelMapper.map(job, JobDTO.class));
    }

    public Employer getEmployerByUser(User user) {
        return employerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with user id: " + user.getId()));
    }

    public MassHiringRequestDTO requestCollegeForMassHiring(Long collegeId, MassHiringRequestDTO massHiringRequestDTO) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException("College not found with id: " + collegeId));
        Employer employer = getCurrentEmployer();
        MassHiringRequest massHiringRequest = MassHiringRequest.builder()
                .description(massHiringRequestDTO.getDescription())
                .requiredStudents(massHiringRequestDTO.getRequiredStudents())
                .status(MassHiringStatus.PENDING)
                .college(college)
                .employer(employer)
                .build();
        return toMassHiringDTO(massHiringRequestRepository.save(massHiringRequest));
    }

    public List<MassHiringRequestDTO> getMyMassHiringRequests() {
        Employer employer = getCurrentEmployer();
        return massHiringRequestRepository.findByEmployer_EmployerId(employer.getEmployerId())
                .stream()
                .map(this::toMassHiringDTO)
                .toList();
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
