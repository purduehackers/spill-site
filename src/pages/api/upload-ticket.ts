import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: import.meta.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: import.meta.env.S3_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.S3_SECRET_ACCESS_KEY,
    },
});

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;
        
        if (!file) {
            return new Response(JSON.stringify({ error: 'No image provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const fileName = `tickets/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        
        const command = new PutObjectCommand({
            Bucket: 'spill-socials',
            Key: fileName,
            Body: buffer,
            ContentType: 'image/png',
        });

        await s3Client.send(command);
        
        const publicUrl = `${import.meta.env.PUBLIC_ENDPOINT}/${fileName}`;
        const ticketId = fileName.split('/')[1].replace('.png', '');

        return new Response(JSON.stringify({ url: publicUrl, id: ticketId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ error: 'Upload failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
