import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tailwind Layout Previewer",
  description: "Browse and copy Tailwind CSS layouts easily.",
};

export default function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout currently doesn't add extra structure, but it's good practice
  // to have a dedicated layout file for sections like this.
  // It inherits the root layout's structure (header, theme provider, etc.).
  return <>{children}</>;
}