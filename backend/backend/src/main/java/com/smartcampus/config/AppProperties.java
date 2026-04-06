package com.smartcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Upload upload = new Upload();
    private final Cors cors = new Cors();
    private final Oauth2 oauth2 = new Oauth2();

    public Upload getUpload() {
        return upload;
    }

    public Cors getCors() {
        return cors;
    }

    public Oauth2 getOauth2() {
        return oauth2;
    }

    public static class Upload {
        private String dir;

        public String getDir() {
            return dir;
        }

        public void setDir(String dir) {
            this.dir = dir;
        }
    }

    public static class Cors {
        private String allowedOrigins;

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Oauth2 {
        private String redirectUri;

        public String getRedirectUri() {
            return redirectUri;
        }

        public void setRedirectUri(String redirectUri) {
            this.redirectUri = redirectUri;
        }
    }
}
