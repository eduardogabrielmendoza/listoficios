import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client:S3Client|undefined;
function config(){const endpoint=process.env.S3_ENDPOINT;const bucket=process.env.S3_BUCKET;const accessKeyId=process.env.S3_ACCESS_KEY_ID;const secretAccessKey=process.env.S3_SECRET_ACCESS_KEY;if(!endpoint||!bucket||!accessKeyId||!secretAccessKey)throw new Error("STORAGE_NOT_CONFIGURED");return{endpoint,bucket,accessKeyId,secretAccessKey,region:process.env.S3_REGION??"auto"};}
function getClient(){const value=config();if(!client)client=new S3Client({endpoint:value.endpoint,region:value.region,credentials:{accessKeyId:value.accessKeyId,secretAccessKey:value.secretAccessKey},forcePathStyle:true});return{client,bucket:value.bucket};}
export async function putPrivateObject(key:string,body:Buffer,contentType:string){const storage=getClient();await storage.client.send(new PutObjectCommand({Bucket:storage.bucket,Key:key,Body:body,ContentType:contentType,CacheControl:"public, max-age=31536000, immutable"}));}
export async function getPrivateObject(key:string){const storage=getClient();return storage.client.send(new GetObjectCommand({Bucket:storage.bucket,Key:key}));}
export async function deletePrivateObject(key:string){const storage=getClient();await storage.client.send(new DeleteObjectCommand({Bucket:storage.bucket,Key:key}));}
