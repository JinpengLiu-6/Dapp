import type { Address } from 'viem';

export const socialAppAbi = [
  {
    type: 'event',
    name: 'PostCreated',
    inputs: [
      { indexed: true, name: 'postId', type: 'uint256' },
      { indexed: true, name: 'author', type: 'address' },
      { indexed: false, name: 'cid', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PostLiked',
    inputs: [
      { indexed: true, name: 'postId', type: 'uint256' },
      { indexed: true, name: 'liker', type: 'address' },
      { indexed: false, name: 'likeCount', type: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'createPost',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'cid', type: 'string' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getPosts',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'author', type: 'address' },
          { name: 'cid', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'likeCount', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'likePost',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'postId', type: 'uint256' }],
    outputs: [],
  },
] as const;

export type ContractPost = {
  author: Address;
  cid: string;
  timestamp: bigint;
  likeCount: bigint;
};

export const socialAppAddress = (import.meta.env.VITE_SOCIAL_APP_CONTRACT_ADDRESS ||
  '') as Address;

export const hasSocialAppAddress = Boolean(socialAppAddress);
