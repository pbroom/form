import { cn } from "./lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/theme-toggle";

function App() {
  return (
    <ThemeProvider>
      <div
        className={cn(
          "min-h-screen bg-gradient-to-br from-background to-muted",
          "flex items-center justify-center relative",
          "transition-colors duration-300"
        )}
      >
        <div className="absolute top-6 right-6">
          <ModeToggle />
        </div>
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-lime-600 to-violet-700 dark:from-lime-400 dark:to-violet-500 bg-clip-text text-transparent">
            App Starter
          </h1>
          <p className="text-muted-foreground">
            React 19 | React Compiler | Tailwind CSS 4.1 | Shadcn/ui
          </p>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
