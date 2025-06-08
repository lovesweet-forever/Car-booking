module.exports = {
  apps: [
    {
      name: "backend",
      script: "./dist/index.js",        // The entry point after build
      instances: 1,                     // Number of instances (1 = single, 0 = all CPU cores)
      autorestart: true,                // Auto-restart on crash
      watch: false,                     // Don't watch files (for production, set false)
      max_memory_restart: "500M",        // Restart if memory exceeds 500MB
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DB_HOST: "localhost",
        DB_PORT: 3306,
        DB_USERNAME: "booking_user",
        DB_PASSWORD: "your_password",
        DB_NAME: "booking_test"
      }
    }
  ]
};
