package main

import (
	"context"

	"github.com/redis/go-redis/v9"
)

// RedisClientInterface defines the Redis operations used by EventBroadcaster
type RedisClientInterface interface {
	PSubscribe(ctx context.Context, channels ...string) *redis.PubSub
	Get(ctx context.Context, key string) *redis.StringCmd
	XGroupCreate(ctx context.Context, stream, group, start string) *redis.StatusCmd
	XReadGroup(ctx context.Context, a *redis.XReadGroupArgs) *redis.XStreamSliceCmd
	XAdd(ctx context.Context, a *redis.XAddArgs) *redis.StringCmd
}