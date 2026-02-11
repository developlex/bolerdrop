SHELL := /bin/bash

INSTANCES ?= 1
START_INDEX ?= 1
NO_INSTALL ?= 0
NO_CONTROL_PLANE ?= 0

.PHONY: cp-up cp-down cp-health cp-logs platform-bootstrap platform-provision

cp-up:
	docker compose -f control-plane/docker-compose.yml up -d --build

cp-down:
	docker compose -f control-plane/docker-compose.yml down --remove-orphans

cp-health:
	bash infra/scripts/health-check.sh

cp-logs:
	docker compose -f control-plane/docker-compose.yml logs -f

platform-bootstrap:
	bash infra/scripts/bootstrap-platform.sh --count $(INSTANCES) --start-index $(START_INDEX) $(if $(filter 1,$(NO_INSTALL)),--no-install,) $(if $(filter 1,$(NO_CONTROL_PLANE)),--no-control-plane,)

platform-provision:
	bash infra/scripts/bootstrap-platform.sh --count $(INSTANCES) --start-index $(START_INDEX) --provision-only
