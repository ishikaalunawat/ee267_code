/**
 * @file Fragment shader for foveated rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/14
 */

/* TODO (2.2.4) Fragment Shader Foveation Blur */

var shaderID = "fShaderFoveated";

var shader = document.createTextNode( `
/***
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// texture or uv coordinates of current fragment in normalized coordinates [0,1]
varying vec2 textureCoords;

// texture map from the first rendering pass
uniform sampler2D textureMap;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// window space coordinates of gaze position in [pixels]
uniform vec2 gazePosition;

// eccentricity angle at boundary of foveal and middle layers
uniform float e1;

// eccentricity angle at boundary of middle and outer layers
uniform float e2;

// visual angle of one pixel
uniform float pixelVA;

// radius of middle layer blur kernel [in pixels]
const float middleKernelRad = 2.0;

// radius of outer layer blur kernel [in pixels]
const float outerKernelRad = 4.0;

// gaussian blur kernel for middle layer (5x5)
uniform float middleBlurKernel[int(middleKernelRad)*2+1];

// gaussian blur kernel for outer layer (9x9)
uniform float outerBlurKernel[int(outerKernelRad)*2+1];


void main() {

	vec2 pixelSize = 1.0/windowSize;

    float dist = distance(textureCoords*windowSize, gazePosition)* pixelVA;
    vec4 colour= vec4(0.0);
    if (dist <= e1) {
        gl_FragColor = texture2D(textureMap, textureCoords);

    } 
	else {
        if (dist > e1 && dist<= e2) {
            const float k = middleKernelRad;
            const int max_it =  int(k);
            for (int i= int(-k); i <= max_it; i++) {
                for (int j= -int(k); j <= max_it; j++)
                {
                    colour += middleBlurKernel[int(k)+i] * middleBlurKernel[int(k)+j] * texture2D(textureMap, textureCoords + vec2(pixelSize.x * float(i), pixelSize.y * float(j)));

                }
            }
            gl_FragColor = colour;
 		} 
		else if (dist > e2) {
            const float k = outerKernelRad;
            const int max_it =  int(k);
            for (int i= int(-k); i <= int(k); i++) {
                for (int j= int(-k); j <= int(k); j++)
                {
                    colour += outerBlurKernel[int(k)+i]* outerBlurKernel[int(k)+j] * texture2D(textureMap, textureCoords+ vec2(pixelSize.x * float(i), pixelSize.y * float(j)));

                }
            }
            gl_FragColor = colour;

        }
    }

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
