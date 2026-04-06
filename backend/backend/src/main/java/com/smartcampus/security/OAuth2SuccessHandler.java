package com.smartcampus.security;

import com.smartcampus.domain.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/auth/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String email = (String) attrs.get("email");
        String name = (String) attrs.get("name");
        String picture = (String) attrs.get("picture");
        String sub = (String) attrs.get("sub");

        // Upsert user
        User user = userRepository.findByEmail(email)
                .map(u -> {
                    u.setName(name);
                    u.setPictureUrl(picture);
                    u.setGoogleId(sub);
                    return userRepository.save(u);
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email).name(name)
                                .pictureUrl(picture).googleId(sub)
                                .role(User.Role.USER)
                                .build()));

        // Use user ID as the session identifier (simple approach)
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("userId", user.getId())
                .queryParam("email", user.getEmail())
                .queryParam("name", user.getName())
                .queryParam("role", user.getRole().name())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
