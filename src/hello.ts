import { ApplicationCommand, InteractionHandler, Interaction, InteractionResponse, InteractionResponseType } from "cloudflare-discord-bot";

export const helloCommand: ApplicationCommand = {
	name: "hello",
	description: "Your bot will greet you!",
};

export const helloHandler: InteractionHandler = async (interaction: Interaction): Promise<InteractionResponse> => {
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
