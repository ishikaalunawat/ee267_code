/**
 * @file Gouraud vertex shader with diffuse and ambient light
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.1.1), (2.1.3) */

var shaderID = "vShaderGouraudDiffuse";

var shader = document.createTextNode( `
/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 vColor; // Color at a vertex

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 modelViewMat;
uniform mat3 normalMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;

attribute vec3 position;
attribute vec3 normal;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 color;
		vec3 position;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;

	vColor = ambientReflection;

	if (NUM_POINT_LIGHTS >= 0) {
		
		for ( int i = 0; i < NUM_POINT_LIGHTS; i++ ) {
			PointLight pointLight = pointLights[i];
			vec4 light_pos_init = (viewMat * vec4(pointLight.position, 1.0));
			vec3 light_pos = vec3(light_pos_init.xyz)/light_pos_init.w; 

			vec4 pos_init = (modelViewMat * vec4(position, 1.0));
			vec3 pos = vec3(pos_init.xyz)/pos_init.w;

			vec3 L = normalize(light_pos - pos);
			vec3 N = normalize(normalMat * normal);
			float max_dot = max(dot(L, N), 0.0);

			float d = length(light_pos - pos);
			float att = float(1.0 / (attenuation.x + attenuation.y * d + attenuation.z * d * d));
			
			vec3 diffuse = material.diffuse * pointLight.color * max_dot;
			vColor += att*diffuse;
		}
	}

	gl_Position =
		projectionMat * modelViewMat * vec4( position, 1.0 );
		}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-vertex" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
