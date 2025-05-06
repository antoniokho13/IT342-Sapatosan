package com.frontend_mobile.api

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.core.content.edit
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonPrimitive
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.lang.reflect.Type
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.TimeUnit
import javax.net.ssl.SSLContext
import javax.net.ssl.X509TrustManager
import java.security.cert.X509Certificate
import javax.net.ssl.SSLSocketFactory

@SuppressLint("StaticFieldLeak")
object RetrofitClient {
    private const val TAG = "RetrofitClient"
    private const val BASE_URL = "https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/"
    private const val PREFS_NAME = "auth_prefs"
    private const val TOKEN_KEY = "jwt_token"
    private const val USER_ID_KEY = "user_id"

    private var context: Context? = null

    fun init(appContext: Context) {
        context = appContext.applicationContext
    }

    // Date serializer for consistent date formatting
    class DateSerializer : JsonSerializer<Date>, JsonDeserializer<Date> {
        private val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

        override fun serialize(src: Date?, typeOfSrc: Type?, context: JsonSerializationContext?): JsonElement {
            return src?.let { JsonPrimitive(dateFormat.format(it)) } ?: JsonPrimitive("")
        }

        override fun deserialize(json: JsonElement?, typeOfT: Type?, context: JsonDeserializationContext?): Date {
            val dateStr = json?.asString
            return if (dateStr.isNullOrEmpty()) Date() else {
                try {
                    dateFormat.parse(dateStr) ?: Date()
                } catch (e: Exception) {
                    Log.e(TAG, "Date parsing error: ${e.message}", e)
                    Date()
                }
            }
        }
    }

    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        //check if the request is for login. Do not add header.
        if (originalRequest.url.encodedPath.contains("/api/auth/login")) {
            return@Interceptor chain.proceed(originalRequest)
        }

        val token = getTokenFromPrefs()  // Call the function defined below
        val newRequest: Request = if (token.isNotEmpty()) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }
        chain.proceed(newRequest)
    }

    // Custom Gson for date handling
    private val gson = GsonBuilder()
        .registerTypeAdapter(Date::class.java, DateSerializer())
        .setLenient()
        .create()

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private val unsafeOkHttpClient: OkHttpClient
        get() {
            val trustAllCerts = arrayOf<X509TrustManager>(object : X509TrustManager {
                @SuppressLint("TrustAllX509TrustManager")
                override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}

                @SuppressLint("TrustAllX509TrustManager")
                override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}

                override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            })

            val sslContext: SSLContext = SSLContext.getInstance("SSL")
            sslContext.init(null, trustAllCerts as Array<X509TrustManager>, java.security.SecureRandom()) // Cast is crucial

            val sslSocketFactory: SSLSocketFactory = sslContext.socketFactory

            return OkHttpClient.Builder()
                .sslSocketFactory(sslSocketFactory, trustAllCerts[0])
                .hostnameVerifier { _, _ -> true }
                .addInterceptor(authInterceptor)
                .addInterceptor(loggingInterceptor)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()
        }

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(unsafeOkHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
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
        val ctx = context ?: throw IllegalStateException("RetrofitClient.init(context) must be called before usage")
        val prefs: SharedPreferences = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit { putString(USER_ID_KEY, userId) }
        Log.d(TAG, "Saved user ID: $userId")
    }

    fun saveToken(token: String) {
        val ctx = context ?: throw IllegalStateException("RetrofitClient.init(context) must be called before usage")
        val prefs: SharedPreferences = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit { putString(TOKEN_KEY, token) }
        Log.d(TAG, "Saved authentication token")
    }

    fun clearToken() {
        val ctx = context ?: throw IllegalStateException("RetrofitClient.init(context) must be called before usage")
        val prefs: SharedPreferences = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit {
            remove(TOKEN_KEY)
            remove(USER_ID_KEY)
        }
        Log.d(TAG, "Cleared authentication token and user ID")
    }

    private fun getTokenFromPrefs(): String {  // Define the function here, inside the object
        val ctx = context ?: throw IllegalStateException("RetrofitClient.init(context) must be called before usage")
        val prefs: SharedPreferences = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(TOKEN_KEY, "") ?: ""
    }
}
