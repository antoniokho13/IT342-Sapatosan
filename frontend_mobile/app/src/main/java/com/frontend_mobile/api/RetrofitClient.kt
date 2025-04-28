package com.frontend_mobile.api

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import androidx.core.content.edit

@SuppressLint("StaticFieldLeak")
object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:8080"
    private const val PREFS_NAME = "auth_prefs"
    private const val TOKEN_KEY = "jwt_token"
    private const val USER_ID_KEY = "user_id"

    private var context: Context? = null

    fun init(appContext: Context) {
        context = appContext.applicationContext
    }

    private val authInterceptor = Interceptor { chain ->
        val token = getTokenFromPrefs()
        val newRequest: Request = if (token.isNotEmpty()) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        chain.proceed(newRequest)
    }

    private fun getTokenFromPrefs(): String {
        val ctx = context ?: throw IllegalStateException("RetrofitClient.init(context) must be called before usage")
        val prefs: SharedPreferences = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(TOKEN_KEY, "") ?: ""
    }

    private val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .build()
    }

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val instance: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }

    fun getUserIdFromPrefs(): String {
        val ctx = context ?: throw IllegalStateException("RetrofitClient.init(context) must be called before usage")
        val prefs: SharedPreferences = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(USER_ID_KEY, "") ?: ""
    }

    fun saveUserId(userId: String) {
        val prefs = context?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs?.edit()?.putString("user_id", userId)?.apply()
    }

    fun saveToken(token: String) {
        val ctx = context ?: throw IllegalStateException("RetrofitClient.init(context) must be called before usage")
        val prefs: SharedPreferences = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit() { putString(TOKEN_KEY, token) }
    }

    fun clearToken() {
        val ctx = context ?: throw IllegalStateException("RetrofitClient.init(context) must be called before usage")
        val prefs: SharedPreferences = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit() { remove(TOKEN_KEY) }
    }
}
