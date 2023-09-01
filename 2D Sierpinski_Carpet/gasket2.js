"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2( -1,  1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function Square( a, b, c, d )
{
    points.push( a, b, c );
    points.push( c, d, a );
}

function divideSquare( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        Square( a, b, c, d );
    }
    else {

        //bisect the sides

        var ab1 = mix( a, b, 1/3 );
        var ab2 = mix( a, b, 2/3 );
        var bc1 = mix( b, c, 1/3 );
        var bc2 = mix( b, c, 2/3 );
        var cd1 = mix( c, d, 1/3 );
        var cd2 = mix( c, d, 2/3 );
        var da1 = mix( d, a, 1/3 );
        var da2 = mix( d, a, 2/3 );
        var x1 = mix( ab1, cd2, 1/3 );
        var x2 = mix( ab2, cd1, 1/3 );
        var x3 = mix( ab2, cd1, 2/3 );
        var x4 = mix( ab1, cd2, 2/3 );

        --count;

        // three new squares

        divideSquare( a, ab1, x1, da2, count );
        divideSquare( ab1, ab2, x2, x1, count);
        divideSquare( ab2, b, bc1, x2, count );
        divideSquare( x2, bc1, bc2, x3, count );
        divideSquare( x3, bc2, c, cd1, count);
        divideSquare( x4, x3, cd1, cd2, count );
        divideSquare( da1, x4, cd2, d, count );
        divideSquare( da2, x1, x4, da1, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
