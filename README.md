# App Starter

A modern React application starter template built with cutting-edge web technologies. This project provides a solid foundation for building beautiful, performant web applications with the latest development practices.

## 🎯 Quick Start

This is a GitHub template repository. To use this template:

1. Click the **"Use this template"** button above
2. Create a new repository from this template
3. Clone your new repository
4. Follow the installation steps below

---

## 🚀 Features

- **React 19** - Latest React with React Compiler for enhanced performance
- **TypeScript** - Full type safety and better developer experience
- **Tailwind CSS 4.1** - Latest version with improved performance and features
- **Vite** - Lightning-fast build tool and development server
- **Shadcn/ui** - Beautiful, accessible component library
- **Dark Mode** - Built-in theme switching with smooth transitions
- **ESLint** - Modern linting configuration
- **Path Aliases** - Clean imports with `@/` prefix

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 4.1.11
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Language**: TypeScript 5.8.3
- **Linting**: ESLint 9.32.0

## 📦 Included Components

- **Theme Provider** - Context-based theme management
- **Theme Toggle** - Dark/light mode switcher
- **Button** - Accessible button component
- **Dropdown Menu** - Interactive dropdown component

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or bun

### Installation

### 1. Use this template

#### Option A: Use GitHub's "Use this template" button

1. Click the green "Use this template" button at the top of this repository
2. Choose "Create a new repository"
3. Name your new repository
4. Clone your new repository

#### Option B: Clone directly

```bash
git clone <your-repo-url>
cd your-project-name
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
# or
bun install
```

### 3. Update project details

Update the following files with your project information:

- `package.json` - Change the name, description, and repository URL
- `README.md` - Update the project title and description
- `src/App.tsx` - Change the app title from "App Starter" to your project name

### 4. Start the development server

```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

### 5. Open your browser and navigate to `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Adding Shadcn/ui Components

This project is configured with Shadcn/ui. To add new components:

```node
npx shadcn@latest add [component-name]
```

or

```bun
bunx --bun shadcn@latest add [component-name]
```

### Theme Customization

The project uses CSS variables for theming. Customize colors in `src/index.css` under the `:root` and `.dark` selectors.

### Styling

- Tailwind CSS 4.1 is configured with the latest features
- CSS variables are used for theme colors
- Responsive design utilities are available
- Custom animations and transitions are supported

## 📁 Project Structure

```directory structure
src/
├── components/
│   ├── ui/           # Shadcn/ui components
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   └── utils.ts      # Utility functions
├── assets/           # Static assets
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
└── index.css        # Global styles and theme
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript configuration
- `components.json` - Shadcn/ui configuration
- `eslint.config.js` - ESLint configuration
- `tailwind.config.js` - Tailwind CSS configuration (if needed)

## 🌟 Key Features

- **Modern Development**: Latest React 19 with React Compiler
- **Performance**: Vite for fast builds and HMR
- **Accessibility**: Built with Radix UI primitives
- **Type Safety**: Full TypeScript support
- **Theme Support**: Dark/light mode with smooth transitions
- **Component Library**: Shadcn/ui for consistent design
- **Developer Experience**: ESLint, path aliases, and modern tooling

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using modern web technologies

# Editor theming and TextMate scopes

## CSS-variable driven theming

- Editor/workbench colors: `--monaco-editor-<kebab>` → `editor.<dots>`
- Monarch tokens: `--monaco-token-<kebab>` → token `<dots>`
- Optional font style per token: add `-font-style`

Light: `:root` values. Dark: `.dark` values.

## TextMate scopes

- Enable in store: `useEditorPreferences().cssVars.textMate.enabled = true`
- Scopes CSS vars: `--tm-scope-<scope-kebab>` (optional `-<lang>` suffix)
  - Example:
    - `--tm-scope-storage-type-function: #ffcc66`
    - `--tm-scope-storage-type-function-tsx: #ffcc66`
  - Optional font style: `--tm-scope-<scope>-font-style: italic`

## Grammars and Onigasm

Place these files under `public/`:

```
public/
  onig.wasm
  grammars/
    JavaScript.tmLanguage.json
    JavaScriptReact.tmLanguage.json
    TypeScript.tmLanguage.json
    TypeScriptReact.tmLanguage.json
    GLSL.tmLanguage.json
```

The app will auto-wire JS, JSX, TS, TSX, and GLSL grammars if present.
