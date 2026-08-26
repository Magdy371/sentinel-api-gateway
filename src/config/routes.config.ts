export interface routeConfig {
    /** Path prefix matched against the incoming request, e.g. "/api/users". */
    prefix: string,
    /** Base URL of the upstream microservice this prefix forwards to. */
    target: string;
}

/**
 * Static route table for the demo. In a larger deployment this would be
 * loaded from Redis/a config service and support hot-reloading without
 * a gateway restart.
 */

export const routeTable: routeConfig[] = [
    { prefix: "/api/users", target: process.env.USERS_SERVICE_URL || "http://localhost:4001" },
    { prefix: "/api/orders", target: process.env.ORDERS_SERVICE_URL || "http://localhost:4002" },
    { prefix: "/api/inventory", target: process.env.INVENTORY_SERVICE_URL || "http://localhost:4003" },
]

// Longest-prefix-first so "/api/users/admin" can't accidentally match a
// broader "/api" entry before a more specific one.
const sortedRoutes = [...routeTable].sort((a,b)=> b.prefix.length - a.prefix.length);

export function resolveTarget(path:string):routeConfig | undefined {
    return sortedRoutes.find((route) => path.startsWith(route.prefix));
}