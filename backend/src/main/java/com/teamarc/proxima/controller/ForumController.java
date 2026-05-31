package com.teamarc.proxima.controller;

import com.teamarc.proxima.entity.Forum;
import com.teamarc.proxima.repository.ForumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumRepository forumRepository;

    @GetMapping
    public ResponseEntity<List<Forum>> getAllForums() {
        return ResponseEntity.ok(forumRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Forum> createForum(@RequestBody Forum forum) {
        if (forum.getMembers() == null) {
            forum.setMembers(1); // creator is the first member
        }
        Forum savedForum = forumRepository.save(forum);
        return ResponseEntity.ok(savedForum);
    }
}
