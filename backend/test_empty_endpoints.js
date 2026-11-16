const http = require("http");

async function request(path, token = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: `/api${path}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-auth-token": token, Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", (err) => {
      resolve({ status: 500, error: err.message });
    });

    req.end();
  });
}

async function login(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("=== TESTING ALL REAL FRONTEND-CALLED API ENDPOINTS ON EMPTY DATABASE ===\n");

  const adminAuth = await login("admin@embertongroup.com", "admin123");
  const shopperAuth = await login("shopper@embertongroup.com", "shopper123");
  const clientAuth = await login("client@embertongroup.com", "client123");

  const adminToken = adminAuth.token;
  const shopperToken = shopperAuth.token;
  const clientToken = clientAuth.token;

  const endpoints = [
    // Public / Stores
    { path: "/stores/missions", token: null, label: "Public Stores" },
    { path: "/stores/map", token: null, label: "Public Map Stores" },

    // Admin Space Endpoints
    { path: "/missions/admin/all", token: adminToken, label: "Admin Missions All" },
    { path: "/users", token: adminToken, label: "Admin Users List" },
    { path: "/applications", token: adminToken, label: "Admin Applications" },
    { path: "/reports", token: adminToken, label: "Admin Reports" },
    { path: "/paiyments/payment_missions", token: adminToken, label: "Admin Payments Missions" },
    { path: "/dashboardadmin/usersMonth", token: adminToken, label: "Admin Dashboard Users/Month" },
    { path: "/chat_messages", token: adminToken, label: "Admin Chat Messages" },
    { path: "/notifications", token: adminToken, label: "Admin Notifications" },

    // Shopper Space Endpoints
    { path: `/missions/missionsApp/${shopperAuth.user.id}`, token: shopperToken, label: "Shopper Available Missions" },
    { path: `/missions/stats/${shopperAuth.user.id}`, token: shopperToken, label: "Shopper Mission Stats" },
    { path: `/applications/assigned/${shopperAuth.user.id}`, token: shopperToken, label: "Shopper Assigned Missions" },
    { path: `/users/user/${shopperAuth.user.id}`, token: shopperToken, label: "Shopper Completed Reports" },
    { path: `/users/stats/${shopperAuth.user.id}`, token: shopperToken, label: "Shopper Completed Stats" },
    { path: `/bank_info/${shopperAuth.user.id}`, token: shopperToken, label: "Shopper Bank Info" },
    { path: `/user-notifications/${shopperAuth.user.id}`, token: shopperToken, label: "Shopper User Notifications" },

    // Client Space Endpoints
    { path: "/clients/missions", token: clientToken, label: "Client Partner Missions" },
  ];

  let failed = 0;
  for (const ep of endpoints) {
    const res = await request(ep.path, ep.token);
    const ok = res.status >= 200 && res.status < 300;
    const marker = ok ? "✅" : "❌";
    console.log(`${marker} [HTTP ${res.status}] ${ep.label} (${ep.path})`);
    if (!ok) {
      console.error("   Error details:", res.data || res.raw || res.error);
      failed++;
    }
  }

  console.log(`\nResults: ${endpoints.length - failed}/${endpoints.length} endpoints succeeded on empty database.`);
}

run().catch(console.error);
