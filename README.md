# Tailwind Layout Preview

## Overview

This project provides a user-friendly interface to preview various Tailwind CSS layout components and easily copy their corresponding HTML code. It leverages Next.js for the frontend, Shadcn/ui for UI components, and features a dynamic 3D background using Three.js.

The primary goal is to accelerate frontend development by offering a categorized library of ready-to-use layout patterns.

## Key Features

*   **Layout Library:** Browse a wide range of pre-built Tailwind CSS layouts.
*   **Live Preview:** See how layouts render in an isolated iframe environment.
*   **Categorized Sidebar:** Layouts are organized into logical categories (Hero, Features, CTA, etc.) in an accordion-style sidebar for easy navigation.
*   **Code Copying:** Quickly copy the clean HTML source code for any selected layout with a single click.
*   **Dark Mode:** Supports light, dark, and system themes for comfortable viewing.
*   **Responsive Design:** The application interface is responsive.
*   **3D Animated Background:** Includes a subtle, animated particle background using Three.js.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd tailwind-layout-preview
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser to view the application.

## Project Structure

*   `src/app/`: Contains the main application pages and layout (using Next.js App Router).
    *   `page.tsx`: The main page displaying the sidebar and preview area.
    *   `layout.tsx`: The root layout for the application.
    *   `globals.css`: Global styles and Tailwind CSS theme configuration (HSL variables).
    *   `api/layout/[name]/route.ts`: API route to fetch layout content dynamically.
*   `src/components/`: Reusable React components.
    *   `ui/`: Components generated by Shadcn/ui.
    *   `layout-preview.tsx`: Component responsible for displaying the iframe preview and handling layout selection.
    *   `header.tsx`: The main application header.
    *   `three-background.tsx`: The 3D animated background component.
    *   `dark-mode-toggle.tsx`: Theme switching component.
*   `src/layouts/`: Stores the raw HTML files for each layout component. Files are named descriptively (e.g., `Hero Section Simple Centered.html`).
*   `src/lib/`: Utility functions.
    *   `layouts.ts`: Server-side functions for reading layout files.
    *   `utils.ts`: General utility functions (like `cn` for class names).
*   `src/hooks/`: Custom React hooks.
    *   `use-toast.ts`: Hook for displaying toast notifications.
*   `public/`: Static assets (if any).
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `next.config.ts`: Next.js configuration.

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn/ui, Radix UI Primitives
*   **Language:** TypeScript
*   **3D Graphics:** Three.js
*   **Icons:** Lucide React
*   **State Management (UI):** React Hooks (useState, useEffect, etc.)
*   **(Potentially) AI:** Genkit (if AI features are implemented)
