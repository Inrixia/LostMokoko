import type { InteractionResponse } from "cloudflare-discord-bot";
import { InteractionResponseType, MessageFlags } from "discord-api-types/v10";

export const errResponse = (err: Error): InteractionResponse => ({
	type: InteractionResponseType.ChannelMessageWithSource,
	data: {
		flags: MessageFlags.Ephemeral,
		embeds: [
			{
				color: parseInt("800000", 16),
				title: `An error occoured`,
				description: err.message,
			},
		],
	},
});
