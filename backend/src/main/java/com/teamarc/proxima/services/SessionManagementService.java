package com.teamarc.proxima.services;

import com.teamarc.proxima.dto.ApplicantDTO;
import com.teamarc.proxima.dto.SessionDTO;
import com.teamarc.proxima.entity.Applicant;
import com.teamarc.proxima.entity.Session;
import com.teamarc.proxima.entity.enums.SessionStatus;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class SessionManagementService {

    private final SessionRepository sessionRepository;
    private final ModelMapper modelMapper;
    private final PaymentService paymentService;
    private final RatingService ratingService;



    public SessionDTO startSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        if (session.getSessionStatus().name().equals("SCHEDULED")) {
            session.setSessionStatus(SessionStatus.ONGOING);
            session.setSessionStartTime(LocalDateTime.now());
            Session savedSession = sessionRepository.save(session);
            return modelMapper.map(savedSession, SessionDTO.class);
        }
        throw new RuntimeException("Session not found with Id: " + session.getSessionId());
    }

    public SessionDTO joinSession(Long sessionId, String otp) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        if (session.getSessionStatus().name().equals("SCHEDULED") && session.getOtp().equals(otp)) {
            session.setSessionStatus(SessionStatus.ONGOING);
            session.setSessionStartTime(LocalDateTime.now());
            Session savedSession = sessionRepository.save(session);
            return modelMapper.map(savedSession, SessionDTO.class);
        }
        throw new RuntimeException("Session not found with Id: " + session.getSessionId());

    }

    public SessionDTO endSessionByApplicant(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        if (session.getSessionStatus().name().equals("ONGOING")) {
            session.setSessionStatus(SessionStatus.COMPLETED);
            session.setSessionEndTime(LocalDateTime.now());
            Session savedSession = sessionRepository.save(session);
            return modelMapper.map(savedSession, SessionDTO.class);
        }
        throw new RuntimeException("Session not found with Id: " + session.getSessionId());
    }


    public SessionDTO endSessionByMentor(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        if (session.getSessionStatus().name().equals("SCHEDULED")) {
            session.setSessionStatus(SessionStatus.COMPLETED);
            session.setSessionEndTime(LocalDateTime.now());
            session.getMentor().setTotalSessions(session.getMentor().getTotalSessions() + 1);
            Session savedSession = sessionRepository.save(session);
            return modelMapper.map(savedSession, SessionDTO.class);
        }
        throw new RuntimeException("Session not found with Id: " + session.getSessionId());
    }


    public SessionDTO cancelSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not associated with Id: " + sessionId));

        if (!(session.getSessionStatus().name().equals("APPLIED") || session.getSessionStatus().name().equals("SCHEDULED"))) {
            throw new RuntimeException("Session not found with Id: " + session.getSessionId());
        }
        session.setSessionStatus(SessionStatus.CANCELLED);
        Session savedSession = sessionRepository.save(session);
        paymentService.refundPayment(savedSession);


        return modelMapper.map(session, SessionDTO.class);

    }

    public SessionDTO requestSession(Long sessionId, ApplicantDTO applicant) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        session.setSessionStatus(SessionStatus.APPLIED);
        session.setApplicant(modelMapper.map(applicant, Applicant.class));
        Session savedSession = sessionRepository.save(session);
        paymentService.createNewPayment(session);
        return modelMapper.map(savedSession, SessionDTO.class);
    }


    public SessionDTO acceptSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        if (session.getSessionStatus().name().equals("APPLIED")) {
            session.setSessionStatus(SessionStatus.SCHEDULED);
            session.setOtp(generateRandomOtp());
            Session savedSession = sessionRepository.save(session);
            paymentService.processPayment(session);
            ratingService.creatNewRating(session);
            return modelMapper.map(savedSession, SessionDTO.class);
        }
        throw new RuntimeException("Session not found with Id: " + session.getSessionId());
    }

    private String generateRandomOtp() {
        Random random = new Random();
        int otp = random.nextInt(10000);
        return String.format("%04d", otp);
    }


}

