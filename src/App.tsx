import { ThemeToggle } from "@/components/ui/theme";
import { ThemeProvider } from 'next-themes';

function App() {
  return (
    <ThemeProvider attribute="class">
      <div className="max-w-xl mx-auto my-12 rounded-lg border p-8">
        <h1 className="text-2xl font-bold mb-4">Custom Registry</h1>
      <p>Add your custom components here to preview them.</p>

        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}

export default App;
