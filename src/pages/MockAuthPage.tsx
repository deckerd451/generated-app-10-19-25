import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Link as LinkIcon } from 'lucide-react';
const serviceDetails = {
  google: {
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    permissions: ['View your primary calendar events', 'See your basic calendar information'],
  },
  linkedin: {
    name: 'LinkedIn',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    permissions: ['See your basic profile information', 'Access your connections'],
  },
  github: {
    name: 'GitHub',
    logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    permissions: ['Read user profile data', 'Read repository information'],
  },
  slack: {
    name: 'Slack',
    logo: 'https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png',
    permissions: ['View basic information about public channels', 'View basic information about users in the workspace'],
  },
  notion: {
    name: 'Notion',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    permissions: ['Read content from selected pages', 'View page titles and properties'],
  },
  meetup: {
    name: 'Meetup',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Meetup_Logo.svg/2560px-Meetup_Logo.svg.png',
    permissions: ['View your groups', 'See your upcoming events'],
  },
  discord: {
    name: 'Discord',
    logo: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.svg',
    permissions: ['Access your username and avatar', 'Know what servers you\'re in'],
  },
  eventbrite: {
    name: 'Eventbrite',
    logo: 'https://cdn.worldvectorlogo.com/logos/eventbrite-1.svg',
    permissions: ['View your upcoming events', 'See your event history'],
  },
  crunchbase: {
    name: 'Crunchbase',
    logo: 'https://images.crunchbase.com/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1491358288/gvk8wzv534c2oawg5qtn.png',
    permissions: ['Read organization and person data', 'Access funding round information'],
  },
  twitter: {
    name: 'Twitter / X',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDEyMDAgMTIyNyI+PHBhdGggZD0iTTcxNC4xNjMgNTE5LjI4NEwxMTYwLjg5IDBIMTA1NS4wM0w2NjcuMTM3IDQ1MC44ODdMMzU3LjMyOCAwSDBMNDY4LjQ5MiA2ODEuODIxTDAgMTIyNi4zN0gxMDUuODY2TDUxNS40OTEgNzUwLjIxOEw4NDIuNjcyIDEyMjYuMzdIMTIwMEw3MTQuMTM3IDUxOS4yODRIMzE0LjE2M1pNNjkuMTY1IDY4Ny44MjhMNTIxLjY5NyA2MTkuOTM0TDE0NC4wMTEgNzkuNjk0NEgzMDYuNjE1TDYxMS40MTIgNTE1LjY4NUw2NTguODggNTgzLjU3OUwxMDU1LjA4IDExNTAuM0g4OTIuNDc2TDU2OS4xNjUgNjg3Ljg1NFY2ODcuODI4WiIgZmlsbD0iY3VycmVudENvbG9yIi8+PC9zdmc+',
    permissions: ['Read your public tweets', 'See your profile information'],
  },
};
type ServiceKey = keyof typeof serviceDetails;
export function MockAuthPage() {
  const { service } = useParams<{ service: string }>();
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get('callback_url');
  const isValidService = service && service in serviceDetails;
  if (!isValidService || !callbackUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Authentication Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">The service or callback URL is missing. Please try connecting again from the Ecosystem page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  const details = serviceDetails[service as ServiceKey];
  const handleAllow = () => {
    // Redirect to the backend callback URL which will then redirect back to the app
    window.location.href = callbackUrl;
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-display text-primary">CYNQ</h1>
            <LinkIcon className="w-6 h-6 text-muted-foreground" />
            <img src={details.logo} alt={`${details.name} Logo`} className="w-12 h-12 rounded-full object-contain" />
          </div>
          <CardTitle className="text-2xl">CYNQ wants to access your {details.name} account</CardTitle>
          <CardDescription>This will allow CYNQ to:</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {details.permissions.map((permission, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>{permission}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-6">
            By clicking "Allow", you agree to let CYNQ access the information described above. This is a simulated authentication for demo purposes.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button onClick={handleAllow}>
            Allow
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}