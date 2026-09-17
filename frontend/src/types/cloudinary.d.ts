// TypeScript global declaration for the Cloudinary upload widget
// loaded via the <script> tag in index.html
export {};

declare global {
  interface Window {
    cloudinary: {
      openUploadWidget: (
        options: {
          cloudName: string;
          uploadPreset: string;
          sources?: string[];
          multiple?: boolean;
          maxFileSize?: number;
          clientAllowedFormats?: string[];
          cropping?: boolean;
          folder?: string;
          resourceType?: string;
        },
        callback: (
          error: any,
          result: { event: string; info: { public_id: string; secure_url: string; original_filename: string; format: string; bytes: number } }
        ) => void
      ) => void;
    };
  }
}
