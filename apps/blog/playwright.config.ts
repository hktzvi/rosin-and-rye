import { defineConfig, devices } from "@playwright/test";

const port = 5173;

export default defineConfig({
  testDir: "./tests-e2e",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${port}`,
    viewport: { width: 1050, height: 800 },
  },
  webServer: {
    command: "npm run start",
    port,
    reuseExistingServer: true,
    timeout: 60 * 1000,
  },
});
