package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

class LoginActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface {
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
            // Handle login logic here
            // This could be a call to your backend API or Firebase Auth
            Toast.makeText(
                context,
                "Logging in with $email",
                Toast.LENGTH_SHORT
            ).show()

            // Navigate to main screen after successful login
            // For example:
            // val intent = Intent(context, MainActivity::class.java)
            // context.startActivity(intent)
        },
        onRegisterClick = {
            // Navigate to register screen
            val intent = Intent(context, RegisterActivity::class.java)
            context.startActivity(intent)
        }
    )
}