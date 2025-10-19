# CYNQ
Augmented Ecosystem Intelligence.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/deckerd451/Kismet)
## Project Status
**Project Complete & Stable:** This project has completed its development cycle. All features outlined in the blueprint have been implemented within a stable, locally-persisted architecture. All known build, runtime, and usability errors, including the final QR scanner prop issue, have been resolved. The application is stable, feature-complete, and ready for production deployment.
## About The Project
CYNQ is a groundbreaking personal intelligence application designed to function as a user's predictive consultant. It operates by building a comprehensive, ever-evolving 'ecosystem' for each user. This ecosystem is created by onboarding key personal information (goals, interests, skills) and then intelligently ingesting and analyzing data from their community, events, and professional/social networks.
The core of the application is a sophisticated AI chat interface through which the user interacts with their personal intelligence. The AI leverages a rich, interconnected data matrix to offer predictive insights, suggest meaningful connections, recommend relevant events, and provide refined consultations that are deeply contextualized to the user's implied and explicit needs.
The visual design is intentionally illustrative and whimsical, making the powerful underlying technology feel human, approachable, and delightful to interact with.
## Key Features
*   **Conversational AI Interface:** Interact with your personal intelligence through a natural and intuitive chat experience.
*   **Persistent Consultations:** All conversations are stateful and saved, allowing you to pick up where you left off.
*   **User-Managed Ecosystem:** Manually build out your personal ecosystem by adding key **Contacts**, **Events**, **Communities**, **Organizations**, **Skills**, **Projects**, and **Knowledge** items.
*   **Relationship Mapping:** Create explicit links between different parts of your ecosystem (e.g., link a contact to a specific goal) to provide deeper context to the AI.
*   **AI-Powered Insights:** Receive proactive, actionable suggestions from the AI based on your unique ecosystem and goals.
*   **Community Intelligence:** Leverage and contribute to a shared pool of anonymized insights and resources from the broader CYNQ community.
*   **CYNQ Snapshot Sharing:** Generate a QR code of your ecosystem data to easily share with others, and import snapshots from others to merge their data into your own.
*   **In-App QR Code Scanning:** Scan snapshot QR codes directly using your device's camera on mobile.
*   **Illustrative & Whimsical UI:** A unique, human-centered design that makes powerful AI feel approachable and delightful.
*   **Responsive Design:** A seamless experience across desktop, tablet, and mobile devices.
*   **Serverless Backend:** Built on the high-performance, scalable Cloudflare Workers platform.
*   **Stateful Agents:** Leverages Cloudflare Durable Objects via the Agents SDK for robust session management.
## Data Layer & Integrations
*   **State Management:** Zustand is used for robust and performant client-side state management.
*   **Data Persistence:** User profile and ecosystem data are persisted locally in the browser's `localStorage`.
*   **Data Source Integrations:** The application features a comprehensive UI for connecting to eight categories of data sources (e.g., Google, LinkedIn, GitHub). **Please note:** The current version uses a mock OAuth 2.0 flow to simulate the connection process, and all integrations are marked as "Coming Soon" in the UI. This version does not connect to live third-party APIs.
## Technology Stack
*   **Frontend:**
    *   [React](https://react.dev/)
    *   [Vite](https://vitejs.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn/ui](https://ui.shadcn.com/)
    *   [Framer Motion](https://www.framer.com/motion/)
    *   [Zustand](https://zustand-demo.pmnd.rs/)
*   **Backend:**
    *   [Cloudflare Workers](https://workers.cloudflare.com/)
    *   [Hono](https://hono.dev/)
    *   [Cloudflare Agents SDK](https://github.com/cloudflare/agents) (Durable Objects)
*   **AI:**
    *   [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/)
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up)
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated
### Installation
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/cynq.git
    cd cynq
    ```
2.  **Install dependencies:**
    ```sh
    bun install
    ```
3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root of the project and add your Cloudflare AI Gateway credentials.
    ```ini
    # .dev.vars
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
    ```
    **Note:** Never commit the `.dev.vars` file to version control.
## Development
To run the application locally, which starts both the Vite frontend development server and the Cloudflare Worker, use the following command:
```sh
bun dev
```
This will start the application on `http://localhost:3000` (or the next available port). The frontend will automatically proxy API requests to the local worker instance.
## Usage
Once the application is running, you can:
*   Sign up for a new account and complete the guided onboarding.
*   Start a new "Consultation" using the button in the sidebar.
*   Type messages into the chat input to interact with the CYNQ AI.
*   Manage your profile, ecosystem data, and relationships.
*   Explore community intelligence and contribute your own insights.
## Deployment
This project is designed for easy deployment to Cloudflare Pages.
1.  **Build the application:**
    ```sh
    bun run build
    ```
2.  **Deploy to Cloudflare:**
    The `deploy` script in `package.json` handles both the build and deployment process.
    ```sh
    bun run deploy
    ```
    Wrangler will guide you through the deployment process, publishing your application to your Cloudflare account.
Alternatively, you can deploy directly from your GitHub repository with a single click.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/deckerd451/Kismet)