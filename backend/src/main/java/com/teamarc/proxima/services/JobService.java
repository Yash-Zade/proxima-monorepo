package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.JobDTO;
import com.teamarc.proxima.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final ModelMapper modelMapper;


    @Cacheable(value = "job", key = "#jobId")
    public JobDTO getJobById(Long jobId) {
        return modelMapper.map(jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found")), JobDTO.class);
    }


    @Cacheable(value = "jobs", keyGenerator = "customKeyGenerator")
    public Page<JobDTO> getAllJobs(PageRequest pageRequest) {
        return jobRepository.findAll(pageRequest).map((element) -> modelMapper.map(element, JobDTO.class));
    }
}
