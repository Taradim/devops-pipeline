# DevOps Pipeline - Docker Setup with Neon Database

This application uses Docker and Docker Compose to manage development and production environments with Neon Database integration.

## Architecture Overview

- **Development**: Uses Neon Local (Docker container) for ephemeral database branches
- **Production**: Connects directly to Neon Cloud Database

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Neon Cloud account with API credentials
- Node.js 20+ (for local development without Docker)

## Quick Start

### Development Environment

1. **Create environment file**:
   ```bash
   cp .env.development.example .env.development
   ```

2. **Configure Neon credentials** in `.env.development`:
   ```env
   NEON_API_KEY=your_neon_api_key_here
   NEON_PROJECT_ID=your_neon_project_id_here
   ```
   
   Get these values from [Neon Console](https://console.neon.tech)

3. **Start the development environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml --env-file .env.development up --build
   ```

4. **Access the application**:
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health
   - Database (for Drizzle Studio): `postgres://neon:npg@localhost:5432/neondb`

5. **Stop the environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Production Environment

1. **Create environment file**:
   ```bash
   cp .env.production.example .env.production
   ```

2. **Configure production database URL** in `.env.production`:
   ```env
   DATABASE_URL=postgres://user:password@your-project.neon.tech/neondb?sslmode=require
   ```
   
   Get this from your Neon Cloud project settings.

3. **Start the production environment** (for local testing):
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up --build
   ```

4. **Stop the environment**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

## Environment Variables

### Development (.env.development)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEON_API_KEY` | Your Neon Cloud API key | Yes |
| `NEON_PROJECT_ID` | Your Neon Cloud project ID | Yes |
| `PARENT_BRANCH_ID` | Parent branch ID to create ephemeral branch from | Optional (uses default branch if not set) |
| `NODE_ENV` | Set to `development` | Optional (default: development) |
| `PORT` | Application port | Optional (default: 3000) |

**Notes**: 
- `DATABASE_URL` is automatically configured in `docker-compose.dev.yml` to point to Neon Local.
- `PARENT_BRANCH_ID` is optional. If not specified, Neon Local uses your project's default branch. If you need to create branches from a specific parent branch, set this variable.
- `PARENT_BRANCH_ID` and `BRANCH_ID` are mutually exclusive (use only one).

### Production (.env.production)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Full Neon Cloud database connection string | Yes |
| `NODE_ENV` | Set to `production` | Optional (default: production) |
| `PORT` | Application port | Optional (default: 3000) |
| `JWT_SECRET` | JWT signing secret | Yes (if using auth) |
| Other secrets | Add as needed | - |

## How It Works

### Development Mode

1. **Neon Local Container**: 
   - Runs the Neon Local proxy service
   - Automatically creates ephemeral database branches
   - Exposes PostgreSQL on port 5432
   - Branches are deleted when container stops

2. **Application Container**:
   - Connects to `neon-local:5432` via Docker network
   - Hot-reload enabled via volume mounts
   - Uses `node --watch` for automatic restarts

3. **Network**:
   - Both containers run in the same Docker network
   - Service name `neon-local` resolves to the Neon Local container
   - No need for `localhost` - use service names directly

### Production Mode

1. **Application Container**:
   - Connects directly to Neon Cloud via `DATABASE_URL`
   - No Neon Local proxy
   - Code is baked into the image (no volumes)
   - Optimized production image (smaller size)

2. **Database Connection**:
   - Uses the full Neon Cloud connection string
   - SSL/TLS required (`sslmode=require`)
   - Connection pooling handled by Neon serverless driver

## Database Migrations

### Running Migrations in Development

```bash
# Enter the application container
docker-compose -f docker-compose.dev.yml exec app sh

# Run migrations
npm run db:migrate
```

### Running Migrations in Production

```bash
# Enter the application container
docker-compose -f docker-compose.prod.yml exec app sh

# Run migrations
npm run db:migrate
```

**Note**: In production, consider running migrations as part of your CI/CD pipeline rather than manually.

## Drizzle Studio (Database GUI)

### Development

Drizzle Studio can connect to Neon Local:

```bash
# From your local machine (not in container)
npm run db:studio
```

Configure Drizzle Studio to use: `postgres://neon:npg@localhost:5432/neondb`

### Production

Connect Drizzle Studio directly to your Neon Cloud database using the production `DATABASE_URL`.

## Troubleshooting

### Container won't start

1. **Check logs**:
   ```bash
   docker-compose -f docker-compose.dev.yml logs
   ```

2. **Verify environment variables**:
   ```bash
   docker-compose -f docker-compose.dev.yml config
   ```

3. **Check Neon Local health**:
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

### Database connection errors

1. **Development**: Ensure Neon Local container is healthy:
   ```bash
   docker-compose -f docker-compose.dev.yml ps neon-local
   ```

2. **Production**: Verify `DATABASE_URL` is correct and accessible from your network.

### Port conflicts

If port 3000 or 5432 are already in use:

1. **Change application port** in `docker-compose.*.yml`:
   ```yaml
   ports:
     - '3001:3000'  # Host:Container
   ```

2. **Change database port** (dev only):
   ```yaml
   ports:
     - '5433:5432'
   ```

## Production Deployment

This `docker-compose.prod.yml` is suitable for local production testing. For actual production deployments:

1. **Use orchestration tools**: Kubernetes, AWS ECS, Docker Swarm
2. **Secrets management**: Use AWS Secrets Manager, HashiCorp Vault, or similar
3. **Environment variables**: Inject via orchestration platform, not `.env` files
4. **Health checks**: Use container health checks for automatic restarts
5. **Logging**: Configure centralized logging (CloudWatch, ELK, etc.)
6. **Monitoring**: Set up APM tools (Datadog, New Relic, etc.)

## Security Best Practices

1. **Never commit** `.env.development` or `.env.production` to version control
2. **Use secrets management** in production (AWS Secrets Manager, etc.)
3. **Rotate credentials** regularly
4. **Use least privilege** for database users
5. **Enable SSL/TLS** for all database connections (production)
6. **Scan images** for vulnerabilities: `docker scan <image-name>`

## Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Cloud Console](https://console.neon.tech)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

