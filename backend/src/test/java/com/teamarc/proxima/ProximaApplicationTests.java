package com.teamarc.proxima;

import com.teamarc.proxima.entity.MassHiringRequest;
import com.teamarc.proxima.entity.College;
import com.teamarc.proxima.entity.User;
import com.teamarc.proxima.repository.MassHiringRequestRepository;
import com.teamarc.proxima.repository.CollegeRepository;
import com.teamarc.proxima.services.CollegeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@SpringBootTest
class ProximaApplicationTests {

    @Autowired
    private MassHiringRequestRepository repository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CollegeService collegeService;

    @Test
    void contextLoads() {
    }

    @Test
    void testQueryMassHiring() {
        System.out.println("=== MASS HIRING REQUESTS ===");
        List<MassHiringRequest> requests = repository.findAll();
        for (MassHiringRequest r : requests) {
            System.out.println("ID: " + r.getId() 
                + ", Description: " + r.getDescription() 
                + ", Status: " + r.getStatus() 
                + ", College: " + (r.getCollege() != null ? r.getCollege().getId() + " - " + r.getCollege().getName() : "null")
                + ", Employer: " + (r.getEmployer() != null ? r.getEmployer().getEmployerId() + " - " + r.getEmployer().getCompanyName() : "null"));
        }
        System.out.println("=== END ===");
    }

    @Test
    void testApprove() {
        System.out.println("=== TEST APPROVE ===");
        try {
            // Find College 9
            College college = collegeRepository.findById(9L).orElse(null);
            if (college == null) {
                System.out.println("College 9 not found!");
                return;
            }
            User user = college.getUser();
            if (user == null) {
                System.out.println("College 9 has no user associated!");
                return;
            }
            System.out.println("Using User ID: " + user.getId() + ", Email: " + user.getEmail() + " for College 9");
            
            // Set Security Context
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null, null);
            SecurityContextHolder.getContext().setAuthentication(auth);
            
            // Call service
            collegeService.approveMassHiringRequest(7L);
            System.out.println("SUCCESSFULLY APPROVED REQUEST 7");
        } catch (Exception e) {
            System.out.println("EXCEPTION CAUGHT:");
            e.printStackTrace();
        }
        System.out.println("=== END TEST APPROVE ===");
    }

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Test
    void testQueryConstraint() {
        System.out.println("=== QUERY CONSTRAINT ===");
        try {
            Object result = entityManager.createNativeQuery(
                "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'mass_hiring_request_status_check'"
            ).getSingleResult();
            System.out.println("CONSTRAINT DEFINITION: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("=== END QUERY CONSTRAINT ===");
    }
}
