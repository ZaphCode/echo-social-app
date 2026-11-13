# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios + android — one shared React Native (Expo) codebase with a single design language on both. Native affordances (safe areas, back gestures, tab bar) are respected per OS.

## Users

- **Clientes**: people in a city who need a technical/home service (plumbing, electrical, carpentry, painting, gardening, cleaning, A/C installation, masonry, flooring, septic cleaning). They search, request, negotiate and review.
- **Profesionales (proveedores)**: tradespeople who publish services with photos and a base price, apply to clients' posted jobs, negotiate and get rated. A professional can also hire like a client. Role is chosen at sign-up and cannot change.

## Product Purpose

Echo connects supply and demand of local technical services in two directions:

- **Servicios**: a professional publishes an offer → a client sends a **solicitud** (initial offer, date, notes).
- **Contrataciones**: a client publishes a need with photos and a budget → professionals **aplican**.

Both open a chat with a negotiation panel (price + date). States: Negociación → Aceptado / Cancelado → Finalizado → Valoración (1–5 stars). Both parties must press the same action for a state change. Echo does not process payments.

Success: a client finds a trusted professional and closes a deal quickly; professionals get steady, well-rated work.

## Positioning

Two-sided, negotiation-first marketplace for neighborhood trades: price and date are negotiated in-chat with explicit, mutual state changes, and it keeps working offline (local SQLite, queued messages and actions that sync on reconnect).

## Constraints

- Language: Spanish (Mexico). Currency shown as `$` with up to 2 decimals.
- Offline-first: screens must communicate connectivity and per-message sync state (sending, queued, offline, sent, failed/retry).
- Theme: Auto / Claro / Oscuro, all supported.
- Brand asset: the "echo" wordmark with blue sound-wave arcs (`assets/app-logo*.png`). Font in use: Geist.
- The local DB debug screen (SqlViewer) is a developer tool and is out of scope for design.

## Navigation (redesign, confirmed 2026-11-12)

- Bottom tabs: Inicio · Solicitudes · (+ Publicar) · Mapa · Perfil. The map tab is pending integration.
- Notifications move from the tab bar to the top-right of the header, with an unread badge.
- The central + opens a choice: publish a service (professionals only) or a contratación.
