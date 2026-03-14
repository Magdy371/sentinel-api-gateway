# Sentinel - API Gateway & Rate-Limiting Proxy

## Overview
Sentinel is a lightweight, high-performance API Gateway built with Express.js. It acts as a reverse proxy that sits in front of backend microservices to manage, authenticate, and monitor incoming API traffic. 

This project was built to demonstrate core backend architecture concepts, including request pipelining, distributed caching, and security enforcement.

## Core Features
* **Dynamic Routing:** Forwards verified requests to target destination services.
* **Authentication Guards:** Validates `x-api-key` headers to ensure only authorized clients can access underlying microservices.
* **Redis-Backed Rate Limiting:** Implements request throttling to prevent abuse and DDoS attacks, tracking client usage in real-time.
* **Asynchronous Audit Logging:** Captures all transaction details (IP, timestamp, target, status) and queues them for storage without blocking the main request thread.
* **Custom Middleware Pipeline:** Utilizes Express middlewares for payload validation, global error handling, and security headers.

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Caching & State:** Redis
* **Testing:** Postman

## Prerequisites
To run this project locally, you will need:
* Node.js (v18+)
* Redis (Easily run via Docker: `docker run --name sentinel-redis -p 6379:6379 -d redis`)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/sentinel-api-gateway.git](https://github.com/your-username/sentinel-api-gateway.git)
   cd sentinel-api-gateway
