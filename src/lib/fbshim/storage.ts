// Drop-in replacement for `firebase/storage`.
// Uploads go to the backend `/api/upload` endpoint which stores files in Cloudinary.
import { apiDelete, apiUpload } from "./client"

export interface FirebaseStorage {
	__type: "storage"
}

export function getStorage(_app?: unknown): FirebaseStorage {
	return { __type: "storage" }
}

export interface StorageReference {
	__type: "storageRef"
	fullPath: string
	__url?: string
	__publicId?: string
}

export function ref(
	_storage: FirebaseStorage,
	path: string,
): StorageReference {
	return { __type: "storageRef", fullPath: path }
}

export async function uploadBytes(
	storageRef: StorageReference,
	data: Blob | Uint8Array | ArrayBuffer,
): Promise<{ ref: StorageReference; metadata: { fullPath: string } }> {
	const form = new FormData()
	const blob =
		data instanceof Blob ? data : new Blob([data as BlobPart])
	const filename = storageRef.fullPath.split("/").pop() || "upload"
	form.append("file", blob, filename)
	form.append("path", storageRef.fullPath)
	const res = await apiUpload("/upload", form)
	storageRef.__url = res.url
	storageRef.__publicId = res.publicId
	return { ref: storageRef, metadata: { fullPath: storageRef.fullPath } }
}

export async function getDownloadURL(
	storageRef: StorageReference,
): Promise<string> {
	return storageRef.__url || ""
}

export async function deleteObject(
	storageRef: StorageReference,
): Promise<void> {
	await apiDelete("/upload", {
		path: storageRef.fullPath,
		publicId: storageRef.__publicId,
		url: storageRef.__url,
	})
}

export default { getStorage, ref, uploadBytes, getDownloadURL, deleteObject }
