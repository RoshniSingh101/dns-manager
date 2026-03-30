# DNS Manager

A professional, full-stack DNS Server and Management Dashboard, where you can create private DNS networks and custom domains (i.e. `dev.local`) to resolve to any IP address you choose, all managed through React.

---

## Project Architecture

Three core components:
1. **The DNS Engine (UDP/1053):** A Node.js server that listens for DNS queries, parses binary packets, and responds with IP addresses from the database.
2. **The Management API (TCP/3000):** An Express.js server that acts as the bridge between the UI and the SQLite database.
3. **The Dashboard (TCP/3001):** A Next.js (React) UI for managing records and viewing live traffic logs.

---

## Recursive Forwarding (Internet Access)

The server supports **Recursive Lookups**, meaning that it can handle both private records and real-world websites.

### How it works:
1. **Local Check:** The engine first checks `records.db` for a match.
2. **Upstream Forward:** If no local record is found, the server transparently forwards the request to Google DNS (`8.8.8.8`).
3. **Response:** The internet's response is passed back to your device.

### Use Case:
You can set your computer's DNS settings to `127.0.0.1`. 
- Browsing to `dev.local` will hit your private IP.
- Browsing to `google.com` will still work perfectly via the forwarder.

---

## Getting Started (Docker)

1. **Clean up local environment**:
   ```bash
   rm -rf client/node_modules server/node_modules
   ```
2. **Build and Start**:
    ```bash
   docker-compose up --build --force_recreate
   ```
3. **Access the dashboard**
Open http://localhost:3001 in your browser.

---

### 4. How to Test Your Server

Once both the Frontend and Backend are running, perform the following steps:

1. **Add a Record:**
   - In the Dashboard (port 3001), enter `dev.local` in the Domain field.
   - Enter `127.0.0.1` in the IP field.
   - Click **Add Record**.
2. **Verify Database:**
   - Check the "Active Records" table in the UI to ensure it appeared.
3. **Perform a DNS Lookup:**
   - Open your terminal and run the following commands:
     ```bash
     dig @127.0.0.1 -p 1053 dev.local
     ```

     ```bash
     dig @127.0.0.1 -p 1053 google.com
     ```
4. **Confirm Results:**
   - The `ANSWER SECTION` of the `dig` output should show the IP `127.0.0.1`.
   - The "Live Traffic" section of your UI should show a new log entry for `dev.local` (LOCAL query) and `google.com` (PROXY query).

---
### 5. Troubleshooting

| Error | Cause | Solution |
| :--- | :--- | :--- |
| `EADDRINUSE: :::3000` | A previous instance of the API is still running. | Run `lsof -ti:3000 | xargs kill -9` then restart. |
| `Unexpected token '<'` | The API is offline; React is receiving an HTML 404 page. | Ensure the backend is running and `api.js` is on Port 3000. |
| `records.map is not a function` | The API returned an Error Object instead of an Array. | Check `database.js` to ensure `getAllRecords` is exported correctly. |
| `Connection Timed Out` | The DNS Engine isn't bound to the correct port/IP. | Ensure `dns-engine.js` is using `server.bind(1053, '127.0.0.1')`. |

---

### 6. Directory Structure

```text
.
├── client/                 # Next.js (React) Frontend
│   ├── app/
│   │   └── page.js         # Main Dashboard UI Logic
│   ├── public/             # Static assets (logos, etc.)
│   └── package.json
└── server/                 # Node.js Backend
    ├── dns-engine.js       # UDP Packet handling & DNS logic
    ├── api.js              # Express API for UI communication
    ├── database.js         # SQLite schema and query functions
    ├── records.db          # Persistent SQLite database file
    └── package.json        # Contains concurrent start scripts
```

---

### 7. Security and Best Practices

- **Caching:** Currently, recursive responses are not cached. Every request to a public site hits the upstream provider. For production, consider adding a `cache` table to improve speed.
- **UDP Flood Prevention:** Recursive servers can be used in "DNS Amplification" attacks. Ensure the server is only reachable from your local network (`127.0.0.1` or your LAN IP).
- **Fallback:** If `8.8.8.8` is down, the recursive lookup will fail. You can add `1.1.1.1` as a secondary upstream in `dns-engine.js`.
