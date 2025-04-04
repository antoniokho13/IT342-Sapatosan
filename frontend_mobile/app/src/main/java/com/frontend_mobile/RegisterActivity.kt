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

class RegisterActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface {
                    RegisterScreenWithActions()
                }
            }
        }
    }
}

@Composable
fun RegisterScreenWithActions() {
    val context = LocalContext.current

    RegisterScreen(
        onRegisterClick = { firstName, lastName, email, password ->
            // Handle registration logic here
            // This could be a call to your backend API or Firebase Auth
            Toast.makeText(
                context,
                "Registered: $firstName $lastName with $email",
                Toast.LENGTH_SHORT
            ).show()

            // Navigate to main screen after successful registration
            // For example:
            // val intent = Intent(context, MainActivity::class.java)
            // context.startActivity(intent)
        },
        onGoogleClick = {
            // Handle Google sign-in
            Toast.makeText(context, "Google Sign-in clicked", Toast.LENGTH_SHORT).show()
        },
        onFacebookClick = {
            // Handle Facebook sign-in
            Toast.makeText(context, "Facebook Sign-in clicked", Toast.LENGTH_SHORT).show()
        },
        onLoginClick = {
            // Navigate to login screen
            val intent = Intent(context, LoginActivity::class.java)
            context.startActivity(intent)
            (context as? ComponentActivity)?.finish() // Optional: close register activity
        }
    )
}