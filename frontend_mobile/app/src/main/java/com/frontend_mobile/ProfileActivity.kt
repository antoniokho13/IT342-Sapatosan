package com.frontend_mobile

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.frontend_mobile.api.ApiResponse
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityProfileBinding
import com.frontend_mobile.models.User
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProfileBinding
    private var userId: String? = null
    private var currentUser: User? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 🔑 Retrieve userId from SharedPreferences
        val sharedPrefs = getSharedPreferences("user_session", Context.MODE_PRIVATE)
        userId = sharedPrefs.getString("user_id", null)

        if (userId == null) {
            Toast.makeText(this, "User not logged in.", Toast.LENGTH_SHORT).show()
            Log.e("ProfileActivity", "user_id is null. Check SharedPreferences.")
            finish()
            return
        } else {
            Log.d("ProfileActivity", "Retrieved user_id: $userId")
        }

        // Fetch user details from the backend
        fetchUserDetails()

        // Save changes when the button is clicked
        binding.btnSave.setOnClickListener {
            saveUserDetails()
        }
    }

    private fun fetchUserDetails() {
        val userId = getSharedPreferences("user_session", MODE_PRIVATE).getString("user_id", null)

        if (userId.isNullOrEmpty()) {
            Toast.makeText(this, "User ID not found. Please login again.", Toast.LENGTH_SHORT).show()
            return
        }

        RetrofitClient.instance.getUserDetails(userId).enqueue(object : Callback<User> {
            override fun onResponse(call: Call<User>, response: Response<User>) {
                if (response.isSuccessful) {
                    val user = response.body()
                    if (user != null) {
                        binding.editFirstName.setText(user.firstName)
                        binding.editLastName.setText(user.lastName)
                        binding.editEmail.setText(user.email)
                    } else {
                        Toast.makeText(this@ProfileActivity, "User details not found.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@ProfileActivity, "Failed to fetch user details.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<User>, t: Throwable) {
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

        val sharedPrefs = getSharedPreferences("user_session", MODE_PRIVATE)
        val userId = sharedPrefs.getString("user_id", null)

        if (userId.isNullOrEmpty()) {
            Toast.makeText(this, "User ID not found. Please login again.", Toast.LENGTH_SHORT).show()
            return
        }

        val updatedUser = User(
            firstName = firstName,
            lastName = lastName,
            email = email,
            password = if (password.isNotEmpty()) password else currentUser?.password,
            role = currentUser?.role ?: "USER"
        )

        userId?.let { id ->
            RetrofitClient.instance.updateUserDetails(id, updatedUser).enqueue(object : Callback<ApiResponse> {
                override fun onResponse(call: Call<ApiResponse>, response: Response<ApiResponse>) {
                    if (response.isSuccessful) {
                        response.body()?.let { apiResponse ->
                            if (apiResponse.success) {
                                Toast.makeText(this@ProfileActivity, "Profile updated successfully!", Toast.LENGTH_SHORT).show()
                            } else {
                                val errorMessage = apiResponse.message ?: "Unexpected response format."
                                Toast.makeText(this@ProfileActivity, "Error: $errorMessage", Toast.LENGTH_SHORT).show()
                            }
                        } ?: run {
                            Toast.makeText(this@ProfileActivity, "Profile updated successfully!", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        val errorBody = response.errorBody()?.string() ?: "Unknown error."
                        Toast.makeText(this@ProfileActivity, "Failed to update: $errorBody", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<ApiResponse>, t: Throwable) {
                    Toast.makeText(this@ProfileActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }
}
