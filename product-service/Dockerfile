# ---- Build Stage ----
FROM amazoncorretto:21-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first for layer caching
COPY pom.xml .
COPY .mvn/ .mvn/ 2>/dev/null || true
COPY mvnw . 2>/dev/null || true

# Download dependencies (layer cache)
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Runtime Stage ----
FROM amazoncorretto:21-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built jar from the builder stage
COPY --from=builder /app/target/product-service-1.0.0.jar app.jar

# Change ownership
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]

