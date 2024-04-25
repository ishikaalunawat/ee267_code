/**
 * @file Fragment shader for DoF rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/14
 */

/* TODO (2.3) DoF Rendering */

var shaderID = "fShaderDof";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// texture map from the first rendering
uniform sampler2D textureMap;

// depth map from the first rendering
uniform sampler2D depthMap;

// Projection matrix used for the first pass
uniform mat4 projectionMat;

// Inverse of projectionMat
uniform mat4 invProjectionMat;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// Gaze position in [pixels]
uniform vec2 gazePosition;

// Diameter of pupil in [mm]
uniform float pupilDiameter;

// pixel pitch in [mm]
uniform float pixelPitch;

const float searchRad = 11.0;


// Compute the distance to fragment in [mm]
// p: texture coordinate of a fragment / a gaze position
//
// Note: GLSL is column major
float distToFrag( vec2 p ) {
	/* TODO (2.3.1) Distance to Fragment */
	vec3 ndc = 2.0 * vec3(texture2D(textureMap,p).x,texture2D(textureMap,p).y,texture2D(depthMap,p)) - 1.0;
  	float w = projectionMat[3][2]/(ndc.z - (projectionMat[2][2]/projectionMat[2][3]));
  	vec4 cam_coords = invProjectionMat * vec4(w*ndc,w);
  	return length(cam_coords);
}


// compute the circle of confusion in [mm]
// fragDist: distance to current fragment in [mm]
// focusDist: distance to focus plane in [mm]
float computeCoC( float fragDist, float focusDist ) {

	/* TODO (2.3.2) Circle of Confusion Computation */
    return pupilDiameter*abs(fragDist - focusDist)/fragDist;

}


// compute depth of field blur and return color at current fragment
vec3 computeBlur() {

	/* TODO (2.3.3) Retinal Blur */
	float fragDist = distToFrag(textureCoords);
  	float focusDist = distToFrag(gazePosition/windowSize);
	float coc_blur = computeCoC(fragDist,focusDist);
  	float coc_blur_rad = coc_blur/(2.0 * pixelPitch);

	float numEl = 0.0;
	vec4 colour = vec4(0.0,0.0,0.0,0.0);
	
	for (int i = -int(searchRad); i < int(searchRad)+1; i++) {
		for (int j = -int(searchRad); j < int(searchRad)+1; j++) {
		float test = sqrt(float(i)*float(i)+float(j)*float(j));
		if (coc_blur_rad > test) {
			colour += texture2D(textureMap, textureCoords + vec2(float(i)/windowSize.x, float(j)/windowSize.y));
			numEl += 1.0;
		}
		}
	}
	return colour.xyz/numEl;

}


void main() {

	gl_FragColor = vec4(computeBlur(), 1.0);

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
