const pcmEncode = (input: Float32Array): ArrayBuffer => {
  var offset = 0;
  var buffer = new ArrayBuffer(input.length * 2);
  var view = new DataView(buffer);
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
};

export default pcmEncode;
