import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Play, Eye, FileText, Globe, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <main className="flex flex-col items-center text-center space-y-16">
          {/* Hero Section */}
          <div className="space-y-8">
            <Image
              className="dark:invert mx-auto"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                Tutor CodeLab
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A powerful code visualization tool that integrates with Python Tutor to help you 
                understand how your programs execute step by step.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-primary mx-auto" />
                <CardTitle>Multi-Language Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Write code in C++, Java, Python, JavaScript and more languages with syntax highlighting.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Eye className="h-10 w-10 text-primary mx-auto" />
                <CardTitle>Step-by-Step Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  See exactly how your code executes with Python Tutor integration and flow visualization.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Play className="h-10 w-10 text-primary mx-auto" />
                <CardTitle>Interactive Debugging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Navigate through execution steps, inspect variables, and understand program flow.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Getting Started</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="text-left space-y-3">
                <li className="flex items-start gap-3">
                  <Badge className="mt-0.5">1</Badge>
                  <span>
                    Click <Badge variant="outline">Open Code Lab</Badge> to start coding and visualizing.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-0.5">2</Badge>
                  <span>Write code in your preferred programming language.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-0.5">3</Badge>
                  <span>Use the debug feature to see step-by-step execution.</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/lab">
                <Code className="mr-2 h-5 w-5" />
                Open Code Lab
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild>
              <a
                href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="dark:invert mr-2"
                  src="/vercel.svg"
                  alt="Vercel logomark"
                  width={16}
                  height={16}
                />
                Deploy now
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            
            <Button variant="secondary" size="lg" asChild>
              <a
                href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="mr-2 h-4 w-4" />
                Read docs
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/lab" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <FileText className="h-4 w-4" />
              Code Lab
            </Link>
            <a
              href="https://pythontutor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Eye className="h-4 w-4" />
              Python Tutor
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              Built with Next.js
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
