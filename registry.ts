import { RegistryEntry } from "./scripts/schema";

/**
 * Registry of themes and UI components.
 * This file defines the color schemes and dependencies for the UI components.
 */
const registry: RegistryEntry[] = [
  {
    name: "theme-vaporwave",
    type: "registry:theme",
    cssVars: {
      light: {
        background: "210 50% 96%",
        foreground: "210 50% 20%",
        primary: "210 50% 60%",
        "primary-foreground": "210 50% 10%",
        secondary: "180 40% 70%",
        "secondary-foreground": "180 40% 30%",
        accent: "300 60% 50%",
        "accent-foreground": "300 60% 20%",
        destructive: "0 80% 50%",
        "destructive-foreground": "0 0% 100%",
        muted: "210 30% 80%",
        "muted-foreground": "210 50% 30%",
        card: "210 40% 90%",
        "card-foreground": "210 50% 25%",
        popover: "0 0% 100%",
        "popover-foreground": "240 10% 5%",
        border: "210 50% 50%",
        input: "210 50% 50%",
        ring: "210 50% 40%",
        "chart-1": "200 30% 40%",
        "chart-2": "220 35% 45%",
        "chart-3": "240 40% 50%",
        "chart-4": "260 45% 55%",
        "chart-5": "280 50% 60%",
      },
      dark: {
        background: "210 50% 10%",
        foreground: "210 50% 90%",
        primary: "210 50% 70%",
        "primary-foreground": "210 50% 20%",
        secondary: "180 40% 60%",
        "secondary-foreground": "180 40% 40%",
        accent: "300 60% 60%",
        "accent-foreground": "300 60% 30%",
        destructive: "0 80% 40%",
        "destructive-foreground": "0 0% 90%",
        muted: "210 30% 20%",
        "muted-foreground": "210 50% 70%",
        card: "210 40% 15%",
        "card-foreground": "210 50% 80%",
        popover: "0 0% 10%",
        "popover-foreground": "240 10% 90%",
        border: "210 50% 30%",
        input: "210 50% 30%",
        ring: "210 50% 20%",
        "chart-1": "200 30% 20%",
        "chart-2": "220 35% 25%",
        "chart-3": "240 40% 30%",
        "chart-4": "260 45% 35%",
        "chart-5": "280 50% 40%",
      },
    },
  },
  {
    name: "theme",
    type: "registry:ui",

    // shadcn-ui components that this component depends on
    registryDependencies: ["button", "dropdown-menu"],

    // npm dependencies that this component depends on
    dependencies: ["next-themes", "@radix-ui/react-icons"],
    devDependencies: [],

    // Tailwind CSS config
    tailwind: {
      config: {},
    },

    // CSS variables
    cssVars: {},

    // Files that make up this component in your src/components/ui folder
    files: ["theme.tsx"],
  },
];
export default registry;
