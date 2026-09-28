/**
 * VidSrcME — pure-JS decrypt (wasm2js), no WebAssembly required.
 * Generated for w=5968610
 */
/** Pure-JS vsdec (wasm2js) — no WebAssembly needed */
function createVsDec() {

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 512, "E2q1wgQzM85K8grEiRzkPJuTxddt73K2jlzaGkRt");
  base64DecodeToExistingUint8Array(bufferView, 0, "sCKjrofv+2N0c7hry9YHuIWeOXmzUIrmb5EBSErdAYQ=");
  base64DecodeToExistingUint8Array(bufferView, 3840, "F1zoIlYKz1SMO/vn++yX+jXQF36OMU79LF1H05f9KlAeNg0sNYiy44w=");
  base64DecodeToExistingUint8Array(bufferView, 1024, "4IWQhge7Dg+ENStfnRBsomzxh3lA0/rIG54nmM5g1ftNxk6yRVZSAu8RaBYdJDjGYa1vhQ176BK3gwYN0oMf93V6S9KBB0awVrRYPQc+nxljXdBH6D+3S7VLhkQgrcJxUv+F2nmOya0=");
  base64DecodeToExistingUint8Array(bufferView, 3968, "tyjjFXXL3AoGizStt1sjkZUbeeRreoc8cd/sQiIj8TSvktgn9iTFeuEv");
  base64DecodeToExistingUint8Array(bufferView, 1408, "rsl86GZGIf1Qcc17fqeHtuFDqK30XzxhsjrRBP3WRFGgvOIjG38dHgOKCbG5");
  base64DecodeToExistingUint8Array(bufferView, 3328, "VG8/S1ST6l1W31XqcjKfE1VHZQosAhyCPp0oE72OhY6Zjxbt9IPcneWqW340mGxQv0lgLwnH3IikwTUOlak8UkRoG41Xk67ovPG1Vw==");
  base64DecodeToExistingUint8Array(bufferView, 1664, "7u3VWkbvQLTfO2wDybWBJ9sIIDDt/ceFmRmCZJ3NJ9p3L8ikAVGs0hY4yvutzrR0AHwZFP5R/Z2PHf0yxJZlpiTfqeXy8jbBEH37FU5OCefO0TMoBig7DwE50/8=");
  base64DecodeToExistingUint8Array(bufferView, 3200, "owgwhmP/a+yBKXqYXzxkkdzpTMtDdaE6Unf4o4St4MQ=");
  base64DecodeToExistingUint8Array(bufferView, 2432, "2ZJeFw08tBG9Bw+Ri90+hfvPoH840vFBpHKtS4G0QqIHKEj5M7mYcwj0EtBN/E1/IAgnEax0h5BW2gHPQlgggyUjNbZbsg7XVhRtXPh9OHgcxv+tYVhx180WXv+6MQ==");
  base64DecodeToExistingUint8Array(bufferView, 2688, "2owWrDrOKdCt9GDJ67L6W2jnmMm9RmghmKbC2leukngwiFUJsl4Xj1urJz89yQY9ZVM6FxURpZVJGa6SsKy+eq88ouAuwg3TlRsEC3qIsoWvpeywXA==");
}
function asmFunc(imports) {
 var buffer = new ArrayBuffer(262144);
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var global$0 = 4096;
 function $0($0_1) {
  $0_1 = $0_1 | 0;
  var $2_1 = 0, $1_1 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  $2_1 = 798752073;
  block : {
   label : while (1) {
    if ($1_1 >>> 0 >= 48 >>> 0) {
     break block
    }
    $2_1 = (__wasm_rotl_i32($2_1 | 0, 16 | 0) | 0) ^ ($1_1 + $0_1 | 0) | 0;
    $2_1 = Math_imul($2_1, 3) + 125233392 | 0;
    (wasm2js_i32$0 = 196 + ($1_1 & 63 | 0) | 0, wasm2js_i32$1 = __wasm_rotr_i32($2_1 | 0, 31 | 0) | 0), HEAP8[wasm2js_i32$0 >> 0] = wasm2js_i32$1;
    $1_1 = $1_1 + 1 | 0;
    continue label;
   };
  }
  return $2_1 ^ $0_1 | 0 | 0;
 }
 
 function $1($0_1) {
  $0_1 = $0_1 | 0;
  var $2_1 = 0, $1_1 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  $2_1 = 288591991;
  block : {
   label : while (1) {
    if ($1_1 >>> 0 >= 27 >>> 0) {
     break block
    }
    $2_1 = (__wasm_rotl_i32($2_1 | 0, 6 | 0) | 0) ^ ($1_1 + $0_1 | 0) | 0;
    $2_1 = Math_imul($2_1, 3) + 741374528 | 0;
    (wasm2js_i32$0 = 300 + ($1_1 & 63 | 0) | 0, wasm2js_i32$1 = __wasm_rotr_i32($2_1 | 0, 13 | 0) | 0), HEAP8[wasm2js_i32$0 >> 0] = wasm2js_i32$1;
    $1_1 = $1_1 + 1 | 0;
    continue label;
   };
  }
  return $2_1 ^ $0_1 | 0 | 0;
 }
 
 function $2($0_1) {
  $0_1 = $0_1 | 0;
  var $2_1 = 0, $1_1 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  $2_1 = 1912927367;
  block : {
   label : while (1) {
    if ($1_1 >>> 0 >= 65 >>> 0) {
     break block
    }
    $2_1 = (__wasm_rotl_i32($2_1 | 0, 28 | 0) | 0) ^ ($1_1 + $0_1 | 0) | 0;
    $2_1 = Math_imul($2_1, 3) + 1580877934 | 0;
    (wasm2js_i32$0 = 476 + ($1_1 & 63 | 0) | 0, wasm2js_i32$1 = __wasm_rotr_i32($2_1 | 0, 24 | 0) | 0), HEAP8[wasm2js_i32$0 >> 0] = wasm2js_i32$1;
    $1_1 = $1_1 + 1 | 0;
    continue label;
   };
  }
  return $2_1 ^ $0_1 | 0 | 0;
 }
 
 function $3($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0;
  $2_1 = 1634760805;
  $3_1 = 857760878;
  $4_1 = 2036477234;
  $5_1 = 1797285236;
  $6 = (HEAP32[0 >> 2] | 0) ^ (HEAP32[3200 >> 2] | 0) | 0;
  $7 = (HEAP32[4 >> 2] | 0) ^ (HEAP32[3204 >> 2] | 0) | 0;
  $8 = (HEAP32[8 >> 2] | 0) ^ (HEAP32[3208 >> 2] | 0) | 0;
  $9 = (HEAP32[12 >> 2] | 0) ^ (HEAP32[3212 >> 2] | 0) | 0;
  $10 = (HEAP32[16 >> 2] | 0) ^ (HEAP32[3216 >> 2] | 0) | 0;
  $11 = (HEAP32[20 >> 2] | 0) ^ (HEAP32[3220 >> 2] | 0) | 0;
  $12 = (HEAP32[24 >> 2] | 0) ^ (HEAP32[3224 >> 2] | 0) | 0;
  $13 = (HEAP32[28 >> 2] | 0) ^ (HEAP32[3228 >> 2] | 0) | 0;
  $14 = $0_1;
  $15 = HEAP32[32 >> 2] | 0;
  $16 = HEAP32[36 >> 2] | 0;
  $17 = HEAP32[40 >> 2] | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $6 | 0;
  $14 = __wasm_rotl_i32($14 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $14 | 0;
  $6 = __wasm_rotl_i32($6 ^ $10 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $7 | 0;
  $15 = __wasm_rotl_i32($15 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $15 | 0;
  $7 = __wasm_rotl_i32($7 ^ $11 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $8 | 0;
  $16 = __wasm_rotl_i32($16 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $16 | 0;
  $8 = __wasm_rotl_i32($8 ^ $12 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $9 | 0;
  $17 = __wasm_rotl_i32($17 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $17 | 0;
  $9 = __wasm_rotl_i32($9 ^ $13 | 0 | 0, 7 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 16 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 12 | 0) | 0;
  $2_1 = $2_1 + $7 | 0;
  $17 = __wasm_rotl_i32($17 ^ $2_1 | 0 | 0, 8 | 0) | 0;
  $12 = $12 + $17 | 0;
  $7 = __wasm_rotl_i32($7 ^ $12 | 0 | 0, 7 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 16 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 12 | 0) | 0;
  $3_1 = $3_1 + $8 | 0;
  $14 = __wasm_rotl_i32($14 ^ $3_1 | 0 | 0, 8 | 0) | 0;
  $13 = $13 + $14 | 0;
  $8 = __wasm_rotl_i32($8 ^ $13 | 0 | 0, 7 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 16 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 12 | 0) | 0;
  $4_1 = $4_1 + $9 | 0;
  $15 = __wasm_rotl_i32($15 ^ $4_1 | 0 | 0, 8 | 0) | 0;
  $10 = $10 + $15 | 0;
  $9 = __wasm_rotl_i32($9 ^ $10 | 0 | 0, 7 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 16 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 12 | 0) | 0;
  $5_1 = $5_1 + $6 | 0;
  $16 = __wasm_rotl_i32($16 ^ $5_1 | 0 | 0, 8 | 0) | 0;
  $11 = $11 + $16 | 0;
  $6 = __wasm_rotl_i32($6 ^ $11 | 0 | 0, 7 | 0) | 0;
  HEAP32[($1_1 + 0 | 0) >> 2] = $2_1 + 1634760805 | 0;
  HEAP32[($1_1 + 4 | 0) >> 2] = $3_1 + 857760878 | 0;
  HEAP32[($1_1 + 8 | 0) >> 2] = $4_1 + 2036477234 | 0;
  HEAP32[($1_1 + 12 | 0) >> 2] = $5_1 + 1797285236 | 0;
  HEAP32[($1_1 + 16 | 0) >> 2] = $6 + ((HEAP32[0 >> 2] | 0) ^ (HEAP32[3200 >> 2] | 0) | 0) | 0;
  HEAP32[($1_1 + 20 | 0) >> 2] = $7 + ((HEAP32[4 >> 2] | 0) ^ (HEAP32[3204 >> 2] | 0) | 0) | 0;
  HEAP32[($1_1 + 24 | 0) >> 2] = $8 + ((HEAP32[8 >> 2] | 0) ^ (HEAP32[3208 >> 2] | 0) | 0) | 0;
  HEAP32[($1_1 + 28 | 0) >> 2] = $9 + ((HEAP32[12 >> 2] | 0) ^ (HEAP32[3212 >> 2] | 0) | 0) | 0;
  HEAP32[($1_1 + 32 | 0) >> 2] = $10 + ((HEAP32[16 >> 2] | 0) ^ (HEAP32[3216 >> 2] | 0) | 0) | 0;
  HEAP32[($1_1 + 36 | 0) >> 2] = $11 + ((HEAP32[20 >> 2] | 0) ^ (HEAP32[3220 >> 2] | 0) | 0) | 0;
  HEAP32[($1_1 + 40 | 0) >> 2] = $12 + ((HEAP32[24 >> 2] | 0) ^ (HEAP32[3224 >> 2] | 0) | 0) | 0;
  HEAP32[($1_1 + 44 | 0) >> 2] = $13 + ((HEAP32[28 >> 2] | 0) ^ (HEAP32[3228 >> 2] | 0) | 0) | 0;
  HEAP32[($1_1 + 48 | 0) >> 2] = $14 + $0_1 | 0;
  HEAP32[($1_1 + 52 | 0) >> 2] = $15 + (HEAP32[32 >> 2] | 0) | 0;
  HEAP32[($1_1 + 56 | 0) >> 2] = $16 + (HEAP32[36 >> 2] | 0) | 0;
  HEAP32[($1_1 + 60 | 0) >> 2] = $17 + (HEAP32[40 >> 2] | 0) | 0;
 }
 
 function $4($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = global$0;
  global$0 = global$0 + $0_1 | 0;
  block : {
   if (global$0 >>> 0 <= Math_imul(__wasm_memory_size(), 65536) >>> 0) {
    break block
   }
   __wasm_memory_grow(1 + (((global$0 - Math_imul(__wasm_memory_size(), 65536) | 0) >>> 0) / (65536 >>> 0) | 0) | 0 | 0);
  }
  return $1_1 | 0;
 }
 
 function $5($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $5_1 = 0, $7 = 0, $3_1 = 0, $4_1 = 0, $6 = 0, $2_1 = 0;
  HEAP32[32 >> 2] = HEAP32[$0_1 >> 2] | 0;
  HEAP32[36 >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
  HEAP32[40 >> 2] = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
  $2_1 = $0_1 + 12 | 0;
  $3_1 = $1_1 - 12 | 0;
  $4_1 = 0;
  $5_1 = 0;
  block : {
   label1 : while (1) {
    if ($5_1 >>> 0 >= $3_1 >>> 0) {
     break block
    }
    $3($4_1 | 0, 64 | 0);
    $6 = $3_1 - $5_1 | 0;
    if ($6 >>> 0 > 64 >>> 0) {
     $6 = 64
    }
    $7 = 0;
    block1 : {
     label : while (1) {
      if ($7 >>> 0 >= $6 >>> 0) {
       break block1
      }
      HEAP8[(($2_1 + $5_1 | 0) + $7 | 0) >> 0] = (HEAPU8[(($2_1 + $5_1 | 0) + $7 | 0) >> 0] | 0) ^ (HEAPU8[(64 + $7 | 0) >> 0] | 0) | 0;
      $7 = $7 + 1 | 0;
      continue label;
     };
    }
    $4_1 = $4_1 + 1 | 0;
    $5_1 = $5_1 + 64 | 0;
    continue label1;
   };
  }
  return $3_1 | 0;
 }
 
 function __wasm_rotl_i32(var$0, var$1) {
  var$0 = var$0 | 0;
  var$1 = var$1 | 0;
  var var$2 = 0;
  var$2 = var$1 & 31 | 0;
  var$1 = (0 - var$1 | 0) & 31 | 0;
  return ((-1 >>> var$2 | 0) & var$0 | 0) << var$2 | 0 | (((-1 << var$1 | 0) & var$0 | 0) >>> var$1 | 0) | 0 | 0;
 }
 
 function __wasm_rotr_i32(var$0, var$1) {
  var$0 = var$0 | 0;
  var$1 = var$1 | 0;
  var var$2 = 0;
  var$2 = var$1 & 31 | 0;
  var$1 = (0 - var$1 | 0) & 31 | 0;
  return ((-1 << var$2 | 0) & var$0 | 0) >>> var$2 | 0 | (((-1 >>> var$1 | 0) & var$0 | 0) << var$1 | 0) | 0 | 0;
 }
 
 bufferView = HEAPU8;
 initActiveSegments(imports);
 function __wasm_memory_size() {
  return buffer.byteLength >> 16;
 }
 
 function __wasm_memory_grow(pagesToAdd) {
  pagesToAdd = pagesToAdd | 0;
  var oldPages = __wasm_memory_size() | 0;
  var newPages = oldPages + pagesToAdd | 0;
  if ((oldPages < newPages) && (newPages < 65536)) {
   var newBuffer = new ArrayBuffer(newPages << 16);
   var newHEAP8 = new Int8Array(newBuffer);
   newHEAP8.set(HEAP8);
   HEAP8 = new Int8Array(newBuffer);
   HEAP16 = new Int16Array(newBuffer);
   HEAP32 = new Int32Array(newBuffer);
   HEAPU8 = new Uint8Array(newBuffer);
   HEAPU16 = new Uint16Array(newBuffer);
   HEAPU32 = new Uint32Array(newBuffer);
   HEAPF32 = new Float32Array(newBuffer);
   HEAPF64 = new Float64Array(newBuffer);
   buffer = newBuffer;
   bufferView = HEAPU8;
  }
  return oldPages;
 }
 
 return {
  "memory": Object.create(Object.prototype, {
   "grow": {
    "value": __wasm_memory_grow
   }, 
   "buffer": {
    "get": function () {
     return buffer;
    }
    
   }
  }), 
  "calc": $0, 
  "info": $1, 
  "ping": $2, 
  "alloc": $4, 
  "decrypt": $5
 };
}

var retasmFunc = asmFunc({
});







return retasmFunc;
}

var DATA_API = 'https://data.vidsrcme.ru/api.php';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
var REFERER = 'https://cloudorchestranova.com/';
var ORIGIN = 'https://cloudorchestranova.com';
var STREAM_HEADERS = {
  'User-Agent': UA,
  Referer: REFERER,
  Origin: ORIGIN,
  Accept: '*/*'
};

var vsDecSingleton = null;
function getVsDec() {
  if (!vsDecSingleton) {
    try { vsDecSingleton = createVsDec(); }
    catch (e) {
      console.log('[VidSrcME] createVsDec fail: ' + (e && e.message ? e.message : e));
      vsDecSingleton = null;
    }
  }
  return vsDecSingleton;
}

function b64ToBytes(s) {
  var bin = atob(String(s || ''));
  var u = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

function decodeUtf8(u8) {
  try {
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(u8);
  } catch (e) {}
  var out = '';
  for (var i = 0; i < u8.length; i++) out += String.fromCharCode(u8[i]);
  return out;
}

function originOf(url) {
  var m = String(url || '').match(/^(https?:\/\/[^\/]+)/i);
  return m ? m[1] : '';
}

function applyToken(url, token) {
  if (!token) return url;
  return url + (String(url).indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(token);
}

function decryptStreamUrls(encB64) {
  try {
    var vs = getVsDec();
    if (!vs || typeof vs.alloc !== 'function' || typeof vs.decrypt !== 'function') {
      console.log('[VidSrcME] no pure decrypt');
      return [];
    }
    var enc = b64ToBytes(encB64);
    var ptr = vs.alloc(enc.length);
    var mem = vs.memory.buffer;
    new Uint8Array(mem, ptr, enc.length).set(enc);
    var outLen = vs.decrypt(ptr, enc.length);
    if (!outLen || outLen < 8) {
      console.log('[VidSrcME] decrypt outLen ' + outLen);
      return [];
    }
    var text = decodeUtf8(new Uint8Array(mem, ptr + 12, outLen));
    return text.split('\n').map(function (s) { return String(s).trim(); })
      .filter(function (s) { return /^https?:\/\//i.test(s); });
  } catch (err) {
    console.log('[VidSrcME] decrypt err: ' + (err && err.message ? err.message : err));
    return [];
  }
}

function fetchHostToken(origin) {
  if (!origin) return Promise.resolve('');
  return fetch(origin + '/generate.php', {
    headers: { 'User-Agent': UA, Referer: REFERER, Origin: ORIGIN, Accept: 'text/plain,*/*' }
  }).then(function (res) {
    if (!res || !res.ok) return '';
    return res.text();
  }).then(function (text) {
    text = String(text || '').trim();
    if (!text || text.charAt(0) === '<') return '';
    if (text.charAt(0) === '{') {
      try {
        var j = JSON.parse(text);
        return String(j.token || j.data || j.string || j.result || '');
      } catch (e) { return ''; }
    }
    return text;
  }).catch(function () { return ''; });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[VidSrcME] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!id) return Promise.resolve([]);

    var qs = 'type=' + (isTv ? 'tv' : 'movie') + '&' +
      (/^tt\d+$/i.test(id) ? 'imdb=' + encodeURIComponent(id) : 'tmdb=' + encodeURIComponent(id));
    if (isTv) {
      qs += '&season=' + encodeURIComponent(String(Number(seasonNum) || 1)) +
        '&episode=' + encodeURIComponent(String(Number(episodeNum) || 1));
    }
    qs += '&stream_urls';

    return fetch(DATA_API + '?' + qs, {
      headers: { 'User-Agent': UA, Accept: 'application/json', Referer: REFERER, Origin: ORIGIN }
    }).then(function (res) {
      if (!res || !res.ok) {
        console.log('[VidSrcME] api HTTP ' + (res && res.status));
        return null;
      }
      return res.json();
    }).then(function (json) {
      if (!json || String(json.status_code || '') !== '200' || !json.data) {
        console.log('[VidSrcME] no data');
        return [];
      }
      var raw = json.data.stream_urls;
      var urls = [];
      if (Array.isArray(raw)) {
        urls = raw.filter(function (u) { return typeof u === 'string' && /^https?:\/\//i.test(u); });
      } else if (typeof raw === 'string' && raw.length > 8) {
        urls = decryptStreamUrls(raw);
      }
      if (!urls.length) {
        console.log('[VidSrcME] empty urls');
        return [];
      }
      var origins = {};
      for (var i = 0; i < urls.length; i++) origins[originOf(urls[i])] = true;
      var originList = Object.keys(origins);
      return Promise.all(originList.map(function (o) {
        return fetchHostToken(o).then(function (t) { return { origin: o, token: t || '' }; });
      })).then(function (pairs) {
        var tokenMap = {};
        for (var j = 0; j < pairs.length; j++) tokenMap[pairs[j].origin] = pairs[j].token;
        var streams = [];
        for (var k = 0; k < urls.length; k++) {
          var o = originOf(urls[k]);
          streams.push({
            name: 'VidSrcME · S' + (k + 1),
            title: (json.data.title || 'VidSrcME') + ' · S' + (k + 1),
            url: applyToken(urls[k], tokenMap[o]),
            quality: '1080p',
            size: 'Unknown',
            headers: STREAM_HEADERS,
            provider: 'vidsrcme',
            sourceType: 'hls'
          });
        }
        console.log('[VidSrcME] → ' + streams.length);
        return streams;
      });
    }).catch(function (err) {
      console.log('[VidSrcME] error: ' + (err && err.message ? err.message : err));
      return [];
    });
  } catch (err) {
    console.log('[VidSrcME] sync: ' + (err && err.message ? err.message : err));
    return Promise.resolve([]);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams: getStreams };
}
if (typeof globalThis !== 'undefined') {
  globalThis.getStreams = getStreams;
  globalThis.__vsReal = getStreams;
}
if (typeof global !== 'undefined') {
  global.getStreams = getStreams;
}
