require 'redis'
require "aws-sdk"

REDIS_CONFIG = YAML.load(File.open(Rails.root.join("config/redis.yml")))
default = REDIS_CONFIG[:default] || {}
config = default.merge(REDIS_CONFIG[Rails.env]) if REDIS_CONFIG[Rails.env]

# Override redis configuration if ENV url var exists
# For staging and production redis
config = { url: ENV["REDIS_URL"] } if ENV["REDIS_URL"]

Redis.current = Redis.new(config)

# TODO Add callback for expiring keys and delete them in s3
