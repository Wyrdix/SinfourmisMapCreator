<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { selected_map } from '../stores';

	let selected_node: Writable<number | undefined> = writable(undefined);
	let selected_edge: Writable<[number, number] | undefined> = writable(undefined);
	let moving_node: number | undefined = undefined;
	let shift_pressed: boolean | undefined = undefined;
	let ctrl_pressed: boolean | undefined = undefined;

	let starting_view_move: Writable<[number, number] | undefined> = writable(undefined);

	// svelte-ignore non_reactive_update
	let height: number = 0;
	// svelte-ignore non_reactive_update
	let width: number = 0;
	let x_origin: Writable<number> = writable(0);
	let y_origin: Writable<number> = writable(0);
	let scale: Writable<number | undefined> = writable(1);

	let local_to_real_x = (v: number) => {
		const newV = v / ($scale || 1) + $x_origin;
		if (ctrl_pressed && $selected_map)
			return Math.round(newV / $selected_map.x_grid) * $selected_map.x_grid;
		return newV;
	};
	let local_to_real_y = (v: number) => {
		const newV = v / ($scale || 1) + $y_origin;
		if (ctrl_pressed && $selected_map)
			return Math.round(newV / $selected_map.y_grid) * $selected_map.y_grid;
		return newV;
	};

	function onClick(e: MouseEvent) {
		if (!e.target || !$selected_map) return;

		const target = e.target as any;

		if (target?.__attributes) {
			const newId = (target?.__attributes as any)['data-id'];
			if (newId) {
				$selected_node = newId;
				return;
			}

			const node1 = (target?.__attributes as any)['data-node1'];
			const node2 = (target?.__attributes as any)['data-node2'];

			if (node1 && node2) {
				$selected_node = undefined;
				$selected_edge = [node1 as number, node2 as number];
			}
		}
	}

	function onDblClick(e: MouseEvent) {
		if (!e.target || !$selected_map) return;

		const target = e.target as any;

		if (target?.__attributes) {
			const newId = (target?.__attributes as any)['data-id'];
			if (newId) {
				$selected_node = newId;
				return;
			}
		}

		if (shift_pressed) return;

		const newId = $selected_map.nodes.map((v) => v.id).reduce((a, b) => Math.max(a, b), 0) + 1;
		$selected_map.nodes = $selected_map.nodes.concat({
			type: 'VIDE',
			x: local_to_real_x(e.offsetX),
			y: local_to_real_y(e.offsetY),
			id: newId,
			neighbors: [] as EdgeData[]
		} as Node);

		$selected_node = newId;
	}

	function onDown(e: MouseEvent) {
		if (!e.target || !$selected_map) return;

		const target = e.target as any;
		if (target?.__attributes) {
			const newId = (target?.__attributes as any)['data-id'];
			if (newId) {
				if (shift_pressed && $selected_node) {
					$selected_map.nodes = $selected_map.nodes.map((v) => {
						if (v.id != $selected_node) return v;
						else return { ...v, neighbors: (v.neighbors || []).concat({ to: newId, life: 1 }) };
					});
				} else {
					moving_node = newId;
					$selected_node = moving_node;
				}
				return;
			}
		}

		$starting_view_move = [e.pageX, e.pageY];
	}

	function onUp(e: MouseEvent) {
		if (!e.target || !$selected_map) return;
		moving_node = undefined;
		$starting_view_move = undefined;
	}

	function onMove(e: MouseEvent) {
		if (!e.target || !$selected_map) return;
		if (moving_node) {
			$selected_map.nodes = $selected_map.nodes.map((v) => {
				if (v.id != moving_node) return v;
				else
					return {
						...v,
						x: local_to_real_x(e.offsetX + 0.5),
						y: local_to_real_y(e.offsetY + 0.5)
					};
			});
		}
		if ($starting_view_move) {
			const move = $starting_view_move;
			$x_origin = $x_origin + e.pageX - move[0];
			$y_origin = $y_origin + e.pageY - move[1];
			$starting_view_move = [e.pageX, e.pageY];
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		if (e.key === 'Backspace' || e.key === 'Delete') {
			if ($selected_map && $selected_node) {
				$selected_map.nodes = $selected_map.nodes
					.filter((v) => v.id !== $selected_node)
					.map((v) => {
						return { ...v, neighbors: (v.neighbors || []).filter((o) => o.to !== $selected_node) };
					});
				$selected_node = undefined;
			}
			if ($selected_map && $selected_edge) {
				const edge = $selected_edge;
				$selected_map.nodes = $selected_map.nodes.map((v) => {
					if (v.id != edge[0]) return v;
					else return { ...v, neighbors: (v.neighbors || []).filter((o) => o.to != edge[1]) };
				});
				$selected_edge = undefined;
			}
		}
	}

	function onKeyDown(e: KeyboardEvent) {}

	const node = {
		get value() {
			const v = $selected_map?.nodes?.find((v) => v.id === $selected_node) || ({} as Node);
			if (!v.initial_food) v.initial_food = 0;
			if (!v.max_food) v.max_food = 0;
			if (!v.regen) v.regen = 0;
			if (!v.total_available) v.total_available = 0;
			if (v.max_food < v.initial_food) {
				v.initial_food = Math.min(v.initial_food, v.max_food);
				node.value = v;
			}
			return v;
		},
		set value(value) {
			if ($selected_map && value)
				$selected_map.nodes = $selected_map.nodes.map((v) => {
					if (v.id != $selected_node) return v;
					else return value;
				});
		}
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if $selected_map}
	<div class="flex flex-row items-center justify-center">
		<div class="flex-1"></div>
		<div class="mx-2 flex flex-row items-center">
			X Grid
			<input
				type="number"
				class="input m-2 w-20 p-2"
				min="0"
				step="1"
				bind:value={$selected_map.x_grid}
			/>
		</div>
		<div class="mx-2 flex flex-row items-center">
			Y Grid
			<input
				type="number"
				class="input m-2 w-20 p-2"
				min="0"
				step="1"
				bind:value={$selected_map.y_grid}
			/>
		</div>

		<div class="flex flex-row">
			<input type="range" min="0.5" max="3" step="0.1" bind:value={$scale} />
			<input
				type="number"
				class="input m-2 w-20 p-2"
				min="0.5"
				max="3"
				step="0.1"
				bind:value={$scale}
			/>
		</div>
		<div class="flex-1"></div>
		<div class="mx-2 flex w-1/12 justify-end font-thin text-gray-500">
			X {$x_origin} ; Y {$y_origin}
		</div>
	</div>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="relative flex flex-1">
		<svg
			class="bg-surface-500-100 w-100% flex-1"
			onclick={onClick}
			onmousedown={onDown}
			onmousemove={onMove}
			onmouseup={onUp}
			ondblclick={onDblClick}
			onkeydown={(e) => {
				shift_pressed = e.shiftKey;
				ctrl_pressed = e.ctrlKey;
				onKeyDown(e);
			}}
			onkeyup={(e) => {
				shift_pressed = e.shiftKey;
				ctrl_pressed = e.ctrlKey;
				onKeyUp(e);
			}}
			onfocusout={() => {
				shift_pressed = false;
				ctrl_pressed = false;
			}}
			onwheel={(e) => {
				if (shift_pressed && !$starting_view_move) {
					$scale = Math.min(Math.max(($scale || 1) + Math.sign(e.deltaY) * 0.1, 0.1), 3);
				}
			}}
			tabindex={-1}
			bind:clientHeight={height}
			bind:clientWidth={width}
		>
			<g transform={`translate(${$x_origin}, ${$y_origin}) scale(${$scale || 1})`}>
				{#if ctrl_pressed}
					{#each Array.apply(null, Array(Math.round(local_to_real_x(width) - local_to_real_x(0) / $selected_map.x_grid))).map((v, i) => i * $selected_map.x_grid + local_to_real_x(0)) as x}
						<line
							x1={x}
							x2={x}
							y1={-$y_origin}
							y2={-$y_origin + height / ($scale || 1)}
							stroke={'gray'}
							stroke-dasharray={'1 5'}
							stroke-width={'2'}
						/>
					{/each}
					{#each Array.apply(null, Array(Math.round(local_to_real_y(height) - local_to_real_y(0) / $selected_map.y_grid))).map((v, i) => i * $selected_map.y_grid + local_to_real_y(0)) as y}
						<line
							x1={-$x_origin}
							x2={-$x_origin + width / ($scale || 1)}
							y1={y}
							y2={y}
							stroke={'gray'}
							stroke-dasharray={'1 5'}
							stroke-width={'2'}
						/>
					{/each}
				{/if}

				{#each $selected_map.nodes
					.map((v) => (v.neighbors || [])
							.map((x) => [v, $selected_map.nodes.find((o) => o.id == x.to)])
							.filter((x) => x[1])
							.map((x) => x as [Node, Node]))
					.reduce((a, b) => a.concat(b), []) as [node1, node2]}
					<line
						x1={node1.x}
						y1={node1.y}
						x2={node2.x}
						y2={node2.y}
						stroke={$selected_edge &&
						$selected_edge[0] === node1.id &&
						$selected_edge[1] === node2.id
							? 'red'
							: 'gray'}
						stroke-width={'5'}
						data-node1={node1.id}
						data-node2={node2.id}
					/>
				{/each}
				{#each $selected_map.nodes as node}
					<circle
						cx={node.x}
						cy={node.y}
						r={20}
						fill={$selected_node === node.id ? 'yellow' : 'white'}
						stroke={'black'}
						stroke-width={'2'}
						data-id={node.id}
					/>

					{#if node.type === 'EAU'}
						<circle cx={node.x} cy={node.y} r={10} fill={'blue'} />
					{/if}

					{#if node.type === 'REINE'}
						{#each [0, 1, 2, 3] as i}
							<path
								d="M -10 0 A 10 10 0 0 0 {10 * Math.cos(Math.PI * 0.65)} {10 *
									Math.sin(Math.PI * 0.65)}"
								stroke={'black'}
								stroke-width={5}
								transform="translate({node.x} , {node.y})  rotate({i * 90})"
							/>
						{/each}
					{/if}

					{#if node.type === 'NOURRITURE'}
						<circle
							cx={node.x}
							cy={node.y}
							r={(16 * node.initial_food) /
								$selected_map.nodes
									.filter((v) => v.type === 'NOURRITURE')
									.map((v) => v.max_food || 0)
									.reduce((a, b) => Math.max(a, b), 0)}
							fill={'orange'}
							data-id={node.id}
						/>
						<circle
							cx={node.x}
							cy={node.y}
							r={(16 * (node.max_food || 0)) /
								$selected_map.nodes
									.filter((v) => v.type === 'NOURRITURE')
									.map((v) => v.max_food || 0)
									.reduce((a, b) => Math.max(a, b), 0)}
							fill="none"
							stroke={'red'}
							stroke-width={2}
							data-id={node.id}
						/>
					{/if}
				{/each}</g
			>
		</svg>
		{#if $selected_node}
			<div
				class="label absolute right-0 top-0 m-5 flex w-1/6 flex-col rounded-md bg-surface-300 p-2"
			>
				<h1 style="h1">Node modifier</h1>
				<div class="flex flex-col items-center">
					<div class="mx-2 flex flex-row items-center justify-start">
						Type
						<select
							class="select m-2 w-min"
							bind:value={node.value.type}
							onchange={(e) => {
								$selected_map.nodes = $selected_map.nodes.map((v) => {
									if (v.id != $selected_node) return v;
									else return { ...v, nodeType: (e as any).target.__value };
								});
							}}
						>
							{#each ['VIDE', 'EAU', 'NOURRITURE', 'REINE'].map((v, i) => [v, i]) as s}
								<option value={s[0]}>{s[0]}</option>
							{/each}
						</select>
					</div>
					{#if node.value.type === 'NOURRITURE'}
						<div class="mx-2 flex flex-row items-center justify-start">
							Current Food
							<input
								type="number"
								class="input m-2 w-20 p-2"
								min="0"
								max={node.value.max_food}
								bind:value={node.value.initial_food}
							/>
						</div>

						<div class="mx-2 flex flex-row items-center justify-start">
							Max Food
							<input
								type="number"
								class="input m-2 w-20 p-2"
								min="0"
								bind:value={node.value.max_food}
							/>
						</div>

						<div class="mx-2 flex flex-row items-center justify-start">
							Regen
							<input
								type="number"
								class="input m-2 w-20 p-2"
								min="0"
								bind:value={node.value.regen}
							/>
						</div>

						<div class="mx-2 flex flex-row items-center justify-start">
							Total Available
							<input
								type="number"
								class="input m-2 w-20 p-2"
								min="0"
								bind:value={node.value.total_available}
							/>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}
