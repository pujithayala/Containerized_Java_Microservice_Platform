# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM amazoncorretto:21-alpine AS builder

WORKDIR /workspace

# Copy Maven wrapper and POM first to leverage Docker layer caching
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .

# Download dependencies (cached unless pom.xml changes)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM amazoncorretto:21-alpine

LABEL maintainer="platform-team"
LABEL service="api-gateway"
LABEL version="1.0.0"

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the fat JAR from the builder stage
COPY --from=builder /workspace/target/api-gateway-1.0.0.jar app.jar

# Adjust ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# JVM flags optimised for containers (Java 21)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
