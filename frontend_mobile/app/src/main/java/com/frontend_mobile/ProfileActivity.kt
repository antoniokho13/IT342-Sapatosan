package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.frontend_mobile.api.ApiResponse
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.models.User
import com.frontend_mobile.databinding.ActivityProfileBinding
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Fetch user details from the database
        fetchUserDetails()

        // Save changes when the button is clicked
        binding.btnSave.setOnClickListener {
            saveUserDetails()
        }
    }

    private fun fetchUserDetails() {
        RetrofitClient.instance.getUserDetails("me").enqueue(object : Callback<User> {
            override fun onResponse(call: Call<User>, response: Response<User>) {
                if (response.isSuccessful) {
                    val user = response.body()
                    if (user != null) {
                        // Update UI with user details
                        binding.editFirstName.setText(user.firstName)
                        binding.editLastName.setText(user.lastName)
                        binding.editEmail.setText(user.email)
                    } else {
                        Toast.makeText(this@ProfileActivity, "User details not found.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    // Log error for debugging
                    println("Error response: ${response.errorBody()?.string()}")
                    Toast.makeText(this@ProfileActivity, "Failed to fetch user details.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<User>, t: Throwable) {
                // Log failure for debugging
                println("API call failed: ${t.message}")
                Toast.makeText(this@ProfileActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun saveUserDetails() {
        val firstName = binding.editFirstName.text.toString()
        val lastName = binding.editLastName.text.toString()
        val email = binding.editEmail.text.toString()
        val password = binding.editPassword.text.toString()
        val confirmPassword = binding.editConfirmPassword.text.toString()

        if (password.isNotEmpty() && password != confirmPassword) {
            Toast.makeText(this, "Passwords do not match!", Toast.LENGTH_SHORT).show()
            return
        }

        val updatedUser = User(
            firstName = firstName,
            lastName = lastName,
            email = email, // Include updated email
            password = if (password.isNotEmpty()) password else null
        )

        RetrofitClient.instance.updateUserDetails("me", updatedUser).enqueue(object : Callback<ApiResponse> {
            override fun onResponse(call: Call<ApiResponse>, response: Response<ApiResponse>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@ProfileActivity, "Profile updated successfully!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@ProfileActivity, "Failed to update profile: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<ApiResponse>, t: Throwable) {
                Toast.makeText(this@ProfileActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}