package main

import (
	"fmt"
	"os"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// DatabaseConfig holds configuration for database connections
type DatabaseConfig struct {
	Host     string
	Port     string
	Database string
	Username string
	Password string
}

// NewDatabaseConfig creates a new database configuration from environment variables
func NewDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		Host:     getEnv("CLICKHOUSE_HOST", "clickhouse.auch.cool"),
		Port:     getEnv("CLICKHOUSE_PORT", "9000"),
		Database: getEnv("CLICKHOUSE_DB", "mvg"),
		Username: getEnv("CLICKHOUSE_USER", "mvgobserver"),
		Password: os.Getenv("CLICKHOUSE_PASSWORD"),
	}
}

// connectClickhouse establishes a connection to ClickHouse database
func connectClickhouse() driver.Conn {
	config := NewDatabaseConfig()
	
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{fmt.Sprintf("%s:%s", config.Host, config.Port)},
		Auth: clickhouse.Auth{
			Database: config.Database,
			Username: config.Username,
			Password: config.Password,
		},
	})
	if err != nil {
		panic(fmt.Errorf("failed to connect to ClickHouse: %w", err))
	}
	
	// Verify connection by getting server version
	version, err := conn.ServerVersion()
	if err != nil {
		panic(fmt.Errorf("failed to get ClickHouse server version: %w", err))
	}
	
	fmt.Printf("Connected to ClickHouse server version: %s\n", version.String())
	return conn
}

// getEnv returns environment variable value or default if not set
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}