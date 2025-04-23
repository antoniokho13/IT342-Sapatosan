package com.frontend_mobile

import android.app.Application
import com.frontend_mobile.api.RetrofitClient

class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        RetrofitClient.init(this) // Initialize with app context
    }
}
