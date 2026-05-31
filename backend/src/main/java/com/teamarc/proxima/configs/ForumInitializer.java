package com.teamarc.proxima.configs;

import com.teamarc.proxima.entity.Forum;
import com.teamarc.proxima.repository.ForumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ForumInitializer implements ApplicationRunner {

    private final ForumRepository forumRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (forumRepository.count() == 0) {
            forumRepository.save(Forum.builder()
                    .name("Engineering Discussions")
                    .description("Architecture, patterns, and development")
                    .members(234)
                    .build());
            forumRepository.save(Forum.builder()
                    .name("Venture Ideation")
                    .description("Brainstorming and early-stage validation")
                    .members(156)
                    .build());
            forumRepository.save(Forum.builder()
                    .name("Technical Screening")
                    .description("Algorithm patterns and system design")
                    .members(189)
                    .build());
        }
    }
}
