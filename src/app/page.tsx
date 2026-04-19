
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Loader2,
  Terminal,
  AlertTriangle,
  Check,
  Copy,
  Bot,
  Play,
  Github,
  Linkedin,
} from 'lucide-react';

import { type ExplainCodeAndFixBugsOutput } from '@/ai/flows/explain-code-and-fix-bugs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeCodeAction, runCodeAction } from './actions';
import { type RunCodeOutput } from '@/ai/flows/run-code';

function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2500);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="absolute top-2 right-2 h-8 w-8 text-foreground/70 hover:text-foreground"
      onClick={copyToClipboard}
    >
      <span className="sr-only">Copy code</span>
      {hasCopied ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold font-sans mb-2 text-foreground">
          Explanation
        </h3>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold font-sans mb-2 text-foreground">
          Corrected Code
        </h3>
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

function ResultDisplay({ result }: { result: ExplainCodeAndFixBugsOutput }) {
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunCodeOutput | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const handleRunCode = async () => {
    setIsRunning(true);
    setRunError(null);
    setRunResult(null);
    const { data, error } = await runCodeAction(result.correctedCode);
    if (error) {
      setRunError(error);
    } else {
      setRunResult(data);
    }
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold font-sans mb-2 text-foreground">
          Explanation
        </h3>
        <div className="text-foreground/90 space-y-4 rounded-md border border-border bg-card p-4">
          <p>{result.explanation}</p>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold font-sans text-foreground">
            Corrected Code
          </h3>
          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            size="sm"
            variant="secondary"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
        </div>
        <div className="relative rounded-md bg-muted/50">
          <CopyButton textToCopy={result.correctedCode} />
          <pre className="p-4 pt-12 overflow-x-auto">
            <code
              className="font-mono text-sm text-foreground/90"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {result.correctedCode}
            </code>
          </pre>
        </div>
      </div>

      {isRunning && (
        <div>
          <h3 className="text-xl font-semibold font-sans mb-2 text-foreground">
            Output
          </h3>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      )}

      {runError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Execution Error</AlertTitle>
          <AlertDescription>{runError}</AlertDescription>
        </Alert>
      )}

      {runResult && (
        <div>
          <h3 className="text-xl font-semibold font-sans mb-2 text-foreground">
            Output
          </h3>
          <div className="relative rounded-md bg-muted/50 p-4">
            <pre className="overflow-x-auto">
              <code className="font-mono text-sm text-foreground/90">
                {runResult.output}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CodeAnalyzerPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ExplainCodeAndFixBugsOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const { data, error } = await analyzeCodeAction(code);

    if (error) {
      if (error.includes('429')) {
        setError(
          'You have sent too many requests in a short period. Please wait a minute and try again.'
        );
      } else {
        setError(error);
      }
      setIsLoading(false);
    } else if (data) {
      setResult(data);
      debounceTimeout.current = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } else {
      setError('An unexpected issue occurred. The analysis returned no data.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground font-sans">
      <main className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">
            Fix Your Code with AI
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
            Paste your buggy code below. Our AI will analyze it, explain the
            errors, and provide a corrected version.
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid w-full gap-2">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                    className="font-mono text-sm min-h-[300px] bg-muted/50 focus:bg-muted/70 border-border placeholder:text-muted-foreground resize-y"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold text-base"
                  disabled={isLoading || !code.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Code'
                  )}
                </Button>
              </form>

              {(isLoading && !result && !error) || error || result ? (
                <div className="mt-6">
                  <Separator className="bg-border/50" />
                  <div className="mt-6">
                    {isLoading && !result && !error && <LoadingState />}
                    {error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Analysis Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {result && <ResultDisplay result={result} />}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-8 text-center">
        <div className="flex justify-center items-center gap-6 mb-3">
          <a
            href="https://github.com/Sitanshudevop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/sitanshu-kumar-7r1ch/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
        <p className="text-muted-foreground text-sm">-developed by Sitanshu Kumar</p>
      </footer>
    </div>
  );
}
