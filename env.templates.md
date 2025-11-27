# Environment Variables Templates

Copy these templates to create your environment files. **Never commit these files with real values to version control.**

## .env.development

Create this file in the project root:

```env
# Neon Local Configuration
# Get these values from your Neon Cloud dashboard: https://console.neon.tech
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here

# Application Configuration
NODE_ENV=development
PORT=3000

# Database URL (automatically configured for Neon Local in docker-compose.dev.yml)
# You don't need to set this manually - it's configured in docker-compose.dev.yml
# DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb

# Add other development-specific environment variables below
# Example: JWT_SECRET, API_KEYS, etc.
```

## .env.production

Create this file in the project root:

```env
# Production Database Configuration
# Get this from your Neon Cloud dashboard: https://console.neon.tech
# Format: postgres://user:password@hostname.neon.tech/dbname?sslmode=require
DATABASE_URL=postgres://user:password@your-project.neon.tech/neondb?sslmode=require

# Application Configuration
NODE_ENV=production
PORT=3000

# Security: Add your production secrets here
# NEVER commit this file with real values to version control
# Example:
# JWT_SECRET=your_production_jwt_secret_here
# ARCJET_KEY=your_arcjet_key_here

# Add other production-specific environment variables below
```

## Quick Setup Commands

```bash
# Development
cat > .env.development << 'EOF'
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
NODE_ENV=development
PORT=3000
EOF

# Production
cat > .env.production << 'EOF'
DATABASE_URL=postgres://user:password@your-project.neon.tech/neondb?sslmode=require
NODE_ENV=production
PORT=3000
EOF
```

## Important Notes

1. Replace all placeholder values with your actual credentials
2. Add `.env.development` and `.env.production` to `.gitignore`
3. Use secrets management tools in production (AWS Secrets Manager, etc.)
4. Rotate credentials regularly

