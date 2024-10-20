import { RegistryEntry } from "./scripts/schema";

const registry: RegistryEntry[] = [
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
