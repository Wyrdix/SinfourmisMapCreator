interface Team {
	id: number;
	name: string;
	color: string;
}

type NodeType = 'VIDE' | 'EAU' | 'NOURRITURE' | 'REINE';

interface EdgeData {
	to: number;
	life: number;
}

interface Node {
	id: number;
	type: NodeType;
	x: number;
	y: number;
	neighbors: EdgeData[];
}

interface WorldMap {
	teams: Team[];
	nodes: Node[];
}

interface WorldMapMeta {
	name: string;
	x_grid: number;
	y_grid: number;
}
