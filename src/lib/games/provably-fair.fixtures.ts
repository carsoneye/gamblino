export type Fixture = {
  readonly serverSeed: string;
  readonly clientSeed: string;
  readonly nonce: number;
  readonly serverSeedHash: string;
  readonly firstBytesHex: string;
  readonly firstFloats: readonly number[];
};

export const FIXTURES: readonly Fixture[] = [
  {
    serverSeed: "a".repeat(64),
    clientSeed: "gamblino-default",
    nonce: 0,
    serverSeedHash: "ffe054fe7ae0cb6dc65c3af9b61d5209f439851db43d0ba5997337df154668eb",
    firstBytesHex: "e1fd2f4e7f3f8d75",
    firstFloats: [0.8827695432119071, 0.49706348520703614, 0.8383918390609324, 0.09912498574703932],
  },
  {
    serverSeed: "b".repeat(64),
    clientSeed: "player-chosen-seed",
    nonce: 7,
    serverSeedHash: "a0fab1377f49a759b57f63318262ebe89fabfc990e8e93ceac2984561482b9d4",
    firstBytesHex: "67426a46f10aabee",
    firstFloats: [0.40335716446861625, 0.9415690856985748, 0.4639185250271112, 0.7331615549046546],
  },
  {
    serverSeed: "0123456789abcdef".repeat(4),
    clientSeed: "midnight-arcade",
    nonce: 42,
    serverSeedHash: "a8ae6e6ee929abea3afcfc5258c8ccd6f85273e0d4626d26c7279f3250f77c8e",
    firstBytesHex: "520fd8529ddbd55c",
    firstFloats: [0.32055427553132176, 0.6166356420144439, 0.9123096333350986, 0.5328213681932539],
  },
] as const;
