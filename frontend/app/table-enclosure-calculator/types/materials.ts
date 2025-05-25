export enum DoorType {
	STANDARD = "standard",
	BIFOLD = "bifold",
	AWNING = "awning",
}

export interface MaterialType {
	id: string;
	name: string;
	description: string;
	price: number;
	unit: string;
}

export interface Dimensions {
	width: number;
	length: number;
	height: number;
}

export interface MaterialConfig {
	type: string;
	thickness: number;
	includePanels: boolean;
	panelConfig: {
		top: boolean;
		bottom: boolean;
		left: boolean;
		right: boolean;
		back: boolean;
		front: boolean;
	};
}

export const DoorTypeDisplayNames: Record<DoorType, string> = {
	[DoorType.STANDARD]: "Standard Door",
	[DoorType.BIFOLD]: "Bifold Door",
	[DoorType.AWNING]: "Awning Door",
};
