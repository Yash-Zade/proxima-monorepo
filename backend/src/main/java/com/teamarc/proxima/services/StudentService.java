package com.teamarc.proxima.services;

import com.teamarc.proxima.entity.Student;
import com.teamarc.proxima.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public Student createNewStudent(Student student) {
        return studentRepository.save(student);
    }
}
