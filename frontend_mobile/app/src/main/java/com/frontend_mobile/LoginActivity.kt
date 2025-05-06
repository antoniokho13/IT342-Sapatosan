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
import android.util.Log // Import Log
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.NetworkCapabilities.*
import androidx.core.content.getSystemService

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
            if (!isNetworkAvailable(context)) { // Check for internet
                Toast.makeText(context, "No internet connection. Please check your network.", Toast.LENGTH_SHORT).show()
                return@LoginScreen // Stop the login attempt
            }

            val loginRequest = LoginRequest(email, password)

            RetrofitClient.instance.loginUser(loginRequest).enqueue(object : Callback<LoginResponse> {
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    if (response.isSuccessful && response.body() != null) {
                        val loginResponse = response.body()!!
                        Log.d("LoginActivity", "Login successful: $loginResponse")
                        Toast.makeText(context, "Login successful!", Toast.LENGTH_SHORT).show()

                        // Save the JWT token and user_id to SharedPreferences
                        RetrofitClient.saveToken(loginResponse.token)
                        val prefs = context.getSharedPreferences("user_session", Context.MODE_PRIVATE)
                        prefs.edit().putString("user_id", loginResponse.userId).apply()
                        RetrofitClient.saveUserId(loginResponse.userId)

                        // Navigate to HomeActivity
                        val intent = Intent(context, HomeActivity::class.java)
                        context.startActivity(intent)
                        (context as? ComponentActivity)?.finish()
                    } else {
                        val errorMessage = response.errorBody()?.string() ?: "Unknown error"
                        Log.e("LoginActivity", "Login failed. Code: ${response.code()}, Message: $errorMessage")
                        when (response.code()) {
                            403 -> {
                                Toast.makeText(
                                    context,
                                    "Login failed. Please check your credentials and try again. If the problem persists, clear app data or contact support.",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                            400 ->  {
                                Toast.makeText(
                                    context,
                                    "Invalid request.  Please check the format of your email and password.",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                            500 -> {
                                Toast.makeText(
                                    context,
                                    "Server error. Please try again later.",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                            else -> {
                                Toast.makeText(context, "Login failed: ${response.message()}", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }

                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    Log.e("LoginActivity", "Error: ${t.message}", t)
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
            painter = painterResource(id = R.drawable.logo),
            contentDescription = "App Logo",
            modifier = Modifier
                .size(150.dp)
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
            colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
        ) {
            Text("LOGIN", color = Color.White)
        }
        Spacer(modifier = Modifier.height(12.dp))

        // Register Navigation
        TextButton(onClick = onRegisterClick) {
            Text("Don't have an account? Register")
        }
    }
}

fun isNetworkAvailable(context: Context): Boolean {
    val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    if (connectivityManager != null) {
        val networkCapabilities = connectivityManager.getNetworkCapabilities(connectivityManager.activeNetwork)
        if (networkCapabilities != null) {
            return when {
                networkCapabilities.hasTransport(TRANSPORT_WIFI) -> {
                    Log.i("Internet", "TRANSPORT_WIFI")
                    true
                }
                networkCapabilities.hasTransport(TRANSPORT_CELLULAR) -> {
                    Log.i("Internet", "TRANSPORT_CELLULAR")
                    true
                }
                networkCapabilities.hasTransport(TRANSPORT_ETHERNET) -> {
                    Log.i("Internet", "TRANSPORT_ETHERNET")
                    true
                }
                // Add other transport types if needed
                else -> false
            }
        }
    }
    Log.e("Internet", "No active network detected")
    return false
}
