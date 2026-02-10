# ARCHITECTURE_DECISIONS.md (DRAFT)

## 1. Architectural Approach

This project is designed as a platform, not as a single application.

The foundational architectural pattern is:

Control Plane / Instance Plane separation

This separation is a core invariant of the system.

## 2. Control Plane vs Instance Plane

### 2.1 Instance Plane (Shop Instance)

Each store is deployed as a fully isolated instance, containing:

- its own runtime environment,
- its own database,
- its own caching layer,
- its own search/indexing service,
- its own secrets and configuration.

An instance:

- operates autonomously,
- is deployed and updated independently,
- does not share state with other stores.

### 2.2 Control Plane

The control plane is a separate system responsible for:

- maintaining a registry of stores,
- managing store lifecycle operations,
- collecting health and status information,
- triggering safe operational actions.

The control plane does not:

- access store databases,
- access store business data,
- hold store secrets.

## 3. Isolation Modes

Isolation strategy is defined in `docs/ISOLATION_MODES.md`.

Supported modes:

- Mode A: Strict Isolation,
- Mode B: Cost-Optimized Isolation.

Isolation mode is selected per store and impacts infrastructure templates and provisioning policy.

## 4. Shop Agent

Each store instance includes a Shop Agent, a constrained management service.

Responsibilities of the agent:

- expose a minimal management API,
- execute only allow-listed operations,
- act as a strict boundary between Magento runtime and external control.

Design principle:

Control Plane -> Shop Agent -> Magento
Control Plane never communicates with Magento directly.

## 5. Headless Architecture

The storefront is decoupled from the commerce backend.

- Backend: Adobe Commerce (Magento)
- Frontend: React + TypeScript
- Contract: GraphQL API

This approach enables:

- independent UI evolution,
- frontend scalability,
- alignment with modern commerce practices,
- simplified external integrations.

## 6. API Strategy

GraphQL is the primary API for storefront communication.

REST APIs are used for integrations and operational workflows.

Management APIs are exposed only through the Shop Agent.

Direct external access to Magento internal APIs is restricted.

## 7. CI/CD as an Architectural Invariant

All deployments are performed via CI/CD pipelines.

Manual server changes are prohibited.

Runtime artifacts are immutable container images.

Rollbacks are performed by redeploying a previous image version.

CI/CD is treated as a core architectural component, not a tooling detail.

## 8. External Commerce Integrations (ECI)

External systems (e.g. Etsy):

- are not embedded directly into Magento core,
- are implemented via a dedicated integration layer,
- operate asynchronously,
- can be enabled or disabled per store instance.

This minimizes coupling and reduces upgrade risk.

## 9. Documentation as Architecture

Architecture is expressed and enforced through documentation.

Guiding principle:

If a decision is not documented, it does not exist.

All architectural changes must be reflected in documentation.
