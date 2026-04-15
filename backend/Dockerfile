# ═══════════════════════════════════════════════════════════════
#  Stage 1 — BUILD
#  Use a full JDK image to compile the Spring Boot app with Maven
# ═══════════════════════════════════════════════════════════════
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copy Maven wrapper and pom first (layer-cache: only re-downloads deps if pom changes)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Fix Windows CRLF line endings so mvnw runs on Linux
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ═══════════════════════════════════════════════════════════════
#  Stage 2 — RUN
#  Use a slim JRE-only image for the final container (smaller size)
# ═══════════════════════════════════════════════════════════════
FROM eclipse-temurin:21-jre

WORKDIR /app

# Create uploads directory (for resume PDFs)
RUN mkdir -p /app/uploads

# Copy only the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects $PORT — expose 8080 as default
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]