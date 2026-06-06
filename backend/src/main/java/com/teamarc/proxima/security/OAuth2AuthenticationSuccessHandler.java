package com.teamarc.proxima.security;

import com.teamarc.proxima.entity.User;
import com.teamarc.proxima.entity.enums.Role;
import com.teamarc.proxima.repository.UserRepository;
import com.teamarc.proxima.services.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JWTService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : email.split("@")[0]);
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setRoles(new HashSet<>(Set.of(Role.USER, Role.APPLICANT)));
            User savedUser = userRepository.save(newUser);
            
            // Initiate Applicant Onboarding
            userService.requestApplicantOnboard(savedUser.getId());
            return savedUser;
        });

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Add HTTP Only Refresh Token Cookie
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);

        // Dynamically resolve target URL based on request origin
        String frontendUrl = "https://proxima-main.vercel.app/oauth2/redirect";
        String serverName = request.getServerName();
        if (serverName.equals("localhost") || serverName.equals("127.0.0.1")) {
            frontendUrl = "http://localhost:5173/oauth2/redirect";
        }

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .queryParam("token", accessToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
