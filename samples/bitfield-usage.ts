import { $BitField, sizeof } from "atbuild-bitfield"; // $

export const ExampleBitfield = $BitField({
  x: sizeof(16),
  y: sizeof(16),
  z: sizeof(16),
});
