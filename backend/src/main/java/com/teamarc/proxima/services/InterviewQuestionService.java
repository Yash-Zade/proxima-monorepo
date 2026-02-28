package com.teamarc.proxima.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamarc.proxima.dto.OptionDTO;
import com.teamarc.proxima.dto.QuestionDTO;
import com.teamarc.proxima.entity.Applicant;
import com.teamarc.proxima.entity.Job;
import com.teamarc.proxima.entity.JobApplication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class InterviewQuestionService {

    private final String geminiApiUrl="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private final String geminiApiKey="AIzaSyD8r3UbfFd7ar-myim-PbxLemUmHA-DA1k";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public InterviewQuestionService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(geminiApiUrl).build();
        this.objectMapper = new ObjectMapper();
    }

    public List<QuestionDTO> generateQuestions(JobApplication request) {
        String prompt = "You are an AI assistant specializing in creating ATS-optimized, story-based skill assessment tests. " +
                "Your task is to generate a skill assessment test to assess a candidate's actual skills and experience, focusing *exclusively* on newly added skills. " +
                "Only generate the test if the required skills in the job description *are not already fully covered* by the candidate's certified skills. " +
                "If all required skills are already certified, output an empty JSON array: `[]`. If a test is needed, it should focus *only* on newly added skills. " +
                "The test should use a consistent, overarching story. The number of questions should be *flexible*, aiming for the *minimum* required to thoroughly assess and certify relevant *new* skills (aim for around 3-5 questions, but adjust as needed). " +
                "The test is generated *before* a formal job application, to pre-qualify the applicant. *DO NOT* generate questions testing skills already in the 'certified_skills' list." +
                "Input Variables:" +
                "Job Description: " + request.getJob().getDescription() +
                "Resume: " + request.getApplicant().getResume() +
                "Certified Skills:" + request.getApplicant().getCertifiedSkills() +
                "Output Requirements:" +
                "1. **Check for Redundancy:** *First*, compare the required skills listed in the `Job Description` and the skills mentioned in the `Resume` against the skills in the `Certified Skills` list." +
                "   * If *all* required skills are already present in the `Certified Skills` list, output *only* an empty JSON array: `[]`" +
                "   * If *any* required skills are *NOT* present in the `Certified Skills` list, proceed to step 2." +
                "2. **Generate Test (If Needed):** If a test is needed (because not all required skills are certified), generate a JSON-formatted skill assessment test with the following structure. " +
                "All questions should be based on the SAME overarching story scenario. The number of questions should be driven by the *new* skills needing assessment, not a fixed number. " +
                "*DO NOT* generate questions that test any skills already present in the `Certified Skills` list.  Focus ONLY on the skills NOT already certified." +
                "[" +
                "  {" +
                "    'question_id': 'Q1'" +
                "    'story': 'A short, realistic job-related scenario where the candidate's skills are tested. This story is the foundation for ALL questions. " +
                "This should be an open-ended story that allows for multiple follow-up questions. *The story should involve situations where the candidate needs to use skills NOT present in the Certified Skills list. " +
                "Focus on key skills from the Job Description that are not already certified.*'," +
                "    'question': 'Based on the story, what action should the candidate take, demonstrating skills *not* in the Certified Skills list?'," +
                "    'answer_type': 'multiple_choice', // OR 'text'" +
                "    'options': [" +
                "      {'text': 'Option A', 'is_correct': false}," +
                "      {'text': 'Option B', 'is_correct': false}," +
                "      {'text': 'Option C', 'is_correct': true}," +
                "      {'text': 'Option D', 'is_correct': false}" +
                "    ]" +
                "    'skill_certifications': ['Skill1', 'Skill2'], // Skills certified upon correct answer to THIS question. " +
                "*These skills MUST NOT be present in the Certified Skills list, but SHOULD be essential skills from the Job Description that are not yet certified.*" +
                "  }," +
                "  {" +
                "    'question_id': 'Q2'" +
                "    'story': 'Same story as Q1. Do NOT change the story. Ensure the scenario involves situations that require skills *not* in the Certified Skills list.  Continue focusing on the most important uncertified skills from the Job Description.',\n" +
                "    'question': 'Building upon the previous scenario, what is the next logical step, showcasing skills *not* yet certified?" +
                "    'answer_type': 'multiple_choice', // OR 'text'" +
                "    'options': [" +
                "      {'text': 'Option A', 'is_correct': false}," +
                "      {'text': 'Option B', 'is_correct': false}," +
                "      {'text': 'Option C', 'is_correct': true}," +
                "      {'text': 'Option D', 'is_correct': false}" +
                "    ], " +
                "    'skill_certifications': ['Skill3'], // Skills certified upon correct answer to THIS question. *This skill MUST NOT be present in the Certified Skills list, but SHOULD be an essential skill from the Job Description that is not yet certified.*\n" +
                "  }," +
                "  {" +
                "    'question_id': 'Q3'," +
                "    'story': 'Same story as Q1 and Q2. Do NOT change the story. The scenario should continue to require skills *not* in the Certified Skills list. Focus on strategic, high-level skills needed for the role that are not yet certified.',\n" +
                "    'question': 'Considering the long-term implications of the situation, how should the candidate strategically address this, demonstrating *new* skills?',\n" +
                "    'answer_type': 'text', // OR 'multiple_choice'" +
                "    'options': [" +
                "      {'text': 'Option A', 'is_correct': false}," +
                "      {'text': 'Option B', 'is_correct': false}," +
                "      {'text': 'Option C', 'is_correct': true}," +
                "      {'text': 'Option D', 'is_correct': false}" +
                "    ]," +
                "    'skill_certifications': ['Skill4', 'Skill5'], // Skills certified upon correct answer to THIS question. *These skills MUST NOT be present in the Certified Skills list, but SHOULD be essential skills from the Job Description that are not yet certified.*\n" +
                "  }," +
                "   //The above is a sample structure, create more questions that you feel are required to access all the NEW skills from resume and job description that are *NOT* in the Certified Skills list and also provide its reasoning. Focus specifically on skills required for the job as listed in the Job Description that are not yet certified.* If no skills need to be certified, output an empty array \"[]\".\n" +
                "]" +
                "Story Guidelines:" +
                "A SINGLE, overarching story MUST be used for ALL questions. The questions should build upon each other within the context of the same story. This ensures deeper understanding is tested.\n" +
                "The story should reflect real-world challenges in the job and REQUIRE the candidate to use skills *NOT* already certified." +
                "Focus on practical application and strategic thinking." +
                "The correct answer should demonstrate true knowledge and not just superficial understanding." +
                "*Ensure the story and questions REQUIRE the candidate to demonstrate skills NOT in the Certified Skills list, but ARE required for the Job.*" +
                "Output Notes:" +
                "*   **Empty Array if Redundant:** If all required skills are already certified, output ONLY an empty JSON array: `[]" +
                "*   **ONE STORY:** Emphasize that the entire assessment uses ONE single story." +
                "*   **Flexible Question Count:** Generate as many questions as needed to thoroughly certify the *new* core skills highlighted in the resume and job description that are *NOT* already certified (aim for 3-5, but be flexible)." +
                "*   **Skill Certification:** Each question MUST clearly define which skills are certified if answered correctly." +
                "*   **Reasoning:** provide reasoning for that each skill is get certified for a particular answer for the question." +
                "*   **NEW SKILLS ONLY:** The `skill_certifications` field for each question MUST ONLY contain skills that are *NOT* present in the `Certified Skills` input variable, but ARE essential from the Job Description" +
                "*    **Answer type:** acceptable_answer_range and expected_answer_keywords both should be there only if answer_type is 'text'" +
                "*   **JSON Validity:** The ENTIRE output MUST be a valid JSON array (either the full test OR an empty array `[]`)." +
                "*   **Placeholder Replacement:** You MUST replace `[INSERT JOB DESCRIPTION HERE]`, `[INSERT RESUME HERE]`, and `[INSERT ARRAY OF CERTIFIED SKILLS HERE]` with the actual data." +
                "Instructions for Using the Results (Not for the LLM, but for your system):" +
                "1.  **Check for Empty Array:** If the LLM returns an empty array `[]`, it means the candidate is already certified in all required skills, and no test is needed." +
                "2.  **Record Certified Skills:** If the LLM returns a test, and the candidate answers a question correctly, store the corresponding skills from `skill_certifications` in the candidate's profile." +
                "3.  **Adaptive Testing:** For future applications, compare the required skills for the new job with the candidate's `certified_skills`. Prioritize assessment questions that target skills the candidate *doesn't* yet have certified. DO NOT re-test certified skills unless a significant time has passed (e.g., more than 2 years). When retesting, consider harder or deeper-dive scenarios.";

        // 🔹 Construct API request body
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );


        // 🔹 Make API call
        String response = restClient.post()
                .uri("?key=" + geminiApiKey)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(String.class);

        return parseResponse(response);
    }

    private List<QuestionDTO> parseResponse(String response) {
        try {
            // Parse the Gemini response
            JsonNode root = objectMapper.readTree(response);
            String jsonContent = root.get("candidates")
                    .get(0)
                    .get("content")
                    .get("parts")
                    .get(0)
                    .get("text")
                    .asText()
                    .replace("```json\n", "")
                    .replace("\n```", "");

            // Parse the questions array
            JsonNode questionsArray = objectMapper.readTree(jsonContent);
            List<QuestionDTO> questions = new ArrayList<>();

            for (JsonNode questionNode : questionsArray) {
                QuestionDTO question = new QuestionDTO();
                question.setDifficulty(questionNode.get("difficulty").asText());
                question.setStory(questionNode.get("story").asText());
                question.setQuestion(questionNode.get("question").asText());

                List<OptionDTO> options = new ArrayList<>();
                for (JsonNode optionNode : questionNode.get("options")) {
                    OptionDTO option = new OptionDTO();
                    option.setText(optionNode.get("text").asText());
                    option.setCorrect(optionNode.get("is_correct").asBoolean());
                    options.add(option);
                }
                question.setOptions(options);
                questions.add(question);
            }

            return questions;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    public List<QuestionDTO> generateQuestions(String jd, String resume, List<String> certifiedSkills) {
        JobApplication jobApplication = new JobApplication();
        jobApplication.setJob(new Job());
        jobApplication.getJob().setDescription(jd);
        jobApplication.setApplicant(new Applicant());
        jobApplication.getApplicant().setResume(resume);
        jobApplication.getApplicant().setCertifiedSkills(certifiedSkills);
        return generateQuestions(jobApplication);
    }
}