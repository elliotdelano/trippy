const canvas = document.getElementById('canvas');

const app = new PIXI.Application({
    view: canvas,
    width: window.innerWidth,
    height: window.innerHeight
});

const { stage, view, ticker, renderer } = app;

document.body.appendChild(view);

var mouseX = 0;
var mouseY = 0;

window.addEventListener('mousemove', function(e) {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
})

noise.seed(5);

const frag = `
    uniform float seed;
    uniform int octives;
    uniform float persis;
    uniform float fre;
    uniform vec2 res;
    uniform vec2 pos;

    uniform float r;
    uniform float g;
    uniform float b;

    uniform float depth;

    varying vec2 vTextureCoord;

    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec2 mod289(vec2 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec3 permute(vec3 x) {
      return mod289(((x*34.0)+1.0)*x);
    }

    float snoise(vec2 v)
      {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
    
    // First corner
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;

    // Permutations
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ) )
                               + i.x + vec3(0.0, i1.x, 1.0 ) );

      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // Original code ends here.


    // Salt is added to limit the x,y values. No matter what you input,
    // it returns a float around ~ 0-6000.
    // I don't claim it to be undredictable, fast and uniform. 
    // Feel free to adjust.
    float salt(float seed) {
        float a = mod(seed, 5901.);
        float b = mod(a,2.)==0. ? -0.01 : 0.11; 
        return a+4179./sqrt(a*5.)*b+1001.*a/seed;
    }
    
    float getnoise(int octaves, float persistence, float freq, vec2 coords) {
        const int MAX_OCTAVES = 100;
        float amp= 1.; 
        float maxamp = 0.;
        float sum = 0.;

        for (int i=0; i < MAX_OCTAVES; ++i) {
            if(i>=octaves) {break;}
            sum += amp * snoise(coords*freq); 
            freq *= 2.1;
            maxamp += amp;
            amp *= persistence;
        }

        return (sum / maxamp) * .5 + .5;
    }


    void main()
    {
        float s = salt(seed); // type any float here as a seed.
        vec2 p = vTextureCoord.xy;
        
        //p += vec2(.805,0.);

        //vec2 g = p + pos;

        float value;
        value = getnoise(octives, persis, fre, vec2(p)+vec2(s)+vec2(pos));
        //value *= smoothstep(0.0, 0., abs(0.5-p.x)); // hello, panda

        gl_FragColor = vec4(vec3(value+r, value+g, value+b) - depth, 0.1);

    }
`;

var p = new PIXI.Sprite();
p.width = renderer.width;
p.height = renderer.height;
p.blendMode = PIXI.BLEND_MODES.ADD;
stage.addChild(p);

var uniformsP = {
    res: { x: p.width, y: p.height },
    pos: { x: p.x, y: p.y },
    seed: 342453.,
    octives: 20.,
    persis: 0.8,
    fre: 4.,
    r: .2,
    g: .08,
    b: .2,
    depth: .7
};

//var shaderPurp = ;
//var shaderOrng = ;
//var shaderBlue = ;

p.filters = [new PIXI.Filter('', frag, uniformsP)];
var c = 1;
var a = 0;

var line = [];

function assembleLine() {
    for(var i = 0; i <= renderer.width; i++) {
        line.push(new PIXI.Graphics());
                  
                  
                  
    }

    for(var i = 0; i < line.length; i++) {
      line[i].lineStyle(1, 0xffffff);
      line[i].beginFill(0xffffff);
      line[i].drawRect(0, 0, 1, 1);
      line[i].position.set(i, renderer.height/2);
      line[i].endFill();
      stage.addChild(line[i]);
    }
    console.dir(line);
}

assembleLine();

//function drawNoise() {
//    for(var x = 0; x < app.renderer.width; x++) {
//        for(var y = 0; y < app.renderer.height; y++) {
//            var n = noise.perlin2(x/500,y/500);
//            p.beginFill(0xffffff, Math.abs(n));
//            p.drawRect(x,y,1,1);
//            p.endFill();
//        }
//    }
//    app.stage.addChild(p);
//}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

ticker.add(() => {
    a+=map(mouseY, 0, renderer.height, 0.001, 0.01);
    
    if(a>2*Math.PI) {
      a = 0;
    }
    uniformsP.pos.x = Math.cos(a);
    uniformsP.pos.y = Math.sin(a);
    uniformsP.r = Math.cos(uniformsP.pos.x)-0.2;
    uniformsP.g = Math.sin(uniformsP.pos.y)-0.2;

    var a1 = 0
    for(var i = 0; i < line.length; i++) {
      a1 += map(mouseX, 0, renderer.width, 0.001, 0.01);
      
      var xO = map(Math.cos(a1), -1,1, 0, 5);
      var yO = map(Math.sin(a1), -1,1, 0, 5);
      var n = map(noise.perlin2(xO + Math.cos(a), yO + Math.sin(a)), 0, 1, -50, 50);
      line[i].position.y = renderer.height/2 +50 + n;

    }
});
