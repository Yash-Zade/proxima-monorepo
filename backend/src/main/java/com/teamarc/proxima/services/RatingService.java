package com.teamarc.proxima.services;


import com.teamarc.proxima.dto.MentorProfileDTO;
import com.teamarc.proxima.dto.RatingDTO;
import com.teamarc.proxima.entity.Mentor;
import com.teamarc.proxima.entity.Rating;
import com.teamarc.proxima.entity.Session;
import com.teamarc.proxima.exceptions.ResourceNotFoundException;
import com.teamarc.proxima.exceptions.RuntimeConflictException;
import com.teamarc.proxima.repository.MentorRepository;
import com.teamarc.proxima.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final MentorRepository mentorRepository;
    private final ModelMapper modelMapper;


    public MentorProfileDTO rateMentor(RatingDTO ratingDTO) {
        Mentor mentor = mentorRepository.findById(ratingDTO.getSession().getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found with id: " + ratingDTO.getSession().getMentorId()));
        Rating ratingObj = ratingRepository.findBySession(modelMapper.map(ratingDTO.getSession(), Session.class))
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found for session with id: " + ratingDTO.getSession().getSessionId()));
        if (ratingObj.getRatingValue() != null) throw new RuntimeConflictException("Mentor is already rated");
        ratingObj.setRatingValue(ratingDTO.getRatingValue());
        ratingObj.setComment(ratingDTO.getComment());
        ratingRepository.save(ratingObj);

        Double newRating = ratingRepository.findByMentor(mentor)
                .stream()
                .mapToDouble(Rating::getRatingValue)
                .average().orElse(0.0);
        mentor.setAverageRating(newRating);
        mentor.getRatings().add(ratingObj);
        Mentor savedMentor = mentorRepository.save(mentor);


        return modelMapper.map(savedMentor, MentorProfileDTO.class);
    }


    public void creatNewRating(Session session) {
        Rating rating = Rating.builder()
                .session(session)
                .mentor(session.getMentor())
                .applicant(session.getApplicant())
                .build();

        ratingRepository.save(rating);
    }

    public Page<RatingDTO> getRatings(Integer pageOffset, Integer pageSize) {
        return ratingRepository.findAll(PageRequest.of(pageOffset, pageSize))
                .map(rating -> modelMapper.map(rating, RatingDTO.class));
    }
}
