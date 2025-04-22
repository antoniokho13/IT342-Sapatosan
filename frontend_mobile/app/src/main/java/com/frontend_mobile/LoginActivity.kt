package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth

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
    val auth = remember { FirebaseAuth.getInstance() }

    LoginScreenContent(
        onLoginClick = { email, password ->
            auth.signInWithEmailAndPassword(email, password)
                .addOnSuccessListener {
                    Toast.makeText(context, "Login successful!", Toast.LENGTH_SHORT).show()
                    context.startActivity(Intent(context, HomeActivity::class.java))
                    (context as? ComponentActivity)?.finish()
                }
                .addOnFailureListener { e ->
                    when (e.localizedMessage) {
                        "There is no user record corresponding to this identifier. The user may have been deleted." -> {
                            Toast.makeText(context, "User not found. Please register first.", Toast.LENGTH_LONG).show()
                        }
                        "The password is invalid or the user does not have a password." -> {
                            Toast.makeText(context, "Invalid password. Please try again.", Toast.LENGTH_LONG).show()
                        }
                        else -> {
                            Toast.makeText(context, "Login failed: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                        }
                    }
                }
        },
        onRegisterClick = {
            context.startActivity(Intent(context, RegisterActivity::class.java))
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
        Text("Login", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(24.dp))

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

        Button(
            onClick = { onLoginClick(email, password) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Login")
        }

        Spacer(modifier = Modifier.height(12.dp))

        TextButton(onClick = onRegisterClick) {
            Text("Don't have an account? Register")
        }
    }
}
