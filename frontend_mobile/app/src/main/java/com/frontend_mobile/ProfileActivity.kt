package com.frontend_mobile

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.frontend_mobile.api.ApiResponse
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityProfileBinding
import com.frontend_mobile.models.User
import com.google.android.material.snackbar.Snackbar
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException

class ProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProfileBinding
    private var userId: String? = null
    private var currentUser: User? = null
    private val TAG = "ProfileActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Retrieve userId from SharedPreferences
        userId = getSharedPreferences("user_session", Context.MODE_PRIVATE).getString("user_id", null)

        if (userId == null) {
            showError("User not logged in.") // Use showError
            Log.e(TAG, "user_id is null. Check SharedPreferences.")
            finish()
            return
        } else {
            Log.d(TAG, "Retrieved user_id: $userId")
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
            showError("User ID not found. Please login again.") // Use showError
            return
        }

        RetrofitClient.instance.getUserDetails(userId).enqueue(object : Callback<User> {
            override fun onResponse(call: Call<User>, response: Response<User>) {
                if (response.isSuccessful) {
                    val user = response.body()
                    if (user != null) {
                        currentUser = user
                        binding.editFirstName.setText(user.firstName)
                        binding.editLastName.setText(user.lastName)
                        binding.editEmail.setText(user.email)
                    } else {
                        showError("User details not found.") // Use showError
                    }
                } else {
                    showError("Failed to fetch user details.") // Use showError
                }
            }

            override fun onFailure(call: Call<User>, t: Throwable) {
                Log.e(TAG, "Error fetching user details: ${t.message}", t)
                showError("Error: ${t.message}") // Use showError
            }
        })
    }

    private fun saveUserDetails() {
        val firstName = binding.editFirstName.text.toString().trim()
        val lastName = binding.editLastName.text.toString().trim()
        val email = binding.editEmail.text.toString().trim()
        val password = binding.editPassword.text.toString().trim()
        val confirmPassword = binding.editConfirmPassword.text.toString().trim()

        if (password.isNotEmpty() && password != confirmPassword) {
            showError("Passwords do not match!") // Use showError
            return
        }

        val sharedPrefs = getSharedPreferences("user_session", MODE_PRIVATE)
        val userId = sharedPrefs.getString("user_id", null)

        if (userId.isNullOrEmpty()) {
            showError("User ID not found. Please login again.") // Use showError
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
            RetrofitClient.instance.updateUserDetails(id, updatedUser)
                .enqueue(object : Callback<ApiResponse> { // Changed to ApiResponse
                    override fun onResponse(
                        call: Call<ApiResponse>,
                        response: Response<ApiResponse>
                    ) {
                        if (response.isSuccessful) {
                            val apiResponse = response.body()
                            if (apiResponse != null) {
                                if (apiResponse.success) {
                                    showMessage(apiResponse.message ?: "Profile updated successfully!") // Use showMessage
                                    finish()
                                } else {
                                    showError(apiResponse.message ?: "Failed to update profile") // Use showError
                                    Log.e(TAG, "Failed to update profile: ${apiResponse.message}")
                                }
                            } else {
                                showMessage("Profile updated successfully, but the response was empty.") // Use showMessage
                                finish()
                            }
                        } else {
                            handleErrorResponse(response) // Extract error handling
                        }
                    }

                    override fun onFailure(call: Call<ApiResponse>, t: Throwable) { // Changed to ApiResponse
                        Log.e(TAG, "Error updating profile: ${t.message}", t)
                        showError("Error: ${t.message}") // Use showError
                    }
                })
        }
    }

    private fun showError(message: String) {
        showSnackbar(message, Snackbar.LENGTH_LONG)
    }

    private fun showMessage(message: String) {
        showSnackbar(message, Snackbar.LENGTH_SHORT)
    }
    private fun showSnackbar(message: String, duration: Int) { // Added duration parameter
        val rootView = findViewById<View>(android.R.id.content)
        Snackbar.make(rootView, message, duration).show()
    }

    private fun handleErrorResponse(response: Response<ApiResponse>) { // Extracted error handling
        val errorBody = response.errorBody()
        val errorMessage = if (errorBody != null) {
            try {
                val errorString = errorBody.string()
                Log.e(TAG, "Raw error from server: $errorString")
                errorString
            } catch (e: IOException) {
                val errorString = "Failed to retrieve error message"
                Log.e(TAG, "Error parsing error response: ${e.message}, raw error: $errorString")
                errorString
            }
        } else {
            "Failed to update profile"
        }
        Log.e(TAG, "Failed to update profile. Code: ${response.code()}, Error: $errorMessage")
        showError(errorMessage) // Use showError
    }
}

