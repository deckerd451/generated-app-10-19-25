import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import {
  getGoogleAuthUrl, handleGoogleCallback,
  getLinkedInAuthUrl, handleLinkedInCallback,
  getGitHubAuthUrl, handleGitHubCallback,
  getSlackAuthUrl, handleSlackCallback,
  getNotionAuthUrl, handleNotionCallback,
  getMeetupAuthUrl, handleMeetupCallback,
  getDiscordAuthUrl, handleDiscordCallback,
  getEventbriteAuthUrl, handleEventbriteCallback,
  getCrunchbaseAuthUrl, handleCrunchbaseCallback,
  getTwitterAuthUrl, handleTwitterCallback
} from './auth';
import { fetchGoogleCalendarEvents, fetchLinkedInContacts, fetchGitHubRepos, fetchSlackChannels, fetchNotionPages } from './dataSync';
const handleApiError = (c: any, error: any, action: string) => {
    console.error(`Failed to ${action}:`, error);
    return c.json({ success: false, error: `Failed to ${action}` }, { status: 500 });
};
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // All routes are now handled in userRoutes.
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            return handleApiError(c, error, 'list sessions');
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title || `Chat ${new Date().toLocaleString()}`;
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            return handleApiError(c, error, 'create session');
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            return handleApiError(c, error, 'delete session');
        }
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title) return c.json({ success: false, error: 'Title is required' }, { status: 400 });
            const controller = getAppController(c.env);
            const updated = await controller.updateSessionTitle(sessionId, title);
            if (!updated) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            return c.json({ success: true, data: { title } });
        } catch (error) {
            return handleApiError(c, error, 'update session title');
        }
    });
    app.delete('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const deletedCount = await controller.clearAllSessions();
            return c.json({ success: true, data: { deletedCount } });
        } catch (error) {
            return handleApiError(c, error, 'clear all sessions');
        }
    });
    const authServices = [
        { name: 'google', getAuthUrl: getGoogleAuthUrl, handleCallback: handleGoogleCallback },
        { name: 'linkedin', getAuthUrl: getLinkedInAuthUrl, handleCallback: handleLinkedInCallback },
        { name: 'github', getAuthUrl: getGitHubAuthUrl, handleCallback: handleGitHubCallback },
        { name: 'slack', getAuthUrl: getSlackAuthUrl, handleCallback: handleSlackCallback },
        { name: 'notion', getAuthUrl: getNotionAuthUrl, handleCallback: handleNotionCallback },
        { name: 'meetup', getAuthUrl: getMeetupAuthUrl, handleCallback: handleMeetupCallback },
        { name: 'discord', getAuthUrl: getDiscordAuthUrl, handleCallback: handleDiscordCallback },
        { name: 'eventbrite', getAuthUrl: getEventbriteAuthUrl, handleCallback: handleEventbriteCallback },
        { name: 'crunchbase', getAuthUrl: getCrunchbaseAuthUrl, handleCallback: handleCrunchbaseCallback },
        { name: 'twitter', getAuthUrl: getTwitterAuthUrl, handleCallback: handleTwitterCallback },
    ];
    for (const service of authServices) {
        app.post(`/api/auth/${service.name}/disconnect`, (c) => c.json({ success: true }));
        app.get(`/api/auth/${service.name}/login`, (c) => c.redirect(service.getAuthUrl(), 302));
        app.get(`/api/auth/${service.name}/callback`, async (c) => {
            const code = c.req.query('code');
            if (!code) return c.text('Authorization code is missing.', 400);
            await service.handleCallback(code);
            return c.redirect(`/ecosystem?connected=${service.name}`, 302);
        });
    }
    app.post('/api/sync/google', async (c) => {
        try {
            const data = await fetchGoogleCalendarEvents();
            return c.json({ success: true, data });
        } catch (error) {
            return handleApiError(c, error, 'sync Google data');
        }
    });
    app.post('/api/sync/linkedin', async (c) => {
        try {
            const data = await fetchLinkedInContacts();
            return c.json({ success: true, data });
        } catch (error) {
            return handleApiError(c, error, 'sync LinkedIn data');
        }
    });
    app.post('/api/sync/github', async (c) => {
        try {
            const data = await fetchGitHubRepos();
            return c.json({ success: true, data });
        } catch (error) {
            return handleApiError(c, error, 'sync GitHub data');
        }
    });
    app.post('/api/sync/slack', async (c) => {
        try {
            const data = await fetchSlackChannels();
            return c.json({ success: true, data });
        } catch (error) {
            return handleApiError(c, error, 'sync Slack data');
        }
    });
    app.post('/api/sync/notion', async (c) => {
        try {
            const data = await fetchNotionPages();
            return c.json({ success: true, data });
        } catch (error) {
            return handleApiError(c, error, 'sync Notion data');
        }
    });
    app.get('/api/community/resources', async (c) => {
        try {
            const controller = getAppController(c.env);
            const resources = await controller.listCommunityResources();
            return c.json({ success: true, data: resources });
        } catch (error) {
            return handleApiError(c, error, 'list community resources');
        }
    });
    app.get('/api/community/insights', async (c) => {
        try {
            const controller = getAppController(c.env);
            const insights = await controller.listAnonymizedInsights();
            return c.json({ success: true, data: insights });
        } catch (error) {
            return handleApiError(c, error, 'list anonymized insights');
        }
    });
    app.post('/api/community/insights', async (c) => {
        try {
            const { text } = await c.req.json();
            if (!text) return c.json({ success: false, error: 'Insight text is required.' }, { status: 400 });
            const controller = getAppController(c.env);
            const newInsight = await controller.addAnonymizedInsight(text.trim());
            return c.json({ success: true, data: newInsight });
        } catch (error) {
            return handleApiError(c, error, 'submit insight');
        }
    });
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            console.error('Agent routing error:', error);
            return c.json({
                success: false,
                error: API_RESPONSES.AGENT_ROUTING_FAILED
            }, { status: 500 });
        }
    });
}