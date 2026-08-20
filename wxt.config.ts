import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Clipclap",
    description: "Local-first web clipper: rewrite clips and save as notes or text",
    permissions: [
      "activeTab",
      "contextMenus",
      "storage",
      "sidePanel",
      "scripting",
      "windows",
    ],
    host_permissions: ["https://openrouter.ai/*", "<all_urls>"],
    action: {
      default_title: "Clipclap",
    },
    commands: {
      "clip-page": {
        suggested_key: {
          default: "Alt+Shift+C",
        },
        description: "Clip current page with Clipclap",
      },
      "clip-selection": {
        suggested_key: {
          default: "Alt+Shift+S",
        },
        description: "Clip selection with Clipclap",
      },
    },
  },
});
