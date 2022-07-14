import { fetchWithTimeout } from "@inrixia/cfworker-helpers";
import { Command, InteractionDataType } from "cloudflare-discord-bot";
import type { EnvInterface } from ".";

import { InteractionResponseType } from "discord-api-types/payloads";
import {
	RouteBases,
	Routes,
	ApplicationCommandOptionType,
	RESTGetAPIChannelMessageResult,
	RESTGetAPIChannelMessageReactionUsersResult,
	MessageFlags,
} from "discord-api-types/v10";
import { errResponse } from "./helpers";

export const reactMentions: Command<InteractionDataType.ChatInput> = [
	{
		name: "reactmentions",
		description: "Get mentions for reactions!",
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: "message",
				description: "The message to check",
				required: true,
			},
			{
				type: ApplicationCommandOptionType.Boolean,
				name: "includeowner",
				description: "Include the owner of the message in the list",
			},
		],
	},
	async (interaction, env: EnvInterface) => {
		const userID = interaction?.member?.user.id;

		const headers = {
			Authorization: `Bot ${env.CLIENT_SECRET}`,
		};

		if (interaction.channel_id === undefined) return errResponse(new Error("Something weird happened, this channel does not exist!"));
		const message = interaction.data.options?.find((option) => option.name === "message");
		const includeOwner = interaction.data.options?.find((option) => option.name === "includeowner");

		if (message?.type !== ApplicationCommandOptionType.String || (includeOwner !== undefined && includeOwner.type !== ApplicationCommandOptionType.Boolean))
			return errResponse(new Error("Unable to parse options"));

		const href = `${RouteBases.api}${Routes.channelMessage(interaction.channel_id, message.value)}`;

		const channelMessage = await fetchWithTimeout(href, { headers }).then((response) => response.json<RESTGetAPIChannelMessageResult>());

		// @ts-expect-error Code may be returned if the request failed
		if (channelMessage.code) return errResponse(new Error(`Unable to fetch the message in this channel: ${channelMessage.message}`));

		if (channelMessage.reactions === undefined || channelMessage.reactions.length === 0) return errResponse(new Error("There are no reactions on this message"));

		const reactionsWithUsers = await Promise.all(
			channelMessage.reactions
				.filter((reaction) => reaction.emoji.name !== null)
				.map(async (reaction) => {
					const reactionUsers = await fetchWithTimeout(
						`${RouteBases.api}${Routes.channelMessageReaction(interaction.channel_id, channelMessage.id, reaction.emoji.name!)}`,
						{
							headers,
						}
					).then((response) => response.json<RESTGetAPIChannelMessageReactionUsersResult>());

					return {
						...reaction,
						reactionUsers: includeOwner?.value ? reactionUsers : reactionUsers.filter((user) => user.id !== channelMessage.author.id),
					};
				})
		);

		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				flags: MessageFlags.Ephemeral,
				content: reactionsWithUsers.reduce(
					(s, reaction) => `${s}\n${reaction.emoji.name} - ${reaction.reactionUsers.reduce((s, user) => `${s}<@${user.id}>, `, "")}`,
					""
				),
				allowed_mentions: {
					users: [userID!],
				},
			},
		};
	},
];
