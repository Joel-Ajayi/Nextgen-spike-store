class FilesHelper {
  public async getBase64String(file: File) {
    try {
      const b64 = await new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          resolve(reader.result);
        };
        reader.onerror = function (error) {
          reject("");
        };
      });
      return b64 as string;
    } catch (error) {
      return "";
    }
  }
}

const filesHelper = new FilesHelper();
export default filesHelper;
