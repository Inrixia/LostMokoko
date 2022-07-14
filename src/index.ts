import { createApplicationCommandHandler, Permissions } from "cloudflare-discord-bot";

import { genericResponse } from "@inrixia/cfworker-helpers";
import { reactMentions } from "./reactMentions";

export type EnvInterface = {
	// Secrets
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	PUBLIC_KEY: string;
	GUILD_ID: string;

	// Keyvaults
	// listings: KVNamespace;

	applicationCommandHandler: ReturnType<typeof createApplicationCommandHandler>;
};
type LRequest = Request & { env: EnvInterface };

// export let _env: EnvInterface;
const init = (env: EnvInterface) => {
	if (env.applicationCommandHandler === undefined) {
		env.applicationCommandHandler = createApplicationCommandHandler({
			applicationId: env.CLIENT_ID,
			applicationSecret: env.CLIENT_SECRET,
			publicKey: env.PUBLIC_KEY,
			commands: [reactMentions],
			// guildId: env.GUILD_ID,
			permissions: new Permissions(["ReadMessageHistory", "ViewChannel"]),
		});
	}
};

import { Router } from "itty-router";
const router = Router();

router.all("*", (...args) => args[1].applicationCommandHandler(...args));

export default {
	fetch: async (req: LRequest, env: EnvInterface, context: ExecutionContext) => {
		try {
			init(env);
			return router.handle(req, env, context);
		} catch (err) {
			return genericResponse(500, <Error>err);
		}
	},
};
