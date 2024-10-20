import { ThemeToggle } from "@/components/ui/theme-toggle";

function App() {
  return (
    <div className="max-w-xl mx-auto my-12 rounded-lg border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Custom Registry</h1>
      <p>Add your custom components here to preview them.</p>

      <ThemeToggle />
    </div>
  );
}

export default App;
