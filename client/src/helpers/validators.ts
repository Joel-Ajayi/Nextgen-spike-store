import { string, object, array } from "yup";
import { CONSTS } from "../const";
import { CatFilter } from "../types/category";

class Validator {
  public email() {
    return string().required("Invalid email").email("Invalid email");
  }

  private async image(img: File, base64s: string[]) {
    const maxSize = CONSTS.files.imgSize;

    if (img.size > maxSize) {
      throw Error(
        `${CONSTS.errors.files.exceededMaxSize} ${(maxSize / 1024).toFixed(
          0
        )}kb`
      );
    }

    const types = CONSTS.files.mimeType.supportedImg
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
    maxNum: number,
    minNum: number,
    type: "video" | "image"
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
              : await this.image(file, base64s);
          base64s.push(bs4);
          currentIndex++;
        })
      );

      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public signInPwd() {
    return string()
      .required("Password is required")
      .min(8, "Password should be 8 chars minimum")
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        {
          message:
            "password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
        }
      );
  }

  public async catName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .matches(/^[a-zA-Z0-9\s]*$/, "Special characters not allowed")
        .max(12, "Name should have not more than 12 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async catDesc(val: string) {
    try {
      await string()
        .required("Description Field is empty")
        .max(110, "Description should have not more than 110 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async catFilter(val: CatFilter[]) {
    try {
      await array().max(5, "Filters should not be more than 5").validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async catFilterName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .max(10, "Name should have not more than 10 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async catFilterUnit(val: string) {
    try {
      await string()
        .max(5, "Unit should have not more than 5 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async catFilterOptions(val: string[]) {
    try {
      await array()
        .of(string().max(10, "Option should have not more than 10 characters"))
        .max(10, "Options should not be more than 10")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }
}

const validator = new Validator();
export default validator;
