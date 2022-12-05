function connect() {
    const { Storage  } = require('@google-cloud/storage');
    const storage = new Storage({
        credentials: JSON.parse(JSON.stringify({
            "type": process.env.KEY_TYPE,
            "project_id": process.env.KEY_PROJECT_ID,
            "private_key_id": process.env.KEY_PRIVATE_KEY_ID,
            "private_key": "-----BEGIN PRIVATE KEY-----\n" + process.env.KEY_PRIVATE_KEY_PART + "de\nNg3+wrVHXm4du9d+V4q5lM8XoKUI0xr05DiGuCFd6G3QjJzrvXHd4PAa0rxmMQeW\nFtlFkYxxG+jusfcRmDfV3IcZPvfSXrM9dzK3vPmdV7BdtwkK7mNsBucU8mmo9XVm\nFcbnUzy0TIj9FfDluFKzQQTOicRVCzwfccG2pFHRIo9HsEH1dvH9XT4pCkWCLCKI\nkKDl3uB7y4/LBRdNiTqRC4Eqhm5BjBtsTQPKva6IXHfWCiTRzWs7mIMHJLoTo4nH\n64ME1xnjIj10ARFde/ll47qSw3keR3+VlRc6B3PCechkEXlPeUZYwBeDKsx5E8Sc\nZbcJEQ19AgMBAAECggEABLPYB/BGwF5+JAbGI1ByNh/p6ZDIoNU+64JcJUFNefHe\nXewC+CJXDzYlu6LPcaKEgKJNCTPTvddy/a/2vzbc+dO1Y++DmZmCjdVRLdRR5aDn\nFeVlhF7zTQ+s6fHAb+jAdmLkzEk3QuLd1aNqi6y5wN00xkdd2HJEfKDO9DTPFs50\nNnius/rNY0+4wJHsBZRkHXp+jngp+4XhMRK65gZxdy5OIkGeEI42k5Yxp+hzdLk4\nlF9UxXxTST4PY36A9Kq4ivzd0Mip0v+gqLc/kCMxR/qCVqZNwtode0pMeGja7VOT\ntlAlm3piZXHWggLNR/aIyIOdJtQGOFbbmCBBy7I1WQKBgQDmL/mRdHNVtZMBXI0q\nUVCW6ToWn/Z7iHUG2IOeLRRh50OQiVgfJWSXCBPUQzbWnaS0KwvESNOVixdvLJaV\n1XRZpYzFkmjmIvb7B15Q671LbTa2w0728RyFyxUBmW1X86QzlGrnZ1WIXNnT0RcB\n4lNtdvLyIekg9+fSilEkAuTY1wKBgQDAmTOpLA06SwuLzhjSjHDqUSiALr/UQ0XD\nvjeYVb4U0Pt3Jhd9OWxJgxpAXdR9D1nHsdFle21aTZNt01tTm42LcT89Idz/xwki\nAf0wHWw7N6IdoFG4b/VMRk+02B4B5Uk1+25TquC37B8+MNrruMiF/LsgT2wZeIAj\nPeP2omVdywKBgQCpw8wd2HKPTcDDikyaXyo+gnfS49rXNMaKa/h2Ge0kX3lXCdQx\n9FQBh3WIYKH7Gny0W+LruoJBkjmQRqQwkSKkUxJFTDuNL1BTxxVqPNJ45G0r0VNV\nkHFmw2YUreEUsp3xZI6LZ4yPa1tDerurKg45dzaqGRRkujEA9/3rvy6kNQKBgD2R\nO9h6gof98WTxrzGvP3FIHGBNkXjzQFwAdJk335mb7Kb8AEpBjwI47K1i0UhhHdwe\nVcfRGvXhEp3rEKi7cxX+T67lIlaJc7vxUtSMs0qC0EoUM8t3zrxhRZ2T8JO+jha5\nl10bpNZmnt4sk+8ClOdwEQmVGgNSZ/PcFwGCjFDdAoGBAM61UTEdaRSMf5bzaoCM\nLdt0QcNxQ4n/HCyc6f8bDIrbJjgy5eZuc9TWg69tp/I5xJxBe5EDJ5L8ev4aJycr\nbd3pV43StHViPERo3jI3tPMnJAyPDhkptstMHBqLc/7Ef3WKLnxD/EV/HNhq+6Kv\nG3aRbCCAObTWlaTvbZ93vsls\n-----END PRIVATE KEY-----\n",
            "client_email": process.env.KEY_CLIENT_EMAIL,
            "client_id": process.env.KEY_CLIENT_ID,
            "auth_uri": process.env.KEY_AUTH_URI,
            "token_uri": process.env.KEY_TOKEN_URI,
            "auth_provider_x509_cert_url": process.env.KEY_AUTH_PROVIDER,
            "client_x509_cert_url": process.env.KEY_CLIENT_CERT
          }
          ))
        ,
        projectId: "delta-chess-363314"
    });
    const bucket = storage.bucket('iaeround');
    return (bucket || 0);
}

class StorageController{

    async removeFile(filePath){
        try{
            await connect().file(filePath).delete();
        }catch{

        }
        return true;
    }

    async clearFolder(folderPath){
        try{
            await connect().deleteFiles({ prefix: folderPath }, function(err) {});
        }catch{

        }
        return true;
    }

    async uploadFile(fileName, destination){
        const options = {
            destination: destination,
          };
        console.log("upload");
        try{
        await connect().upload(fileName,options);
        }catch(err){
            console.log(err);
        }
        return true;
    }
}

module.exports = new StorageController();