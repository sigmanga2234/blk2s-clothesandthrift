import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { Product } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing app or initialize new one
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive file access scope
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      // If we don't have cachedAccessToken (e.g. on page refresh), we need to sign in again
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and retrieve OAuth token
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) return null;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- Google Drive Helper Functions ---

const FILE_NAME = 'thrift_store_inventory.json';

/**
 * Searches for the inventory file in the user's Google Drive.
 * Returns the file ID if found, or null.
 */
export const findDriveFile = async (accessToken: string): Promise<string | null> => {
  try {
    const q = `name = '${FILE_NAME}' and trashed = false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to search Drive files:', errText);
      return null;
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error finding Drive file:', error);
    return null;
  }
};

/**
 * Downloads and parses the inventory file from Google Drive using its file ID.
 */
export const downloadDriveFile = async (accessToken: string, fileId: string): Promise<Product[] | null> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to download Drive file:', await response.text());
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data as Product[];
    }
    return null;
  } catch (error) {
    console.error('Error downloading Drive file:', error);
    return null;
  }
};

/**
 * Creates a new file in Google Drive with the specified inventory data.
 * Returns the new file ID.
 */
export const createDriveFile = async (accessToken: string, products: Product[]): Promise<string | null> => {
  try {
    // Step 1: Create metadata
    const metaResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: FILE_NAME,
        mimeType: 'application/json',
        description: 'Inventory and catalog backups for BLK2S Thrift shop',
      }),
    });

    if (!metaResponse.ok) {
      console.error('Failed to create Drive file metadata:', await metaResponse.text());
      return null;
    }

    const metaData = await metaResponse.json();
    const fileId = metaData.id;

    if (!fileId) return null;

    // Step 2: Upload initial content
    const success = await updateDriveFileContent(accessToken, fileId, products);
    return success ? fileId : null;
  } catch (error) {
    console.error('Error creating Drive file:', error);
    return null;
  }
};

/**
 * Updates the contents of an existing Google Drive file.
 */
export const updateDriveFileContent = async (
  accessToken: string,
  fileId: string,
  products: Product[]
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(products),
      }
    );

    if (!response.ok) {
      console.error('Failed to update Drive file content:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating Drive file content:', error);
    return false;
  }
};
