package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.api.LoginRequest
import android.content.Context
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import androidx.compose.ui.graphics.Color
import com.frontend_mobile.api.LoginResponse

class LoginActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    LoginScreenWithActions()
                }
            }
        }
    }
}

@Composable
fun LoginScreenWithActions() {
    val context = LocalContext.current

    LoginScreen(
        onLoginClick = { email, password ->
            val loginRequest = LoginRequest(email, password)

            RetrofitClient.instance.loginUser(loginRequest).enqueue(object : Callback<LoginResponse> {
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    if (response.isSuccessful && response.body() != null) {
                        val loginResponse = response.body()!!
                        Toast.makeText(context, "Login successful!", Toast.LENGTH_SHORT).show()

                        // Save the JWT token and user_id to SharedPreferences
                        RetrofitClient.saveToken(loginResponse.token) // Save the token
                        val prefs = context.getSharedPreferences("user_session", Context.MODE_PRIVATE)
                        prefs.edit().putString("user_id", loginResponse.userId).apply() // Save user_id
                        RetrofitClient.saveUserId(response.body()?.userId ?: "")

                        // Navigate to HomeActivity
                        context.startActivity(Intent(context, HomeActivity::class.java))
                        (context as? ComponentActivity)?.finish()
                    } else {
                        Toast.makeText(context, "Invalid credentials.", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        },
        onRegisterClick = {
            val intent = Intent(context, RegisterActivity::class.java)
            context.startActivity(intent)
            (context as? ComponentActivity)?.finish()
        }
    )
}

@Composable
fun LoginScreen(
    onLoginClick: (String, String) -> Unit,
    onRegisterClick: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo
        Image(
            painter = painterResource(id = R.drawable.logo), // Replace with your logo resource
            contentDescription = "App Logo",
            modifier = Modifier
                .size(150.dp) // Increased size
                .padding(bottom = 24.dp)
        )

        // Title
        Text("Login", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(24.dp))

        // Input Fields
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(24.dp))

        // Login Button
        Button(
            onClick = { onLoginClick(email, password) },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Red) // Red button
        ) {
            Text("LOGIN", color = Color.White) // Capitalized text
        }
        Spacer(modifier = Modifier.height(12.dp))

        // Register Navigation
        TextButton(onClick = onRegisterClick) {
            Text("Don't have an account? Register")
        }
    }
}