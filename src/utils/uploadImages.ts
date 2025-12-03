// // src/utils/uploadImages.ts
// import { storage } from "../lib/firebase";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// export async function uploadProductImages(
//   productId: string,
//   files: File[]
// ): Promise<{ url: string; isPrimary: boolean }[]> {
//   const uploaded: { url: string; isPrimary: boolean }[] = [];

//   for (let i = 0; i < files.length; i++) {
//     const file = files[i];
//     const path = `products/${productId}/${Date.now()}-${file.name}`;
//     const storageRef = ref(storage, path);
//     await uploadBytes(storageRef, file);
//     const url = await getDownloadURL(storageRef);

//     uploaded.push({
//       url,
//       isPrimary: i === 0, // first image as primary
//     });
//   }

//   return uploaded;
// }

// src/utils/uploadImages.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";

export type UploadedImage = {
  url: string;
  isPrimary: boolean;
};

export async function uploadProductImages(
  productId: string,
  files: File[]
): Promise<UploadedImage[]> {
  const uploads = files.map(async (file, index) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/${productId}/${Date.now()}-${index}.${ext}`;

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      isPrimary: index === 0,
    };
  });

  return Promise.all(uploads);
}