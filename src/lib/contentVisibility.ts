type ContentWithVisibility = {
	data: {
		disable?: boolean;
	};
};

export const isContentEnabled = <Entry extends ContentWithVisibility>(entry: Entry) => !entry.data.disable;
