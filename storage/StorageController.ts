function connect() {
    const { Storage  } = require('@google-cloud/storage');
    const storage = new Storage({
        keyFilename: "./key.json",
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
        
        try{
        await connect().upload(fileName,options);
        }catch{

        }
        return true;
    }
}

module.exports = new StorageController();