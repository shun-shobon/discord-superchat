// ZWJ: Zero Width Joiner
const ZWJ = String.fromCharCode(0x200d);
// EPVS: VARIATION SELECTOR-16
const EPVS_REGEX = /\uFE0F/g;

function getIconCode(segment: string): string {
  // ZWJが含まれていない場合は，EPVSを削除する(EPVSはZWJが使われる絵文字には使われないため)
  const str =
    segment.indexOf(ZWJ) === -1 ? segment.replace(EPVS_REGEX, "") : segment;

  const codePoints = [...str]
    .map((c) => c.codePointAt(0)!.toString(16))
    .join("-");

  return codePoints;
}

export async function loadEmoji(segment: string) {
  const code = getIconCode(segment);
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code.toLowerCase()}.svg`;

  const res = await fetch(url);
  const base64 = await res
    .arrayBuffer()
    .then((b) =>
      btoa(
        new Uint8Array(b).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        )
      )
    );

  return `data:image/svg+xml;base64,${base64}`;
}
