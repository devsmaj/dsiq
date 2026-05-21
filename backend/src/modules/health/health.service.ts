export function getHealthStatus() {
  return {
    service: "dsiq-backend",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}
