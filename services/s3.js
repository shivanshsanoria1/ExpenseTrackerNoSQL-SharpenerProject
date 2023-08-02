const AWS = require('aws-sdk');

exports.uploadToS3 = (data, filename) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_ACCESS_KEY = process.env.IAM_USER_ACCESS_KEY;
    const IAM_USER_SECRET_ACCESS_KEY = process.env.IAM_USER_SECRET_ACCESS_KEY;

    const s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_ACCESS_KEY,
        secretAccessKey: IAM_USER_SECRET_ACCESS_KEY
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3Response) => {
            if(err){
                console.log('S3 UPLOAD ERROR');
                reject(err);
                return;
            }
            resolve(s3Response.Location);
        });
    });
}