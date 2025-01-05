<script lang="ts">
	import '../app.css';
	import { Autocomplete, LightSwitch, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	let world_selector_popupsettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'bottom'
	};

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
</script>

<div class="flex h-lvh flex-col">
	<div class="variant-soft-surface flex flex-row items-center p-2">
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

		<div class="flex-1"></div>

		<LightSwitch />
	</div>
	<slot></slot>
</div>
