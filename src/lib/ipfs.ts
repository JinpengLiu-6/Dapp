const PINATA_PIN_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

type PinataPinJsonResponse = {
  IpfsHash?: string;
  PinSize?: number;
  Timestamp?: string;
  isDuplicate?: boolean;
  error?: {
    reason?: string;
    details?: string;
  };
  message?: string;
};

export type UploadPostContentInput = {
  content: string;
};

export async function uploadPostToIpfs({
  content,
}: UploadPostContentInput): Promise<string> {
  const jwt = import.meta.env.VITE_PINATA_JWT?.trim();
  const normalizedContent = content.trim();

  if (!jwt) {
    throw new Error('Missing VITE_PINATA_JWT');
  }

  if (!normalizedContent) {
    throw new Error('Post content cannot be empty');
  }

  const response = await fetch(PINATA_PIN_JSON_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `social-post-${Date.now()}.json`,
      },
      pinataContent: {
        content: normalizedContent,
        createdAt: new Date().toISOString(),
      },
    }),
  });

  const data = (await response.json()) as PinataPinJsonResponse;

  if (!response.ok) {
    const reason =
      data.error?.reason || data.error?.details || data.message || 'Pinata upload failed';
    throw new Error(reason);
  }

  if (!data.IpfsHash) {
    throw new Error('Pinata upload did not return a CID');
  }

  return data.IpfsHash;
}
