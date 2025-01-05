<script lang="ts">
	import '../app.css';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { dark, selected_map } from '../stores';

	// import { storePopup } from '@skeletonlabs/skeleton';
	// storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	// let world_selector_popupsettings: PopupSettings = {
	// 	event: 'focus-click',
	// 	target: 'popupAutocomplete',
	// 	placement: 'bottom'
	// };

	let selected_world: string = '';

	function onWorldSelected() {
		// const v = $local_maps;
		// v.set('new', {
		// 	nodes: [],
		// 	teams: [],
		// 	name: 'new',
		// 	x_grid: 10,
		// 	y_grid: 10
		// });
		// local_maps.set(v);
	}

	function handleFileUpload(event: Event) {
		const fileInput = event.target as HTMLInputElement;
		const file = fileInput.files?.[0];

		if (!file) {
			alert('No file selected');
			return;
		}

		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const fileContent = e.target?.result as string;
				const parsedObject = JSON.parse(fileContent);

				if (parsedObject satisfies WorldMap) {
					$selected_map = { ...(parsedObject as WorldMap), x_grid: 10, y_grid: 10 };
				} else throw new Error('Could not convert json to WorldMap type');

				alert(`Imported WorldMap`);
			} catch (error) {
				alert('Invalid JSON file');
				console.error('Error parsing JSON:', error);
			}
		};

		reader.onerror = () => {
			alert('Failed to read file');
		};

		reader.readAsText(file);
	}
</script>

<div class="flex h-lvh flex-col">
	<div class="flex flex-row items-center bg-surface-400 p-2">
		Sinfourmis

		<div class="flex-1"></div>

		<!-- <input
			class="autocomplete input w-1/2 p-2"
			type="search"
			name="autocomplete-search"
			bind:value={selected_world}
			placeholder="Search..."
			use:popup={world_selector_popupsettings}
			disabled
		/>
		<div data-popup="popupAutocomplete">
			<Autocomplete bind:input={selected_world} options={[]} on:selection={onWorldSelected} />
		</div>

		<button type="button" class="variant-filled btn-icon mx-5" disabled>(icon)</button> -->

		<input
			id="file-input"
			type="file"
			accept="application/json"
			class="absolute inset-0 h-0 w-0 cursor-pointer opacity-0"
			on:change={handleFileUpload}
		/>
		<label
			for="file-input"
			class="mx-10 cursor-pointer rounded-sm bg-primary-600 p-4 text-white hover:bg-primary-700"
		>
			Import
		</label>
		<a
			class="rounded-sm bg-primary-600 p-4 hover:bg-primary-700"
			href={URL.createObjectURL(
				new Blob(
					[
						JSON.stringify({
							...$selected_map,
							name: undefined,
							x_grid: undefined,
							y_grid: undefined
						})
					],
					{ type: 'application/json' }
				)
			)}
			download="sinfourmis_map.json"
		>
			Export
		</a>

		<div class="flex-1"></div>

		<Switch name="Dark" bind:checked={$dark} />

		<!-- <LightSwitch /> -->
	</div>
	<slot></slot>
</div>
