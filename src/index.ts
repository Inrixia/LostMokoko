import { createApplicationCommandHandler, Permissions, PermissionType } from "cloudflare-discord-bot";

import { genericResponse, jsonResponse } from "@inrixia/cfworker-helpers";
import { helloHandler, helloCommand, listListingsHandler, listListings, click_oneComponent } from "./hello";

export type EnvInterface = {
	// Secrets
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	PUBLIC_KEY: string;
	GUILD_ID: string;

	// Keyvaults
	listings: KVNamespace;

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
			commands: [
				[helloCommand, helloHandler],
				[listListings, listListingsHandler],
			],
			components: {
				click_one: click_oneComponent,
			},
			guildId: env.GUILD_ID,
			permissions: new Permissions([PermissionType.SEND_MESSAGES]),
		});
	}
};

import { Router } from "itty-router";
const router = Router();

router
	.all("/test", (req: LRequest) => {
		return jsonResponse(req.env);
	})
	.all("*", (req: LRequest, env: EnvInterface) => env.applicationCommandHandler(req, env));

export default {
	fetch: async (req: LRequest, env: EnvInterface) => {
		try {
			init(env);
			console.log(await req.clone().json());
			return router.handle(req, env);
		} catch (err) {
			return genericResponse(500, <Error>err);
		}
	},
};
