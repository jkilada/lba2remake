precision highp float;

uniform sampler2D library;
uniform vec2 tileSize;
uniform float pixelSize;

varying vec2 vCenter;
varying vec2 vTile;

void main() {
    vec2 offset = vCenter - gl_FragCoord.xy;
    vec2 nOffset = offset / vec2(48.0, 38.0) + 0.5;
    gl_FragColor = vec4(texture2D(library, vTile + nOffset * tileSize));
    //gl_FragColor.rgb = mix(vec3(1.0), gl_FragColor.rgb, gl_FragColor.a);
    //gl_FragColor.a = 1.0;
}
