var CameraRig = document.getElementById( 'CameraRig' ), CameraLag = 16;
var BaseRotation = [ 16.75, 0, 0 ], CurrentRotation = [ 16.75, 0, 0 ];
var OffsetX = 0, OffsetY = 0;

var SunCanvasEl = document.getElementById( 'SunCanvas' );
var SunCanvas2D = SunCanvasEl.getContext( '2d' );
var SunCanvasPhase = 0;

var SkyCanvasEl = document.getElementById( 'SkyCanvas' );
var SkyCanvas2D = SkyCanvasEl.getContext( '2d' );

function PickBetween( min, max ) {

	var min = Math.ceil( min );
	var max = Math.floor( max );
	return Math.floor( Math.random() * ( max - min + 1 ) + min );

}

function InitHillsCanvas() {

	let HillsCanvasEl = document.getElementById( 'HillsCanvas' );
	let HillsCanvas2D = HillsCanvasEl.getContext( '2d' );

	// Empty...
	HillsCanvas2D.fillStyle = 'rgb(0,0,0)';
	HillsCanvas2D.fillRect( 0, 0, 32, 32 );

	// Mountain Peaks...
	for( let _y = 0; _y < 31; _y ++ ) {
		for( let _x = 0; _x < 31; _x ++ ) {

			let _z = PickBetween( 0, 255 );
			HillsCanvas2D.fillStyle = 'rgb(' + [ _z, _z, _z ].join(',') + ')';
			HillsCanvas2D.fillRect( _x , _y, 1, 1 );

			if( !_y ) HillsCanvas2D.fillRect( _x, 31, 1, 1 );
			if( !_x ) HillsCanvas2D.fillRect( 31, _y, 1, 1 );
			if( !_x && !_y ) HillsCanvas2D.fillRect( 31, 31, 1, 1 );

		}
	}

	// Valley...
	let HillsGradient = HillsCanvas2D.createLinearGradient( 0, 0, 32, 0 );
	HillsGradient.addColorStop( 0, 'rgba(0,0,0,0.0)' );
	HillsGradient.addColorStop( (1 / 3) * 1, 'rgba(0,0,0,1.0)' );
	HillsGradient.addColorStop( (1 / 3) * 2, 'rgba(0,0,0,1.0)' );
	HillsGradient.addColorStop( 1, 'rgba(0,0,0,0.0)' );
	HillsCanvas2D.fillStyle = HillsGradient;
	HillsCanvas2D.fillRect( 0, 0, 32, 32 );

}
InitHillsCanvas();

function InitGridCanvas() {

	var GridCanvasEl = document.getElementById( 'GridCanvas' );
	var GridCanvas2D = GridCanvasEl.getContext( '2d' );

	// Draw Base...
	var GridGradient = GridCanvas2D.createLinearGradient( 0, 0, 2048, 0 );
	GridGradient.addColorStop( 0.000, 'rgb(0,170,255)' );
	GridGradient.addColorStop( 0.100, 'rgb(0,170,255)' );
	GridGradient.addColorStop( 0.500, 'rgb(255,0,170)' );
	GridGradient.addColorStop( 0.900, 'rgb(0,170,255)' );
	GridGradient.addColorStop( 1.000, 'rgb(0,170,255)' );
	GridCanvas2D.fillStyle = GridGradient;
	GridCanvas2D.fillRect( 0, 0, 2048, 2048 );

	// Draw Squares...
	GridCanvas2D.fillStyle = '#000000';
	for( let _y = 0; _y < 32; _y ++ ) {
		for( let _x = 0; _x < 32; _x ++ ) {
			GridCanvas2D.fillRect( ( _x * 64 ) + 1, ( _y * 64) + 1, 62, 62 );
		}
	}

}
InitGridCanvas();

function InitSkyCanvas() {
	
	// Draw Space...
	SkyCanvas2D.fillStyle = '#000000';
	SkyCanvas2D.fillRect( 0, 0, 6400, 3200 );

	// Draw Stars...
	for( let i = 0; i < 1024; i ++ ) {
		SkyCanvas2D.beginPath();
		SkyCanvas2D.arc( PickBetween( 0, 6400 ), PickBetween( 0, 1600 ), ( PickBetween( 1, 3 ) / 2 ), 0, 2 * Math.PI );
		SkyCanvas2D.fillStyle = '#FFFFFF';
		SkyCanvas2D.fill();
	}

	// Draw Atmos...
	var SkyGradient = SkyCanvas2D.createLinearGradient( 0, 0, 0, 3200 );
	SkyGradient.addColorStop( 0.00, 'rgba(68,0,68,0.0)' );
	SkyGradient.addColorStop( 0.375, 'rgba(68,0,68,0.0)' );
	SkyGradient.addColorStop( 0.5, 'rgba(68,0,68,1.0)' );
	SkyGradient.addColorStop( 1.00, 'rgba(68,0,68,1.0)' );
	SkyCanvas2D.fillStyle = SkyGradient;
	SkyCanvas2D.fillRect( 0, 0, 6400, 3200 );

}
InitSkyCanvas();

function UpdateSunCanvas() {

	// Clear color...
	SunCanvas2D.fillStyle = '#440044';
	SunCanvas2D.fillRect( 0, 0, 512, 512 );

	// Draw lines...
	for( let i = 0; i < 32; i ++ ) {
		var	vSize = 1 * ( i + 1 );
		var vOffset = ( SunCanvasPhase + ( 16 * i ) ) + vSize;
		SunCanvas2D.fillStyle = '#FFAA00';
		SunCanvas2D.fillRect( 0, 512 - vOffset, 512, vSize );
	}
	SunCanvasPhase += 0.5;
	if( SunCanvasPhase > 16 ) SunCanvasPhase -= 16;

}
UpdateSunCanvas();

function UpdateCameraRig() {

	CurrentRotation = [
		CurrentRotation[ 0 ] + ( ( ( BaseRotation[ 0 ] + OffsetY ) - CurrentRotation[ 0 ] ) / CameraLag ),
		CurrentRotation[ 1 ] + ( ( ( BaseRotation[ 1 ] + OffsetX ) - CurrentRotation[ 1 ] ) / CameraLag ),
		0,
	];
	CameraRig.setAttribute( 'rotation', CurrentRotation.join( ' ' ) );

}
UpdateCameraRig();

function AnimationFrame() {

	requestAnimationFrame( AnimationFrame );
	UpdateSunCanvas();
	UpdateCameraRig();

}
AnimationFrame();

/* INTERACTIVITY */

document.addEventListener( 'mousemove', event => {

	OffsetX = ( -0.5 + ( event.clientX / window.innerWidth ) ) * 2;
	OffsetY = ( -0.5 + ( event.clientY / window.innerHeight ) ) * 1;

} );
