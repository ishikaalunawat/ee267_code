/**
 * @file Phong fragment shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.2.2) */

var shaderID = "fShaderPhong";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Fragment position in view cooridnate

uniform mat4 viewMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;

	vec3 fColor = ambientReflection;

	if (NUM_POINT_LIGHTS >= 0) {
		for ( int i = 0; i < NUM_POINT_LIGHTS; i++ ) {

			// Transform to view coordinates
			PointLight pointLight = pointLights[i];
			vec4 light_pos_init = (viewMat * vec4(pointLight.position, 1.0));
			vec3 light_pos = vec3(light_pos_init.xyz)/light_pos_init.w; 
			vec3 pos = fragPosCam;

			// Compute diffuse reflection
			vec3 L = normalize(light_pos - pos);
			vec3 N = normalize(normalCam);
			float diff = max(dot(L, N), 0.0);
			float d = length(light_pos - pos);
			float att = float(1.0 / (attenuation.x + attenuation.y * d + attenuation.z * d * d));
			
			vec3 diffuse = material.diffuse * pointLight.color * diff;
			fColor += att*diffuse;

			// Compute specular reflection
			vec3 V = normalize(-pos);
			vec3 R = normalize(reflect(-L, N));
			float spec = pow(max(dot(R, V), 0.0), material.shininess);

			vec3 specular = material.specular * pointLight.color * spec;
			fColor += att*specular;
		}
	}
	gl_FragColor = vec4( fColor, 1.0 );
}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
