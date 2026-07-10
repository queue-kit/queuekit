import os from "os";

/** LAN IPs of this machine (e.g. 192.168.x.x) — no network call needed, instant. */
export function getLocalNetworkIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

/**
 * Best-effort public IP lookup (useful on cloud servers so the printed URL
 * is actually the address you'd type into your own browser). Never blocks
 * startup and never throws — if there's no internet access or the lookup
 * service is unreachable, it just quietly returns null.
 */
export async function getPublicIP(timeoutMs = 2000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.ip ?? null;
  } catch {
    return null;
  }
}
