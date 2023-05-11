AFRAME.registerComponent( 'max-anisotropy', {
	dependencies: [ 'material', 'geometry' ],
	init: function() {
		var el = this.el;
		var material = el.getObject3D( 'mesh' ).material;
		material.map.anisotropy = el.sceneEl.renderer.capabilities.getMaxAnisotropy();
		material.map.needsUpdate = true;
		/*
		// Use if loading an external image...
		el.addEventListener( 'materialtextureloaded', () => {
			material.map.anisotropy = el.sceneEl.renderer.capabilities.getMaxAnisotropy();
			material.map.needsUpdate = true;
		} );
		*/
	}
} );

AFRAME.registerComponent( 'canvas-updater', {
	dependencies: [ 'material', 'geometry' ],
	tick: function() {
		var el = this.el;
		var material = el.getObject3D( 'mesh' ).material;
		if( material.map ) material.map.needsUpdate = true;
		if( material.displacementMap ) material.displacementMap.needsUpdate = true;
	}
} );

AFRAME.registerComponent( 'position-loop', {
	schema: {
		duration: { type: 'int', default: 1000 },
		progress: { type: 'int', default: 0 },
		from: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
		to: { type: 'vec3', default: { x: 0, y: 0, z: 0 } }
	},
	tick: function( time, delta ) {

		var a_duration = this.data.duration;
		var a_progress = this.data.progress + delta;
		if( a_progress > a_duration ) a_progress -= a_duration;
		var a_playhead = a_progress / a_duration; /* 0 to 1 */

		var from_x = this.data.from.x;
		var from_y = this.data.from.y;
		var from_z = this.data.from.z;

		var to_x = this.data.to.x;
		var to_y = this.data.to.y;
		var to_z = this.data.to.z;

		var progress_x = ( to_x - from_x ) * a_playhead;
		var progress_y = ( to_y - from_y ) * a_playhead;
		var progress_z = ( to_z - from_z ) * a_playhead;

		this.el.setAttribute( 'position', {
			x: from_x + progress_x,
			y: from_y + progress_y,
			z: from_z + progress_z
		} );
		this.el.setAttribute( 'position-loop', 'progress', a_progress );

	}
} );

AFRAME.registerComponent( 'synthwave-tree', {
	schema: {
		trunkSegments: { type: 'int', default: 5 },
		trunkBend: { type: 'number', default: 0 },
		trunkColor: { type: 'color', default: '#00FFFF' },
		leafDensity: { type: 'int', default: 16 },
		leafColor: { type: 'color', default: '#00FFFF' },
		wireframe: { type: 'boolean', default: true }
	},
	init: function() {

		// Trunk height clamp...
		var trunkSegments = parseInt( this.data.trunkSegments );
		if( trunkSegments < 1 ) trunkSegments = 1;
		if( trunkSegments > 8 ) trunkSegments = 8;

		// Build trunk...
		var ParentTrunkEl = this.el;
		for( var _i = 0; _i <= trunkSegments - 1; _i ++ ) {

			// Trunk Primitive...
			var TrunkPrimitive = document.createElement( 'a-cone' );
			TrunkPrimitive.setAttribute( 'height', '1' );
			TrunkPrimitive.setAttribute( 'segments-height', '1' );
			TrunkPrimitive.setAttribute( 'segments-radial', '6' );
			TrunkPrimitive.setAttribute( 'radius-bottom', '0.2' );
			TrunkPrimitive.setAttribute( 'radius-top', '0.25' );
			TrunkPrimitive.setAttribute( 'position', '0 0.5 0' );
			TrunkPrimitive.setAttribute( 'scale', '' + ( 1 - ( 0.1 * _i ) ) + ' 1 ' + ( 1 - ( 0.1 * _i ) ) );
			if( this.data.wireframe ) {
				TrunkPrimitive.setAttribute( 'material', 'shader: flat; wireframe: true; color: ' + this.data.trunkColor + ';' );
			} else {
				TrunkPrimitive.setAttribute( 'material', 'flatShading: true; color: ' + this.data.trunkColor + ';' );
			}

			// Trunk Wrapper...
			var TrunkRig = document.createElement( 'a-entity' );
			TrunkRig.setAttribute( 'position', '0 ' + ( _i ? '1' : '0' ) + ' 0' );
			TrunkRig.setAttribute( 'rotation', '0 0 ' + ( _i ? this.data.trunkBend : '0' ) );
			TrunkRig.appendChild( TrunkPrimitive );

			// Parent Append...
			ParentTrunkEl.appendChild( TrunkRig );

			// Become Parent...
			ParentTrunkEl = TrunkRig;

		}

		// Canopy density clamp...
		var leafDensity = parseInt( this.data.leafDensity );
		if( leafDensity < 1 ) leafDensity = 1;
		if( leafDensity > 32 ) leafDensity = 32;

		// Canopy rig...
		var CanopyRig = document.createElement( 'a-entity' );
		CanopyRig.setAttribute( 'position', '0 1 0' );
		CanopyRig.setAttribute( 'rotation', '0 0 ' + ( _i ? this.data.trunkBend : '0' ) );
		ParentTrunkEl.appendChild( CanopyRig );

		// Build canopy...
		for( var _i = 0; _i < leafDensity; _i ++ ) {

			// Leaf tip outer...
			var LeafTipOuter = document.createElement( 'a-cone' );
			LeafTipOuter.setAttribute( 'height', '0.75' );
			LeafTipOuter.setAttribute( 'segments-height', '1' );
			LeafTipOuter.setAttribute( 'segments-radial', '4' );
			LeafTipOuter.setAttribute( 'radius-bottom', '0.25' );
			LeafTipOuter.setAttribute( 'radius-top', '0' );
			LeafTipOuter.setAttribute( 'position', '0 0.375 0' );
			LeafTipOuter.setAttribute( 'scale', '0.1 1 1' );
			if( this.data.wireframe ) {
				LeafTipOuter.setAttribute( 'material', 'shader: flat; wireframe: true; color: ' + this.data.leafColor + ';' );
			} else {
				LeafTipOuter.setAttribute( 'material', 'flatShading: true; color: ' + this.data.leafColor + ';' );
			}
			var LeafTipOuterRig = document.createElement( 'a-entity' );
			LeafTipOuterRig.setAttribute( 'position', '0 0.5 0' );
			LeafTipOuterRig.setAttribute( 'rotation', '0 0 22.5' );
			LeafTipOuterRig.appendChild( LeafTipOuter );

			// Leaf tip inner...
			var LeafTipInner = document.createElement( 'a-cylinder' );
			LeafTipInner.setAttribute( 'height', '0.5' );
			LeafTipInner.setAttribute( 'segments-height', '1' );
			LeafTipInner.setAttribute( 'segments-radial', '4' );
			LeafTipInner.setAttribute( 'radius', '0.25' );
			LeafTipInner.setAttribute( 'position', '0 0.25 0' );
			LeafTipInner.setAttribute( 'scale', '0.1 1 1' );
			if( this.data.wireframe ) {
				LeafTipInner.setAttribute( 'material', 'shader: flat; wireframe: true; color: ' + this.data.leafColor + ';' );
			} else {
				LeafTipInner.setAttribute( 'material', 'flatShading: true; color: ' + this.data.leafColor + ';' );
			}
			var LeafTipInnerRig = document.createElement( 'a-entity' );
			LeafTipInnerRig.setAttribute( 'position', '0 0.5 0' );
			LeafTipInnerRig.setAttribute( 'rotation', '0 0 22.5' );
			LeafTipInnerRig.appendChild( LeafTipInner );
			LeafTipInnerRig.appendChild( LeafTipOuterRig );

			// Leaf base inner...
			var LeafBaseInner = document.createElement( 'a-cylinder' );
			LeafBaseInner.setAttribute( 'height', '0.5' );
			LeafBaseInner.setAttribute( 'segments-height', '1' );
			LeafBaseInner.setAttribute( 'segments-radial', '4' );
			LeafBaseInner.setAttribute( 'radius', '0.25' );
			LeafBaseInner.setAttribute( 'position', '0 0.25 0' );
			LeafBaseInner.setAttribute( 'scale', '0.1 1 1' );
			if( this.data.wireframe ) {
				LeafBaseInner.setAttribute( 'material', 'shader: flat; wireframe: true; color: ' + this.data.leafColor + ';' );
			} else {
				LeafBaseInner.setAttribute( 'material', 'flatShading: true; color: ' + this.data.leafColor + ';' );
			}
			var LeafBaseInnerRig = document.createElement( 'a-entity' );
			LeafBaseInnerRig.setAttribute( 'position', '0 0.75 0' );
			LeafBaseInnerRig.setAttribute( 'rotation', '0 0 22.5' );
			LeafBaseInnerRig.appendChild( LeafBaseInner );
			LeafBaseInnerRig.appendChild( LeafTipInnerRig );

			// Leaf base outer...
			var LeafBaseOuter = document.createElement( 'a-cone' );
			LeafBaseOuter.setAttribute( 'height', '0.75' );
			LeafBaseOuter.setAttribute( 'segments-height', '1' );
			LeafBaseOuter.setAttribute( 'segments-radial', '4' );
			LeafBaseOuter.setAttribute( 'radius-bottom', '0' );
			LeafBaseOuter.setAttribute( 'radius-top', '0.25' );
			LeafBaseOuter.setAttribute( 'position', '0 0.375 0' );
			LeafBaseOuter.setAttribute( 'scale', '0.1 1 1' );
			if( this.data.wireframe ) {
				LeafBaseOuter.setAttribute( 'material', 'shader: flat; wireframe: true; color: ' + this.data.leafColor + ';' );
			} else {
				LeafBaseOuter.setAttribute( 'material', 'flatShading: true; color: ' + this.data.leafColor + ';' );
			}
			var LeafBaseOuterRig = document.createElement( 'a-entity' );
			LeafBaseOuterRig.setAttribute( 'rotation', [ 0, Math.random() * 360 , ( Math.random() * 90 ) + 30 ].join( ' ' ) );
			LeafBaseOuterRig.setAttribute( 'scale', Array( 3 ).fill( ( Math.random() * 0.25 ) + 0.75 ).join( ' ' ) );
			LeafBaseOuterRig.appendChild( LeafBaseOuter );
			LeafBaseOuterRig.appendChild( LeafBaseInnerRig );
			
			// Attach to canopy...
			CanopyRig.appendChild( LeafBaseOuterRig );

		}

	}

} );