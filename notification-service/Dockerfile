# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM amazoncorretto:21-alpine AS builder

WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy Maven descriptor first for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM amazoncorretto:21-alpine AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR from builder stage
COPY --from=builder /app/target/notification-service-1.0.0.jar app.jar

# Change ownership to non-root user
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8085

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
