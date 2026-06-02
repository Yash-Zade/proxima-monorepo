package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.OnBoardNewStudentDTO;
import com.teamarc.proxima.entity.College;
import com.teamarc.proxima.entity.OnBoardNewStudent;
import com.teamarc.proxima.entity.Student;
import com.teamarc.proxima.entity.User;
import com.teamarc.proxima.repository.CollegeRepository;
import com.teamarc.proxima.repository.OnBoardNewStudentRepository;
import com.teamarc.proxima.repository.StudentRepository;
import com.teamarc.proxima.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@RequiredArgsConstructor
@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final OnBoardNewStudentRepository onBoardNewStudentRepository;
    private final CollegeRepository collegeRepository;
    private final ModelMapper modelMapper;

    public Student createNewStudent(Student student) {
        return studentRepository.save(student);
    }

    public List<OnBoardNewStudentDTO> getStudentOnboardRequests() {
        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        College college = collegeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("College not associated with user with id: " + user.getId()));
        return onBoardNewStudentRepository.findByCollegeId(college.getId()).stream()
                .map(onBoardNewStudent -> modelMapper.map(onBoardNewStudent, OnBoardNewStudentDTO.class))
                .toList();
    }

    public void deleteOnboardRequest(Long userId, Long collegeId) {
        List<OnBoardNewStudent> requests = onBoardNewStudentRepository.findByCollegeId(collegeId).stream()
                .filter(req -> req.getUserId().equals(userId))
                .toList();
        onBoardNewStudentRepository.deleteAll(requests);
    }

    public List<Student> getStudentsByCollegeId(Long collegeId) {
        return studentRepository.findByCollegeId(collegeId);
    }
}
