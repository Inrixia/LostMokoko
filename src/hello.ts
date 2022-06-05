import { ApplicationCommand, InteractionHandler, InteractionResponseType } from "cloudflare-discord-bot";
import type { EnvInterface } from ".";

// import { _env } from "./";

export const helloCommand: ApplicationCommand = {
	name: "hello",
	description: "Your bot will greet you!",
};
export const helloHandler: InteractionHandler = async (interaction) => {
	const userID = interaction.member.user.id;

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `Hello, <@${userID}>!`,
			allowed_mentions: {
				users: [userID],
			},
		},
	};
};

export const listListings: ApplicationCommand = {
	name: "listlistings",
	description: "List current listings",
};
export const listListingsHandler: InteractionHandler = async (interaction, env: EnvInterface) => {
	const listings = await env.listings.list();

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: JSON.stringify(listings),
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							label: "Click me!",
							style: 1,
							custom_id: "click_one",
						},
					],
				},
			],
		},
	};
};
export const click_oneComponent: InteractionHandler = async (interaction, env: EnvInterface) => {
	const userID = interaction.member.user.id;
	return {
		type: 7,
		data: {
			content: `Hello, <@${userID}>!`,
			allowed_mentions: {
				users: [userID],
			},
		},
	};
};
