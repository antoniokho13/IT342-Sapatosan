package edu.cit.sapatosan.dto;

public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private String userId;
    private String email;
    private String role;

    public LoginResponse(String token, String userId, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role=role;
    }

    public String getToken() {
        return token;
    }

    public String getType() {
        return type;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
    public String getRole(){
        return role;
    }
}
