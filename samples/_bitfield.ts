/*** Code-generated with AtBuild *****************
-> bitfield.tsb v4dba2f0a053f6655dc3dc5c36e92b25b
**************************************************
// @ts-ignore
/* eslint-disable */
class ChunkID {
  static encode(x, y, z) {
    let result = 0;
    result <<= 11;
    result |= Math.abs(z);
    result <<= 5;
    result |= y;
    result <<= 11;
    result |= Math.abs(x);
    result <<= 1;
    result |= Math.max(Math.min(Math.sign(z) + 1, 1), 0);
    result <<= 1;
    result |= Math.max(Math.min(Math.sign(x) + 1, 1), 0);
    return result;
  }
  static decodeRef(value, result) {
    result[2] = 1 | (value & 1) - 1 >> 255;
    value >>= 1;
    result[4] = 1 | (value & 1) - 1 >> 255;
    value >>= 1;
    result[2] *= value & 2047;
    value >>= 11;
    result[3] = value & 31;
    value >>= 5;
    result[4] *= value & 2047;
    value >>= 11;
    return result;
  }
  static decode(value) {
    const result = this.cached;
    result[0] = 1 | (value & 1) - 1 >> 255;
    value >>= 1;
    result[2] = 1 | (value & 1) - 1 >> 255;
    value >>= 1;
    result[0] *= value & 2047;
    value >>= 11;
    result[1] = value & 31;
    value >>= 5;
    result[2] *= value & 2047;
    value >>= 11;
    return result;
  }
}
ChunkID.masks = {xSign: 1, zSign: 1, x: 2047, y: 31, z: 2047};
ChunkID.offsets = {xSign: 0, zSign: 1, x: 2, y: 13, z: 18};
ChunkID.schema = {xSign: 1, zSign: 1, x: 11, y: 5, z: 11};
ChunkID.fields = ["xSign", "zSign", "x", "y", "z"];
ChunkID.cached = new Array(3);
;
export {
  ChunkID
};
