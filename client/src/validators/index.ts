import { string } from "yup";
import { CONSTS } from "../const";

class Validator {
  public email() {
    return string().required("Invalid email").email("Invalid email");
  }

  private async image(img: File, base64s: string[], format = "") {
    const maxSize = CONSTS.files.imgSize;

    if (img.size > maxSize) {
      throw Error(
        `${CONSTS.errors.files.exceededMaxSize} ${(maxSize / 1024).toFixed(
          0
        )}kb`
      );
    }

    const types = (format ? format : CONSTS.files.mimeType.supportedImg)
      .split(/\,.|\./g)
      .map((type) => `image/${type}`);

    if (!types.includes(img.type)) {
      throw Error(CONSTS.errors.files.inCorrectImageFormat);
    }

    const bs4: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(img);
      reader.onload = () => {
        resolve(reader.result as string);
      };
    });

    const removeBase64 = (str: string) => str.replace(/^data:(.*,)?/, "");
    base64s.forEach((currentB64) => {
      if (currentB64 === removeBase64(bs4)) {
        throw Error(CONSTS.errors.files.duplicate);
      }
    });
    return bs4.replace(/^data:(.*,)?/, "");
  }

  private async video(vd: File, base64s: string[]) {
    if (vd.size > CONSTS.files.vdSize) {
      throw Error(
        `${CONSTS.errors.files.exceededMaxSize} ${(
          (CONSTS.files.vdSize / 1024) *
          1024
        ).toFixed(0)}mb`
      );
    }

    const types = CONSTS.files.mimeType.supportedVd
      .split(/\,.|\./g)
      .map((type) => `video/${type}`);

    if (!types.includes(vd.type)) {
      throw Error(CONSTS.errors.files.inCorrectImageFormat);
    }

    const bs4: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(vd);
      reader.onload = () => {
        resolve(reader.result as string);
      };
    });

    const removeBase64 = (str: string) => str.replace(/^data:(.*,)?/, "");
    base64s.forEach((currentB64) => {
      if (removeBase64(currentB64) === removeBase64(bs4)) {
        throw Error(CONSTS.errors.files.duplicate);
      }
    });

    return bs4;
  }

  public async files(
    files: File[],
    type: "video" | "image",
    minNum = 0,
    maxNum = 1,
    format = ""
  ) {
    try {
      if (files.length < minNum) {
        throw new Error(`${CONSTS.errors.files.leastFileUpload} ${minNum}`);
      }

      if (files.length > maxNum) {
        throw new Error(`${CONSTS.errors.files.exceededMaxNumber} ${maxNum}`);
      }

      let currentIndex = 0;
      const base64s: string[] = [];
      await Promise.all(
        files.map(async (file, i) => {
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (currentIndex === i) {
                clearInterval(interval);
                resolve(null);
              }
            }, 20);
          });

          const bs4 =
            type === "video"
              ? await this.video(file, base64s)
              : await this.image(file, base64s, format);
          base64s.push(bs4);
          currentIndex++;
        })
      );

      return "";
    } catch (error) {
      return (error as any).message;
    }
  }
}

const validator = new Validator();
export default validator;
