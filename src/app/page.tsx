import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Code, Copy, Eye, Palette, Zap, Layers } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tailwind Layout Preview - Home',
  description: 'Discover and preview Tailwind CSS layouts effortlessly.',
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 md:pt-32 md:pb-20 text-center overflow-hidden">
        {/* Background Elements (optional, keep subtle) */}
         <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[48rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-accent/30 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",}}></div>
        </div>

        <div className="mx-auto max-w-3xl px-4">
          <Code className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Preview & Copy Tailwind Layouts Instantly
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Accelerate your development with a curated library of ready-to-use Tailwind CSS layouts. Browse, preview, and copy clean HTML with ease.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/preview">Explore Layouts</Link>
            </Button>
            {/* <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button> */}
          </div>
        </div>
         <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent -z-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to build faster
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Our platform provides essential tools to streamline your frontend development process.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card shadow-sm hover:shadow-lg transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
                  Live Preview
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm leading-6 text-muted-foreground">
                  <p className="flex-auto">Instantly visualize layouts in an isolated iframe environment, ensuring accurate rendering.</p>
                </dd>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card shadow-sm hover:shadow-lg transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Copy className="h-6 w-6 text-primary" aria-hidden="true" />
                  Easy Code Copying
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm leading-6 text-muted-foreground">
                  <p className="flex-auto">Grab clean, ready-to-use HTML for any layout with a single click.</p>
                </dd>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card shadow-sm hover:shadow-lg transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Layers className="h-6 w-6 text-primary" aria-hidden="true" />
                  Categorized Library
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm leading-6 text-muted-foreground">
                  <p className="flex-auto">Easily find the layout you need with well-organized categories in the sidebar.</p>
                </dd>
              </div>
               <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card shadow-sm hover:shadow-lg transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Zap className="h-6 w-6 text-primary" aria-hidden="true" />
                  Fast & Efficient
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm leading-6 text-muted-foreground">
                  <p className="flex-auto">Built with Next.js and Tailwind CSS for optimal performance and development speed.</p>
                </dd>
              </div>
              {/* Removed Theme Support Feature Card */}
              {/* Removed 3D Background Feature Card */}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
       <section className="py-16 sm:py-24 bg-muted">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to accelerate your workflow?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Start browsing our extensive layout library and copy the code you need in seconds.
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/preview">Start Exploring Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <p className="text-center text-xs leading-5 text-muted-foreground">
            &copy; {new Date().getFullYear()} Tailwind Layout Preview. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
