import { createApplicationCommandHandler, Permissions, PermissionType } from "cloudflare-discord-bot";

import { genericResponse, jsonResponse } from "@inrixia/cfworker-helpers";
import { helloHandler, helloCommand } from "./hello";

type EnvInterface = {
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	PUBLIC_KEY: string;
	GUILD_ID: string;
	applicationCommandHandler: ReturnType<typeof createApplicationCommandHandler>;
};
type LRequest = Request & { env: EnvInterface };

const init = (env: EnvInterface) => {
	if (env.applicationCommandHandler === undefined) {
		env.applicationCommandHandler = createApplicationCommandHandler({
			applicationId: env.CLIENT_ID,
			applicationSecret: env.CLIENT_SECRET,
			publicKey: env.PUBLIC_KEY,
			commands: [[helloCommand, helloHandler]],
			guildId: env.GUILD_ID,
			permissions: new Permissions([PermissionType.SEND_MESSAGES]),
		});
	}
	return env;
};

import { Router } from "itty-router";
const router = Router();

router
	.all("/test", (req: LRequest) => {
		return jsonResponse(req.env);
	})
	.all("*", (req: LRequest) => req.env.applicationCommandHandler(req));

export default {
	fetch: async (req: LRequest, env: EnvInterface) => {
		try {
			req.env = init(env);
			return router.handle(req);
		} catch (err) {
			return genericResponse(500, <Error>err);
		}
	},
};
