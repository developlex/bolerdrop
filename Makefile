SHELL := /bin/bash

.PHONY: cp-up cp-down cp-health cp-logs

cp-up:
	docker compose -f control-plane/docker-compose.yml up -d --build

cp-down:
	docker compose -f control-plane/docker-compose.yml down --remove-orphans

cp-health:
	bash infra/scripts/health-check.sh

cp-logs:
	docker compose -f control-plane/docker-compose.yml logs -f
