import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
export function SimpleRouteError() {
  const error = useRouteError();
  let errorMessage: string;
  let errorStatus: number | string = 'Error';
  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorStatus = `${error.status} ${error.statusText}`;
    errorMessage = error.data?.message || 'Sorry, an unexpected error has occurred.';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = 'An unknown error occurred.';
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">{errorStatus}</CardTitle>
          <CardDescription className="text-lg">Oops! Something went wrong.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {errorMessage}
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Go back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}