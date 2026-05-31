package com.teamarc.proxima.configs;

import com.teamarc.proxima.entity.*;
import com.teamarc.proxima.entity.enums.JobStatus;
import com.teamarc.proxima.entity.enums.Role;
import com.teamarc.proxima.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DummyDataInitializer implements ApplicationRunner {

    private final CollegeRepository collegeRepository;
    private final EmployerRepository employerRepository;
    private final JobRepository jobRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ApplicantRepository applicantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        long collegeCount = collegeRepository.count();
        long employerCount = employerRepository.count();
        long studentCount = studentRepository.count();
        long userCount = userRepository.count();

        System.out.println("==============================================================");
        System.out.println("Proxima DummyDataInitializer: Starting data ingestion...");
        System.out.println("Current database counts:");
        System.out.println(" - Users: " + userCount);
        System.out.println(" - Colleges: " + collegeCount);
        System.out.println(" - Employers: " + employerCount);
        System.out.println(" - Students: " + studentCount);
        System.out.println("==============================================================");

        String encodedPassword = passwordEncoder.encode("password123");

        // 1. Create Colleges
        College iitb = createCollege("Indian Institute of Technology Bombay", "Powai, Mumbai, Maharashtra 400076", "contact@iitb.ac.in", "https://www.iitb.ac.in", "IIT Bombay Admin", "admin@iitb.ac.in", encodedPassword);
        College bits = createCollege("Birla Institute of Technology and Science, Pilani", "Vidya Vihar, Pilani, Rajasthan 333031", "admissions@pilani.bits-pilani.ac.in", "https://www.bits-pilani.ac.in", "BITS Pilani Admin", "admin@bits-pilani.ac.in", encodedPassword);
        College dtu = createCollege("Delhi Technological University", "Shahbad Daulatpur, Bawana Road, Delhi 110042", "info@dtu.ac.in", "https://www.dtu.ac.in", "DTU Admin", "admin@dtu.ac.in", encodedPassword);

        // 2. Create Employers and Jobs
        createEmployerAndJob("Google", "https://google.com", "Google HR", "hr@google.com", encodedPassword,
                "Software Engineer", "Design, develop, test, deploy, maintain and improve software.", "Bangalore", List.of("Java", "Go", "Distributed Systems", "Kubernetes"));

        createEmployerAndJob("Microsoft", "https://microsoft.com", "Microsoft HR", "hr@microsoft.com", encodedPassword,
                "Frontend Developer", "Build modern, accessible, and delightful web experiences.", "Hyderabad", List.of("TypeScript", "React", "CSS", "Next.js"));

        createEmployerAndJob("Meta", "https://meta.com", "Meta HR", "hr@meta.com", encodedPassword,
                "React Developer", "Work on advanced React architecture and performant interfaces.", "Remote", List.of("React", "Redux", "JavaScript", "HTML5"));

        createEmployerAndJob("Netflix", "https://netflix.com", "Netflix HR", "hr@netflix.com", encodedPassword,
                "Senior Systems Engineer", "Scale our video delivery infrastructure to hundreds of millions of users.", "Mumbai", List.of("C++", "Rust", "Network Protocols", "Linux"));

        createEmployerAndJob("Apple", "https://apple.com", "Apple HR", "hr@apple.com", encodedPassword,
                "iOS Engineer", "Create the next generation of applications for iOS and macOS platforms.", "Bangalore", List.of("Swift", "SwiftUI", "Objective-C", "iOS SDK"));

        createEmployerAndJob("Amazon", "https://amazon.com", "Amazon HR", "hr@amazon.com", encodedPassword,
                "Cloud Solution Architect", "Help customers design enterprise-grade, highly resilient architectures on AWS.", "Chennai", List.of("AWS", "Cloud Architecture", "Terraform", "Security"));

        createEmployerAndJob("Adobe", "https://adobe.com", "Adobe HR", "hr@adobe.com", encodedPassword,
                "C++ Developer", "Work on performance-critical graphic engine code in Photoshop.", "Noida", List.of("C++", "Data Structures", "Algorithms", "OpenGL"));

        createEmployerAndJob("Uber", "https://uber.com", "Uber HR", "hr@uber.com", encodedPassword,
                "Backend Engineer (Ride Sharing)", "Optimize real-time matching and dispatch systems for rides.", "Bangalore", List.of("Go", "Java", "Redis", "Kafka"));

        createEmployerAndJob("Stripe", "https://stripe.com", "Stripe HR", "hr@stripe.com", encodedPassword,
                "Full Stack Engineer", "Develop and support global billing products and developer APIs.", "Pune", List.of("Ruby", "React", "TypeScript", "SQL"));

        createEmployerAndJob("Airbnb", "https://airbnb.com", "Airbnb HR", "hr@airbnb.com", encodedPassword,
                "Product Manager", "Define and drive product roadmap for host onboarding experience.", "Gurugram", List.of("Product Strategy", "Data Analysis", "Agile", "SQL"));

        // 3. Create Students
        createStudent("Aarav Sharma", "aarav.sharma@iitb.ac.in", encodedPassword, iitb, List.of("Java", "Spring Boot", "SQL"), List.of("Mumbai", "Bangalore"));
        createStudent("Ananya Iyer", "ananya.iyer@iitb.ac.in", encodedPassword, iitb, List.of("Python", "Machine Learning", "PyTorch"), List.of("Mumbai", "Pune"));
        createStudent("Kabir Mehta", "kabir.mehta@iitb.ac.in", encodedPassword, iitb, List.of("React", "TypeScript", "Node.js"), List.of("Bangalore", "Delhi"));
        createStudent("Diya Joshi", "diya.joshi@iitb.ac.in", encodedPassword, iitb, List.of("Swift", "iOS Development", "SwiftUI"), List.of("Bangalore", "Remote"));

        createStudent("Rohan Verma", "rohan.verma@bits.ac.in", encodedPassword, bits, List.of("Go", "Kubernetes", "Docker"), List.of("Hyderabad", "Bangalore"));
        createStudent("Ishaan Gupta", "ishaan.gupta@bits.ac.in", encodedPassword, bits, List.of("AWS", "DevOps", "Terraform"), List.of("Bangalore", "Delhi"));
        createStudent("Sanya Malhotra", "sanya.malhotra@bits.ac.in", encodedPassword, bits, List.of("C++", "Embedded Systems", "Rust"), List.of("Noida", "Bangalore"));

        createStudent("Aditya Roy", "aditya.roy@dtu.ac.in", encodedPassword, dtu, List.of("JavaScript", "React Native", "CSS"), List.of("Delhi", "Noida"));
        createStudent("Meera Sen", "meera.sen@dtu.ac.in", encodedPassword, dtu, List.of("Ruby on Rails", "PostgreSQL", "React"), List.of("Pune", "Remote"));
        createStudent("Devansh Dixit", "devansh.dixit@dtu.ac.in", encodedPassword, dtu, List.of("Product Management", "Data Analytics", "Excel"), List.of("Delhi", "Mumbai"));

        System.out.println("==============================================================");
        System.out.println("Proxima DummyDataInitializer: Finished data ingestion successfully!");
        System.out.println("==============================================================");
    }

    private College createCollege(String name, String address, String email, String website, String adminName, String adminEmail, String encodedPassword) {
        java.util.Optional<College> existingCollege = collegeRepository.findByName(name);
        if (existingCollege.isPresent()) {
            System.out.println("College '" + name + "' already exists. Skipping creation.");
            return existingCollege.get();
        }

        System.out.println("Creating college: " + name);
        User collegeUser = userRepository.findByEmail(adminEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setName(adminName);
            newUser.setEmail(adminEmail);
            newUser.setPassword(encodedPassword);
            newUser.setRoles(new HashSet<>(Set.of(Role.COLLEGE)));
            return userRepository.save(newUser);
        });

        College college = College.builder()
                .name(name)
                .address(address)
                .email(email)
                .website(website)
                .user(collegeUser)
                .build();
        return collegeRepository.save(college);
    }

    private void createEmployerAndJob(String companyName, String website, String hrName, String hrEmail, String encodedPassword,
                                      String jobTitle, String jobDesc, String location, List<String> skills) {
        User employerUser = userRepository.findByEmail(hrEmail).orElseGet(() -> {
            System.out.println("Creating HR user for employer '" + companyName + "' with email: " + hrEmail);
            User newUser = new User();
            newUser.setName(hrName);
            newUser.setEmail(hrEmail);
            newUser.setPassword(encodedPassword);
            newUser.setRoles(new HashSet<>(Set.of(Role.EMPLOYER)));
            return userRepository.save(newUser);
        });

        Employer employer = employerRepository.findByUser(employerUser).orElseGet(() -> {
            System.out.println("Creating employer record for: " + companyName);
            Employer newEmployer = Employer.builder()
                    .companyName(companyName)
                    .companyWebsite(website)
                    .user(employerUser)
                    .build();
            return employerRepository.save(newEmployer);
        });

        boolean jobExists = jobRepository.findAll().stream()
                .anyMatch(j -> j.getTitle().equalsIgnoreCase(jobTitle) && j.getCompany().equalsIgnoreCase(companyName));

        if (!jobExists) {
            System.out.println("Creating job: '" + jobTitle + "' for employer: " + companyName);
            Job job = Job.builder()
                    .title(jobTitle)
                    .description(jobDesc)
                    .location(location)
                    .skillsRequired(skills)
                    .postedBy(employer)
                    .company(companyName)
                    .jobStatus(JobStatus.OPEN)
                    .build();
            jobRepository.save(job);
        } else {
            System.out.println("Job '" + jobTitle + "' for employer " + companyName + " already exists. Skipping job creation.");
        }
    }

    private void createStudent(String name, String email, String encodedPassword, College college, List<String> skills, List<String> preferredLocations) {
        User studentUser = userRepository.findByEmail(email).orElseGet(() -> {
            System.out.println("Creating student user: " + name + " with email: " + email);
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPassword(encodedPassword);
            newUser.setRoles(new HashSet<>(Set.of(Role.STUDENT, Role.APPLICANT)));
            return userRepository.save(newUser);
        });

        Applicant applicant = applicantRepository.findByUser(studentUser).orElseGet(() -> {
            System.out.println("Creating applicant profile for student: " + name);
            Applicant newApplicant = Applicant.builder()
                    .user(studentUser)
                    .skills(skills)
                    .preferredLocations(preferredLocations)
                    .isFirstSession(true)
                    .build();
            return applicantRepository.save(newApplicant);
        });

        studentRepository.findByUser(studentUser).orElseGet(() -> {
            System.out.println("Creating student record for: " + name);
            Student newStudent = Student.builder()
                    .user(studentUser)
                    .college(college)
                    .applicant(applicant)
                    .build();
            return studentRepository.save(newStudent);
        });
    }
}
