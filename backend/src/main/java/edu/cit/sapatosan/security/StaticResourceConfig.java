package edu.cit.sapatosan.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    // Inject the value from application.properties
    @Value("${upload.folder}")
    private String uploadFolder;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configure resource handling for the "/uploads/**" URL path
        registry.addResourceHandler("/uploads/**")
                // Map it to the filesystem directory specified by uploadFolder
                // The "file:" prefix is crucial here.
                // Ensure the path ends with a slash.
                .addResourceLocations("file:" + uploadFolder + "/");
    }
}
