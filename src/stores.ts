import { derived, get, writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

// type LocalMaps = Map<string, WorldMap & WorldMapMeta>;

// export const local_maps: Writable<LocalMaps> = writable(
// 	browser
// 		? (JSON.parse(localStorage.getItem('local_maps') || JSON.stringify(new Map())) as Map<
// 				string,
// 				WorldMap & WorldMapMeta
// 			>)
// 		: new Map()
// );

// export const selected_name = writable('');

export const selected_map: Writable<(WorldMap & WorldMapMeta) | undefined> = writable(
	(() => {
		if (!browser) return undefined;
		const v = localStorage.getItem('local_maps');
		if (!v)
			return {
				nodes: [],
				teams: [],
				name: 'New',
				x_grid: 10,
				y_grid: 10
			} as WorldMap & WorldMapMeta;
		return JSON.parse(v);
	})()
);

selected_map.subscribe((v) => {
	if (browser) return (localStorage.local_maps = JSON.stringify(v));
});

export const dark: Writable<boolean> = writable(
	(() => {
		if (!browser) return undefined;
		const v = localStorage.getItem('dark');
		if (!v) return false;
		document.body.classList.toggle('dark', JSON.parse(v));
		return JSON.parse(v);
	})()
);

dark.subscribe((v) => {
	if (browser) {
		document.body.classList.toggle('dark', v);
		return (localStorage.dark = JSON.stringify(v));
	}
});

// local_maps.subscribe((val) => {
// 	if (browser) return (localStorage.local_maps = JSON.stringify(val));
// });

// selected_name.subscribe((val) => {
// 	const v = get(local_maps);
// 	console.log(v);
// 	selected_map.set(v.get ? v.get(val) : undefined);
// });

// local_maps.subscribe((val) => {
// 	selected_map.set(val.get(get(selected_name)));
// });

// selected_map.subscribe((val) => {
// 	if (browser) return (localStorage.local_maps = { ...get(local_maps) });
// });
