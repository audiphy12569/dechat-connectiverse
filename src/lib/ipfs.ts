import axios from 'axios';

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
const pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY;

export async function uploadToPinata(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error('Failed to upload image');
  }
}