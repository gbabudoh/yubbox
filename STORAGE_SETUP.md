# Storage Setup Guide: MinIO + imgproxy + CDN

This guide explains how to set up the self-hosted storage solution using MinIO, imgproxy, and CDN for the Yubbox application.

## Architecture Overview

- **MinIO**: S3-compatible object storage for storing original images
- **imgproxy**: Fast image processing and optimization server
- **CDN**: Content Delivery Network (optional, for faster global delivery)

## Prerequisites

- Docker and Docker Compose (recommended) OR
- Direct installation of MinIO and imgproxy on your VPS

## Option 1: Docker Compose Setup (Recommended)

Create a `docker-compose.yml` file in your project root or a separate directory:

```yaml
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    container_name: yubbox-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  imgproxy:
    image: darthsim/imgproxy:latest
    container_name: yubbox-imgproxy
    ports:
      - "8080:8080"
    environment:
      IMGPROXY_BIND: ":8080"
      IMGPROXY_LOCAL_FILESYSTEM_ROOT: /
      IMGPROXY_USE_S3: "true"
      IMGPROXY_S3_ENDPOINT: "http://minio:9000"
      IMGPROXY_S3_REGION: "us-east-1"
      IMGPROXY_S3_BUCKET: "yubbox-images"
      IMGPROXY_S3_ACCESS_KEY: "minioadmin"
      IMGPROXY_S3_SECRET_KEY: "minioadmin123"
      # Optional: Enable signature for security
      # IMGPROXY_KEY: "your-32-byte-hex-key"
      # IMGPROXY_SALT: "your-32-byte-hex-salt"
    depends_on:
      - minio
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  minio_data:
```

### Starting the Services

```bash
docker-compose up -d
```

### Accessing MinIO Console

1. Open http://localhost:9001 (or your VPS IP:9001)
2. Login with:
   - Username: `minioadmin`
   - Password: `minioadmin123`
3. Create a bucket named `yubbox-images`
4. Set bucket policy to allow public read access (for imgproxy)

## Option 2: Manual Installation

### Installing MinIO

```bash
# Download MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio

# Run MinIO
MINIO_ROOT_USER=minioadmin MINIO_ROOT_PASSWORD=minioadmin123 ./minio server /data --console-address ":9001"
```

### Installing imgproxy

```bash
# Download imgproxy
wget https://github.com/imgproxy/imgproxy/releases/latest/download/imgproxy-linux-amd64
chmod +x imgproxy-linux-amd64

# Run imgproxy
./imgproxy-linux-amd64 \
  -bind ":8080" \
  -use-s3 \
  -s3-endpoint "http://localhost:9000" \
  -s3-region "us-east-1" \
  -s3-bucket "yubbox-images" \
  -s3-access-key "minioadmin" \
  -s3-secret-key "minioadmin123"
```

## Environment Variables

Add these to your `.env.local` file:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=yubbox-images
MINIO_REGION=us-east-1

# imgproxy Configuration
IMGPROXY_BASE_URL=http://localhost:8080
# Optional: For signed URLs (recommended for production)
IMGPROXY_KEY=your-32-byte-hex-key-here
IMGPROXY_SALT=your-32-byte-hex-salt-here

# CDN Configuration (optional)
# If you have a CDN in front of imgproxy, set this:
CDN_BASE_URL=https://cdn.yourdomain.com
# For client-side usage:
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.yourdomain.com
```

### Generating imgproxy Key and Salt

For production, generate secure keys:

```bash
# Generate 32-byte hex key
openssl rand -hex 32

# Generate 32-byte hex salt
openssl rand -hex 32
```

Update your imgproxy environment variables with these values.

## CDN Setup (Optional)

If you want to use a CDN (like Cloudflare, CloudFront, etc.):

1. Point your CDN to your imgproxy server
2. Set `CDN_BASE_URL` to your CDN domain
3. Configure caching rules in your CDN

Example Cloudflare configuration:
- Origin: `http://your-vps-ip:8080`
- Cache everything: Yes
- Edge cache TTL: 1 month
- Browser cache TTL: 1 week

## Testing the Setup

1. **Test MinIO**:
   ```bash
   curl http://localhost:9000/minio/health/live
   ```

2. **Test imgproxy**:
   ```bash
   curl http://localhost:8080/health
   ```

3. **Test image processing**:
   Upload an image through the application and verify it's stored in MinIO and accessible through imgproxy.

## Production Considerations

1. **Security**:
   - Change default MinIO credentials
   - Enable SSL/TLS for MinIO
   - Use signed URLs in imgproxy
   - Restrict MinIO access to internal network only

2. **Performance**:
   - Use a CDN for global distribution
   - Configure appropriate cache headers
   - Monitor imgproxy performance

3. **Backup**:
   - Regularly backup MinIO data volume
   - Consider replication for high availability

4. **Monitoring**:
   - Set up health checks
   - Monitor disk usage
   - Monitor API response times

## Troubleshooting

### Images not loading
- Check MinIO bucket exists and is accessible
- Verify imgproxy can connect to MinIO
- Check environment variables are correct
- Verify CORS settings if accessing from browser

### imgproxy errors
- Check imgproxy logs: `docker logs yubbox-imgproxy`
- Verify S3 credentials are correct
- Ensure bucket name matches configuration

### MinIO connection issues
- Verify MinIO is running: `docker ps`
- Check network connectivity
- Verify firewall rules allow connections

## Support

For issues specific to:
- **MinIO**: https://docs.min.io/
- **imgproxy**: https://docs.imgproxy.net/
- **This application**: Check the main README.md

