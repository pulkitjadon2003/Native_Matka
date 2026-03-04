import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Configure Cloudinary INSIDE the handler to ensure env vars are loaded
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Validate config before proceeding
        if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary env vars missing:', {
                cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
                api_key: !!process.env.CLOUDINARY_API_KEY,
                api_secret: !!process.env.CLOUDINARY_API_SECRET,
            });
            return NextResponse.json({ success: false, msg: 'Server configuration error: Cloudinary not configured' }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            console.error('Upload Error: No file in formData. Keys:', [...formData.keys()]);
            return NextResponse.json({ success: false, msg: 'No file uploaded' }, { status: 400 });
        }

        console.log('Upload received:', { name: file.name, type: file.type, size: file.size });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'matka_uploads',
                    resource_type: 'image',
                },
                (error: any, result: any) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        }) as any;

        console.log('Upload successful:', uploadResult.secure_url);

        return NextResponse.json({
            success: true,
            msg: 'File uploaded successfully',
            url: uploadResult.secure_url
        });

    } catch (error: any) {
        console.error('File Upload Error:', error?.message || error);
        return NextResponse.json({ success: false, msg: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
