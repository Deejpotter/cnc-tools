export enum DoorType {
	STANDARD = "STND",
	BIFOLD = "BFLD",
	AWNING = "AWNG",
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

export interface DoorConfig {
	frontDoor: boolean;
	backDoor: boolean;
	leftDoor: boolean;
	rightDoor: boolean;
	doorType: DoorType;
}

export interface TableConfig {
	includeTable: boolean;
	includeEnclosure: boolean;
	mountEnclosureToTable: boolean;
	includeDoors: boolean;
	isOutsideDimension: boolean;
	doorConfig: DoorConfig;
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

export interface Results {
	table?: any; // TODO: Define specific types
	enclosure?: any;
	mounting?: any;
	doors?: any;
	panels?: any;
}

export const DoorTypeDisplayNames: Record<DoorType, string> = {
	[DoorType.STANDARD]: "Standard Door",
	[DoorType.BIFOLD]: "Bifold Door",
	[DoorType.AWNING]: "Awning Door",
};
