#!/bin/bash

# Locate and set JAVA_HOME to Java 21 on macOS
if [ -x /usr/libexec/java_home ]; then
    export JAVA_HOME=$(/usr/libexec/java_home -v 21 2>/dev/null)
    if [ -n "$JAVA_HOME" ]; then
        echo "Using JAVA_HOME: $JAVA_HOME"
    fi
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"


# Define path to the .env file
ENV_FILE="$SCRIPT_DIR/.env"

# Load environment variables from .env if it exists
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE..."
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "Warning: .env file not found at $ENV_FILE. Starting with default/existing environment."
fi

# Run the application
echo "Starting Proxima Backend..."
cd "$SCRIPT_DIR" || exit 1
mvn spring-boot:run
