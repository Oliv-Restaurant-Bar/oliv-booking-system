import { toast } from 'sonner';

export async function handleImageUpload(
  file: File,
  setUploadingImage?: (uploading: boolean) => void
): Promise<string> {
  try {
    setUploadingImage?.(true);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();

    if (!data.success || !data.imageUrl) {
      throw new Error('Invalid response from server');
    }

    toast.success('Image uploaded successfully');
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    throw error;
  } finally {
    setUploadingImage?.(false);
  }
}
